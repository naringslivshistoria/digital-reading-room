import { getSubRange } from '..'

describe('arrayHelper', () => {
  describe('getSubRange', () => {
    it('includes the first number', async () => {
      const subRange = getSubRange(1000, 1100, 3)
      expect(subRange).toHaveLength(3)

      expect(subRange).toContain(1000)
      expect(subRange).toContain(1001)
      expect(subRange).toContain(1002)
      expect(subRange).not.toContain(1003)
    })

    it('returns upper if same as lower', async () => {
      const subRange = getSubRange(15000, 15000, 10)
      expect(subRange).toHaveLength(1)

      expect(subRange).toContain(15000)
    })

    it('does not overflow the range', async () => {
      const subRange = getSubRange(14999, 15000, 10)
      expect(subRange).toHaveLength(2)

      expect(subRange).toContain(14999)
      expect(subRange).toContain(15000)
      expect(subRange).not.toContain(15001)
    })

    it('returns an empty array if the range is empty', async () => {
      const subRange = getSubRange(1001, 1000, 10)
      expect(subRange).toHaveLength(0)
    })
  })
})
