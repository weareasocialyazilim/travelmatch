#!/bin/bash

# Fix unescaped apostrophes in JSX

cd /Users/kemalteksal/Documents/travelmatch-new

# Common patterns - replace ' with &apos; or use double quotes
# This is safer - we'll use proper apostrophes

# Files with known issues from lint output
files=(
  "src/components/ReportBlockBottomSheet.tsx"
  "src/components/RequestMoreProofBottomSheet.tsx"
  "src/screens/CacheSuccessScreen.tsx"
  "src/screens/CardAddedSuccessScreen.tsx"
  "src/screens/GiftSentSuccessScreen.tsx"
  "src/screens/HowEscrowWorksScreen.tsx"
  "src/screens/IdentityVerificationDocumentScreen.tsx"
  "src/screens/IdentityVerificationIntroScreen.tsx"
  "src/screens/IdentityVerificationPendingScreen.tsx"
  "src/screens/JourneyScreen.tsx"
  "src/screens/MaintenanceScreen.tsx"
  "src/screens/PaymentFailedScreen.tsx"
  "src/screens/PaymentMethodsScreen.tsx"
  "src/screens/ProfileDetailScreen.tsx"
  "src/screens/ProofApprovedScreen.tsx"
  "src/screens/ReportUserScreen.tsx"
  "src/screens/ReputationScreen.tsx"
  "src/screens/ReviewProofScreen.tsx"
  "src/screens/ReviewProofsScreen.tsx"
  "src/screens/SavedMomentsScreen.tsx"
  "src/screens/SuccessConfirmationScreen.tsx"
  "src/screens/TrustNotesScreen.tsx"
  "src/screens/VerifyCodeScreen.tsx"
  "src/screens/WaitingForCodeScreen.tsx"
  "src/screens/WithdrawSuccessScreen.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace common patterns
    sed -i '' "s/Don't /Don\&apos;t /g" "$file"
    sed -i '' "s/don't /don\&apos;t /g" "$file"
    sed -i '' "s/can't /can\&apos;t /g" "$file"
    sed -i '' "s/won't /won\&apos;t /g" "$file"
    sed -i '' "s/isn't /isn\&apos;t /g" "$file"
    sed -i '' "s/doesn't /doesn\&apos;t /g" "$file"
    sed -i '' "s/haven't /haven\&apos;t /g" "$file"
    sed -i '' "s/you're /you\&apos;re /g" "$file"
    sed -i '' "s/You're /You\&apos;re /g" "$file"
    sed -i '' "s/we're /we\&apos;re /g" "$file"
    sed -i '' "s/We're /We\&apos;re /g" "$file"
    sed -i '' "s/it's /it\&apos;s /g" "$file"
    sed -i '' "s/It's /It\&apos;s /g" "$file"
    sed -i '' "s/I'm /I\&apos;m /g" "$file"
    sed -i '' "s/that's /that\&apos;s /g" "$file"
    sed -i '' "s/That's /That\&apos;s /g" "$file"
    sed -i '' "s/here's /here\&apos;s /g" "$file"
    sed -i '' "s/Here's /Here\&apos;s /g" "$file"
    sed -i '' "s/what's /what\&apos;s /g" "$file"
    sed -i '' "s/What's /What\&apos;s /g" "$file"
  fi
done

echo "Fixed unescaped apostrophes in JSX"
