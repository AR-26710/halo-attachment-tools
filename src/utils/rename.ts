function generateUUIDWithDash(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16)
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function generateUUIDNoDash(): string {
  return generateUUIDWithDash().replaceAll('-', '')
}

function generateRandomAlphabetic(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const maxLength = Math.min(length, chars.length)
  const charArray = chars.split('')
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[charArray[i], charArray[j]] = [charArray[j], charArray[i]]
  }
  return charArray.slice(0, maxLength).join('')
}

function generateRandomNumeric(length: number): string {
  const chars = '0123456789'
  const maxLength = Math.min(length, chars.length)
  const charArray = chars.split('')
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[charArray[i], charArray[j]] = [charArray[j], charArray[i]]
  }
  return charArray.slice(0, maxLength).join('')
}

function generateRandomAlphanumeric(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const maxLength = Math.min(length, chars.length)
  const charArray = chars.split('')
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[charArray[i], charArray[j]] = [charArray[j], charArray[i]]
  }
  return charArray.slice(0, maxLength).join('')
}

export function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.slice(lastDotIndex)
}

function getBaseFilename(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return filename
  return filename.slice(0, lastDotIndex)
}

function escapeReplacement(str: string): string {
  return str.replaceAll('$', '$$$$')
}

export function renameFile(originalFilename: string, template: string): string {
  const now = new Date()
  const baseFilename = getBaseFilename(originalFilename)
  const extension = getFileExtension(originalFilename)

  let result = template

  result = result.replaceAll('${origin-filename}', () => escapeReplacement(baseFilename))
  result = result.replaceAll('${uuid-with-dash}', () => generateUUIDWithDash())
  result = result.replaceAll('${uuid-no-dash}', () => generateUUIDNoDash())
  result = result.replaceAll('${timestamp-sec}', () => Math.floor(now.getTime() / 1000).toString())
  result = result.replaceAll('${timestamp-ms}', () => now.getTime().toString())
  result = result.replaceAll('${year}', () => now.getFullYear().toString())
  result = result.replaceAll('${month}', () => String(now.getMonth() + 1).padStart(2, '0'))
  result = result.replaceAll('${day}', () => String(now.getDate()).padStart(2, '0'))
  result = result.replaceAll('${weekday}', () => (now.getDay() || 7).toString())
  result = result.replaceAll('${hour}', () => String(now.getHours()).padStart(2, '0'))
  result = result.replaceAll('${minute}', () => String(now.getMinutes()).padStart(2, '0'))
  result = result.replaceAll('${second}', () => String(now.getSeconds()).padStart(2, '0'))
  result = result.replaceAll('${millisecond}', () => String(now.getMilliseconds()).padStart(3, '0'))

  const randomGenerators: Record<string, (length: number) => string> = {
    'random-alphabetic': generateRandomAlphabetic,
    'random-num': generateRandomNumeric,
    'random-alphanumeric': generateRandomAlphanumeric,
  }
  for (const [type, generator] of Object.entries(randomGenerators)) {
    result = result.replaceAll(new RegExp(`\\$\\{${type}(:\\d+)?\\}`, 'g'), (_match, p1) => {
      const DEFAULT_LENGTH = 4
      const MIN_LENGTH = 4
      let length = DEFAULT_LENGTH
      if (p1) {
        const parsed = Number.parseInt(p1.slice(1), 10)
        if (!Number.isNaN(parsed) && parsed >= MIN_LENGTH) {
          length = parsed
        }
      }
      return generator(length)
    })
  }

  return result + extension
}
