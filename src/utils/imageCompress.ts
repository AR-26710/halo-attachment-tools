import { getFileExtension } from './rename'
import { formatFileSize } from './format'

export interface CompressConfig {
  enabled: boolean
  quality: number
  maxWidth: number
  maxHeight: number
  keepOriginalFormat: boolean
  maxConcurrent: number
}

const DEFAULT_QUALITY = 0.85
const DEFAULT_MAX_WIDTH = 1920
const DEFAULT_MAX_HEIGHT = 1080
const MAX_FILE_SIZE = 50 * 1024 * 1024
const MAX_DIMENSION = 10000

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function calculateNewDimensions(
  imgWidth: number,
  imgHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = imgWidth
  let height = imgHeight

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width
    const heightRatio = maxHeight / height
    const ratio = Math.min(widthRatio, heightRatio)

    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  return { width, height }
}

export async function compressImage(
  file: File,
  quality: number = DEFAULT_QUALITY,
  maxWidth: number = DEFAULT_MAX_WIDTH,
  maxHeight: number = DEFAULT_MAX_HEIGHT,
  keepOriginalFormat: boolean = true
): Promise<File> {

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件过大，最大支持 ${formatFileSize(MAX_FILE_SIZE)}`)
  }

  if (!isImageFile(file)) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {

      if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
        URL.revokeObjectURL(url)
        reject(new Error(`图片尺寸过大，最大支持 ${MAX_DIMENSION}x${MAX_DIMENSION}`))
        return
      }

      const { width, height } = calculateNewDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      )

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('无法创建 canvas 上下文'))
        return
      }

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      const targetMimeType = keepOriginalFormat ? file.type : 'image/jpeg'
      const targetExtension = keepOriginalFormat ? getFileExtension(file.name) : '.jpg'

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)

          if (!blob) {
            reject(new Error('图片压缩失败'))
            return
          }

          const newFilename = keepOriginalFormat
            ? file.name
            : file.name.replace(/\.[^/.]+$/, '') + targetExtension

          const compressedFile = new File([blob], newFilename, { type: targetMimeType })
          resolve(compressedFile)
        },
        targetMimeType,
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('图片加载失败'))
    }

    img.src = url
  })
}
