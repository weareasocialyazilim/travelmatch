#!/bin/bash

# Comprehensive fix for all remaining unused variables

# ChatScreen - value param (line 49)
sed -i '' 's/(value)/(value: _value)/' src/screens/ChatScreen.tsx

# FormExamplesScreen - options param (line 147)
sed -i '' 's/(options)/(options: _options)/' src/screens/FormExamplesScreen.tsx

# GiftSentSuccessScreen - categoryId (line 69)
sed -i '' 's/{categoryId}/{categoryId: _categoryId}/' src/screens/GiftSentSuccessScreen.tsx

# HowEscrowWorksScreen - ScrollView
sed -i '' 's/, ScrollView//' src/screens/HowEscrowWorksScreen.tsx

# IdentityVerificationUploadScreen - onUpdateProfile (line 96)
sed -i '' 's/onUpdateProfile:/onUpdateProfile: _onUpdateProfile =/' src/screens/IdentityVerificationUploadScreen.tsx

# InboxScreen - Image
sed -i '' 's/  Image,//' src/screens/InboxScreen.tsx

# MomentGalleryScreen - Image
sed -i '' 's/  Image,//' src/screens/MomentGalleryScreen.tsx

# OnboardingScreen - Image  
sed -i '' '/^  Image,$/d' src/screens/OnboardingScreen.tsx

# PaymentFailedScreen - navigation (line 92)
sed -i '' 's/}: { navigation,/}: { navigation: _navigation,/' src/screens/PaymentFailedScreen.tsx

# ProofHistoryScreen - Image
sed -i '' 's/  SafeAreaView,$/  SafeAreaView,\n  Image,/' src/screens/ProofHistoryScreen.tsx

# ProfileDetailScreen - momentId (line 53/54)
sed -i '' 's/= momentId;/= momentId as _momentId;/' src/screens/ProfileDetailScreen.tsx

# ProofApprovedScreen - SCREEN_HEIGHT (line 18)
sed -i '' 's/const { height: SCREEN_HEIGHT/const { height: _SCREEN_HEIGHT/' src/screens/ProofApprovedScreen.tsx

# ReviewProofScreen - SCREEN_WIDTH and proofId
sed -i '' 's/const { width: SCREEN_WIDTH/const { width: _SCREEN_WIDTH/' src/screens/ReviewProofScreen.tsx  
sed -i '' 's/const { proofId }/const { proofId: _proofId }/' src/screens/ReviewProofScreen.tsx

# ReviewProofsScreen - momentId (line 102)
sed -i '' 's/const momentId/const _momentId/' src/screens/ReviewProofsScreen.tsx

# SavedMomentsScreen - useState and Image
sed -i '' 's/React, { useState }/React/' src/screens/SavedMomentsScreen.tsx
sed -i '' 's/  Image,//' src/screens/SavedMomentsScreen.tsx

# VerifyCodeScreen and SignUpScreen - password params
sed -i '' 's/(email, password)/(email, password: _password)/' src/screens/VerifyCodeScreen.tsx || true
sed -i '' 's/(email, password)/(email, password: _password)/' src/screens/SignUpScreen.tsx || true

# useImageUpload - priority, quality, etc (lines 112, 134, 153)
sed -i '' 's/priority,/priority: _priority,/' src/hooks/useImageUpload.ts
sed -i '' 's/quality,/quality: _quality,/' src/hooks/useImageUpload.ts
sed -i '' 's/maxWidth,/maxWidth: _maxWidth,/' src/hooks/useImageUpload.ts
sed -i '' 's/maxHeight,/maxHeight: _maxHeight,/' src/hooks/useImageUpload.ts
sed -i '' 's/format,/format: _format,/' src/hooks/useImageUpload.ts
sed -i '' 's/threshold /threshold: _threshold /' src/hooks/useImageUpload.ts

# PhotoSelectionScreen - Platform (line 8)
sed -i '' 's/Platform,$/Platform as _Platform,/' src/screens/PhotoSelectionScreen.tsx || true

echo "✅ Fixed all remaining unused variables!"
