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
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateRandomNumeric(length: number): string {
  const chars = '0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateRandomAlphanumeric(length: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
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

  result = result.replaceAll(/\${random-alphabetic:(\d+)}/g, (_match, p1) => {
    return generateRandomAlphabetic(Number.parseInt(p1, 10))
  })
  result = result.replaceAll(/\${random-num:(\d+)}/g, (_match, p1) => {
    return generateRandomNumeric(Number.parseInt(p1, 10))
  })
  result = result.replaceAll(/\${random-alphanumeric:(\d+)}/g, (_match, p1) => {
    return generateRandomAlphanumeric(Number.parseInt(p1, 10))
  })

  return result + extension
}
