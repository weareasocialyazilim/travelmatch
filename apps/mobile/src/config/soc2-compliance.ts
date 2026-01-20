/**
 * SOC 2 Type II Compliance Configuration
 * Security, availability, processing integrity, confidentiality, and privacy
 *
 * Compliance Requirements:
 * - Access controls and authentication
 * - Data encryption (at rest and in transit)
 * - Audit logging
 * - Incident response
 * - Change management
 * - Risk assessment
 * - Vendor management
 */

import { logger } from '../utils/logger';

// Supabase client import removed - not currently used

// SOC 2 Trust Service Criteria
export const SOC2_CRITERIA = {
  // Security (CC)
  security: {
    accessControl: true,
    encryption: true,
    networkSecurity: true,
    systemOperations: true,
  },

  // Availability (A)
  availability: {
    performanceMonitoring: true,
    incidentManagement: true,
    backupRecovery: true,
    capacityPlanning: true,
  },

  // Processing Integrity (PI)
  processingIntegrity: {
    dataValidation: true,
    errorHandling: true,
    processingMonitoring: true,
  },

  // Confidentiality (C)
  confidentiality: {
    dataClassification: true,
    accessRestriction: true,
    dataDisposal: true,
  },

  // Privacy (P)
  privacy: {
    noticeChoice: true,
    collectionUse: true,
    disclosure: true,
    dataRetention: true,
  },
} as const;

// Security configuration
export const SECURITY_CONFIG = {
  // Password policy
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    expiryDays: 90,
    historyCount: 5, // Can't reuse last 5 passwords
  },

  // Session management
  session: {
    maxDuration: 24 * 60 * 60, // 24 hours
    idleTimeout: 30 * 60, // 30 minutes
    requireReauth: true, // For sensitive operations
  },

  // Multi-factor authentication
  mfa: {
    required: true, // Required for all admin users
    methods: ['totp', 'sms', 'email'],
    backupCodes: 10,
  },

  // IP whitelist (optional)
  ipWhitelist: {
    enabled: false,
    allowedRanges: [] as string[],
  },

  // Rate limiting
  rateLimit: {
    login: { attempts: 5, window: 15 * 60 }, // 5 attempts per 15 min
    api: { requests: 100, window: 60 }, // 100 req/min
    upload: { requests: 10, window: 60 * 60 }, // 10 uploads/hour
  },
} as const;

// Data encryption configuration
export const ENCRYPTION_CONFIG = {
  // At rest encryption
  atRest: {
    algorithm: 'AES-256-GCM',
    keyRotation: 90, // Days
    keyStorage: 'aws-kms', // or 'vault', 'cloud-kms'
  },

  // In transit encryption
  inTransit: {
    minTlsVersion: '1.3',
    cipherSuites: [
      'TLS_AES_128_GCM_SHA256',
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
    ],
    hsts: {
      enabled: true,
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },

  // Field-level encryption (for sensitive data)
  fieldLevel: {
    enabled: true,
    fields: [
      'payment_method.card_number',
      'payment_method.cvv',
      'user.ssn',
      'user.tax_id',
    ],
  },
} as const;

// Audit logging configuration
export const AUDIT_CONFIG = {
  // Events to log
  events: {
    authentication: [
      'login',
      'logout',
      'login_failed',
      'password_reset',
      'mfa_enabled',
    ],
    authorization: ['access_granted', 'access_denied', 'permission_changed'],
    dataAccess: ['read', 'create', 'update', 'delete'],
    configuration: [
      'setting_changed',
      'user_created',
      'user_deleted',
      'role_changed',
    ],
    security: [
      'encryption_key_rotated',
      'security_alert',
      'vulnerability_detected',
    ],
  },

  // Log retention
  retention: {
    default: 365, // Days
    security: 730, // 2 years for security events
    compliance: 2555, // 7 years for compliance
  },

  // Log storage
  storage: {
    provider: 'supabase', // or 'cloudwatch', 'datadog'
    encryption: true,
    immutable: true, // Cannot be modified after creation
  },
} as const;

interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  event: string;
  category: keyof typeof AUDIT_CONFIG.events;
  resource: string;
  action: string;
  result: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

/**
 * Log audit event
 * SECURITY: Audit logging is handled via Edge Function with service_role access
 * Client code never has access to service_role key
 */
export async function logAuditEvent(
  entry: Omit<AuditLogEntry, 'id' | 'timestamp'>,
): Promise<void> {
  try {
    // Import supabase client dynamically to avoid circular dependencies
    const { supabase } = await import('./supabase');
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      logger.warn('Cannot log audit event: No active session');
      return;
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      logger.error('Missing Supabase configuration for audit logging');
      return;
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/audit-logging/log`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      },
    );

    if (!response.ok) {
      logger.error('Failed to log audit event:', await response.text());
    }
  } catch (error) {
    logger.error('Failed to log audit event:', error);
    // Don't throw - logging failure shouldn't break the app
  }
}

/**
 * Query audit logs
 * SECURITY: Only admins can query audit logs via Edge Function
 */
export async function queryAuditLogs(filters: {
  userId?: string;
  event?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AuditLogEntry[]> {
  try {
    const { supabase } = await import('./supabase');
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('Authentication required');
    }

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      throw new Error('Missing Supabase configuration');
    }

    const queryParams = new URLSearchParams();
    if (filters.userId) queryParams.set('userId', filters.userId);
    if (filters.event) queryParams.set('event', filters.event);
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.startDate) queryParams.set('startDate', filters.startDate);
    if (filters.endDate) queryParams.set('endDate', filters.endDate);
    if (filters.limit) queryParams.set('limit', String(filters.limit));

    const response = await fetch(
      `${supabaseUrl}/functions/v1/audit-logging/query?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: anonKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to query audit logs');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    logger.error('Failed to query audit logs:', error);
    throw error;
  }
}

/**
 * Encrypt sensitive data
 */
export async function encryptData(data: string, key: string): Promise<string> {
  const crypto = require('crypto');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    iv,
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  });
}

/**
 * Decrypt sensitive data
 */
export async function decryptData(
  encryptedData: string,
  key: string,
): Promise<string> {
  const crypto = require('crypto');
  const { encrypted, iv, authTag } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex'),
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Check password against policy
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const policy = SECURITY_CONFIG.password;

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Incident response workflow
 */
export const INCIDENT_RESPONSE = {
  severity: {
    critical: {
      responseTime: 1, // Hours
      escalation: ['cto', 'ceo', 'security-team'],
      notification: ['email', 'sms', 'slack'],
    },
    high: {
      responseTime: 4,
      escalation: ['security-team', 'engineering-lead'],
      notification: ['email', 'slack'],
    },
    medium: {
      responseTime: 24,
      escalation: ['security-team'],
      notification: ['email'],
    },
    low: {
      responseTime: 72,
      escalation: ['security-team'],
      notification: ['ticket'],
    },
  },

  steps: [
    '1. Detection and Analysis',
    '2. Containment',
    '3. Eradication',
    '4. Recovery',
    '5. Post-Incident Review',
  ],

  communications: {
    internal: ['security-team@lovendo.xyz', 'engineering@lovendo.xyz'],
    external: ['customers@lovendo.xyz'],
    regulatory: ['gdpr-dpo@lovendo.xyz'],
  },
} as const;

/**
 * Data retention policy
 */
export const DATA_RETENTION = {
  // User data
  userProfiles: {
    active: 'indefinite',
    inactive: 365, // Delete after 1 year of inactivity
    deleted: 30, // Soft delete for 30 days, then hard delete
  },

  // Financial data
  transactions: {
    retention: 2555, // 7 years (legal requirement)
    archival: 365, // Archive after 1 year
  },

  // User content
  moments: {
    active: 'indefinite',
    deleted: 30, // Soft delete for 30 days
  },

  videos: {
    active: 'indefinite',
    deleted: 7, // Permanent delete after 7 days (expensive storage)
  },

  // Logs
  applicationLogs: 90,
  auditLogs: 730, // 2 years
  securityLogs: 2555, // 7 years
} as const;

/**
 * Vendor management
 */
export const VENDOR_MANAGEMENT = {
  vendors: [
    {
      name: 'Supabase',
      category: 'Database & Auth',
      soc2: true,
      gdpr: true,
      contract: 'annual',
      reviewDate: '2025-12-31',
    },
    {
      name: 'Mux',
      category: 'Video Infrastructure',
      soc2: true,
      gdpr: true,
      contract: 'annual',
      reviewDate: '2025-12-31',
    },
    {
      name: 'PayTR',
      category: 'Payment Processing',
      soc2: true,
      pciDss: true,
      contract: 'ongoing',
      reviewDate: 'quarterly',
    },
    {
      name: 'Sentry',
      category: 'Error Monitoring',
      soc2: true,
      gdpr: true,
      contract: 'annual',
      reviewDate: '2025-12-31',
    },
    {
      name: 'OpenAI',
      category: 'AI Services',
      soc2: true,
      contract: 'ongoing',
      reviewDate: 'quarterly',
    },
  ],

  requirements: {
    minimumStandards: ['SOC 2 Type II', 'ISO 27001'],
    dataProcessing: 'Data Processing Agreement required',
    securityReview: 'Annual security review required',
    incidentNotification: '24 hours for security incidents',
  },
} as const;

/**
 * Compliance checklist
 */
export const COMPLIANCE_CHECKLIST = {
  security: [
    'Multi-factor authentication enabled',
    'Password policy enforced',
    'Encryption at rest (AES-256)',
    'Encryption in transit (TLS 1.3)',
    'Regular security assessments',
    'Penetration testing (annual)',
    'Vulnerability scanning (weekly)',
  ],

  availability: [
    'Uptime monitoring (99.99% SLA)',
    'Automated backups (daily)',
    'Disaster recovery plan',
    'Incident response plan',
    'Capacity planning',
  ],

  processingIntegrity: [
    'Input validation',
    'Error logging',
    'Transaction monitoring',
    'Data integrity checks',
  ],

  confidentiality: [
    'Data classification policy',
    'Access controls (RBAC)',
    'Secure data disposal',
    'Confidentiality agreements',
  ],

  privacy: [
    'Privacy policy published',
    'Cookie consent',
    'GDPR compliance',
    'CCPA compliance',
    'Data subject rights (access, deletion)',
    'Data breach notification process',
  ],
} as const;
