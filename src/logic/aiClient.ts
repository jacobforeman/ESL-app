const SYSTEM_GUARDRAILS = `You are a supportive health companion for ESLD patients and caregivers.
- Never provide diagnosis or treatment instructions.
- Always defer to clinician guidance and emergency instructions.
- If red-flag symptoms are mentioned, advise seeking urgent care.
- Use clear, empathetic, non-alarming language.
- Keep responses short and actionable.`;

export interface AiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiClientOptions {
  apiKey: string;
  endpoint?: string;
  model?: string;
}

export const buildGuardedMessages = (userPrompt: string, context?: string): AiMessage[] => {
  const guardrails = context ? `${SYSTEM_GUARDRAILS}\nContext: ${context}` : SYSTEM_GUARDRAILS;
  return [
    { role: 'system', content: guardrails },
    { role: 'user', content: userPrompt },
  ];
};

export const requestAiCompletion = async (
  userPrompt: string,
  options: AiClientOptions,
  context?: string,
): Promise<string> => {
  const endpoint = options.endpoint ?? 'https://api.openai.com/v1/chat/completions';
  const model = options.model ?? 'gpt-4o-mini';
  const messages = buildGuardedMessages(userPrompt, context);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI request failed: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return payload.choices?.[0]?.message?.content?.trim() ?? '';
};
