import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { z } from 'zod';

import { questionFlowConfig } from '../../config/questionFlow';
import { buildCheckInSchema } from '../../logic/checkInSchema';
import { runTriage } from '../../logic/triageEngine';
import { appendCheckInHistory } from '../../state/checkInHistory';
import { CheckInAnswers, QuestionDefinition, TriageLevel } from '../../types/checkIn';
import { QuestionRenderer } from './QuestionRenderer';

type CheckInWizardProps = {
  onComplete: (result: TriageLevel, entryId: string) => void;
};

export const CheckInWizard = ({ onComplete }: CheckInWizardProps) => {
  const { questions } = questionFlowConfig;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<CheckInAnswers>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const schema = useMemo(() => buildCheckInSchema(questions), [questions]);
  const currentQuestion = questions[currentIndex];

  const updateAnswer = (question: QuestionDefinition, value: boolean | string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: value,
    }));
  };

  const goNext = () => {
    setErrorMessage(null);
    if (currentIndex < questions.length - 1) {
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
      const triageResult = runTriage(validated);
      const entry = await appendCheckInHistory(validated, triageResult);
      onComplete(triageResult, entry.id);
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
      <Text style={styles.heading}>{questionFlowConfig.title}</Text>
      <Text style={styles.progress}>
        Question {currentIndex + 1} of {questions.length}
      </Text>

      <QuestionRenderer
        question={currentQuestion}
        value={answers[currentQuestion.id]}
        onChange={(value) => updateAnswer(currentQuestion, value)}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          onPress={goBack}
          disabled={currentIndex === 0}
          style={[styles.button, currentIndex === 0 && styles.buttonDisabled]}
        >
          <Text style={styles.buttonText}>Back</Text>
        </Pressable>
        {currentIndex < questions.length - 1 ? (
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
  progress: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
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
