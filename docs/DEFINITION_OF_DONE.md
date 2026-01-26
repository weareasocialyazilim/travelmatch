# Definition of Done (DoD)

## Scope

Applies to all production-facing features across mobile, web, admin, and backend.

## Must Pass (Required Gates)

- `pnpm qa:pr` for every PR to main.
- `pnpm qa:rc` before release candidate tagging.
- Chromatic visual regression check must be green.
- RLS tests must pass for any Supabase migration or policy changes.
- **TypeScript check must pass with 0 errors**: `pnpm type-check` or `npx tsc --noEmit`

## Functional Criteria

- No silent failures: every gated action shows a reason and a next step.
- Error states are surfaced with user-facing messaging.
- Loading, empty, and retry states are implemented for new screens.

## Security & Privacy

- No production `console.*` output.
- No `@ts-nocheck`, `@ts-ignore`, or `any` in production code without justification.
- Sensitive data never logged.

## Performance

- Admin lists must load under 2 seconds on local + staging data.
- Client-side pagination or cursor-based pagination required for list views.

## Observability

- Crash reporting enabled for production builds.
- Key flows emit logs/breadcrumbs for root-cause analysis.

## QA Evidence

- Test evidence attached for:
  - Unit/integration tests
  - E2E (web + admin)
  - Mobile E2E flows (Maestro)
