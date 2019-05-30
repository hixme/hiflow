import {
  checkoutBranch,
  createBranch,
  createCommit,
  getBranch,
  getRemoteRepositoryName,
  getRemoteRepositoryNameFromURL,
  getRemoteURL,
  getRemoteUsernameFromURL,
  getVersion,
  pullAndRebase,
} from './git-cli'

const MOCK_REMOTE_SSH_URL = 'git@github.com:billyxs/hiflow.git'
const MOCK_REMOTE_SSH_URL_2 = 'ssh://git@github.com/billyxs/hiflow.git'
const MOCK_REMOTE_HTTPS_URL = 'https://github.com/billyxs/hiflow.git'

describe('getVersion()', () => {
  it('should be a function', () => {
    expect(typeof getVersion).toBe('function')
  })

  it('should return a string', () => {
    expect(typeof getVersion()).toBe('string')
  })
})

describe('getBranch()', () => {
  it('should be a function', () => {
    expect(typeof getBranch).toBe('function')
  })

  it('should return a string', () => {
    expect(typeof getBranch()).toBe('string')
  })
})

describe('getRemoteUsernameFromURL()', () => {
  it('should be a function', () => {
    expect(typeof getRemoteUsernameFromURL).toBe('function')
  })

  it('should equal billyxs', () => {
    expect(getRemoteUsernameFromURL(MOCK_REMOTE_SSH_URL)).toBe('billyxs')
  })

  it('should equal billyxs', () => {
    expect(getRemoteUsernameFromURL(MOCK_REMOTE_HTTPS_URL)).toBe('billyxs')
  })

  it('should equal billyxs', () => {
    expect(getRemoteUsernameFromURL(MOCK_REMOTE_SSH_URL_2)).toBe('billyxs')
  })
})

describe('getRemoteURL()', () => {
  it('should be a function', () => {
    expect(typeof getRemoteURL).toBe('function')
  })

  it('should return a string', () => {
    expect(typeof getRemoteURL()).toBe('string')
  })
})

describe('getRemoteRepositoryNameFromURL()', () => {
  it('should be a function', () => {
    expect(typeof getRemoteRepositoryNameFromURL).toBe('function')
  })

  it('should equal billyxs', () => {
    expect(getRemoteRepositoryNameFromURL(MOCK_REMOTE_SSH_URL)).toBe('hiflow')
  })

  it('should equal billyxs', () => {
    expect(getRemoteRepositoryNameFromURL(MOCK_REMOTE_HTTPS_URL)).toBe('hiflow')
  })
})

describe('getRemoteRepositoryName()', () => {
  it('should be a function', () => {
    expect(typeof getRemoteRepositoryName).toBe('function')
  })

  it('should return a string', () => {
    expect(typeof getRemoteRepositoryName()).toBe('string')
  })
})

describe('pullAndRebase()', () => {
  it('should be a function', () => {
    expect(typeof pullAndRebase).toBe('function')
  })
})

describe('createBranch()', () => {
  it('should be a function', () => {
    expect(typeof createBranch).toBe('function')
  })
})

describe('checkoutBranch()', () => {
  it('should be a function', () => {
    expect(typeof checkoutBranch).toBe('function')
  })
})

describe('createCommit()', () => {
  it('should be a function', () => {
    expect(typeof createCommit).toBe('function')
  })
})
