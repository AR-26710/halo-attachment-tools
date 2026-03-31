export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
export function getFileIcon(mimeType: string): string {
  if (!mimeType) return 'mdi:file-outline'

  if (mimeType.startsWith('image/')) return 'mdi:file-image-outline'
  if (mimeType.startsWith('video/')) return 'mdi:file-video-outline'
  if (mimeType.startsWith('audio/')) return 'mdi:file-music-outline'
  if (mimeType.includes('pdf')) return 'mdi:file-pdf-box'
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('officedocument.wordprocessingml')) return 'mdi:file-word-outline'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('officedocument.spreadsheetml')) return 'mdi:file-excel-outline'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || mimeType.includes('officedocument.presentationml')) return 'mdi:file-powerpoint-outline'
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('tar') || mimeType.includes('gzip') || mimeType.includes('7z') || mimeType.includes('rar')) return 'mdi:folder-zip-outline'
  if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('css') || mimeType.includes('html')) return 'mdi:file-code-outline'

  return 'mdi:file-outline'
}

export function getFileTypeName(mimeType: string): string {
  if (!mimeType) return '未知'

  if (mimeType.startsWith('image/')) {
    const subtypes = mimeType.split('/')[1]
    if (subtypes.includes('jpeg') || subtypes.includes('jpg')) return 'JPEG 图片'
    if (subtypes.includes('png')) return 'PNG 图片'
    if (subtypes.includes('gif')) return 'GIF 图片'
    if (subtypes.includes('webp')) return 'WebP 图片'
    if (subtypes.includes('svg')) return 'SVG 图片'
    return '图片'
  }
  if (mimeType.startsWith('video/')) {
    const subtypes = mimeType.split('/')[1]
    if (subtypes.includes('mp4')) return 'MP4 视频'
    if (subtypes.includes('webm')) return 'WebM 视频'
    if (subtypes.includes('avi')) return 'AVI 视频'
    if (subtypes.includes('mov')) return 'MOV 视频'
    return '视频'
  }
  if (mimeType.startsWith('audio/')) {
    const subtypes = mimeType.split('/')[1]
    if (subtypes.includes('mp3')) return 'MP3 音频'
    if (subtypes.includes('wav')) return 'WAV 音频'
    if (subtypes.includes('ogg')) return 'OGG 音频'
    if (subtypes.includes('flac')) return 'FLAC 音频'
    return '音频'
  }
  if (mimeType.includes('pdf')) return 'PDF 文档'
  if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('officedocument.wordprocessingml')) return 'Word 文档'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType.includes('officedocument.spreadsheetml')) return 'Excel 表格'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || mimeType.includes('officedocument.presentationml')) return 'PowerPoint 演示'
  if (mimeType.includes('zip') || mimeType.includes('compressed') || mimeType.includes('tar') || mimeType.includes('gzip') || mimeType.includes('7z') || mimeType.includes('rar')) {
    if (mimeType.includes('zip')) return 'ZIP 压缩'
    if (mimeType.includes('rar')) return 'RAR 压缩'
    if (mimeType.includes('7z')) return '7Z 压缩'
    return '压缩文件'
  }
  if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('yaml') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('css') || mimeType.includes('html')) {
    if (mimeType.includes('json')) return 'JSON 文件'
    if (mimeType.includes('javascript') || mimeType.includes('js')) return 'JavaScript 文件'
    if (mimeType.includes('typescript') || mimeType.includes('ts')) return 'TypeScript 文件'
    if (mimeType.includes('css')) return 'CSS 文件'
    if (mimeType.includes('html') || mimeType.includes('htm')) return 'HTML 文件'
    if (mimeType.includes('xml')) return 'XML 文件'
    return '文本文件'
  }

  return '未知'
}
