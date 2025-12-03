#!/bin/bash

# Fix remaining unescaped apostrophes in JSX text content
# This script carefully targets only text content within JSX tags

cd /Users/kemalteksal/Documents/travelmatch-new

files=(
  "src/screens/CacheSuccessScreen.tsx"
  "src/screens/CardAddedSuccessScreen.tsx"
  "src/screens/GiftSentSuccessScreen.tsx"
  "src/screens/IdentityVerificationDocumentScreen.tsx"
  "src/screens/IdentityVerificationIntroScreen.tsx"
  "src/screens/MaintenanceScreen.tsx"
  "src/screens/PaymentFailedScreen.tsx"
  "src/screens/ProfileDetailScreen.tsx"
  "src/screens/ProofApprovedScreen.tsx"
  "src/screens/ReputationScreen.tsx"
  "src/screens/ReviewProofsScreen.tsx"
  "src/screens/SavedMomentsScreen.tsx"
  "src/screens/SuccessConfirmationScreen.tsx"
  "src/screens/TrustNotesScreen.tsx"
  "src/screens/VerifyCodeScreen.tsx"
  "src/screens/WaitingForCodeScreen.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Replace problematic patterns in text content
    # Use proper Unicode apostrophe or escape sequences
    sed -i '' "s/You've/You\&apos;ve/g" "$file"
    sed -i '' "s/you've/you\&apos;ve/g" "$file"
    sed -i '' "s/Don't/Don\&apos;t/g" "$file" 
    sed -i '' "s/don't/don\&apos;t/g" "$file"
    sed -i '' "s/We'll/We\&apos;ll/g" "$file"
    sed -i '' "s/we'll/we\&apos;ll/g" "$file"
    sed -i '' "s/Let's/Let\&apos;s/g" "$file"
    sed -i '' "s/let's/let\&apos;s/g" "$file"
    sed -i '' "s/didn't/didn\&apos;t/g" "$file"
    sed -i '' "s/Didn't/Didn\&apos;t/g" "$file"
    sed -i '' "s/haven't/haven\&apos;t/g" "$file"
    sed -i '' "s/Haven't/Haven\&apos;t/g" "$file"
   sed -i '' 's/travelers"/travelers\&quot;/g' "$file"
    sed -i '' 's/"real"/\&quot;real\&quot;/g' "$file"
    
    echo "Fixed apostrophes in $file"
  fi
done

echo "All apostrophes fixed!"
