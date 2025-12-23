# TravelMatch Compliance Checklist

**Last Updated:** December 22, 2025
**Status:** Pre-Launch Review

Use this checklist to track compliance remediation progress.

---

## Critical Blockers (P0) - Must Fix Before Launch

### Security Vulnerabilities

- [ ] **CRIT-001**: Remove Mapbox SECRET token from client bundle
  - File: `apps/mobile/app.config.ts:74`
  - Action: Change `EXPO_PUBLIC_MAPBOX_SECRET_TOKEN` to `MAPBOX_DOWNLOAD_TOKEN`
  - Owner: Security Team
  - Due: Before launch

- [ ] **CRIT-002**: Remove Cloudflare Images token from client code
  - File: `apps/mobile/src/services/cloudflareImages.ts`
  - Action: Delete file, use Edge Function proxy only
  - Owner: Backend Team
  - Due: Before launch

- [ ] **CRIT-003**: Re-enable atomic_transfer RPC
  - File: `supabase/migrations/20251212100000_atomic_transfer_rpc.sql`
  - Action: Implement proper atomic transfer with FOR UPDATE locks
  - Owner: Database Team
  - Due: Before launch

- [ ] **CRIT-004**: Implement real KYC verification
  - File: `supabase/functions/verify-kyc/index.ts:110`
  - Action: Integrate Onfido or Stripe Identity
  - Owner: Backend Team
  - Due: Before launch

- [ ] **CRIT-005**: Restrict cache_invalidation RLS
  - File: `supabase/migrations/20241207000000_payment_security.sql:141`
  - Action: Limit to service_role only
  - Owner: Database Team
  - Due: Before launch

### Legal Documents

- [ ] Draft and publish Privacy Policy
  - [ ] GDPR-compliant language
  - [ ] Data collection purposes
  - [ ] Third-party sharing disclosure
  - [ ] Cookie policy (for web)
  - [ ] Contact information for DPO
  - Owner: Legal Team
  - Due: Before launch

- [ ] Draft and publish Terms of Service
  - [ ] User responsibilities
  - [ ] Payment terms
  - [ ] Content policies
  - [ ] Dispute resolution
  - [ ] Liability limitations
  - Owner: Legal Team
  - Due: Before launch

### App Store Requirements

- [ ] Complete Apple App Privacy details (nutrition labels)
  - [ ] Data collection types
  - [ ] Data usage purposes
  - [ ] Data linked to identity
  - [ ] Tracking disclosure
  - Owner: Product Team
  - Due: Before App Store submission

- [ ] Complete Google Play Data Safety section
  - [ ] Data shared
  - [ ] Data collected
  - [ ] Security practices
  - Owner: Product Team
  - Due: Before Play Store submission

---

## High Priority (P1) - Within 2 Weeks Post-Launch

### GDPR Compliance

- [ ] Appoint Data Protection Officer (DPO)
  - [ ] Evaluate in-house vs external DPO service
  - [ ] Register with supervisory authority if required
  - [ ] Update privacy policy with DPO contact
  - Owner: Legal/HR
  - Due: 2 weeks post-launch

- [ ] Complete Data Protection Impact Assessment (DPIA)
  - [ ] Analytics tracking assessment
  - [ ] Location data processing assessment
  - [ ] AI/ML processing assessment (if applicable)
  - Owner: Compliance Team
  - Due: 2 weeks post-launch

- [ ] Implement cookie consent for web
  - [ ] Cookie banner with accept/reject options
  - [ ] Granular category controls
  - [ ] Consent storage mechanism
  - [ ] Integration with analytics
  - Owner: Frontend Team
  - Due: 2 weeks post-launch

### SOC 2 Preparation

- [ ] Create formal Risk Register
  - [ ] Identify assets
  - [ ] Assess threats
  - [ ] Calculate risk scores
  - [ ] Define mitigations
  - Owner: Security Team
  - Due: 2 weeks post-launch

- [ ] Document Information Security Policy
  - [ ] Acceptable use policy
  - [ ] Access control policy
  - [ ] Incident response policy
  - [ ] Change management policy
  - Owner: Security Team
  - Due: 2 weeks post-launch

### Vendor Management

- [ ] Execute Data Processing Agreements (DPAs)
  - [ ] Supabase DPA
  - [ ] Stripe DPA
  - [ ] Mux DPA
  - [ ] Sentry DPA
  - [ ] OpenAI DPA
  - [ ] Cloudflare DPA
  - Owner: Legal Team
  - Due: 2 weeks post-launch

---

## Medium Priority (P2) - Within 1 Month

### Security Enhancements

- [ ] Implement certificate pinning
  - [ ] iOS configuration
  - [ ] Android configuration
  - [ ] Pin rotation strategy
  - Owner: Mobile Team
  - Due: 1 month post-launch

- [ ] Schedule penetration testing
  - [ ] Select vendor
  - [ ] Define scope
  - [ ] Execute test
  - [ ] Remediate findings
  - Owner: Security Team
  - Due: 1 month post-launch

- [ ] Implement security headers for web
  - [ ] Content-Security-Policy
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Referrer-Policy
  - Owner: DevOps Team
  - Due: 1 month post-launch

### Documentation

- [ ] Create Disaster Recovery Plan
  - [ ] Recovery objectives (RTO/RPO)
  - [ ] Backup procedures
  - [ ] Recovery procedures
  - [ ] Communication plan
  - [ ] Testing schedule
  - Owner: DevOps Team
  - Due: 1 month post-launch

- [ ] Document data flow diagrams
  - [ ] User data flows
  - [ ] Payment data flows
  - [ ] Third-party integrations
  - Owner: Architecture Team
  - Due: 1 month post-launch

---

## Lower Priority (P3) - Within 3 Months

### Training & Awareness

- [ ] Implement security awareness training
  - [ ] Phishing awareness
  - [ ] Data handling
  - [ ] Incident reporting
  - [ ] Password security
  - Owner: HR/Security Team
  - Due: 3 months post-launch

- [ ] Create developer security training
  - [ ] OWASP Top 10
  - [ ] Secure coding practices
  - [ ] Code review guidelines
  - Owner: Engineering Lead
  - Due: 3 months post-launch

### Compliance Certification

- [ ] Prepare for SOC 2 Type I audit
  - [ ] Engage audit firm
  - [ ] Complete readiness assessment
  - [ ] Gather evidence
  - [ ] Conduct audit
  - Owner: Compliance Team
  - Due: 3 months post-launch

---

## Ongoing Compliance Activities

### Weekly

- [ ] Security vulnerability scanning
- [ ] Failed login monitoring
- [ ] Anomaly detection review
- [ ] GDPR request processing

### Monthly

- [ ] Access rights review
- [ ] Audit log review
- [ ] Backup verification test
- [ ] Security metrics review
- [ ] Vendor security news monitoring

### Quarterly

- [ ] Policy review and update
- [ ] Risk assessment update
- [ ] Vendor compliance review
- [ ] Incident response drill
- [ ] Business continuity test

### Annually

- [ ] Full compliance assessment
- [ ] Penetration testing
- [ ] Privacy policy update
- [ ] Terms of service update
- [ ] SOC 2 audit
- [ ] Security awareness training refresh
- [ ] Disaster recovery full test

---

## Compliance Metrics Dashboard

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Critical vulnerabilities | 0 | 5 | 🔴 |
| GDPR requests processed (30d) | 100% | N/A | ⚪ |
| Average breach response time | <72h | N/A | ⚪ |
| Audit log coverage | 100% | 95% | 🟡 |
| Vendor DPAs in place | 100% | 40% | 🔴 |
| Staff security trained | 100% | 0% | 🔴 |
| Backup success rate | 100% | 100% | 🟢 |
| RLS policy coverage | 100% | 100% | 🟢 |

---

## Quick Reference: Key Contacts

| Role | Name | Email |
|------|------|-------|
| Compliance Lead | TBD | compliance@travelmatch.app |
| Data Protection Officer | TBD | dpo@travelmatch.app |
| Security Lead | TBD | security@travelmatch.app |
| Legal Counsel | TBD | legal@travelmatch.app |
| Incident Response | Team | security@travelmatch.app |

---

## Compliance Calendar

| Date | Activity | Owner |
|------|----------|-------|
| Weekly | Vulnerability scan review | Security |
| Monthly | Access review | Security |
| Quarterly | Policy review | Compliance |
| Jan 15 | Annual compliance assessment | Compliance |
| Mar 15 | Penetration test | Security |
| Jun 15 | SOC 2 audit prep | Compliance |
| Sep 15 | DR drill | DevOps |
| Dec 15 | Annual report | Compliance |

---

**Checklist maintained by:** Compliance Team
**Review frequency:** Weekly during pre-launch, monthly after launch
