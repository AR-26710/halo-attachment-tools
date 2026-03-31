export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]

export function isSupportedImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type)
}
