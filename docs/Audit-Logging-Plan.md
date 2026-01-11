# Audit Logging Plan (Draft)

## Goal
Provide visibility into sensitive actions without claiming compliance. Logs are stored locally in v0.

## Events Captured (v0)
- check-in submitted
- triage result viewed
- export generated
- AI message generated
- caregiver mode toggled
- journal saved
- medication logged
- emergency alert triggered

## Schema
```
{
  id,
  timestamp,
  user_role,
  action_type,
  entity,
  entity_id,
  metadata
}
```

## Future Enhancements
- Immutable log storage
- Encryption and integrity checks
- Exportable audit reports
