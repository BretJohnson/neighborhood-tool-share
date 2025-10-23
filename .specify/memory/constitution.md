<!--
Sync Impact Report:
- Version: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
- New principles added:
  1. Speed Over Perfection
  2. User Experience First
  3. Security Essentials Only
  4. Simple Solutions
  5. Pragmatic Testing
- New sections added:
  - Development Workflow
  - Security Requirements
- Templates requiring updates:
  ✅ plan-template.md (verified - constitution check section present)
  ✅ spec-template.md (verified - requirements aligned)
  ✅ tasks-template.md (verified - task structure compatible)
- Follow-up TODOs: None
-->

# Neighborhood Tool Share Constitution

## Core Principles

### I. Speed Over Perfection

Development velocity is the PRIMARY metric. Ship working features fast, iterate based on real user feedback from the neighborhood.

**Rules**:
- MUST prioritize working software over comprehensive documentation
- MUST avoid over-engineering - build for current needs, not hypothetical future scale
- MUST NOT implement features speculatively - only build what users explicitly need
- CAN skip optimization unless performance impacts basic usability

**Rationale**: This is a single-neighborhood tool with a known, small user base. Time-to-value beats theoretical perfection. We learn faster by shipping.

### II. User Experience First

The application MUST be intuitive for non-technical neighbors. If a feature requires documentation to use, it needs redesign.

**Rules**:
- MUST design workflows that require zero training
- MUST provide clear error messages that tell users exactly what to do
- MUST make common tasks achievable in 3 clicks or less
- MUST test features with actual neighbors before considering them complete

**Rationale**: Neighbors won't read manuals. Software that doesn't work intuitively won't get used, no matter how feature-complete it is.

### III. Security Essentials Only

Implement ONLY security measures that prevent serious harm. Skip security theater and enterprise-grade hardening.

**Rules**:
- MUST prevent: SQL injection, XSS, CSRF, credential exposure
- MUST use HTTPS in production
- MUST hash passwords (bcrypt/argon2)
- MUST validate and sanitize all user inputs
- MUST implement basic authentication and authorization
- CAN skip: Advanced threat modeling, penetration testing, security audits, elaborate monitoring
- CAN use: Basic logging for debugging, simple session management

**Rationale**: We're protecting neighbor data and preventing embarrassing breaches, not defending against nation-state actors. Focus on the OWASP Top 10, skip the rest.

### IV. Simple Solutions

Always choose the simplest technology that solves the problem. Complexity is a liability for a small project.

**Rules**:
- MUST use boring, well-established technology
- MUST NOT introduce new dependencies without strong justification
- MUST prefer monoliths over microservices
- MUST prefer server-side rendering over complex frontend frameworks (unless interactivity demands it)
- MUST avoid ORMs and abstractions that hide what's happening
- CAN use SQLite for initial versions
- CAN defer scaling concerns until they become real problems

**Rationale**: Complex architectures require more development time, more debugging time, and more maintenance. Every abstraction layer is a potential confusion point.

### V. Pragmatic Testing

Test what breaks. Skip what doesn't. Automated testing is NOT mandatory.

**Rules**:
- MUST manually test all features before merging
- MUST test core user journeys (borrowing, returning, searching tools)
- CAN write automated tests for business logic that's hard to verify manually
- CAN skip: 100% coverage goals, unit tests for trivial code, integration test suites
- MUST fix bugs immediately when found, add regression test only if it recurs

**Rationale**: For a small user base, manual testing is often faster than writing test automation. Write tests when they save time, not because of dogma.

## Development Workflow

### Feature Development

1. **Understand the need**: Talk to neighbors or clarify the request
2. **Design the simplest solution**: Sketch out the approach, validate it makes sense
3. **Build quickly**: Implement with focus on working > perfect
4. **Manual test**: Click through the feature yourself
5. **Deploy**: Get it in front of real users fast
6. **Iterate**: Fix based on actual feedback

### Code Review (Optional)

- Code review is OPTIONAL for solo development
- If collaborating, reviews MUST focus on: correctness, security essentials, obvious bugs
- Reviews SHOULD NOT block on: style preferences, speculative concerns, minor optimizations

### Deployment

- MUST have a way to deploy changes quickly (aim for < 5 minute deploy cycle)
- MUST be able to rollback if something breaks
- CAN deploy directly to production without staging (for a small user base)

## Security Requirements

### Authentication & Authorization

- MUST require login for actions that modify data
- MUST ensure users can only modify their own items (unless they're admins)
- MUST use session-based or token-based auth (pick whichever is simpler for your stack)

### Data Protection

- MUST use HTTPS in production
- MUST hash passwords (never store plaintext)
- MUST validate user inputs server-side
- MUST sanitize data before rendering (prevent XSS)
- MUST use parameterized queries (prevent SQL injection)

### What We Skip

- Rate limiting (unless abuse becomes a real problem)
- Advanced monitoring and intrusion detection
- Formal security audits
- Compliance certifications
- Complex permission systems (keep roles simple: user/admin)

## Governance

### Constitution Authority

This constitution defines the development philosophy for the Neighborhood Tool Share project. When making technical decisions, refer to these principles.

### Amendments

Constitution changes require:
1. Clear rationale for why the change improves development speed or user experience
2. Update to version number following semantic versioning
3. Review of templates to ensure consistency

### Compliance

- All feature specifications MUST align with Core Principles
- Implementation plans MUST document any violations with strong justification
- Complexity that violates "Simple Solutions" MUST be justified in plan.md

### Version Increments

- **MAJOR**: Backward incompatible changes to core principles (e.g., changing from speed-first to quality-first)
- **MINOR**: Adding new principles or expanding guidance
- **PATCH**: Clarifications, wording improvements, typo fixes

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22
