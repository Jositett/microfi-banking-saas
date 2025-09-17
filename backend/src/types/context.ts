import type { Context } from 'hono'
import type { Env } from '../main'

export interface User {
  id: string
  email: string
  role: 'user' | 'admin' | 'business'
  mfaSetup: boolean
  createdAt: string
}

export interface AppContext extends Context<{ Bindings: Env }> {
  get(key: 'user'): User
  set(key: 'user', value: User): void
}

export type { Env }