import type { Context } from 'hono'
import type { User, Env } from './context'

export type HonoContext = Context<{ Bindings: Env; Variables: { user: User } }>
export type HonoEnv = { Bindings: Env; Variables: { user: User } }