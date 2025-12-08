# TravelMatch GraphQL API POC

## Objective
Migrate from REST API to GraphQL for better:
- Type safety (auto-generated TypeScript types)
- Efficient data fetching (no over/under-fetching)
- Real-time subscriptions
- Better developer experience

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    GraphQL API Layer                         │
│  • Apollo Server                                             │
│  • Type-safe resolvers                                       │
│  • DataLoader for batching                                   │
│  • Redis caching                                             │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  • PostgreSQL (data storage)                                 │
│  • Row Level Security (RLS)                                  │
│  • Realtime (subscriptions)                                  │
│  • Storage (file uploads)                                    │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. Type Safety
- Auto-generated TypeScript types from GraphQL schema
- Type-safe resolvers
- Type-safe client queries

### 2. Efficient Data Fetching
- DataLoader for N+1 query prevention
- Field-level caching
- Query complexity limits

### 3. Real-time Support
- GraphQL subscriptions for live updates
- Supabase Realtime integration
- WebSocket connection pooling

### 4. Performance Optimization
- Redis caching layer
- Query batching
- Response compression
- CDN integration

## Schema Design

### Core Types

```graphql
type User {
  id: ID!
  email: String!
  name: String!
  avatarUrl: String
  trustScore: Int!
  verifiedAt: DateTime
  createdAt: DateTime!
  
  # Relations (auto-loaded with DataLoader)
  moments(first: Int, after: String): MomentConnection!
  matches: [Match!]!
  profile: UserProfile!
}

type Moment {
  id: ID!
  title: String!
  description: String
  type: MomentType!
  price: Float
  location: Location!
  imageUrl: String
  videoUrl: String
  status: MomentStatus!
  expiresAt: DateTime!
  
  # Relations
  creator: User!
  participants: [User!]!
  comments: [Comment!]!
  likes: [Like!]!
}

type Match {
  id: ID!
  status: MatchStatus!
  matchedAt: DateTime!
  
  # Relations
  user1: User!
  user2: User!
  moment: Moment
  messages: [Message!]!
}
```

### Queries

```graphql
type Query {
  # User queries
  me: User
  user(id: ID!): User
  users(filter: UserFilter, first: Int, after: String): UserConnection!
  
  # Moment queries
  moment(id: ID!): Moment
  moments(filter: MomentFilter, first: Int, after: String): MomentConnection!
  discoverMoments(location: LocationInput!, radius: Int!): [Moment!]!
  
  # Match queries
  myMatches(status: MatchStatus): [Match!]!
  match(id: ID!): Match
}
```

### Mutations

```graphql
type Mutation {
  # User mutations
  updateProfile(input: UpdateProfileInput!): User!
  uploadAvatar(file: Upload!): User!
  
  # Moment mutations
  createMoment(input: CreateMomentInput!): Moment!
  updateMoment(id: ID!, input: UpdateMomentInput!): Moment!
  deleteMoment(id: ID!): Boolean!
  joinMoment(momentId: ID!): Moment!
  leaveMoment(momentId: ID!): Moment!
  
  # Match mutations
  createMatch(userId: ID!, momentId: ID): Match!
  acceptMatch(matchId: ID!): Match!
  rejectMatch(matchId: ID!): Match!
  
  # Message mutations
  sendMessage(matchId: ID!, content: String!): Message!
}
```

### Subscriptions

```graphql
type Subscription {
  # Real-time moment updates
  momentCreated(location: LocationInput!, radius: Int!): Moment!
  momentUpdated(momentId: ID!): Moment!
  
  # Real-time match updates
  matchReceived: Match!
  matchUpdated(matchId: ID!): Match!
  
  # Real-time messages
  messageReceived(matchId: ID!): Message!
}
```

## Implementation Phases

### Phase 1: Core Setup ✅
- [x] Apollo Server setup
- [x] GraphQL schema definition
- [x] Supabase integration
- [x] Basic resolvers (User, Moment)

### Phase 2: Optimization 🚧
- [ ] DataLoader implementation
- [ ] Redis caching
- [ ] Query complexity limits
- [ ] Response compression

### Phase 3: Real-time 📋
- [ ] Subscription resolvers
- [ ] Supabase Realtime integration
- [ ] WebSocket connection pooling

### Phase 4: Migration 📋
- [ ] Client migration guide
- [ ] Backward compatibility layer
- [ ] Performance benchmarks
- [ ] Gradual rollout plan

## API Comparison

### REST (Current)

```typescript
// Multiple round trips
const user = await fetch('/api/users/123');
const moments = await fetch('/api/users/123/moments');
const profile = await fetch('/api/users/123/profile');

// Over-fetching (gets all fields)
// Under-fetching (needs multiple requests)
```

### GraphQL (POC)

```typescript
// Single request
const { data } = await client.query({
  query: gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        avatarUrl
        moments(first: 10) {
          edges {
            node {
              id
              title
              imageUrl
            }
          }
        }
        profile {
          bio
          interests
        }
      }
    }
  `,
  variables: { id: '123' }
});

// Perfect data fetching (only requested fields)
// Type-safe client
```

## Performance Metrics (Target)

| Metric | REST | GraphQL | Improvement |
|--------|------|---------|-------------|
| API Calls | 3-5 | 1 | 66-80% ↓ |
| Response Size | ~50KB | ~15KB | 70% ↓ |
| Latency (p95) | 800ms | 250ms | 68% ↓ |
| Type Errors | High | None | 100% ↓ |

## Security

### Authentication
- JWT tokens from Supabase Auth
- Per-resolver authentication checks
- Role-based access control

### Authorization
- Field-level permissions
- Query depth limits
- Rate limiting per user
- Cost analysis

### Data Protection
- Input validation with Zod
- SQL injection prevention
- XSS protection
- CSRF tokens

## Development

### Start Development Server
```bash
cd poc/graphql
pnpm install
pnpm dev
```

Server runs at: http://localhost:4000/graphql

### Generate TypeScript Types
```bash
pnpm codegen
```

### Run Tests
```bash
pnpm test
pnpm test:coverage
```

## Testing

### GraphQL Playground
Visit http://localhost:4000/graphql

Example query:
```graphql
query GetMyProfile {
  me {
    id
    name
    email
    trustScore
    moments(first: 5) {
      edges {
        node {
          id
          title
          type
          status
        }
      }
    }
  }
}
```

### cURL
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"query": "{ me { id name email } }"}'
```

## Next Steps

1. **Complete Phase 1**
   - Finish all basic resolvers
   - Add comprehensive error handling
   - Write integration tests

2. **Implement DataLoader**
   - Batch database queries
   - Cache loaded entities
   - Measure performance improvement

3. **Add Redis Caching**
   - Cache frequently accessed data
   - Invalidation strategy
   - TTL configuration

4. **Real-time Subscriptions**
   - Moment updates
   - Match notifications
   - Live messages

5. **Client Migration**
   - Generate client hooks
   - Update mobile app
   - Update admin panel
   - A/B testing

6. **Production Rollout**
   - Performance benchmarks
   - Load testing
   - Gradual migration (feature flags)
   - Monitor metrics

## Resources

- [GraphQL Schema](./src/schema/schema.graphql)
- [Resolvers](./src/resolvers/)
- [DataLoaders](./src/loaders/)
- [Tests](./src/__tests__/)

## Questions?

Contact: @kemalteksal
Slack: #graphql-migration
