# GitHub Branch Protection (Manual Steps)

Since I cannot manipulate GitHub UI directly, please apply these settings manually to "lock" the
main branch.

Settings → Branches → Add branch protection rule

1. **Branch name pattern**: `main`

2. **Enable**:
   - [x] Require pull request before merging
     - [x] Require approvals: 1 (preferably 2)
     - [x] Dismiss stale approvals
     - [x] Require review from Code Owners

   - [x] Require status checks to pass:
     - `db-smoke`
     - `security-baseline`
     - `monorepo-quality`

   - [x] Require branches to be up to date
   - [x] Restrict who can push
   - [x] Disable force pushes
   - [x] Disable deletions
   - [x] Include administrators: enabled
