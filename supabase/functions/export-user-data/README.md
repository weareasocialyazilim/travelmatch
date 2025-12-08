# GDPR Data Export Edge Function

## Overview

This Supabase Edge Function provides GDPR-compliant data export functionality, allowing users to download all their personal data stored in the TravelMatch platform.

## Compliance

- **GDPR Article 20**: Right to Data Portability
- **GDPR Article 15**: Right of Access
- **CCPA Section 1798.110**: Right to Know

## Features

✅ Exports all user data in JSON format  
✅ Includes data from all tables where user has records  
✅ Audit logging for compliance tracking  
✅ Authenticated access only  
✅ Automatic timestamp and metadata  
✅ Ready for CSV export extension

## Data Included

### Profile Data
- User profile information
- Account settings
- Verification status
- Trust score data

### Content Data
- **Moments**: All moments created by the user
- **Requests**: Sent and received gift requests
- **Messages**: All messages sent/received
- **Conversations**: Conversation metadata

### Financial Data
- **Transactions**: Complete transaction history
- Payment methods (sanitized)
- Wallet balance history

### Social Data
- **Reviews**: Written and received reviews
- **Favorites**: Saved moments
- **Blocks**: Blocked users list
- **Reports**: Safety reports filed

### System Data
- **Notifications**: Notification history
- **Audit Logs**: Export request history
- **Metadata**: Account statistics

## Usage

### From Mobile App

```typescript
import { supabase } from '@/config/supabase';

async function exportMyData() {
  try {
    const { data, error } = await supabase.functions.invoke('export-user-data', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;

    // Save data to device
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Trigger download or share
    // iOS: Use FileSystem + Share
    // Android: Use FileSystem + Share or Downloads
    
    return data;
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
```

### From Admin Panel

```typescript
// Admin can export data for support purposes
const { data } = await supabaseAdmin.functions.invoke('export-user-data', {
  headers: {
    Authorization: `Bearer ${userToken}`, // User's token, not admin
  },
});
```

### Direct API Call

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/export-user-data' \
  -H 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  -H 'Content-Type: application/json'
```

## Response Format

```json
{
  "exportDate": "2025-12-07T10:30:00.000Z",
  "userId": "uuid-here",
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    // ... all profile fields
  },
  "moments": [
    {
      "id": "uuid",
      "title": "Coffee in Paris",
      // ... moment data
    }
  ],
  "requests": {
    "sent": [...],
    "received": [...]
  },
  "messages": [...],
  "transactions": [...],
  "reviews": {
    "written": [...],
    "received": [...]
  },
  "notifications": [...],
  "favorites": [...],
  "blocks": [...],
  "reports": [...],
  "metadata": {
    "totalMoments": 15,
    "totalRequests": 23,
    "totalMessages": 145,
    "totalTransactions": 8,
    "totalReviews": 12,
    "accountCreatedAt": "2024-01-15T08:00:00Z",
    "lastActivityAt": "2025-12-07T09:45:00Z"
  }
}
```

## Deployment

```bash
# Deploy the function
supabase functions deploy export-user-data

# Set environment variables (if needed)
supabase secrets set CUSTOM_CONFIG=value

# Test the function
supabase functions invoke export-user-data \
  --headers '{"Authorization":"Bearer YOUR_JWT"}' \
  --method POST
```

## Security

### Authentication
- ✅ Requires valid JWT token
- ✅ User can only export their own data
- ✅ No admin override (privacy protection)

### Rate Limiting
Recommended: Implement rate limiting to prevent abuse
```sql
-- Example: Allow 1 export per 24 hours
CREATE TABLE user_export_requests (
  user_id UUID REFERENCES users(id),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, requested_at)
);

-- Function to check rate limit
CREATE FUNCTION check_export_rate_limit(user_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM user_export_requests
    WHERE user_id = user_uuid
    AND requested_at > NOW() - INTERVAL '24 hours'
  );
$$ LANGUAGE SQL;
```

### Data Sanitization
- ❌ Passwords are excluded
- ❌ Internal system IDs sanitized
- ✅ PII included (as required by GDPR)
- ✅ Financial data included (sanitized card numbers)

## Audit Logging

All export requests are logged to `audit_logs` table:

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### Unit Tests

```typescript
// supabase/functions/export-user-data/test.ts
import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

Deno.test('should export user data', async () => {
  // Mock Supabase client
  // Make request
  // Assert response structure
});

Deno.test('should reject unauthenticated requests', async () => {
  // Make request without auth
  // Assert 401 response
});
```

### Integration Tests

```bash
# Create test user
psql -c "INSERT INTO users (id, email) VALUES ('test-uuid', 'test@example.com');"

# Export data
curl -X POST ... > export.json

# Verify data
jq '.profile.email' export.json  # Should be "test@example.com"

# Cleanup
psql -c "DELETE FROM users WHERE id = 'test-uuid';"
```

## Future Enhancements

### CSV Export
```typescript
// Add format parameter
const { format = 'json' } = await req.json();

if (format === 'csv') {
  // Convert to CSV using Papa Parse or similar
  const csv = jsonToCSV(exportData);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="export.csv"`,
    },
  });
}
```

### Email Delivery
```typescript
// Instead of direct download, send via email
import { Resend } from 'https://esm.sh/resend@1.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'noreply@travelmatch.com',
  to: user.email,
  subject: 'Your TravelMatch Data Export',
  attachments: [
    {
      filename: 'data-export.json',
      content: Buffer.from(JSON.stringify(exportData)),
    },
  ],
});
```

### Scheduled Exports
```typescript
// Allow users to schedule automatic exports (monthly, quarterly)
// Use Supabase pg_cron extension
```

## Compliance Checklist

- [x] Right to access (GDPR Article 15)
- [x] Right to data portability (GDPR Article 20)
- [x] Machine-readable format (JSON)
- [x] Structured and commonly used format
- [x] Audit trail maintained
- [ ] User notification system (optional)
- [ ] Encryption at rest (Supabase handles this)
- [ ] Automatic deletion after 30 days (optional)

## Support

For questions or issues:
- Create an issue in the repository
- Contact: privacy@travelmatch.com
- GDPR Officer: dpo@travelmatch.com

## License

Same as main project (MIT)
