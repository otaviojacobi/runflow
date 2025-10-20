import {
  createTrainingSchema,
  updateTrainingSchema,
  updateTrainingDetailsSchema,
  trainingDoneDetailsSchema,
  strengthExerciseSchema,
  listTrainingsQuerySchema,
  TrainingType,
  TrainingStatus,
} from '@repo/schemas/training'
import { ZodError } from 'zod'

describe('Training Validation Schemas', () => {
  describe('createTrainingSchema', () => {
    it('should validate correct training data', () => {
      const validData = {
        title: 'Morning Run',
        subtitle: '5K Easy Run',
        description: 'Take it easy, focus on form',
        type: 'RUNNING' as const,
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      }

      const result = createTrainingSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject missing title', () => {
      const invalidData = {
        type: 'RUNNING',
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      }

      expect(() => createTrainingSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject invalid type', () => {
      const invalidData = {
        title: 'Test Training',
        type: 'INVALID_TYPE',
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      }

      expect(() => createTrainingSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject invalid UUID for memberId', () => {
      const invalidData = {
        title: 'Test Training',
        type: 'RUNNING',
        memberId: 'not-a-uuid',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      }

      expect(() => createTrainingSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should accept optional fields', () => {
      const validData = {
        title: 'Test Training',
        type: 'STRENGTH' as const,
        memberId: '123e4567-e89b-12d3-a456-426614174000',
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
      }

      const result = createTrainingSchema.parse(validData)
      expect(result.subtitle).toBeUndefined()
      expect(result.description).toBeUndefined()
    })
  })

  describe('updateTrainingSchema', () => {
    it('should validate correct update data', () => {
      const validData = {
        title: 'Updated Title',
        status: 'COMPLETED' as const,
      }

      const result = updateTrainingSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should allow partial updates', () => {
      const validData = {
        status: 'MISSED' as const,
      }

      const result = updateTrainingSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject invalid status', () => {
      const invalidData = {
        status: 'INVALID_STATUS',
      }

      expect(() => updateTrainingSchema.parse(invalidData)).toThrow(ZodError)
    })
  })

  describe('trainingDoneDetailsSchema', () => {
    it('should validate complete running details', () => {
      const validData = {
        distanceKm: 5.0,
        durationSeconds: 1800,
        paceMinPerKm: 6.0,
        averageHeartRate: 150,
        maxHeartRate: 175,
        elevationGainM: 50.5,
        calories: 300,
        completedAt: '2025-10-20T10:00:00.000Z',
      }

      const result = trainingDoneDetailsSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate complete strength details', () => {
      const validData = {
        exercises: [
          {
            name: 'Bench Press',
            sets: 3,
            reps: 10,
            weight: 80,
            restTimeSeconds: 90,
          },
          {
            name: 'Squats',
            sets: 4,
            reps: 8,
            weight: 100,
            restTimeSeconds: 120,
          },
        ],
        totalVolume: 2400,
        durationSeconds: 3600,
        calories: 400,
        notes: 'Good session, felt strong',
        completedAt: '2025-10-20T10:00:00.000Z',
      }

      const result = trainingDoneDetailsSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate mixed running and strength fields', () => {
      const validData = {
        distanceKm: 10.0,
        durationSeconds: 3600,
        calories: 500,
        notes: 'Combined training',
      }

      const result = trainingDoneDetailsSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should reject negative distance', () => {
      const invalidData = {
        distanceKm: -5.0,
      }

      expect(() => trainingDoneDetailsSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject heart rate above 220', () => {
      const invalidData = {
        averageHeartRate: 250,
      }

      expect(() => trainingDoneDetailsSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject exercise with missing name', () => {
      const invalidData = {
        exercises: [
          {
            sets: 3,
            reps: 10,
          },
        ],
      }

      expect(() => trainingDoneDetailsSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should reject negative sets or reps', () => {
      const invalidData = {
        exercises: [
          {
            name: 'Bench Press',
            sets: -3,
            reps: 10,
          },
        ],
      }

      expect(() => trainingDoneDetailsSchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should accept empty object (all fields optional)', () => {
      const validData = {}

      const result = trainingDoneDetailsSchema.parse(validData)
      expect(result).toEqual({})
    })
  })

  describe('updateTrainingDetailsSchema', () => {
    it('should validate running details update', () => {
      const validData = {
        distanceKm: 10.0,
        durationSeconds: 3600,
        paceMinPerKm: 6.0,
      }

      const result = updateTrainingDetailsSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should validate strength details update', () => {
      const validData = {
        exercises: [
          {
            name: 'Deadlift',
            sets: 5,
            reps: 5,
            weight: 120,
          },
        ],
        totalVolume: 3000,
      }

      const result = updateTrainingDetailsSchema.parse(validData)
      expect(result).toEqual(validData)
    })

    it('should accept partial updates', () => {
      const validData = {
        completedAt: '2025-10-20T10:00:00.000Z',
        notes: 'Great workout',
      }

      const result = updateTrainingDetailsSchema.parse(validData)
      expect(result).toEqual(validData)
    })
  })

  describe('listTrainingsQuerySchema', () => {
    it('should validate correct query parameters', () => {
      const validData = {
        organizationId: '123e4567-e89b-12d3-a456-426614174001',
        status: 'TODO' as const,
        type: 'RUNNING' as const,
        limit: '20',
        offset: '0',
      }

      const result = listTrainingsQuerySchema.parse(validData)
      expect(result.limit).toBe(20)
      expect(result.offset).toBe(0)
    })

    it('should apply default values', () => {
      const validData = {}

      const result = listTrainingsQuerySchema.parse(validData)
      expect(result.limit).toBe(50)
      expect(result.offset).toBe(0)
    })

    it('should reject limit above 100', () => {
      const invalidData = {
        limit: '150',
      }

      expect(() => listTrainingsQuerySchema.parse(invalidData)).toThrow(ZodError)
    })

    it('should coerce string numbers to numbers', () => {
      const validData = {
        limit: '25',
        offset: '10',
      }

      const result = listTrainingsQuerySchema.parse(validData)
      expect(result.limit).toBe(25)
      expect(result.offset).toBe(10)
      expect(typeof result.limit).toBe('number')
      expect(typeof result.offset).toBe('number')
    })
  })

  describe('TrainingType enum', () => {
    it('should validate valid training types', () => {
      expect(TrainingType.parse('RUNNING')).toBe('RUNNING')
      expect(TrainingType.parse('STRENGTH')).toBe('STRENGTH')
    })

    it('should reject invalid training type', () => {
      expect(() => TrainingType.parse('INVALID')).toThrow(ZodError)
    })
  })

  describe('TrainingStatus enum', () => {
    it('should validate valid training statuses', () => {
      expect(TrainingStatus.parse('TODO')).toBe('TODO')
      expect(TrainingStatus.parse('COMPLETED')).toBe('COMPLETED')
      expect(TrainingStatus.parse('MISSED')).toBe('MISSED')
    })

    it('should reject invalid training status', () => {
      expect(() => TrainingStatus.parse('INVALID')).toThrow(ZodError)
    })
  })
})
