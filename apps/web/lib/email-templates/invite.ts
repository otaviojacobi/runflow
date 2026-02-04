interface InviteEmailParams {
  organizationName: string
  role: string
  inviteUrl: string
}

const roleLabels: Record<string, string> = {
  OWNER: 'Proprietário',
  TRAINER: 'Treinador',
  ATHLETE: 'Atleta',
}

export function getInviteEmailHtml({
  organizationName,
  role,
  inviteUrl,
}: InviteEmailParams): string {
  const roleLabel = roleLabels[role] ?? role

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">RunFlow</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 32px;">
            <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Boas notícias!</h2>
            <p style="margin:0 0 24px;color:#3f3f46;font-size:16px;line-height:1.6;">
              Você foi convidado para fazer parte da <strong>${organizationName}</strong> como <strong>${roleLabel}</strong>. Estamos animados para ter você no time!
            </p>
            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
              <tr><td align="center" style="background-color:#2563eb;border-radius:8px;">
                <a href="${inviteUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
                  Aceitar convite
                </a>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;color:#71717a;font-size:14px;line-height:1.5;">
              Se você não esperava este convite, pode ignorar este e-mail.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;background-color:#f9fafb;text-align:center;border-top:1px solid #e4e4e7;">
            <p style="margin:0;color:#a1a1aa;font-size:12px;">© ${new Date().getFullYear()} RunFlow. Todos os direitos reservados.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
