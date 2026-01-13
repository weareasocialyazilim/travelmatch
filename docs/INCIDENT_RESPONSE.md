# TravelMatch Incident Response & Data Breach Notification Procedure

> **Version:** 1.0
> **Last Updated:** January 2026
> **Classification:** Internal - Confidential
> **GDPR Compliance:** Article 33 & 34

---

## 1. Overview

This document outlines TravelMatch's procedures for responding to security incidents and data breaches in compliance with GDPR requirements. Under GDPR Article 33, we must notify the supervisory authority within **72 hours** of becoming aware of a personal data breach.

---

## 2. Definitions

### 2.1 Personal Data Breach
A breach of security leading to the accidental or unlawful destruction, loss, alteration, unauthorized disclosure of, or access to, personal data.

### 2.2 Categories of Breaches

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Large-scale breach affecting >1000 users or sensitive data | Database leak, payment data exposure |
| **High** | Breach affecting 100-1000 users | Email list exposure, auth token leak |
| **Medium** | Breach affecting <100 users | Individual account compromise |
| **Low** | Potential breach, no confirmed data access | Failed intrusion attempt |

---

## 3. Incident Response Team

### 3.1 Core Team

| Role | Responsibility | Contact |
|------|----------------|---------|
| **Incident Commander** | Overall coordination, decisions | CTO / Tech Lead |
| **Security Lead** | Technical investigation | Security Engineer |
| **Legal/DPO** | GDPR compliance, notifications | Data Protection Officer |
| **Communications** | Internal/external messaging | PR / Customer Support |
| **Engineering Lead** | Technical remediation | Senior Engineer |

### 3.2 Escalation Matrix

```
Low/Medium → Security Lead → Engineering Lead
High → Security Lead → Incident Commander → Legal/DPO
Critical → ALL TEAM MEMBERS IMMEDIATELY
```

---

## 4. Response Procedure

### Phase 1: Detection & Initial Response (0-4 hours)

#### Step 1: Identify & Contain
```bash
# 1. Check Sentry for error spikes
# 2. Review Supabase audit logs
# 3. Check CloudFlare security events

# If breach confirmed, immediately:
# - Rotate compromised credentials
# - Enable additional RLS restrictions if needed
# - Block suspicious IPs via CloudFlare
```

#### Step 2: Document Initial Findings
- [ ] What data may be affected?
- [ ] How many users potentially impacted?
- [ ] What is the attack vector?
- [ ] Is the breach ongoing?

#### Step 3: Escalate
- Notify Incident Commander immediately
- Create private Slack channel: `#incident-YYYY-MM-DD`
- Start incident timeline document

### Phase 2: Investigation (4-24 hours)

#### Step 4: Full Assessment
```sql
-- Example: Check for unauthorized data access
SELECT user_id, action, created_at, ip_address
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
AND action IN ('select', 'export', 'download')
ORDER BY created_at DESC;
```

#### Step 5: Determine Scope
- Exact number of affected users
- Types of data accessed/exposed
- Duration of the breach
- Root cause analysis

#### Step 6: Evidence Preservation
- Export relevant logs
- Screenshot dashboards
- Document system state
- Preserve forensic evidence

### Phase 3: Notification (24-72 hours)

#### Step 7: GDPR Authority Notification (if required)

**When to notify:** If breach likely results in risk to individuals' rights and freedoms.

**Turkey (KVKK):** notify@kvkk.gov.tr
**EU (if applicable):** Relevant supervisory authority

**Required Information:**
1. Nature of the breach
2. Categories and approximate number of data subjects
3. Categories and approximate number of records
4. Name and contact of DPO
5. Likely consequences
6. Measures taken/proposed

#### Step 8: User Notification (if high risk)

**Email Template:**
```
Subject: Important Security Notice - TravelMatch

Dear [User],

We are writing to inform you of a security incident that may have affected your TravelMatch account.

What Happened:
[Brief description]

What Information Was Involved:
[List of data types]

What We Are Doing:
[Actions taken]

What You Can Do:
- Change your password immediately
- Enable two-factor authentication
- Monitor your account for suspicious activity

If you have questions, contact us at security@travelmatch.app

Sincerely,
TravelMatch Security Team
```

### Phase 4: Remediation (72+ hours)

#### Step 9: Technical Fixes
- [ ] Patch vulnerability
- [ ] Update affected systems
- [ ] Implement additional controls
- [ ] Rotate all potentially compromised credentials

#### Step 10: Verification
- [ ] Penetration test the fix
- [ ] Review related code for similar issues
- [ ] Update security documentation

---

## 5. Communication Guidelines

### 5.1 Internal Communication
- Use encrypted channels only
- No speculation in written communications
- All statements reviewed by Legal/DPO
- Regular status updates every 4 hours during active incident

### 5.2 External Communication
- **DO NOT** disclose until authorized by Incident Commander
- All press inquiries to Communications lead
- User communications reviewed by Legal
- Document all external communications

---

## 6. Post-Incident Review

### 6.1 Incident Report Template

```markdown
# Incident Report: [TITLE]

## Summary
- **Date Detected:**
- **Date Resolved:**
- **Severity:**
- **Users Affected:**

## Timeline
- HH:MM - Event
- HH:MM - Event

## Root Cause
[Description]

## Impact
[Description]

## Response Actions
1. Action taken
2. Action taken

## Lessons Learned
1. What went well
2. What could improve

## Action Items
- [ ] Task (Owner, Due Date)
```

### 6.2 Review Meeting
- Schedule within 7 days of resolution
- All incident team members attend
- Document lessons learned
- Update procedures as needed

---

## 7. Preventive Measures

### 7.1 Regular Security Tasks
- [ ] Weekly: Review Sentry alerts
- [ ] Weekly: Check CloudFlare security events
- [ ] Monthly: Review access logs
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration test

### 7.2 Technical Controls
- Row Level Security (RLS) on all tables
- Audit logging enabled
- Rate limiting on all endpoints
- Input validation with Zod schemas
- Encrypted sensitive data at rest

---

## 8. Regulatory Contacts

### Turkey
- **KVKK (Data Protection Authority)**
  - Website: kvkk.gov.tr
  - Email: notify@kvkk.gov.tr
  - Phone: +90 312 216 50 00

### European Union (if applicable)
- Relevant supervisory authority based on user location

---

## 9. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | TravelMatch | Initial version |

---

## 10. Approval

This document has been reviewed and approved by:

- [ ] CTO / Technical Lead
- [ ] Data Protection Officer
- [ ] Legal Counsel

---

*This document should be reviewed and updated at least annually or after any significant incident.*
