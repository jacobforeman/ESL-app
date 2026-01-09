import { z } from 'zod';

export const doseStatusSchema = z.enum(['taken', 'missed', 'unknown']);

export const medicationDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  critical: z.boolean(),
});

export const medicationDefinitionsSchema = z.array(medicationDefinitionSchema);

export const dailyAdherenceSchema = z.record(doseStatusSchema);

export const adherenceHistorySchema = z.record(dailyAdherenceSchema);
