import { formatMessage } from '../src/commit'

describe('Command - commit', () => {
  describe('formatMessage()', () => {
    it('should format - default', () => {
      expect(formatMessage({ message: 'hello', branch: 'fix/test' })).toBe('fix/test: hello')
    })
  })
})
