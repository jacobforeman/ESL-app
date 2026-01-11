# Threat Model (Draft)

## Assets
- Patient-entered PHI (check-ins, journal, medications)
- Triage outcomes
- AI summaries and exportable reports

## Threats (High-Level)
- Unauthorized access to device data
- Accidental export/share of PHI
- Data loss from device reset
- Misinterpretation of AI responses

## Mitigations (Planned)
- Encrypted local storage (future)
- Explicit consent gates for export/share
- Clear disclaimers and emergency guidance
- Audit logging for sensitive actions

## Open Items
- Formal STRIDE analysis
- Threat modeling workshop with clinical + security stakeholders
