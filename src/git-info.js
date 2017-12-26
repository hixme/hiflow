import asyncExec from './async-exec'
const execSync = require('child_process').execSync

export function getRepositoryName() {
  return execSync('basename `git rev-parse --show-toplevel`', { encoding: 'utf8' }).replace('\n', '')
}

export function getRepositoryVersion() {
  return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' })
}

export function getRepositoryBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' })
}

export function getRepositoryRemoteURL() {
  return execSync('git config --get remote.origin.url', { encoding: 'utf8' })
}

export function getRepositoryRemoteUsername() {
  return getRepositoryRemoteURL().split(':')[1].split('/')[0]
}

export function refreshRepo() {
  return execSync('git pull origin')
}

export function checkoutBranch(branchName) {
  return execSync(`git checkout ${branchName}`)
}
