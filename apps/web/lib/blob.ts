import { put, del } from '@vercel/blob'

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

export async function uploadOrganizationLogo(orgId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ValidationError(
      `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    )
  }

  if (file.size > MAX_SIZE) {
    throw new ValidationError(
      `File too large: ${file.size} bytes. Maximum size: ${MAX_SIZE} bytes (2MB)`
    )
  }

  const ext = MIME_TO_EXT[file.type]
  const blob = await put(`organizations/${orgId}/logo.${ext}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  return blob.url
}

export async function deleteBlob(blobUrl: string): Promise<void> {
  await del(blobUrl)
}

export function getSignedLogoUrl(blobUrl: string | null): string | null {
  return blobUrl
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}
