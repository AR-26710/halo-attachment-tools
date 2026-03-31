const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'halo-attachment-tools-v1'

async function getEncryptionKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(ENCRYPTION_KEY)

  const hash = await crypto.subtle.digest('SHA-256', keyData)

  return await crypto.subtle.importKey(
    'raw',
    hash,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptData(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey()
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)

    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)

    return btoa(String.fromCodePoint(...combined))
  } catch {
    throw new Error('加密失败')
  }
}

export async function decryptData(ciphertext: string): Promise<string> {
  try {
    const key = await getEncryptionKey()

    const combined = new Uint8Array(
      atob(ciphertext).split('').map(char => char.codePointAt(0) ?? 0)
    )

    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch {
    throw new Error('解密失败')
  }
}
