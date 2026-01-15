#!/bin/bash

# Update GitHub Secrets for new Infisical workspace
# Run this script to update GitHub repository secrets

REPO="weareasocialyazilim/lovendo"

echo "🔐 Updating GitHub Secrets for Infisical (new workspace)"
echo "=================================================="
echo ""
echo "Machine Identity: GitHub Actions Lovendo"
echo "Client ID: 8533cb5a-07f0-446f-9b89-84e6677e55a8"
echo ""
echo "You need to update these secrets in GitHub:"
echo "https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "1. INFISICAL_CLIENT_ID"
echo "   Value: 8533cb5a-07f0-446f-9b89-84e6677e55a8"
echo ""
echo "2. INFISICAL_CLIENT_SECRET"
echo "   Value: (use the client secret you created earlier)"
echo "   Note: You created this in Infisical dashboard"
echo ""
echo "If you don't have the client secret, create a new one:"
echo "1. Go to: https://app.infisical.com/project/fa0ed450-40e2-4063-b4f4-ce5cca83a57e/access-management"
echo "2. Click: GitHub Actions Lovendo > Universal Auth > Add Client Secret"
echo "3. Copy the secret and add to GitHub"
echo ""
echo "After updating secrets, GitHub Actions will use the new Infisical workspace! ✅"
