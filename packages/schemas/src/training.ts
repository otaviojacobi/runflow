import { z } from 'zod'

// Enums
export const TrainingType = z.enum(['RUNNING', 'STRENGTH'])
export const TrainingStatus = z.enum(['TODO', 'COMPLETED', 'MISSED'])

// Exercise schema for strength training
export const strengthExerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  weight: z.number().positive().optional(),
  restTimeSeconds: z.number().int().positive().optional(),
})

// Training done details schema (unified for all training types)
export const trainingDoneDetailsSchema = z.object({
  // Running-specific fields
  distanceKm: z.number().positive().optional(),
  paceMinPerKm: z.number().positive().optional(),
  elevationGainM: z.number().optional(),
  routeData: z.any().optional(), // JSONB data for route/GPS

  // Strength-specific fields
  exercises: z.array(strengthExerciseSchema).optional(),
  totalVolume: z.number().positive().optional(), // Total weight lifted

  // Common fields
  durationSeconds: z.number().int().positive().optional(),
  averageHeartRate: z.number().int().positive().max(220).optional(),
  maxHeartRate: z.number().int().positive().max(250).optional(),
  calories: z.number().int().positive().optional(),
  notes: z.string().optional(),
  completedAt: z.string().datetime().optional(),
})

// Training schemas
export const createTrainingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  type: TrainingType,
  memberId: z.string().uuid(),
  organizationId: z.string().uuid(),
})

export const updateTrainingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subtitle: z.string().max(200).optional(),
  description: z.string().optional(),
  status: TrainingStatus.optional(),
})

export const updateTrainingDetailsSchema = trainingDoneDetailsSchema

// Response schemas
export const trainingResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().nullable(),
  description: z.string().nullable(),
  type: TrainingType,
  status: TrainingStatus,
  trainerId: z.string().uuid(),
  memberId: z.string().uuid(),
  organizationId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  trainer: z.object({
    id: z.string().uuid(),
    name: z.string().nullable(),
    email: z.string().email(),
  }).optional(),
  member: z.object({
    id: z.string().uuid(),
    name: z.string().nullable(),
    email: z.string().email(),
  }).optional(),
  doneDetails: z.object({
    id: z.string().uuid(),
    trainingId: z.string().uuid(),
    // Running-specific fields
    distanceKm: z.number().nullable(),
    paceMinPerKm: z.number().nullable(),
    elevationGainM: z.number().nullable(),
    routeData: z.any().nullable(),
    // Strength-specific fields
    exercises: z.any().nullable(),
    totalVolume: z.number().nullable(),
    // Common fields
    durationSeconds: z.number().nullable(),
    averageHeartRate: z.number().nullable(),
    maxHeartRate: z.number().nullable(),
    calories: z.number().nullable(),
    notes: z.string().nullable(),
    completedAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }).optional(),
})

// Query schemas
export const listTrainingsQuerySchema = z.object({
  organizationId: z.string().uuid().optional(),
  memberId: z.string().uuid().optional(),
  trainerId: z.string().uuid().optional(),
  status: TrainingStatus.optional(),
  type: TrainingType.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

// Types
export type CreateTraining = z.infer<typeof createTrainingSchema>
export type UpdateTraining = z.infer<typeof updateTrainingSchema>
export type UpdateTrainingDetails = z.infer<typeof updateTrainingDetailsSchema>
export type TrainingResponse = z.infer<typeof trainingResponseSchema>
export type ListTrainingsQuery = z.infer<typeof listTrainingsQuerySchema>
export type TrainingTypeValue = z.infer<typeof TrainingType>
export type TrainingStatusValue = z.infer<typeof TrainingStatus>
export type TrainingDoneDetails = z.infer<typeof trainingDoneDetailsSchema>
export type StrengthExercise = z.infer<typeof strengthExerciseSchema>
