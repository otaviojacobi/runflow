import crypto from 'crypto'

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getInviteExpirationDate(daysValid: number = 7): Date {
  const date = new Date()
  date.setDate(date.getDate() + daysValid)
  return date
}