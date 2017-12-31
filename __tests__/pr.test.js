import {
  parseUserApprovals,
} from '../src/pr'

const mockActivitiesWithApproval = [{
  approval: {
    user: {
      username: 'hiflow',
    },
  },
}]

const mockActivitiesNoApproval = [{
  update: {
    user: {
      username: 'hiflow',
    },
  },
}]

describe('parseUserApprovals()', () => {
  it('activity with approval', () => {
    const usernames = parseUserApprovals(mockActivitiesWithApproval)
    expect(usernames.length).toBe(1)
    expect(usernames.includes('hiflow')).toBe(true)
  })

  it('activity no approval', () => {
    const usernames = parseUserApprovals(mockActivitiesNoApproval)
    expect(usernames.length).toBe(0)
    expect(usernames.includes('hiflow')).toBe(false)
  })
})

