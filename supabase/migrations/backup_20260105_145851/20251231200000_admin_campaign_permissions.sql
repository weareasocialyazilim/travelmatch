-- Admin Campaign & Promo Permissions Migration
-- Migration: 20251231200000_admin_campaign_permissions
-- Purpose: Add permissions for campaign and promo management

-- =====================================================
-- ADD CAMPAIGN PERMISSIONS
-- =====================================================

-- Super Admin - Full campaign access (already has via super_admin role)
INSERT INTO role_permissions (role, resource, action) VALUES
  ('super_admin', 'campaigns', 'view'),
  ('super_admin', 'campaigns', 'create'),
  ('super_admin', 'campaigns', 'update'),
  ('super_admin', 'campaigns', 'delete'),
  ('super_admin', 'campaigns', 'export'),
  ('super_admin', 'notifications', 'view'),
  ('super_admin', 'notifications', 'create'),
  ('super_admin', 'notifications', 'update'),
  ('super_admin', 'notifications', 'delete'),
  ('super_admin', 'notifications', 'export'),
  ('super_admin', 'promos', 'view'),
  ('super_admin', 'promos', 'create'),
  ('super_admin', 'promos', 'update'),
  ('super_admin', 'promos', 'delete'),
  ('super_admin', 'promos', 'export')
ON CONFLICT DO NOTHING;

-- Manager permissions for campaigns
INSERT INTO role_permissions (role, resource, action) VALUES
  ('manager', 'campaigns', 'view'),
  ('manager', 'campaigns', 'create'),
  ('manager', 'campaigns', 'update'),
  ('manager', 'campaigns', 'export'),
  ('manager', 'notifications', 'view'),
  ('manager', 'notifications', 'create'),
  ('manager', 'notifications', 'update'),
  ('manager', 'notifications', 'export'),
  ('manager', 'promos', 'view'),
  ('manager', 'promos', 'create'),
  ('manager', 'promos', 'update'),
  ('manager', 'promos', 'export')
ON CONFLICT DO NOTHING;

-- Marketing team - Full campaign & promo management
INSERT INTO role_permissions (role, resource, action) VALUES
  ('marketing', 'campaigns', 'view'),
  ('marketing', 'campaigns', 'create'),
  ('marketing', 'campaigns', 'update'),
  ('marketing', 'campaigns', 'delete'),
  ('marketing', 'campaigns', 'export'),
  ('marketing', 'notifications', 'view'),
  ('marketing', 'notifications', 'create'),
  ('marketing', 'notifications', 'update'),
  ('marketing', 'notifications', 'export'),
  ('marketing', 'promos', 'view'),
  ('marketing', 'promos', 'create'),
  ('marketing', 'promos', 'update'),
  ('marketing', 'promos', 'delete'),
  ('marketing', 'promos', 'export')
ON CONFLICT DO NOTHING;

-- Finance team - View access for budget tracking
INSERT INTO role_permissions (role, resource, action) VALUES
  ('finance', 'campaigns', 'view'),
  ('finance', 'campaigns', 'export'),
  ('finance', 'promos', 'view'),
  ('finance', 'promos', 'export')
ON CONFLICT DO NOTHING;

-- Support team - View access
INSERT INTO role_permissions (role, resource, action) VALUES
  ('support', 'campaigns', 'view'),
  ('support', 'promos', 'view')
ON CONFLICT DO NOTHING;

-- Viewer - Read-only access
INSERT INTO role_permissions (role, resource, action) VALUES
  ('viewer', 'campaigns', 'view'),
  ('viewer', 'notifications', 'view'),
  ('viewer', 'promos', 'view')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE notification_campaigns IS 'Push/email/SMS notification campaigns managed by admin panel';
COMMENT ON TABLE marketing_campaigns IS 'Marketing campaigns with budget tracking and performance metrics';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes linked to marketing campaigns';
COMMENT ON TABLE promo_code_usage IS 'Tracks promo code redemptions per user';
