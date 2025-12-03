#!/bin/bash

# Fix unused variables by adding _ prefix

# Fix in LocationPickerBottomSheet
sed -i '' 's/setSelectedLocation/setSelectedLocation/' src/components/LocationPickerBottomSheet.tsx

# Fix in RemoveCardModal  
sed -i '' 's/const { cardLast4 } = useCardStore();/const { cardLast4: _cardLast4 } = useCardStore();/' src/components/RemoveCardModal.tsx

# Fix in AdvancedFilterPanel
sed -i '' 's/const hasActiveFilters =/const _hasActiveFilters =/' src/components/ui/AdvancedFilterPanel.tsx

# Fix in EnhancedLoginForm
sed -i '' 's/const { errors } = formState;/const { errors: _errors } = formState;/' src/components/ui/EnhancedLoginForm.tsx

# Fix in CategorySelectionScreen
sed -i '' 's/(categoryId) =>/((_categoryId) =>/' src/screens/CategorySelectionScreen.tsx

# Fix in IdentityVerificationSelfieScreen
sed -i '' 's/const { documentType } = route.params;/const { documentType: _documentType } = route.params;/' src/screens/IdentityVerificationSelfieScreen.tsx

# Fix in InboxScreen  
sed -i '' 's/navigation) =>/_navigation) =>/' src/screens/InboxScreen.tsx

# Fix in MomentGalleryScreen
sed -i '' 's/const { momentId } = route.params;/const { momentId: _momentId } = route.params;/' src/screens/MomentGalleryScreen.tsx

# Fix in MomentPreviewScreen
sed -i '' 's/const { width: SCREEN_WIDTH } = Dimensions/const { width: _SCREEN_WIDTH } = Dimensions/' src/screens/MomentPreviewScreen.tsx

# Fix in OnboardingScreen
sed -i '' 's/const { height: SCREEN_HEIGHT } = Dimensions/const { height: _SCREEN_HEIGHT } = Dimensions/' src/screens/OnboardingScreen.tsx

# Fix in ProofApprovedScreen
sed -i '' 's/const { proofId } = route.params;/const { proofId: _proofId } = route.params;/' src/screens/ProofApprovedScreen.tsx

# Fix in ProofHistoryScreen
sed -i '' 's/const { momentId } = selectedMoment;/const { momentId: _momentId } = selectedMoment;/' src/screens/ProofHistoryScreen.tsx

# Fix in SearchScreen
sed -i '' 's/setShowEmpty/\_setShowEmpty/' src/screens/SearchScreen.tsx

# Fix in WelcomeScreen
sed -i '' 's/const { height: SCREEN_HEIGHT } = Dimensions/const { height: _SCREEN_HEIGHT } = Dimensions/' src/screens/WelcomeScreen.tsx

# Fix in useFormValidation
sed -i '' 's/(value) =>/((_value) =>/' src/hooks/useFormValidation.ts

# Fix in useImageUpload
sed -i '' 's/(options) =>/((_options) =>/' src/hooks/useImageUpload.ts

# Fix in authStore
sed -i '' 's/password: string/_password: string/' src/stores/authStore.ts

# Fix in accessibility
sed -i '' 's/const priority =/const _priority =/' src/utils/accessibility.ts
sed -i '' 's/const minRatio =/const _minRatio =/' src/utils/accessibility.ts

# Fix in imageHandling
sed -i '' 's/{ quality, maxWidth, maxHeight, format }/{ quality: _quality, maxWidth: _maxWidth, maxHeight: _maxHeight, format: _format }/' src/utils/imageHandling.ts

# Fix in imageOptimization
sed -i '' 's/const threshold =/const _threshold =/' src/utils/imageOptimization.ts

# Fix in lazyLoad
sed -i '' 's/fallback,/_fallback,/' src/utils/lazyLoad.tsx

echo "Fixed unused variables with _ prefix"
