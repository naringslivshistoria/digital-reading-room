import * as userAdapter from '../../../common/adapters/userAdapter'
import { fetchUserData } from '..'

jest.mock('../../../common/adapters/userAdapter', () => ({
  getUserData: jest.fn(),
}))
const mockedGetUserData = userAdapter.getUserData as jest.Mock

afterEach(() => jest.clearAllMocks())

it('hämtar från cache inom TTL', async () => {
  mockedGetUserData.mockResolvedValue({ depositors: 'a;b;', locked: false })

  await fetchUserData('cache-hit-user')
  await fetchUserData('cache-hit-user')

  expect(mockedGetUserData).toHaveBeenCalledTimes(1)
})

it('cachar inte saknad användare', async () => {
  mockedGetUserData.mockResolvedValue(undefined)

  const first = await fetchUserData('missing-user')
  const second = await fetchUserData('missing-user')

  expect(first).toBeNull()
  expect(second).toBeNull()
  expect(mockedGetUserData).toHaveBeenCalledTimes(2)
})
