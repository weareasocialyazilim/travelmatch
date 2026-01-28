# Admin Overview

## Admin Roles

| Role        | Capabilities                         |
| ----------- | ------------------------------------ |
| Moderator   | Review queue, approve/reject content |
| Admin       | All moderator + user management      |
| Super Admin | All admin + system configuration     |

## Admin Panel Access

Location: `apps/admin/`

Requirements:

- Authenticated user with `is_admin` flag
- Valid session (IP binding enforced)
- MFA for Super Admin actions

## Admin Features

| Feature           | Path                   |
| ----------------- | ---------------------- |
| Dashboard         | `/`                    |
| Moments           | `/moments`             |
| Users             | `/users`               |
| Moderation        | `/moderation`          |
| Wallet Operations | `/wallet-operations`   |
| Finance           | `/finance`             |
| Compliance        | `/compliance`          |
| Ceremonies        | `/ceremony-management` |

## Code References

| Feature         | Location                                       |
| --------------- | ---------------------------------------------- |
| Admin app       | `apps/admin/src/app/(dashboard)/`              |
| Sidebar         | `apps/admin/src/components/layout/sidebar.tsx` |
| Auth middleware | `apps/admin/src/middleware.ts`                 |
| API routes      | `apps/admin/src/app/api/`                      |

## NOT IMPLEMENTED

- Bulk user actions
- Automated reporting
- Custom admin roles
- Audit log exports
