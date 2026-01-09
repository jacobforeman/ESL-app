import { questionFlowConfig } from '../config/questionFlow';
import { loadCheckInHistory } from '../state/checkInHistory';
import { CheckInHistoryEntry, QuestionDefinition } from '../types/checkIn';

const ACTIONS_BY_LEVEL: Record<string, string> = {
  emergency: 'Call 911 or go to the nearest emergency department now.',
  urgent: 'Contact your liver care team within 24 hours.',
  routine: 'Discuss this at your next appointment.',
  'self-monitor': 'Keep monitoring your symptoms today.',
};

type ExportSummaryPayload = {
  generatedAt: string;
  latestCheckIn: CheckInHistoryEntry | null;
};

const formatAnswerValue = (question: QuestionDefinition, value: CheckInHistoryEntry['answers'][string]) => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  const matchedOption = question.options?.find((option) => option.value === value);
  return matchedOption ? matchedOption.label : value;
};

const buildBackgroundLine = (entry: CheckInHistoryEntry): string => {
  const lines = questionFlowConfig.questions
    .filter((question) => entry.answers[question.id] !== undefined)
    .map((question) => {
      const answer = entry.answers[question.id];
      const formatted = formatAnswerValue(question, answer);
      return `${question.title}: ${formatted}`;
    });

  if (!lines.length) {
    return 'B: No responses recorded.';
  }

  return `B: ${lines.join(' | ')}`;
};

const formatSbar = (entry: CheckInHistoryEntry | null): string => {
  if (!entry) {
    return [
      'S: No check-in history available.',
      'B: No recent answers recorded.',
      'A: Triage result unavailable.',
      'R: Complete a check-in to generate recommendations.',
    ].join('\n');
  }

  const recommendation =
    ACTIONS_BY_LEVEL[entry.result] ?? 'Review patient status and follow care plan.';

  const situation = `S: Check-in completed at ${entry.timestamp}. Latest triage level: ${entry.result}.`;
  const background = buildBackgroundLine(entry);
  const assessment = `A: Based on reported answers, the triage level is ${entry.result}.`;
  const recommendationLine = `R: ${recommendation}`;

  return [situation, background, assessment, recommendationLine].join('\n');
};

export const exportSummary = async (): Promise<{
  json: string;
  sbar: string;
  combined: string;
  summary: ExportSummaryPayload;
}> => {
  const history = await loadCheckInHistory();
  const latestCheckIn = history[0] ?? null;
  const summary: ExportSummaryPayload = {
    generatedAt: new Date().toISOString(),
    latestCheckIn,
  };

  const json = JSON.stringify(summary, null, 2);
  const sbar = formatSbar(latestCheckIn);
  const combined = `JSON Summary\n${json}\n\nSBAR\n${sbar}`;

  return {
    json,
    sbar,
    combined,
    summary,
  };
};
