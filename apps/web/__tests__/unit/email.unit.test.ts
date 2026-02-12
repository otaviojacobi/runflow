const mockSend = jest.fn()
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}))

const mockSendMail = jest.fn()
const mockCreateTransport = jest.fn().mockReturnValue({ sendMail: mockSendMail })
jest.mock('nodemailer', () => ({
  __esModule: true,
  default: { createTransport: mockCreateTransport },
  createTransport: mockCreateTransport,
}))

jest.mock('@/lib/email-templates/invite', () => ({
  getInviteEmailHtml: jest.fn().mockReturnValue('<html>mock</html>'),
}))

import { sendInviteEmail } from '@/lib/email'
import { getInviteEmailHtml } from '@/lib/email-templates/invite'

const mockedGetInviteEmailHtml = jest.mocked(getInviteEmailHtml)

const baseParams = {
  to: 'user@example.com',
  organizationName: 'Test Org',
  role: 'TRAINER',
  inviteToken: 'abc123',
}

describe('sendInviteEmail', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.RESEND_API_KEY
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.runflow.com'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses Resend when RESEND_API_KEY is set', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    mockSend.mockResolvedValue({ error: null })

    await sendInviteEmail(baseParams)

    expect(mockSend).toHaveBeenCalledWith({
      from: 'RunFlow <otavio@runflow.club>',
      to: 'aaaauser@example.com',
      subject: 'Convite para Test Org — RunFlow',
      html: '<html>mock</html>',
    })
  })

  it('uses nodemailer when RESEND_API_KEY is not set', async () => {
    mockSendMail.mockResolvedValue({})

    await sendInviteEmail(baseParams)

    expect(mockCreateTransport).toHaveBeenCalledWith({
      host: 'localhost',
      port: 2500,
      secure: false,
    })
    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'RunFlow <noreply@runflow.local>',
      to: 'user@example.com',
      subject: 'Convite para Test Org — RunFlow',
      html: '<html>mock</html>',
    })
  })

  it('throws when Resend returns an error', async () => {
    process.env.RESEND_API_KEY = 'test-key'
    mockSend.mockResolvedValue({ error: { message: 'rate limited' } })

    await expect(sendInviteEmail(baseParams)).rejects.toThrow('Failed to send invite email: rate limited')
  })

  it('throws when nodemailer fails', async () => {
    mockSendMail.mockRejectedValue(new Error('SMTP connection refused'))

    await expect(sendInviteEmail(baseParams)).rejects.toThrow('SMTP connection refused')
  })

  it('builds correct invite URL from NEXT_PUBLIC_APP_URL + token', async () => {
    mockSendMail.mockResolvedValue({})

    await sendInviteEmail(baseParams)

    expect(mockedGetInviteEmailHtml).toHaveBeenCalledWith(
      { "inviteUrl": "https://app.runflow.com/pt/invite/abc123", "organizationName": "Test Org", "role": "TRAINER" }
    )
  })

  it('defaults to localhost:3000 when NEXT_PUBLIC_APP_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    mockSendMail.mockResolvedValue({})

    await sendInviteEmail(baseParams)

    expect(mockedGetInviteEmailHtml).toHaveBeenCalledWith(
      { "inviteUrl": "http://localhost:3000/pt/invite/abc123", "organizationName": "Test Org", "role": "TRAINER" }
    )
  })
})
