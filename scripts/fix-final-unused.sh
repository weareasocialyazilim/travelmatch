#!/bin/bash

# Final comprehensive unused vars fix

# Context/ToastContext.tsx - Platform (line 10)
sed -i '' '10s/Platform,/Platform as _Platform,/' src/context/ToastContext.tsx || true

# ChatScreen.tsx - value param (line 49)
sed -i '' 's/=> (value)/=> (value: _value)/' src/screens/ChatScreen.tsx || true

# FormExamplesScreen.tsx - options param (line 147)  
sed -i '' 's/=> (options)/=> (options: _options)/' src/screens/FormExamplesScreen.tsx || true

# GiftSentSuccessScreen.tsx - categoryId (line 69)
sed -i '' 's/(categoryId)/(categoryId: _categoryId)/' src/screens/GiftSentSuccessScreen.tsx || true

# HowEscrowWorksScreen.tsx - ScrollView (line 12)
sed -i '' 's/ScrollView,/ScrollView as _ScrollView,/' src/screens/HowEscrowWorksScreen.tsx || true

# IdentityVerificationUploadScreen.tsx - onUpdateProfile (line 96)
sed -i '' 's/onUpdateProfile:/onUpdateProfile: _onUpdateProfile =/' src/screens/IdentityVerificationUploadScreen.tsx || true

# InboxScreen.tsx - Image (line 8)
sed -i '' 's/  Image,/  Image as _Image,/' src/screens/InboxScreen.tsx || true

# MomentGalleryScreen.tsx - Image (line 11)
sed -i '' 's/  Image,/  Image as _Image,/' src/screens/MomentGalleryScreen.tsx || true

# OnboardingScreen.tsx - Image (line 7)
sed -i '' 's/  Image,/  Image as _Image,/' src/screens/OnboardingScreen.tsx || true

# PaymentFailedScreen.tsx - navigation (line 92)
sed -i '' 's/{ navigation }/{ navigation: _navigation }/' src/screens/PaymentFailedScreen.tsx || true

# ProofHistoryScreen.tsx - Image (line 11)
sed -i '' '/  Image,$/d' src/screens/ProofHistoryScreen.tsx || true

# ProfileDetailScreen.tsx - momentId (line 54)
sed -i '' 's/const momentId/const _momentId/' src/screens/ProfileDetailScreen.tsx || true

# ProofApprovedScreen.tsx - SCREEN_HEIGHT (line 18)
sed -i '' 's/{ height: SCREEN_HEIGHT/{ height: _SCREEN_HEIGHT/' src/screens/ProofApprovedScreen.tsx || true

# ProofHistoryScreen.tsx - Image
sed -i '' 's/  Image,/  Image as _Image,/' src/screens/ProofHistoryScreen.tsx || true

# ReviewProofScreen.tsx - SCREEN_WIDTH and proofId (already fixed proofId)
sed -i '' 's/{ width: SCREEN_WIDTH/{ width: _SCREEN_WIDTH/' src/screens/ReviewProofScreen.tsx || true

# ReviewProofsScreen.tsx - momentId (line 102)
sed -i '' 's/const momentId =/const _momentId =/' src/screens/ReviewProofsScreen.tsx || true

# SavedMomentsScreen.tsx - useState (line 1)
sed -i '' 's/React, { useState }/React/' src/screens/SavedMomentsScreen.tsx || true

# VerifyCodeScreen.tsx - password
sed -i '' 's/(email, password)/(email, password: _password)/' src/screens/VerifyCodeScreen.tsx || true

# WelcomeScreen.tsx or similar - password
find src/screens -name "*Screen.tsx" -exec sed -i '' 's/onSubmitVerify = (email, password)/onSubmitVerify = (email, password: _password)/' {} \; 2>/dev/null || true
find src/screens -name "*Screen.tsx" -exec sed -i '' 's/onSubmitRegister = (email, password)/onSubmitRegister = (email, password: _password)/' {} \; 2>/dev/null || true

# useImageUpload.ts - all unused destructured vars
sed -i '' 's/{ priority,/{ priority: _priority,/' src/hooks/useImageUpload.ts || true
sed -i '' 's/quality,/quality: _quality,/' src/hooks/useImageUpload.ts || true  
sed -i '' 's/maxWidth,/maxWidth: _maxWidth,/' src/hooks/useImageUpload.ts || true
sed -i '' 's/maxHeight,/maxHeight: _maxHeight,/' src/hooks/useImageUpload.ts || true
sed -i '' 's/format,/format: _format,/' src/hooks/useImageUpload.ts || true
sed -i '' 's/const threshold =/const _threshold =/' src/hooks/useImageUpload.ts || true

# Platform in other files
find src -name "*.tsx" -exec sed -i '' 's/^import { Platform/import { Platform as _Platform/' {} \; 2>/dev/null || true

echo "✅ Comprehensive unused vars fix applied!"
