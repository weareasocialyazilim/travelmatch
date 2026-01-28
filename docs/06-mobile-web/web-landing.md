# Web Landing Page

## Overview

The web application is a static marketing/landing page with a creator application form.

## Page Structure

```
Home (/)
├── Hero section
├── Features
├── How it works
├── Creator CTA
└── Footer
```

## Creator Application Flow

```
User fills form
    │
    ▼
POST /api/creator
    │
    ▼
Rate limit check (5 req/hour)
    │
    ▼
Input validation
    │
    ▼
Save to database
    │
    ▼
Return success/error
```

## Code References

| Feature     | Location                                   |
| ----------- | ------------------------------------------ |
| Home page   | `apps/web/src/app/page.tsx`                |
| Creator API | `apps/web/src/app/api/creator/route.ts`    |
| CSP report  | `apps/web/src/app/api/csp-report/route.ts` |

## Security Features

| Feature          | Implementation                      |
| ---------------- | ----------------------------------- |
| CSP              | Content-Security-Policy-Report-Only |
| Rate limiting    | 5 requests/hour per IP              |
| Input validation | Zod schema validation               |

## NOT IMPLEMENTED

- User authentication on web
- Web-based moment management
- Full admin panel on web
- Interactive features beyond form
