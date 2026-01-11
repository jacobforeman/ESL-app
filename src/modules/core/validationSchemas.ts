import { z } from "zod";

export const PatientProfileSchema = z.object({
  id: z.string().min(1),
  age: z.number().int().min(18).max(120),
  hasTIPS: z.boolean().default(false),
  transplantStatus: z
    .enum(["pre-transplant", "post-transplant", "not-listed"])
    .default("not-listed"),
  baselineWeightKg: z.number().positive().optional(),
  caregiverMode: z.boolean().default(false),
});

export const CheckInSchema = z.object({
  timestamp: z.string().datetime(),
  symptoms: z.object({
    vomitingBlood: z.boolean().default(false),
    blackTarryStools: z.boolean().default(false),
    severeAbdominalPain: z.boolean().default(false),
    abdominalPain: z.boolean().default(false),
    confusionLevel: z.enum(["none", "mild", "moderate", "severe"]),
    shortnessOfBreath: z.boolean().default(false),
    jaundiceWorsening: z.boolean().default(false),
    edemaWorsening: z.boolean().default(false),
    ascitesWorsening: z.boolean().default(false),
    fever: z.boolean().default(false),
    missedLactulose: z.boolean().default(false),
  }),
  vitals: z
    .object({
      temperatureC: z.number().min(30).max(43).optional(),
      heartRate: z.number().int().min(30).max(220).optional(),
      systolicBP: z.number().int().min(60).max(220).optional(),
      diastolicBP: z.number().int().min(30).max(140).optional(),
      oxygenSat: z.number().min(50).max(100).optional(),
    })
    .optional(),
  weightGainKgLast24h: z.number().min(0).max(10).optional(),
});

export const TriageResultSchema = z.object({
  level: z.enum(["emergency", "urgent", "routine", "self-monitor"]),
  reasons: z.array(z.string()),
  ruleIds: z.array(z.string()).optional(),
  recommendedAction: z.string(),
});

export type PatientProfile = z.infer<typeof PatientProfileSchema>;
export type CheckIn = z.infer<typeof CheckInSchema>;
export type TriageResult = z.infer<typeof TriageResultSchema>;
