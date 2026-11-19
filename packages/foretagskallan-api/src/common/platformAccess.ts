export const PLATFORM = 'foretagskallan'

// The user must have Företagskällan in user_platforms.
export const hasPlatformAccess = (platforms: unknown): boolean =>
  Array.isArray(platforms) && platforms.includes(PLATFORM)
