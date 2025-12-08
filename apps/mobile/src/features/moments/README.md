# Moments Feature

Social moments/posts functionality (travel stories, updates, photos).

## Overview

The moments feature provides social sharing capabilities:
- Create and share travel moments
- Photo/video posts
- Like and comment
- Explore feed
- User stories

## Structure

```
moments/
├── screens/
│   ├── MomentsFeedScreen.tsx     # Social feed
│   ├── CreateMomentScreen.tsx    # Create post
│   └── MomentDetailScreen.tsx    # Post detail
├── components/
│   ├── MomentCard.tsx           # Post card
│   ├── MomentComments.tsx       # Comments section
│   ├── MomentActions.tsx        # Like/Comment/Share
│   └── CreateMomentForm.tsx     # Post form
├── hooks/
│   ├── useMoments.ts           # Moments feed
│   ├── useCreateMoment.ts      # Create post
│   ├── useMomentLikes.ts       # Like/unlike
│   └── useMomentComments.ts    # Comments
├── services/
│   └── momentsService.ts       # Moments API
└── types/
    └── moments.types.ts        # Type definitions
```

## Screens

### MomentsFeedScreen
Main feed showing moments from connections.

**Features:**
- Infinite scroll
- Pull to refresh
- Video autoplay
- Like/comment inline
- Share options

### CreateMomentScreen
Create and share a new moment.

**Features:**
- Photo/video upload
- Caption with hashtags
- Location tagging
- Privacy settings
- Post scheduling (future)

### MomentDetailScreen
Individual moment with full comments.

**Features:**
- Full resolution media
- All comments
- Share options
- Report/delete

## Components

### MomentCard
Post card in feed.

**Props:**
```typescript
interface MomentCardProps {
  moment: Moment;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}
```

### MomentComments
Comments section with replies.

### MomentActions
Like, comment, share, bookmark actions.

## Hooks

### useMoments
```typescript
const {
  moments,
  loading,
  hasMore,
  loadMore,
  refresh,
} = useMoments();
```

### useCreateMoment
```typescript
const {
  createMoment,
  uploading,
  progress,
} = useCreateMoment();
```

### useMomentLikes
```typescript
const {
  toggleLike,
  likesCount,
  isLiked,
} = useMomentLikes(momentId);
```

## API

### Moments
- `GET /api/v1/moments` - Get feed
- `GET /api/v1/moments/:id` - Get moment
- `POST /api/v1/moments` - Create moment
- `DELETE /api/v1/moments/:id` - Delete moment

### Interactions
- `POST /api/v1/moments/:id/like` - Like moment
- `DELETE /api/v1/moments/:id/like` - Unlike
- `GET /api/v1/moments/:id/comments` - Get comments
- `POST /api/v1/moments/:id/comments` - Add comment

## State Management

Uses React Query for caching:
```typescript
const queryClient = useQueryClient();

// Optimistic update
queryClient.setQueryData(['moments'], (old) => {
  // Update cached data
});
```

## Media Upload

Integration with Cloudflare Images:
```typescript
const uploadMoment = async (photo: File) => {
  // 1. Upload to Cloudflare
  const { cloudflareId } = await uploadToCloudflare(photo);
  
  // 2. Create moment
  await createMoment({
    cloudflareId,
    caption,
  });
};
```

## Testing

```bash
pnpm test:unit features/moments
pnpm test:integration features/moments
```

## Performance

- **Image optimization**: Cloudflare WebP conversion
- **Video compression**: Client-side compression
- **Lazy loading**: Load moments on scroll
- **Cache strategy**: React Query with stale-while-revalidate

## Dependencies

- `react-native-image-picker` - Photo/video selection
- `@tanstack/react-query` - Data fetching
- `expo-av` - Video playback
