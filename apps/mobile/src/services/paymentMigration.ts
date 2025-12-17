/**
 * Payment Backend Migration Infrastructure
 * Handles migration from old payment system to new Supabase-based system
 *
 * Features:
 * - Dual-write strategy for data consistency
 * - Gradual migration with feature flags
 * - Transaction reconciliation
 * - Rollback capabilities
 * - Monitoring and logging
 */

import { supabase } from '../config/supabase';
import type { Database } from '../types/database.types';
import { logger } from '../utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Payment provider types
 */
export type PaymentProvider = 'stripe' | 'iyzico' | 'supabase';

/**
 * Payment transaction
 */
export interface PaymentTransaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'gift';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: PaymentProvider;
  provider_transaction_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  completed_at?: string;
}

/**
 * Migration configuration
 */
interface MigrationConfig {
  // Feature flags
  useNewSystem: boolean; // Whether to use new Supabase system
  dualWrite: boolean; // Write to both old and new systems
  readFromNew: boolean; // Read from new system (vs old)

  // Providers
  primaryProvider: PaymentProvider;
  fallbackProvider?: PaymentProvider;

  // Migration state
  migrationStartDate?: string;
  migrationCompleteDate?: string;
  batchSize: number;
}

const MIGRATION_CONFIG_KEY = 'payment_migration_config';
const DEFAULT_CONFIG: MigrationConfig = {
  useNewSystem: false,
  dualWrite: true, // Start with dual-write for safety
  readFromNew: false,
  primaryProvider: 'iyzico',
  fallbackProvider: 'stripe',
  batchSize: 100,
};

/**
 * Payment Migration Service
 */
class PaymentMigrationService {
  private config: MigrationConfig = DEFAULT_CONFIG;
  private migrationInProgress = false;

  /**
   * Initialize migration service
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(MIGRATION_CONFIG_KEY);
      if (stored) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
      }

      logger.info('PaymentMigration', 'Initialized with config:', this.config);
    } catch (error) {
      logger.error('PaymentMigration', 'Failed to initialize:', error);
    }
  }

  /**
   * Update migration configuration
   */
  async updateConfig(updates: Partial<MigrationConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };

    await AsyncStorage.setItem(
      MIGRATION_CONFIG_KEY,
      JSON.stringify(this.config),
    );

    logger.info('PaymentMigration', 'Config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): MigrationConfig {
    return { ...this.config };
  }

  /**
   * Create payment transaction (with dual-write support)
   */
  async createTransaction(
    transaction: Omit<PaymentTransaction, 'id' | 'created_at'>,
  ): Promise<PaymentTransaction> {
    const errors: Error[] = [];

    try {
      // Always write to new system (Supabase)
      const { data: supabaseTransaction, error: supabaseError } = await supabase
        .from('transactions')
        .insert({
          user_id: transaction.user_id,
          amount: transaction.amount,
          currency: transaction.currency,
          type: transaction.type,
          status: transaction.status,
          description: `Payment via ${transaction.provider}`,
          metadata: {
            provider: transaction.provider,
            provider_transaction_id: transaction.provider_transaction_id,
            ...transaction.metadata,
          },
        })
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      logger.info(
        'PaymentMigration',
        'Transaction created in Supabase:',
        supabaseTransaction.id,
      );

      // If dual-write is enabled, also write to old system
      if (this.config.dualWrite && !this.config.useNewSystem) {
        try {
          // TODO: Call old payment API
          await this.writeToLegacySystem(transaction);
        } catch (legacyError) {
          logger.error(
            'PaymentMigration',
            'Failed to write to legacy system:',
            legacyError,
          );
          errors.push(legacyError as Error);

          // Don't fail the transaction, but log for reconciliation
          await this.logMigrationError({
            transaction_id: supabaseTransaction.id,
            error_type: 'dual_write_failed',
            error_message: (legacyError as Error).message,
            metadata: { transaction },
          });
        }
      }

      return {
        ...transaction,
        id: supabaseTransaction.id,
        created_at: supabaseTransaction.created_at ?? '',
      };
    } catch (error) {
      logger.error('PaymentMigration', 'Failed to create transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransaction(
    transactionId: string,
  ): Promise<PaymentTransaction | null> {
    try {
      // Read from new system if configured
      if (this.config.readFromNew || this.config.useNewSystem) {
        // SECURITY: Explicit column selection - never use select('*')
        const { data, error } = await supabase
          .from('transactions')
          .select(
            `
            id,
            type,
            amount,
            currency,
            status,
            description,
            created_at,
            metadata,
            moment_id,
            sender_id,
            receiver_id,
            user_id
          `,
          )
          .eq('id', transactionId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore not found

        if (data) {
          return this.mapSupabaseToTransaction(data);
        }
      }

      // Fallback to legacy system
      if (!this.config.useNewSystem) {
        return await this.readFromLegacySystem(transactionId);
      }

      return null;
    } catch (error) {
      logger.error('PaymentMigration', 'Failed to get transaction:', error);
      throw error;
    }
  }

  /**
   * List user transactions
   */
  async listUserTransactions(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: PaymentTransaction['status'];
      type?: PaymentTransaction['type'];
    },
  ): Promise<{ data: PaymentTransaction[]; count: number }> {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 50) - 1,
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      return {
        data: (data || []).map(this.mapSupabaseToTransaction),
        count: count || 0,
      };
    } catch (error) {
      logger.error('PaymentMigration', 'Failed to list transactions:', error);
      throw error;
    }
  }

  /**
   * Update transaction status
   */
  async updateTransactionStatus(
    transactionId: string,
    status: PaymentTransaction['status'],
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      if (metadata) {
        updates.metadata = metadata;
      }

      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;

      logger.info(
        'PaymentMigration',
        `Transaction ${transactionId} status updated to ${status}`,
      );

      // Dual-write to legacy system if enabled
      if (this.config.dualWrite && !this.config.useNewSystem) {
        await this.updateLegacySystemStatus(transactionId, status);
      }
    } catch (error) {
      logger.error(
        'PaymentMigration',
        'Failed to update transaction status:',
        error,
      );
      throw error;
    }
  }

  /**
   * Migrate batch of transactions from legacy to new system
   */
  async migrateBatch(
    startDate: string,
    endDate: string,
  ): Promise<{
    success: number;
    failed: number;
    errors: Array<{ transaction: any; error: string }>;
  }> {
    if (this.migrationInProgress) {
      throw new Error('Migration already in progress');
    }

    this.migrationInProgress = true;
    const result = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ transaction: any; error: string }>,
    };

    try {
      logger.info(
        'PaymentMigration',
        `Starting batch migration: ${startDate} to ${endDate}`,
      );

      // Fetch transactions from legacy system
      const legacyTransactions = await this.fetchLegacyTransactions(
        startDate,
        endDate,
      );

      logger.info(
        'PaymentMigration',
        `Found ${legacyTransactions.length} legacy transactions`,
      );

      // Migrate in batches
      for (
        let i = 0;
        i < legacyTransactions.length;
        i += this.config.batchSize
      ) {
        const batch = legacyTransactions.slice(i, i + this.config.batchSize);

        for (const legacyTx of batch) {
          try {
            // Check if already migrated
            const { data: existing } = await supabase
              .from('transactions')
              .select('id')
              .eq('metadata->legacy_id', legacyTx.id)
              .single();

            if (existing) {
              logger.debug(
                'PaymentMigration',
                `Transaction ${legacyTx.id} already migrated`,
              );
              continue;
            }

            // Insert into Supabase
            const { error } = await supabase.from('transactions').insert({
              user_id: legacyTx.user_id,
              amount: legacyTx.amount,
              currency: legacyTx.currency,
              type: legacyTx.type,
              status: legacyTx.status,
              description: legacyTx.description || 'Migrated transaction',
              metadata: {
                legacy_id: legacyTx.id,
                migrated_at: new Date().toISOString(),
                ...legacyTx.metadata,
              },
              created_at: legacyTx.created_at,
            });

            if (error) throw error;

            result.success++;
            logger.debug(
              'PaymentMigration',
              `Migrated transaction ${legacyTx.id}`,
            );
          } catch (error) {
            result.failed++;
            result.errors.push({
              transaction: legacyTx,
              error: (error as Error).message,
            });
            logger.error(
              'PaymentMigration',
              `Failed to migrate ${legacyTx.id}:`,
              error,
            );
          }
        }

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      logger.info(
        'PaymentMigration',
        `Batch migration complete: ${result.success} success, ${result.failed} failed`,
      );

      return result;
    } catch (error) {
      logger.error('PaymentMigration', 'Batch migration failed:', error);
      throw error;
    } finally {
      this.migrationInProgress = false;
    }
  }

  /**
   * Reconcile transactions between systems
   */
  async reconcile(date: string): Promise<{
    total: number;
    matched: number;
    mismatched: number;
    missingInNew: number;
    missingInLegacy: number;
  }> {
    logger.info('PaymentMigration', `Starting reconciliation for ${date}`);

    const result = {
      total: 0,
      matched: 0,
      mismatched: 0,
      missingInNew: 0,
      missingInLegacy: 0,
    };

    try {
      // Get transactions from both systems
      const legacyTransactions = await this.fetchLegacyTransactions(date, date);
      // SECURITY: Explicit column selection - never use select('*')
      const { data: supabaseTransactions } = await supabase
        .from('transactions')
        .select(
          `
          id,
          type,
          amount,
          currency,
          status,
          description,
          created_at,
          metadata,
          moment_id,
          sender_id,
          receiver_id
        `,
        )
        .gte('created_at', `${date}T00:00:00`)
        .lt('created_at', `${date}T23:59:59`);

      const supabaseTxList = (supabaseTransactions ||
        []) as unknown as Database['public']['Tables']['transactions']['Row'][];

      result.total = legacyTransactions.length;

      // Compare transactions
      for (const legacyTx of legacyTransactions) {
        const supabaseTx = supabaseTxList.find(
          (tx: any) => tx.metadata?.legacy_id === legacyTx.id,
        );

        if (!supabaseTx) {
          result.missingInNew++;
          await this.logReconciliationIssue({
            type: 'missing_in_new',
            legacy_transaction: legacyTx,
          });
          continue;
        }

        // Compare key fields
        if (
          supabaseTx.amount !== legacyTx.amount ||
          supabaseTx.status !== legacyTx.status
        ) {
          result.mismatched++;
          await this.logReconciliationIssue({
            type: 'mismatch',
            legacy_transaction: legacyTx,
            supabase_transaction: supabaseTx,
          });
        } else {
          result.matched++;
        }
      }

      logger.info('PaymentMigration', 'Reconciliation complete:', result);

      return result;
    } catch (error) {
      logger.error('PaymentMigration', 'Reconciliation failed:', error);
      throw error;
    }
  }

  /**
   * Rollback to legacy system
   */
  async rollback(): Promise<void> {
    logger.warn('PaymentMigration', 'Rolling back to legacy system');

    await this.updateConfig({
      useNewSystem: false,
      readFromNew: false,
      dualWrite: true,
    });

    logger.info('PaymentMigration', 'Rollback complete - using legacy system');
  }

  /**
   * Complete migration (switch to new system)
   */
  async completeMigration(): Promise<void> {
    logger.info('PaymentMigration', 'Completing migration to new system');

    await this.updateConfig({
      useNewSystem: true,
      readFromNew: true,
      dualWrite: false,
      migrationCompleteDate: new Date().toISOString(),
    });

    logger.info('PaymentMigration', 'Migration complete - using new system');
  }

  /**
   * Helper: Map Supabase transaction to domain model
   */
  private mapSupabaseToTransaction(data: any): PaymentTransaction {
    return {
      id: data.id,
      user_id: data.user_id,
      amount: parseFloat(data.amount),
      currency: data.currency,
      type: data.type,
      status: data.status,
      provider: data.metadata?.provider || 'supabase',
      provider_transaction_id: data.metadata?.provider_transaction_id,
      metadata: data.metadata,
      created_at: data.created_at,
      completed_at: data.completed_at,
    };
  }

  /**
   * Helper: Write to legacy system (placeholder)
   */
  private async writeToLegacySystem(transaction: any): Promise<void> {
    // TODO: Implement legacy API call
    logger.debug(
      'PaymentMigration',
      'Would write to legacy system:',
      transaction,
    );
  }

  /**
   * Helper: Read from legacy system (placeholder)
   */
  private async readFromLegacySystem(
    transactionId: string,
  ): Promise<PaymentTransaction | null> {
    // TODO: Implement legacy API call
    logger.debug(
      'PaymentMigration',
      'Would read from legacy system:',
      transactionId,
    );
    return null;
  }

  /**
   * Helper: Update legacy system status (placeholder)
   */
  private async updateLegacySystemStatus(
    transactionId: string,
    status: string,
  ): Promise<void> {
    // TODO: Implement legacy API call
    logger.debug(
      'PaymentMigration',
      'Would update legacy system:',
      transactionId,
      status,
    );
  }

  /**
   * Helper: Fetch legacy transactions (placeholder)
   */
  private async fetchLegacyTransactions(
    startDate: string,
    endDate: string,
  ): Promise<any[]> {
    // TODO: Implement legacy API call
    logger.debug(
      'PaymentMigration',
      'Would fetch legacy transactions:',
      startDate,
      endDate,
    );
    return [];
  }

  /**
   * Helper: Log migration error
   */
  private async logMigrationError(error: any): Promise<void> {
    try {
      await supabase.from('migration_errors').insert({
        error_type: error.error_type,
        error_message: error.error_message,
        metadata: error.metadata,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      logger.error('PaymentMigration', 'Failed to log migration error:', err);
    }
  }

  /**
   * Helper: Log reconciliation issue
   */
  private async logReconciliationIssue(issue: any): Promise<void> {
    try {
      await supabase.from('reconciliation_issues').insert({
        type: issue.type,
        legacy_transaction: issue.legacy_transaction,
        supabase_transaction: issue.supabase_transaction,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(
        'PaymentMigration',
        'Failed to log reconciliation issue:',
        err,
      );
    }
  }
}

/**
 * Export singleton instance
 */
export const paymentMigration = new PaymentMigrationService();

/**
 * Initialize on app start
 */
export const initializePaymentMigration = async (): Promise<void> => {
  await paymentMigration.initialize();
};
