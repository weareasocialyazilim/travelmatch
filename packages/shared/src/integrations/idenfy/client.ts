/**
 * iDenfy KYC Integration Client
 *
 * Provides identity verification services for Lovendo platform.
 * https://documentation.idenfy.com/
 *
 * @module integrations/idenfy
 */

export interface IdenfyConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string;
}

export interface IdenfyTokenRequest {
  /** Unique user identifier (required) */
  clientId: string;
  /** User's first name for cross-matching */
  firstName?: string;
  /** User's last name for cross-matching */
  lastName?: string;
  /** Redirect URL on success */
  successUrl?: string;
  /** Redirect URL on error */
  errorUrl?: string;
  /** Redirect URL if unverified */
  unverifiedUrl?: string;
  /** Webhook callback URL */
  callbackUrl?: string;
  /** UI locale (e.g., 'en', 'tr') */
  locale?: string;
  /** Token expiry time in seconds (default: 600) */
  expiryTime?: number;
  /** Country code for document (e.g., 'tr') */
  country?: string;
  /** Allowed document types */
  documents?: (
    | 'ID_CARD'
    | 'PASSPORT'
    | 'DRIVER_LICENSE'
    | 'RESIDENCE_PERMIT'
  )[];
}

export interface IdenfyTokenResponse {
  message: string;
  /** Authentication token for verification session */
  authToken: string;
  /** Unique scan reference ID */
  scanRef: string;
  clientId: string;
  /** 8-digit mobile code (if generateDigitString was true) */
  digitString?: string;
  successUrl?: string;
  errorUrl?: string;
  unverifiedUrl?: string;
  callbackUrl?: string;
  locale: string;
  expiryTime: number;
}

export interface IdenfyWebhookPayload {
  /** Unique scan reference */
  scanRef: string;
  clientId: string;
  /** Overall verification status */
  status: {
    overall:
      | 'APPROVED'
      | 'DENIED'
      | 'SUSPECTED'
      | 'REVIEWING'
      | 'ACTIVE'
      | 'EXPIRED'
      | 'DELETED';
    autoDocument?: 'DOC_VALIDATED' | 'DOC_NOT_VALIDATED' | 'DOC_NOT_FOUND';
    autoFace?: 'FACE_MATCH' | 'FACE_MISMATCH' | 'NO_FACE_FOUND';
    manualDocument?: 'DOC_VALIDATED' | 'DOC_NOT_VALIDATED';
    manualFace?: 'FACE_MATCH' | 'FACE_MISMATCH';
  };
  /** Extracted document data */
  data?: {
    docFirstName?: string;
    docLastName?: string;
    docNumber?: string;
    docPersonalCode?: string;
    docExpiry?: string;
    docDob?: string;
    docNationality?: string;
    docType?: string;
    docIssuingCountry?: string;
    docSex?: string;
  };
  /** Fraud check results */
  fraudChecks?: {
    fraudTags?: string[];
    mismatchTags?: string[];
  };
  /** Timestamps */
  finishTime?: string;
  startTime?: string;
}

/**
 * iDenfy API Client
 *
 * @example
 * ```typescript
 * const idenfy = new IdenfyClient({
 *   apiKey: process.env.IDENFY_API_KEY!,
 *   apiSecret: process.env.IDENFY_API_SECRET!,
 * });
 *
 * // Generate verification token
 * const token = await idenfy.generateToken({
 *   clientId: user.id,
 *   firstName: user.firstName,
 *   lastName: user.lastName,
 *   callbackUrl: 'https://api.lovendo.com/webhooks/idenfy',
 * });
 *
 * // Use token.authToken to redirect user to verification
 * ```
 */
export class IdenfyClient {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl: string;

  constructor(config: IdenfyConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl || 'https://ivs.idenfy.com/api/v2';
  }

  /**
   * Generate a verification token for KYC session
   */
  async generateToken(
    request: IdenfyTokenRequest,
  ): Promise<IdenfyTokenResponse> {
    const response = await fetch(`${this.baseUrl}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({
        clientId: request.clientId,
        firstName: request.firstName,
        lastName: request.lastName,
        successUrl: request.successUrl,
        errorUrl: request.errorUrl,
        unverifiedUrl: request.unverifiedUrl,
        callbackUrl: request.callbackUrl,
        locale: request.locale || 'tr',
        expiryTime: request.expiryTime || 600,
        country: request.country,
        documents: request.documents,
        tokenType: 'IDENTIFICATION',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new IdenfyError(
        `Failed to generate token: ${response.status}`,
        response.status,
        error,
      );
    }

    return response.json();
  }

  /**
   * Get verification status by scanRef
   */
  async getVerificationStatus(scanRef: string): Promise<IdenfyWebhookPayload> {
    const response = await fetch(`${this.baseUrl}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
      },
      body: JSON.stringify({ scanRef }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new IdenfyError(
        `Failed to get status: ${response.status}`,
        response.status,
        error,
      );
    }

    return response.json();
  }

  /**
   * Validate webhook signature
   * Call this before processing webhook to ensure it's from iDenfy
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    signingSecret: string,
  ): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', signingSecret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Parse webhook payload and map to KYC status
   */
  parseWebhookToKycStatus(payload: IdenfyWebhookPayload): {
    status: 'verified' | 'pending' | 'rejected' | 'expired';
    scanRef: string;
    clientId: string;
    data?: IdenfyWebhookPayload['data'];
    fraudTags?: string[];
  } {
    const { status, scanRef, clientId, data, fraudChecks } = payload;

    let kycStatus: 'verified' | 'pending' | 'rejected' | 'expired';

    switch (status.overall) {
      case 'APPROVED':
        kycStatus = 'verified';
        break;
      case 'REVIEWING':
      case 'ACTIVE':
        kycStatus = 'pending';
        break;
      case 'EXPIRED':
        kycStatus = 'expired';
        break;
      case 'DENIED':
      case 'SUSPECTED':
      case 'DELETED':
      default:
        kycStatus = 'rejected';
        break;
    }

    return {
      status: kycStatus,
      scanRef,
      clientId,
      data,
      fraudTags: fraudChecks?.fraudTags,
    };
  }

  /**
   * Get verification URL for redirect
   */
  getVerificationUrl(authToken: string): string {
    return `https://ivs.idenfy.com/api/v2/redirect?authToken=${authToken}`;
  }

  /**
   * Get verification URL for iframe embed
   */
  getIframeUrl(authToken: string): string {
    return `https://ui.idenfy.com/?authToken=${authToken}`;
  }
}

/**
 * iDenfy API Error
 */
export class IdenfyError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'IdenfyError';
  }
}

// Factory function for easier initialization
export function createIdenfyClient(
  config?: Partial<IdenfyConfig>,
): IdenfyClient {
  const apiKey = config?.apiKey || process.env.IDENFY_API_KEY;
  const apiSecret = config?.apiSecret || process.env.IDENFY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('iDenfy API key and secret are required');
  }

  return new IdenfyClient({
    apiKey,
    apiSecret,
    baseUrl: config?.baseUrl,
  });
}
