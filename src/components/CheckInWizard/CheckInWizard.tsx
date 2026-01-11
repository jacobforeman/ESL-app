import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { z } from 'zod';

import { questionFlowConfig } from '../../config/questionFlow';
import { buildCheckInSchema } from '../../logic/checkInSchema';
import { getTodayAdherenceSnapshot, recordDose } from '../../logic/medTracker';
import { runTriage } from '../../logic/triageEngine';
import { appendCheckInHistory } from '../../state/checkInHistory';
import { readStore } from '../../storage';
import { journalStore, profileStore } from '../../storage/stores';
import type { CaregiverMode } from '../../storage/types';
import { CheckInAnswers, QuestionDefinition, TriageLevel } from '../../types/checkIn';
import { MedAdherenceSnapshotItem, MedAdherenceStatus } from '../../types/meds';
import { getCaregiverPossessive } from '../../utils/caregiverPhrasing';
import { QuestionRenderer } from './QuestionRenderer';

type CheckInWizardProps = {
  onComplete: (result: TriageLevel, entryId: string) => void;
};

export const CheckInWizard = ({ onComplete }: CheckInWizardProps) => {
  const { questions } = questionFlowConfig;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckInAnswers>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adherenceSnapshot, setAdherenceSnapshot] = useState<MedAdherenceSnapshotItem[]>([]);
  const [adherenceError, setAdherenceError] = useState<string | null>(null);
  const [caregiverMode, setCaregiverMode] = useState<CaregiverMode>('patient');
  const [journalRedFlags, setJournalRedFlags] = useState<string[]>([]);

  const schema = useMemo(() => buildCheckInSchema(questions), [questions]);
  const totalSteps = questions.length + 1;
  const isAdherenceStep = currentIndex === 0;
  const currentQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;

  useEffect(() => {
    let isMounted = true;

    const loadSnapshot = async () => {
      try {
        const [{ data: profile }, snapshot, { data: journalEntries }] = await Promise.all([
          readStore(profileStore),
          getTodayAdherenceSnapshot(),
          readStore(journalStore),
        ]);
        if (isMounted) {
          setCaregiverMode(profile.caregiverMode);
          setAdherenceSnapshot(snapshot);
          const cutoff = Date.now() - 24 * 60 * 60 * 1000;
          const recentFlags = journalEntries.flatMap((entry) => {
            const createdAt = new Date(entry.createdAt).getTime();
            if (Number.isNaN(createdAt) || createdAt < cutoff) {
              return [];
            }
            return entry.redFlags ?? [];
          });
          setJournalRedFlags(Array.from(new Set(recentFlags)));
        }
      } catch (error) {
        console.warn('Unable to load adherence snapshot.', error);
        if (isMounted) {
          setAdherenceError('Unable to load today’s medications. You can still continue.');
        }
      }
    };

    loadSnapshot();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateAnswer = (question: QuestionDefinition, value: boolean | string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const updateMedStatus = (medId: string, status: MedAdherenceStatus) => {
    setAdherenceSnapshot((prev) =>
      prev.map((med) => (med.medId === medId ? { ...med, status } : med)),
    );
  };

  const goNext = () => {
    setErrorMessage(null);
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goBack = () => {
    setErrorMessage(null);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    try {
      const validated = schema.parse(answers) as z.infer<typeof schema>;
      const triageDecision = runTriage({
        answers: validated,
        medAdherence: adherenceSnapshot,
        journalRedFlags,
      });
      const dateKey = new Date().toISOString().slice(0, 10);
      for (const med of adherenceSnapshot) {
        if (med.status === 'unknown') {
          continue;
        }
        await recordDose({
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          medId: med.medId,
          date: dateKey,
          taken: med.status === 'taken',
        });
      }
      const entry = await appendCheckInHistory(validated, triageDecision, {
        journalRedFlags,
        medAdherence: adherenceSnapshot,
      });
      onComplete(triageDecision.level, entry.checkIn.id);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        setErrorMessage(firstError?.message ?? 'Please answer the highlighted question.');
        return;
      }

      setErrorMessage('Unable to save your check-in. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {caregiverMode === 'caregiver' ? 'Caregiver Check-In' : questionFlowConfig.title}
      </Text>
      <Text style={styles.subheading}>
        Complete today&apos;s check-in for {getCaregiverPossessive(caregiverMode)} symptoms.
      </Text>
      <Text style={styles.progress}>
        Step {currentIndex + 1} of {totalSteps}
      </Text>

      {isAdherenceStep ? (
        <View style={styles.adherenceStep}>
          <Text style={styles.sectionTitle}>Medication adherence</Text>
          <Text style={styles.sectionDescription}>
            Review {getCaregiverPossessive(caregiverMode)} medications and update any missed doses.
          </Text>
          {adherenceSnapshot.length === 0 ? (
            <Text style={styles.emptyState}>No medications saved for today.</Text>
          ) : (
            adherenceSnapshot.map((med) => (
              <View key={med.medId} style={styles.medRow}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDose}>{med.dose}</Text>
                  {med.isCritical ? <Text style={styles.criticalTag}>Critical</Text> : null}
                </View>
                <View style={styles.medActions}>
                  <Pressable
                    onPress={() => updateMedStatus(med.medId, 'taken')}
                    style={[
                      styles.statusButton,
                      med.status === 'taken' && styles.statusButtonActive,
                    ]}
                  >
                    <Text style={styles.statusButtonText}>Taken</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => updateMedStatus(med.medId, 'missed')}
                    style={[
                      styles.statusButton,
                      med.status === 'missed' && styles.statusButtonMissed,
                    ]}
                  >
                    <Text style={styles.statusButtonText}>Missed</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => updateMedStatus(med.medId, 'unknown')}
                    style={[
                      styles.statusButton,
                      med.status === 'unknown' && styles.statusButtonUnknown,
                    ]}
                  >
                    <Text style={styles.statusButtonText}>Not sure</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
          {adherenceError ? <Text style={styles.error}>{adherenceError}</Text> : null}
        </View>
      ) : currentQuestion ? (
        <QuestionRenderer
          question={currentQuestion}
          value={answers[currentQuestion.id]}
          onChange={(value) => updateAnswer(currentQuestion, value)}
        />
      ) : null}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          onPress={goBack}
          disabled={currentIndex === 0}
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
        {currentIndex < totalSteps - 1 ? (
          <Pressable onPress={goNext} style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable onPress={handleSubmit} style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>See Result</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  progress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  adherenceStep: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionDescription: {
    color: '#4b5563',
  },
  emptyState: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
  medRow: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  medInfo: {
    gap: 4,
  },
  medName: {
    fontSize: 16,
    fontWeight: '600',
  },
  medDose: {
    color: '#6b7280',
  },
  criticalTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  medActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  statusButtonActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  statusButtonMissed: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  statusButtonUnknown: {
    backgroundColor: '#e5e7eb',
    borderColor: '#9ca3af',
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  error: {
    color: '#b91c1c',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPrimary: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
