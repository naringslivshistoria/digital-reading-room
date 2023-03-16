import log from '../../common/log'

export const getUnindexedLevels = async (count: number) => {
  log.debug(`Request ${count} unindexed levels from postgres`)
  // TODO: Get unindexed levels from postgres
  // TODO: Mark levels as in progress in postgres

  // TODO: Remove this mock
  return Promise.resolve([41000,41001,41003])
}
