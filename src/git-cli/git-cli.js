import { execSync } from 'child_process'

export function getVersion() {
  return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim()
}

export function getBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim()
}

export function getRemoteURL() {
  return execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim()
}

export function getRemoteUsernameFromURL(url) {
  if (url.startsWith('https') || url.startsWith('ssh://')) {
    return url
      .split('/')
      .reverse()[1]
      .trim()
  }

  return url.split(':')[1].split('/')[0].trim()
}

export function getRemoteUsername() {
  return getRemoteUsernameFromURL(getRemoteURL())
}

export function getRemoteRepositoryNameFromURL(url) {
  return url
    .split('/')
    .pop()
    .trim()
    .replace('.git', '')
}

export function getRemoteRepositoryName() {
  return getRemoteRepositoryNameFromURL(getRemoteURL())
}

export function pullAndRebase() {
  return execSync('git pull --rebase', { encoding: 'utf8' })
}

export function checkoutBranch(branchName) {
  return execSync(`git checkout ${branchName}`, { encoding: 'utf8' })
}

export function createBranch(branchName) {
  return execSync(`git checkout -b ${branchName}`, { encoding: 'utf8' })
}

export function createCommit(message) {
  return execSync(`git commit -m "${message}"`, { encoding: 'utf8' })
}
