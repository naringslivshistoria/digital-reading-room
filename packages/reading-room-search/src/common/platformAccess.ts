import config from './config'

export const PLATFORM = 'readingroom'

// The user must have the reading room in user_platforms. The check is off until
// auth.requirePlatformAccess is turned on, so the rollout can happen in the right order.
export const hasPlatformAccess = (platforms: unknown): boolean =>
  !config.auth.requirePlatformAccess ||
  (Array.isArray(platforms) && platforms.includes(PLATFORM))
