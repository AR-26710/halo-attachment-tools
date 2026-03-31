export interface AuthConfig {
  type: 'pat' | 'basic'
  siteUrl: string
  pat?: string
  username?: string
  password?: string
  rememberAuth?: boolean
}
