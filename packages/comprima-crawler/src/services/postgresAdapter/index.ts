import log from '../../common/log'

export const getUnindexedLevels = async (): Promise<{lower: number, upper: number}> => {
  // TODO: Get unindexed levels from postgres
  // TODO: Mark levels as in progress in postgres

  // TODO: Remove this mock
  return Promise.resolve({
    lower: 41000,
    upper: 42000
  })
}
