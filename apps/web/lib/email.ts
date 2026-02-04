import { getInviteEmailHtml } from './email-templates/invite'

interface SendInviteEmailParams {
  to: string
  organizationName: string
  role: string
  inviteToken: string
}

export async function sendInviteEmail({
  to,
  organizationName,
  role,
  inviteToken,
}: SendInviteEmailParams): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteUrl = `${appUrl}/pt/invite/${inviteToken}`

  const subject = `Convite para ${organizationName} — RunFlow`
  const html = getInviteEmailHtml({ organizationName, role, inviteUrl })

  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
      from: 'RunFlow <otavio@runflow.club>',
      to,
      subject,
      html,
    })

    if (error) {
      throw new Error(`Failed to send invite email: ${error.message}`)
    }
  } else {
    const nodemailer = await import('nodemailer')
    const transport = nodemailer.default.createTransport({
      host: 'localhost',
      port: 2500,
      secure: false,
    })

    await transport.sendMail({
      from: 'RunFlow <noreply@runflow.local>',
      to,
      subject,
      html,
    })
  }
}
