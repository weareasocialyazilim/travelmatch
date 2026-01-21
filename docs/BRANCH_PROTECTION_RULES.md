# GitHub Branch Protection Rules

GitHub Repo -> Settings -> Branches -> Add branch protection rule

Branch name pattern: main

Enable:

- [x] Require a pull request before merging
  - Require approvals: 1 (preferably 2)
  - Dismiss stale approvals
  - [x] Require review from Code Owners
- [x] Require status checks to pass before merging
  - Require branches to be up to date before merging
  - Required checks:
    - db-smoke
    - security-baseline
- [x] Restrict who can push to matching branches
- [x] Do not allow force pushes
- [x] Do not allow deletions
- [x] Include administrators (critical for enforcement)

Save.
