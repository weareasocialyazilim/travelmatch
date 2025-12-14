/**
 * Profile Strings Constants
 */

export const STRINGS = {
  createMoment: {
    title: 'Create Moment',
    subtitle: 'Share your experience with travelers',
    titlePlaceholder: 'Give your moment a catchy title',
    descriptionPlaceholder: 'Describe your moment in detail...',
    pricePlaceholder: '0.00',
    locationPlaceholder: 'Search for a location',
    addPhotos: 'Add Photos',
    setPrice: 'Set Your Price',
    chooseCategory: 'Choose Category',
    setAvailability: 'Set Availability',
    submitButton: 'Create Moment',
    validation: {
      titleRequired: 'Title is required',
      titleMinLength: 'Title must be at least 5 characters',
      titleMaxLength: 'Title must be less than 100 characters',
      descriptionRequired: 'Description is required',
      descriptionMinLength: 'Description must be at least 20 characters',
      priceRequired: 'Price is required',
      priceMin: 'Price must be greater than 0',
      locationRequired: 'Location is required',
      categoryRequired: 'Please select a category',
      photosRequired: 'Please add at least one photo',
    },
    success: 'Your moment has been created!',
    error: 'Failed to create moment. Please try again.',
  },
  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    settings: 'Settings',
    myMoments: 'My Moments',
    savedMoments: 'Saved',
    stats: {
      moments: 'Moments',
      gifts: 'Gifts',
      reviews: 'Reviews',
    },
  },
  momentDetail: {
    book: 'Book Now',
    sendGift: 'Send Gift',
    save: 'Save',
    share: 'Share',
    report: 'Report',
  },
} as const;

export default STRINGS;
