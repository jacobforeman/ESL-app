# Data Flow (v0)

## On-Device (Current)
- Check-ins, triage results, journal entries, and medication adherence are stored locally.
- AI summaries are generated locally via mock responses (no network calls required for v0).

## Future (Planned)
- Optional cloud sync behind explicit consent
- Authentication and authorization required for any remote access
- End-to-end encryption for PHI in transit and at rest
- Audit logging for all PHI access or export events

## Boundaries
- The v0 app does not transmit PHI to external services.
- Any future network access must be gated by consent, encryption, and audit logging.
