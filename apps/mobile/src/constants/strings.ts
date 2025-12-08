export const STRINGS = {
  // Error messages
  ERRORS: {
    PHOTO_SELECT: 'Failed to select photo. Please try again.',
    PHOTO_PERMISSION: 'We need camera roll permissions to add photos.',
    PUBLISH_MOMENT: 'Failed to publish moment. Please try again.',
    NETWORK: 'No internet connection. Please check your network.',
    GENERIC: 'Something went wrong. Please try again.',
    TITLE_REQUIRED: 'Please add a title',
    CATEGORY_REQUIRED: 'Please select a category',
    AMOUNT_REQUIRED: 'Please enter a valid amount',
  },

  // Success messages
  SUCCESS: {
    MOMENT_PUBLISHED: 'Your moment has been published!',
    GIFT_SENT: 'Gift sent successfully!',
  },

  // Placeholder texts
  PLACEHOLDERS: {
    MOMENT_TITLE: 'Ex: Coffee at Blue Bottle Oakland',
    STORY: 'Share why this matters to you...',
    SEARCH_LOCATION: 'Search for a place...',
    AMOUNT: '0',
  },

  // Button texts
  BUTTONS: {
    TRY_AGAIN: 'Try Again',
    PUBLISH: 'Publish Moment',
    GIFT: 'Gift this moment',
    MAYBE_LATER: 'Maybe later',
    SELECT_PHOTO: 'Select Photo',
    CHOOSE_LOCATION: 'Choose a location',
  },

  // Labels
  LABELS: {
    PERMISSION_NEEDED: 'Permission needed',
    SOMETHING_WRONG: 'Something went wrong',
  },
} as const;
