import { QuestionFlowConfig } from '../types/checkIn';

export const questionFlowConfig: QuestionFlowConfig = {
  id: 'daily-check-in',
  title: 'Daily Check-In',
  questions: [
    {
      id: 'vomitingBlood',
      title: 'Have you vomited blood or had black/tarry stools?'
        + ' (This can indicate bleeding.)',
      type: 'boolean',
    },
    {
      id: 'severeConfusion',
      title: 'Are you experiencing severe confusion or not acting like yourself?',
      type: 'boolean',
    },
    {
      id: 'fever',
      title: 'Do you have a fever today (100.4°F / 38°C or higher)?',
      type: 'boolean',
    },
    {
      id: 'abdominalPain',
      title: 'How would you rate your abdominal pain today?',
      type: 'single-select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Mild', value: 'mild' },
        { label: 'Moderate', value: 'moderate' },
        { label: 'Severe', value: 'severe' },
      ],
    },
    {
      id: 'missedMeds',
      title: 'Have you missed any liver-related medications in the last 24 hours?',
      type: 'boolean',
    },
    {
      id: 'weightChange',
      title: 'How much did your weight change since yesterday (lbs)?',
      description: 'Rapid gain can indicate fluid retention.',
      type: 'number',
      min: -10,
      max: 20,
      placeholder: '0',
    },
    {
      id: 'notes',
      title: 'Anything else you want to share?',
      type: 'text',
      placeholder: 'Optional notes...',
    },
  ],
};
