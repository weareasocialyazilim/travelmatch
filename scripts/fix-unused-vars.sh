#!/bin/bash

# Fix unused variables by prefixing with underscore

# ErrorBoundary.tsx - line 82
sed -i '' '82s/const { children }/const { children: _children }/' src/components/ErrorBoundary.tsx

# RemoveCardModal.tsx - line 23
sed -i '' '23s/cardLast4 = /cardLast4: _cardLast4 = /' src/components/RemoveCardModal.tsx

# ShareProofModal.tsx - line 13 - remove logger import
sed -i '' '13d' src/components/ShareProofModal.tsx

# AdvancedFilterPanel.tsx - line 60
sed -i '' '60s/hasActiveFilters }/hasActiveFilters: _hasActiveFilters }/' src/components/ui/AdvancedFilterPanel.tsx

# EnhancedLoginForm.tsx - line 34
sed -i '' '34s/formState: { errors,/formState: { errors: _errors,/' src/components/ui/EnhancedLoginForm.tsx

# ToastContext.tsx - line 9 - remove Platform
sed -i '' '/^import { Platform } from/d' src/context/ToastContext.tsx

# CategorySelectionScreen.tsx - line 12 - remove ScrollView
sed -i '' 's/, ScrollView//' src/screens/CategorySelectionScreen.tsx

# ChatScreen.tsx - line 49 - fix value param
sed -i '' '49s/(value)/(value: _value)/' src/screens/ChatScreen.tsx

# FormExamplesScreen.tsx - line 147 - fix options param  
sed -i '' '147s/(options)/(options: _options)/' src/screens/FormExamplesScreen.tsx

# GiftSentSuccessScreen.tsx - line 69 - fix categoryId param
sed -i '' 's/categoryId,/_categoryId,/' src/screens/GiftSentSuccessScreen.tsx

# HowEscrowWorksScreen.tsx - remove ScrollView (line 12)
sed -i '' 's/, ScrollView//' src/screens/HowEscrowWorksScreen.tsx

# IdentityVerificationUploadScreen.tsx - line 96
sed -i '' '96s/onUpdateProfile/onUpdateProfile: _onUpdateProfile/' src/screens/IdentityVerificationUploadScreen.tsx

# InboxScreen.tsx - remove Image (line 8)
sed -i '' '/^  Image,$/d' src/screens/InboxScreen.tsx

# MomentGalleryScreen.tsx - remove Image (line 9)
sed -i '' 's/  Image,//' src/screens/MomentGalleryScreen.tsx

# OnboardingScreen.tsx - remove Image (line 9)
sed -i '' 's/  Image,//' src/screens/OnboardingScreen.tsx

# PaymentFailedScreen.tsx - fix navigation param (line 92)
sed -i '' 's/navigation,/_navigation,/' src/screens/PaymentFailedScreen.tsx

# ProfileDetailScreen.tsx - line 53
sed -i '' '53s/momentId/momentId: _momentId/' src/screens/ProfileDetailScreen.tsx

# ProofApprovedScreen.tsx - line 18
sed -i '' '18s/SCREEN_HEIGHT/_SCREEN_HEIGHT/' src/screens/ProofApprovedScreen.tsx

# ProofHistoryScreen.tsx - remove Image (line 8)
sed -i '' 's/  Image,//' src/screens/ProofHistoryScreen.tsx

# ReviewProofScreen.tsx - line 17 and 14
sed -i '' '17s/SCREEN_WIDTH/_SCREEN_WIDTH/' src/screens/ReviewProofScreen.tsx
sed -i '' '14s/proofId/proofId: _proofId/' src/screens/ReviewProofScreen.tsx

# ReviewProofsScreen.tsx - line 102
sed -i '' '102s/momentId/momentId: _momentId/' src/screens/ReviewProofsScreen.tsx

# SavedMomentsScreen.tsx - remove useState (line 1)
sed -i '' 's/useState, //' src/screens/SavedMomentsScreen.tsx

# Also remove Image from SavedMomentsScreen.tsx (line 9)
sed -i '' '/^  Image,$/d' src/screens/SavedMomentsScreen.tsx

echo "✅ Fixed all unused variables!"
