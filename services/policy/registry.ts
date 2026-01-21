export type PolicyEndpoint =
  | 'claim.create'
  | 'proof.submit'
  | 'gift.create'
  | 'escrow.hold'
  | 'escrow.release'
  | 'escrow.refund'
  | 'chat.unlock.request'
  | 'chat.unlock.approve'
  | 'location.override.set'
  | 'report.create'
  | 'review.create';

export const POLICY_ENDPOINTS: PolicyEndpoint[] = [
  'claim.create',
  'proof.submit',
  'gift.create',
  'escrow.hold',
  'escrow.release',
  'escrow.refund',
  'chat.unlock.request',
  'chat.unlock.approve',
  'location.override.set',
  'report.create',
  'review.create',
];
