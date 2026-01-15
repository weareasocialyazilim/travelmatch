/**
 * Proof Security & Verification Constants
 * Lovendo - Escrow proof system security rules
 */

// ============================================
// PROOF VERIFICATION LAYERS
// ============================================
export const PROOF_VERIFICATION_LAYERS = {
  // Layer 1: Live capture enforcement (most secure)
  layer1_capture: {
    method: 'in_app_camera_only' as const, // No gallery selection
    requirements: {
      mustBeLiveCapture: true,
      maxAgeSeconds: 300, // 5 minutes to upload
      blockScreenshots: true,
    },
  },

  // Layer 2: Metadata validation
  layer2_metadata: {
    checkExif: true,
    validateLocation: {
      enabled: true,
      maxDistanceFromMomentKm: 50, // 50km proximity to moment location
    },
    validateTimestamp: {
      enabled: true,
      mustBeAfterGiftDate: true,
      maxDaysAfterGift: 30,
    },
  },

  // Layer 3: AI analysis (fraud detection)
  layer3_ai: {
    detectPhotoshop: true,
    detectScreenshot: true,
    detectStockPhoto: true,
    confidenceThreshold: 0.85,
  },
} as const;

// ============================================
// RATE LIMITS
// ============================================
export const PROOF_RATE_LIMITS = {
  perEscrow: 3, // Max 3 attempts per escrow
  perUserPerDay: 10, // Max 10 proof uploads per day
  cooldownMinutes: 5, // 5 min wait after failed attempt
} as const;

// ============================================
// PROOF UX FLOW
// ============================================
export const PROOF_UX_FLOW = {
  // Step 1: Notification
  notification: {
    title: 'Deneyimini paylaş! 📸',
    body: 'Kahveni içtin mi? Kanıtını yükle, ödemen hesabına geçsin.',
    action: 'Fotoğraf Çek',
  },

  // Step 2: Camera screen (no gallery)
  cameraScreen: {
    showGalleryOption: false, // Security: no gallery
    overlay: {
      text: 'Deneyimini gösteren bir fotoğraf çek',
      examples: ['Kahve fincanı', 'Mekan', 'Makbuz/fiş'],
    },
    maxPhotos: 1, // Single photo for simplicity
  },

  // Step 3: Confirm + optional description
  confirmScreen: {
    showPreview: true,
    descriptionOptional: true,
    descriptionPlaceholder: 'Nasıl geçti? (opsiyonel)',
    submitButton: 'Gönder ✓',
  },

  // Step 4: Success
  successScreen: {
    message: 'Kanıtın gönderildi!',
    subtext: 'Onaylandığında ödemen hesabına geçecek.',
    nextAction: 'Teşekkür Notu Yaz',
  },
} as const;

// ============================================
// DISPUTE RESOLUTION
// ============================================
export const DISPUTE_RESOLUTION = {
  // Auto-resolve rules (minimize human intervention)
  autoResolve: {
    // Sender no response in 72 hours → Auto APPROVE
    senderNoResponse: {
      timeoutHours: 72,
      action: 'auto_release' as const,
    },

    // Receiver no proof in 7 days → Auto REFUND
    receiverNoProof: {
      timeoutDays: 7,
      action: 'auto_refund' as const,
    },

    // Low AI score → Manual review
    lowAiScore: {
      threshold: 0.5,
      action: 'admin_review' as const,
    },
  },

  // Dispute process
  dispute: {
    receiverCanAppeal: true,
    appealWindowHours: 48,
    additionalProofAllowed: true,
    maxAdditionalProofs: 2,
    finalDecision: 'admin_only' as const, // No community jury (manipulation risk)
    adminResponseSLA: 48, // 48 hours
  },

  // Repeat offenders
  repeatOffenders: {
    thresholdLosses: 3, // 3 disputes lost → increased escrow requirement
    action: 'increase_escrow_requirement' as const,
    banThreshold: 5, // 5 disputes → account review
  },
} as const;

// ============================================
// ESCROW TIMEOUTS
// ============================================
export const ESCROW_TIMEOUTS = {
  // Proof upload deadline
  proofUploadDeadlineDays: 7,

  // Sender approval deadline
  senderApprovalDeadlineHours: 72,

  // Auto-release after approval timeout
  autoReleaseAfterTimeoutHours: 72,

  // Extension allowed (by sender)
  extensionAllowed: true,
  maxExtensionDays: 7,
} as const;

// ============================================
// PROOF CONTENT RULES
// ============================================
export const PROOF_CONTENT_RULES = {
  // Photo requirements
  photo: {
    minCount: 1,
    maxCount: 3,
    minWidth: 800,
    minHeight: 600,
    maxFileSizeMB: 20,
    allowedFormats: ['jpeg', 'jpg', 'png'],
  },

  // Description
  description: {
    required: false,
    minLength: 0,
    maxLength: 500,
  },

  // Location
  location: {
    required: false,
    validateProximity: true,
    maxProximityKm: 50,
  },
} as const;

// ============================================
// NOTIFICATION TRIGGERS
// ============================================
export const NOTIFICATION_TRIGGERS = {
  // To receiver
  toReceiver: {
    giftReceived: {
      immediate: true,
      titleKey: 'notification.gift_received.title',
      bodyKey: 'notification.gift_received.body',
    },
    proofReminder: {
      delayHours: 24,
      titleKey: 'notification.proof_reminder.title',
      bodyKey: 'notification.proof_reminder.body',
    },
    proofApproved: {
      immediate: true,
      titleKey: 'notification.proof_approved.title',
      bodyKey: 'notification.proof_approved.body',
    },
    proofRejected: {
      immediate: true,
      titleKey: 'notification.proof_rejected.title',
      bodyKey: 'notification.proof_rejected.body',
    },
  },

  // To sender
  toSender: {
    proofUploaded: {
      immediate: true,
      titleKey: 'notification.proof_uploaded.title',
      bodyKey: 'notification.proof_uploaded.body',
      deepLink: 'lovendo://proof-review/{escrowId}',
    },
    approvalReminder: {
      delayHours: 48,
      titleKey: 'notification.approval_reminder.title',
      bodyKey: 'notification.approval_reminder.body',
    },
    autoApproved: {
      immediate: true,
      titleKey: 'notification.auto_approved.title',
      bodyKey: 'notification.auto_approved.body',
    },
  },
} as const;

// ============================================
// DEEP LINKS
// ============================================
export const DEEP_LINKS = {
  'proof-review': {
    screen: 'ProofReview',
    params: ['escrowId'],
  },
  'upload-proof': {
    screen: 'ProofFlow',
    params: ['escrowId', 'momentId'],
    autoOpenCamera: true,
  },
  'write-trust-note': {
    screen: 'TrustNotes',
    params: ['receiverId', 'momentId'],
  },
  'escrow-status': {
    screen: 'EscrowStatus',
    params: ['escrowId'],
  },
  'gesture-received': {
    screen: 'GestureReceived',
    params: ['gestureId'],
  },
} as const;

export default {
  PROOF_VERIFICATION_LAYERS,
  PROOF_RATE_LIMITS,
  PROOF_UX_FLOW,
  DISPUTE_RESOLUTION,
  ESCROW_TIMEOUTS,
  PROOF_CONTENT_RULES,
  NOTIFICATION_TRIGGERS,
  DEEP_LINKS,
};
