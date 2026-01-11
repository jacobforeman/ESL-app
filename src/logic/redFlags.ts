const RED_FLAG_KEYWORDS = [
  'vomited blood',
  'vomiting blood',
  'throwing up blood',
  'black stool',
  'black stools',
  'black tarry stools',
  'bloody stool',
  'confusion',
  'severe abdominal pain',
  'severe belly pain',
  'high fever',
  'cannot wake',
  'passing out',
  'shortness of breath',
  'severe shortness of breath',
];

const NEGATION_PATTERNS = ['no', 'denies', 'without', 'not', "isn't", "is not", "don't", 'do not'];

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalize = (value: string): string => value.toLowerCase();

const isNegated = (text: string, keyword: string): boolean => {
  const escaped = escapeRegExp(keyword);
  const negationRegex = new RegExp(
    `(?:${NEGATION_PATTERNS.join('|')})(?:\\s+\\w+){0,4}\\s+${escaped}`,
    'i',
  );
  return negationRegex.test(text);
};

export const scanTextForRedFlags = (text: string): string[] => {
  const normalized = normalize(text);
  return RED_FLAG_KEYWORDS.filter((keyword) => {
    if (!normalized.includes(keyword)) {
      return false;
    }
    return !isNegated(normalized, keyword);
  });
};

export const scanSymptomsForRedFlags = (symptoms: string[]): string[] => {
  const normalizedSymptoms = symptoms.map(normalize);
  return RED_FLAG_KEYWORDS.filter((keyword) =>
    normalizedSymptoms.some((symptom) => symptom.includes(keyword)),
  );
};

export const hasEmergencyRedFlags = (text: string): boolean => scanTextForRedFlags(text).length > 0;

export const RED_FLAG_KEYWORDS_LIST = RED_FLAG_KEYWORDS;
