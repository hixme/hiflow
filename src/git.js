const execSync = require('child_process').execSync

export function getRepositoryVersion() {
  return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
}

export function getRepositoryBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
}

export function getRepositoryRemoteURL() {
  return execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim()
}

export function getRepositoryRemoteUsername() {
  const url = getRepositoryRemoteURL()

  if (url.includes('https')) {
    return url.split('/').reverse()[1].trim()
  }

  return url.split(':')[1].split('/')[0].trim()
}

export function getRepositoryName() {
  return getRepositoryRemoteURL()
    .split('/').pop().trim().replace('.git', '')
}

export function refreshRepo() {
  return execSync('git fetch', { encoding: 'utf8' })
}

export function checkoutBranch(branchName) {
  return execSync(`git checkout ${branchName}`, { encoding: 'utf8' })
}
