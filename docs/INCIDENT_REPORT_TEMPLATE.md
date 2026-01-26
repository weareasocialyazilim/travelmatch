# Incident Report Template

**Incident ID:** `INC-YYYY-MM-XXX`
**Date:** YYYY-MM-DD
**Severity:** P0 / P1 / P2 / P3
**Status:** Resolved / Investigating / Monitoring

---

## Summary

**What happened:**
[One-paragraph description of the incident]

**Impact:**
- Users affected: [number or percentage]
- Duration: [start time to end time]
- Revenue impact: [if applicable]

---

## Timeline (All times in UTC)

| Time | Action |
|------|--------|
| HH:MM | Issue detected (monitoring/alert/user report) |
| HH:MM | On-call acknowledged |
| HH:MM | Severity confirmed |
| HH:MM | Mitigation deployed |
| HH:MM | Full recovery |
| HH:MM | Incident closed |

---

## Root Cause Analysis

### Primary Cause
[Describe the technical root cause]

### Contributing Factors
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

### Detection
[How was the incident detected?]

---

## Impact Assessment

| Metric | Normal | During Incident | Delta |
|--------|--------|-----------------|-------|
| Response Time | [value] | [value] | [%] |
| Error Rate | [value] | [value] | [%] |
| Availability | [value]% | [value]% | [%] |

---

## Response Evaluation

### What Went Well
- [Item 1]
- [Item 2]

### What Could Be Improved
- [Item 1]
- [Item 2]

---

## Action Items

| ID | Action | Owner | Due Date | Status |
|----|--------|-------|----------|--------|
| I-001 | [Action item] | @owner | YYYY-MM-DD | Done/In Progress |
| I-002 | [Action item] | @owner | YYYY-MM-DD | Pending |

---

## Lessons Learned

### Technical
[What we learned about the system]

### Process
[What we learned about our response]

### Communication
[What we learned about internal/external communication]

---

## Attachments

- [Link to relevant logs]
- [Link to Sentry errors]
- [Link to monitoring screenshots]
- [Link to postmortem document]

---

## Sign-off

| Role | Name | Date |
|------|------|------|
| Lead Investigator | | |
| Engineering Manager | | |
| Product Manager | | |

---

## Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| P0 | Complete outage, data loss, or security breach | Database inaccessible, PII leaked |
| P1 | Major functionality broken, no workaround | Payments failing, login broken |
| P2 | Feature degraded, workaround available | Slow responses, occasional errors |
| P3 | Minor issue, low user impact | UI glitch, logging error |

---

**Template Version:** 1.0
**Last Updated:** 2026-01-26
