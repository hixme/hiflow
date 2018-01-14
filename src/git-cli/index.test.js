import gitCli from './index'

console.log('gitCli = ', gitCli)

describe('gitCli', () => {
  it('should export object', () => {
    expect(gitCli).toBeDefined()
  })
})
