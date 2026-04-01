const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const
const KB = 1024

const MIME_RULES: { pattern: RegExp; icon: string; name: string }[] = [
  { pattern: /^image\//, icon: 'mdi:file-image-outline', name: '图片' },
  { pattern: /^video\//, icon: 'mdi:file-video-outline', name: '视频' },
  { pattern: /^audio\//, icon: 'mdi:file-music-outline', name: '音频' },
  { pattern: /pdf/, icon: 'mdi:file-pdf-box', name: 'PDF 文档' },
  { pattern: /word|officedocument\.wordprocessingml/, icon: 'mdi:file-word-outline', name: 'Word 文档' },
  { pattern: /excel|spreadsheet|officedocument\.spreadsheetml/, icon: 'mdi:file-excel-outline', name: 'Excel 表格' },
  { pattern: /powerpoint|presentation|officedocument\.presentationml/, icon: 'mdi:file-powerpoint-outline', name: 'PowerPoint 演示' },
  { pattern: /zip|compressed|tar|gzip|7z|rar/, icon: 'mdi:folder-zip-outline', name: '压缩文件' },
  { pattern: /text\/|json|xml|yaml|javascript|typescript|css|html/, icon: 'mdi:file-code-outline', name: '文本文件' },
]

const SUBTYPE_MAP: Record<string, Record<string, string>> = {
  image: {
    jpeg: 'JPEG 图片',
    jpg: 'JPEG 图片',
    png: 'PNG 图片',
    gif: 'GIF 图片',
    webp: 'WebP 图片',
    svg: 'SVG 图片',
  },
  video: {
    mp4: 'MP4 视频',
    webm: 'WebM 视频',
    avi: 'AVI 视频',
    mov: 'MOV 视频',
  },
  audio: {
    mp3: 'MP3 音频',
    wav: 'WAV 音频',
    ogg: 'OGG 音频',
    flac: 'FLAC 音频',
  },
}

const COMPRESS_TYPE_MAP: Record<string, string> = {
  zip: 'ZIP 压缩',
  rar: 'RAR 压缩',
  '7z': '7Z 压缩',
}

const CODE_TYPE_MAP: Record<string, string> = {
  json: 'JSON 文件',
  javascript: 'JavaScript 文件',
  js: 'JavaScript 文件',
  typescript: 'TypeScript 文件',
  ts: 'TypeScript 文件',
  css: 'CSS 文件',
  html: 'HTML 文件',
  htm: 'HTML 文件',
  xml: 'XML 文件',
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串，如 "1.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const i = Math.floor(Math.log(bytes) / Math.log(KB))
  const size = Number.parseFloat((bytes / Math.pow(KB, i)).toFixed(2))
  const unit = FILE_SIZE_UNITS[i] ?? FILE_SIZE_UNITS[FILE_SIZE_UNITS.length - 1]

  return `${size} ${unit}`
}

/**
 * 获取文件图标
 * @param mimeType MIME 类型
 * @returns 图标名称
 */
export function getFileIcon(mimeType: string): string {
  if (!mimeType) return 'mdi:file-outline'

  const lowerMime = mimeType.toLowerCase()
  const rule = MIME_RULES.find(r => r.pattern.test(lowerMime))

  return rule?.icon ?? 'mdi:file-outline'
}

/**
 * 获取文件类型名称
 * @param mimeType MIME 类型
 * @returns 文件类型描述
 */
export function getFileTypeName(mimeType: string): string {
  if (!mimeType) return '未知'

  const lowerMime = mimeType.toLowerCase()

  const mainType = lowerMime.split('/')[0]
  const subType = lowerMime.split('/')[1] ?? ''

  const subTypeMap = SUBTYPE_MAP[mainType]
  if (subTypeMap) {
    const detailedName = Object.entries(subTypeMap).find(([key]) =>
      subType.includes(key),
    )?.[1]
    if (detailedName) return detailedName
  }

  if (lowerMime.includes('zip') || lowerMime.includes('compressed')) {
    const compressName = Object.entries(COMPRESS_TYPE_MAP).find(([key]) =>
      lowerMime.includes(key),
    )?.[1]
    if (compressName) return compressName
  }

  if (
    lowerMime.includes('text/') ||
    lowerMime.includes('json') ||
    lowerMime.includes('xml') ||
    lowerMime.includes('yaml') ||
    lowerMime.includes('javascript') ||
    lowerMime.includes('typescript') ||
    lowerMime.includes('css') ||
    lowerMime.includes('html')
  ) {
    const codeName = Object.entries(CODE_TYPE_MAP).find(([key]) =>
      lowerMime.includes(key),
    )?.[1]
    if (codeName) return codeName
  }

  const rule = MIME_RULES.find(r => r.pattern.test(lowerMime))
  return rule?.name ?? '未知'
}
