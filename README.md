# AI-Enabled Triage Companion App for End-Stage Liver Disease Patients

## Overview
This repository contains the starter blueprint for a mobile-first, AI-powered triage companion app tailored for end-stage liver disease (ESLD) patients and their caregivers. The goal is to reduce avoidable hospitalizations and improve daily self-management by combining symptom check-ins, medication adherence tracking, journaling, caregiver support, and safe AI guidance.

The app is patient-facing in v1 (no clinician dashboard) and is designed to be modular so that it can be adapted to other chronic diseases with minimal changes.

## Scope and Objectives
**Target users**
- Adults with ESLD (including decompensated cirrhosis, pre-transplant patients, and those with TIPS).
- Caregivers acting in a support role.

**Primary goal**
- Enable daily monitoring and early detection of complications through structured check-ins and rule-based triage.

**Key objectives**
- Symptom & vitals tracking with evidence-informed triage levels (Emergency, Urgent, Routine, Self-monitor).
- Medication adherence tracking with reminders and checklists.
- AI companion for education, explanations, and message drafting (never overriding medical rules).
- Caregiver mode for shared tracking, notes, and context-aware UI.
- Journaling and proactive alerts for red flags or worsening trends.
- Modular architecture for future disease-specific adaptations.

All interactions include safety disclaimers and reminders to follow medical advice. The vision is to deliver a production-ready starter repository that can run locally (front-end only), and later integrate with a backend.

## Technical Architecture
**Platform & stack**
- React Native (TypeScript) for iOS/Android.
- State management: Zustand (or Redux Toolkit if needed).
- Validation: Zod schemas for all inputs.
- AI: OpenAI API via a dedicated helper module with strict safety prompts.
- Local storage: AsyncStorage or SQLite for on-device persistence.
- UI toolkit: React Native Paper or NativeBase for consistent UI.
- Testing: Jest + React Native Testing Library.

**Design principles**
- Client-side processing and offline support (AI requires connectivity).
- Feature-based modules with clean separation of concerns.
- Rule-based triage engine that is easy to test and evolve.

## Core Modules

### 1) Smart Check-In (Triage Wizard)
A guided, multi-step daily intake flow that collects symptoms, vitals, and medication adherence data. It feeds the **TriageEngine** to determine one of four outcomes:
- **Emergency**: Immediate care recommended (e.g., vomiting blood, severe confusion, fever + severe abdominal pain).
- **Urgent**: Contact clinic within 24 hours (e.g., moderate confusion + worsening ascites).
- **Routine**: Discuss at next appointment.
- **Self-monitor**: No concerning symptoms today.

The triage result screen is color-coded, includes a simple explanation, and offers actions (Call 911, Call Clinic, Export Summary, or open Journal).

### 2) Medication Adherence Tracker
A daily checklist with scheduled doses, reminders, and adherence logging. Missed doses feed into triage logic (e.g., confusion + missed lactulose can elevate risk). Optional reason logging and a weekly adherence summary support engagement and clinician discussions.

### 3) Symptom Journal & Daily Log
A free-text journal with optional prompts and caregiver notes. The journal is integrated with alerting: key phrases (e.g., “vomited blood”) trigger safety alerts and guidance to seek care. AI can summarize journal history for doctor visits.

### 4) Caregiver Support Mode
A mode toggle that adjusts UI copy to “patient” vs “caregiver” phrasing, adds caregiver-specific notes, and provides quick access to recent status. The design supports future multi-device access when a backend is added.

### 5) Red Flag Monitoring & Alerts
Always-on safety checks that trigger immediate Emergency guidance when critical symptoms are detected — even outside the check-in flow (e.g., in journal entries). Alerts are interruptive and emphasize emergency actions.

### 6) Exportable Health Summary
Generates a structured and narrative summary for sharing with clinicians or caregivers. Includes triage history, symptom trends, medication adherence, and journal highlights. The AI companion can draft a clear message for the doctor based on the summary.

### 7) AI Companion (Chat & Guidance)
A guided AI assistant that explains terms, supports check-ins, and helps patients prepare communications. The AI does **not** provide medical diagnoses or treatment instructions and must always reinforce the triage outcome. A strict system prompt enforces safety, empathy, and clarity.

## Project Structure (Proposed)
```
esld-companion-app/
├── App.tsx
├── src/
│   ├── components/
│   │   ├── CheckInWizard/
│   │   ├── MedTracker/
│   │   ├── Journal/
│   │   └── AiChat/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── CheckInScreen.tsx
│   │   ├── MedicationsScreen.tsx
│   │   ├── JournalScreen.tsx
│   │   ├── ChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── state/
│   │   ├── useTriageStore.ts
│   │   ├── useMedStore.ts
│   │   ├── useJournalStore.ts
│   │   └── useAppStore.ts
│   ├── logic/
│   │   ├── TriageEngine.ts
│   │   ├── TriageRulesConfig.ts
│   │   ├── AiHelper.ts
│   │   ├── AlertsService.ts
│   │   └── ValidationSchemas.ts
│   ├── hooks/
│   ├── utils/
│   └── theme/
├── tests/
│   ├── TriageEngine.test.ts
│   ├── JournalAlerts.test.ts
│   └── MedTracker.test.ts
└── README.md
```

## Testing Plan (Examples)
- Triage engine rule tests (red flags, urgent scenarios, self-monitor cases).
- Journal keyword detection for red flags with false-positive mitigation.
- Medication adherence state updates and daily reset logic.
- Caregiver mode phrasing and UI toggles.

## Safety and Compliance
- Clear disclaimers: this app does not replace professional medical care.
- The AI companion follows strict safety prompts and never overrides triage outcomes.
- Sensitive data remains on-device in v0; users explicitly control sharing.

## Run in Expo Go (v0)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo dev server:
   ```bash
   npx expo start
   ```
3. Open the Expo Go app on your device and scan the QR code.

AI keys are optional for v0. If `EXPO_PUBLIC_AI_API_KEY` is not set, the app uses mock AI responses.

## Future Expansion
- Backend for data sync and multi-device caregiver access.
- Disease-agnostic content configuration for other chronic conditions.
- Wearable integration (heart rate, step count).
- Advanced personalization (baseline symptom thresholds, dynamic triage).

---

### References & Inspiration
- Mobile monitoring and cirrhosis readmission reduction studies.
- Existing ESLD apps (LiverCheck, PatientBuddy, Happi Liver, LyfeMD) and their gaps.
- Cirrhosis emergency guidance and safety best practices.

*This document is a blueprint and product/engineering guide for the ESLD Companion App.*
