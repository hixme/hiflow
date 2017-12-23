import asyncExec from './async-exec'

export async function getRepositoryName() {
  return await asyncExec('basename `git rev-parse --show-toplevel`')
}

export async function getRepositoryVersion() {
  return await asyncExec('git describe --tags --abbrev=0')
}

export async function getRepositoryBranch() {
  return await asyncExec('git rev-parse --abbrev-ref HEAD')
}
