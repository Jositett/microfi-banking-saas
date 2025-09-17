import { vi } from 'vitest'

// Mock WebAuthn API
Object.defineProperty(global.navigator, 'credentials', {
  value: {
    create: vi.fn(),
    get: vi.fn(),
  },
  writable: true,
})

// Mock localStorage
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock fetch
global.fetch = vi.fn()