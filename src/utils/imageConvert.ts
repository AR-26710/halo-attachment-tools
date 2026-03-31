import { isSupportedImageFile } from './imageSupport'

export interface ConvertConfig {
  enabled: boolean
  quality: number
  maxConcurrent: number
}

const DEFAULT_QUALITY = 0.85
const TARGET_MIME_TYPE = 'image/webp'
const TARGET_EXTENSION = '.webp'

function changeFileExtension(filename: string, newExt: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) {
    return filename + newExt
  }
  return filename.slice(0, lastDotIndex) + newExt
}

export async function convertToWebp(
  file: File,
  quality: number = DEFAULT_QUALITY
): Promise<File> {
  if (!isSupportedImageFile(file)) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('无法创建 canvas 上下文'))
        return
      }

      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)

          if (!blob) {
            reject(new Error('图片转换失败'))
            return
          }

          const newFilename = changeFileExtension(file.name, TARGET_EXTENSION)
          const convertedFile = new File([blob], newFilename, { type: TARGET_MIME_TYPE })
          resolve(convertedFile)
        },
        TARGET_MIME_TYPE,
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
