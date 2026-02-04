import { describe, it, expect } from '@jest/globals'
import { getInviteEmailHtml } from '@/lib/email-templates/invite'

const baseParams = {
  organizationName: 'Academia Forte',
  role: 'TRAINER',
  inviteUrl: 'https://app.runflow.com/invite/token123',
}

describe('getInviteEmailHtml', () => {
  it('contains org name and invite URL', () => {
    const html = getInviteEmailHtml(baseParams)

    expect(html).toContain('Academia Forte')
    expect(html).toContain('https://app.runflow.com/invite/token123')
  })

  it('has a cheerful message', () => {
    const html = getInviteEmailHtml(baseParams)

    expect(html).toContain('Boas notícias!')
    expect(html).toContain('Estamos animados para ter você no time!')
  })

  it('maps OWNER role to Proprietário', () => {
    const html = getInviteEmailHtml({ ...baseParams, role: 'OWNER' })
    expect(html).toContain('Proprietário')
  })

  it('maps TRAINER role to Treinador', () => {
    const html = getInviteEmailHtml({ ...baseParams, role: 'TRAINER' })
    expect(html).toContain('Treinador')
  })

  it('maps ATHLETE role to Atleta', () => {
    const html = getInviteEmailHtml({ ...baseParams, role: 'ATHLETE' })
    expect(html).toContain('Atleta')
  })

  it('falls back to raw role string for unknown roles', () => {
    const html = getInviteEmailHtml({ ...baseParams, role: 'ADMIN' })
    expect(html).toContain('ADMIN')
  })

  it('produces valid HTML structure', () => {
    const html = getInviteEmailHtml(baseParams)
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('lang="pt-BR"')
    expect(html).toContain('Aceitar convite')
  })
})
