import axios from 'axios'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { HOME } from './args'
import {
  bitbucketRequest,
  getPullRequests,
  getRepository,
  createPullRequest,
  addPullRequestComment,
} from './bitbucket'

import {
  getRepositoryName,
  getRepositoryRemoteUsername,
  getRepositoryBranch,
  refreshRepo,
  checkoutBranch,
} from './git'

function outputPRSummary(pullrequest) {
  const { id, title, description, author } = pullrequest || {}
  console.log(`
  ${chalk.cyan(`#${pullrequest.id} ${pullrequest.title}`)}
  by ${author.display_name}

    ${pullrequest.description}
`)
}

function getPullRequestActions(pr) {
  return {
    checkout: () => refreshRepo && checkoutBranch(pr.source.branch.name),
    approve: () => bitbucketRequest(pr.links.approve.href, {}, 'post'),
    decline: () => bitbucketRequest(pr.links.decline.href, {}, 'post'),
    // activity: async () => await bitbucketRequest(pr.links.activity.href),
    merge: () => bitbucketRequest(pr.links.merge.href, {}, 'post'),
    exit: () => {},
  }

  return actions
}

// not support with bitbucket API 2.0
function promptComment(prId) {
  return inquirer.prompt({
    type: 'input',
    name: 'comment',
    message: `Your comment:`,
    validate: val => !!val,
    filter: val => val.trim(),
    when: () => true,
  })
  .then(({ comment }) => addPullRequestComment(comment))
  .catch(e => console.log(e))
}

function promptCreatePullRequest() {
  const currentBranch = getRepositoryBranch()

  const prObj = {
    source: { branch: { name: currentBranch, }, },
    title: '',
    description: '',
    reviewers: [],
  }

  return inquirer.prompt({
      type: 'confirm',
      name: 'createpr',
      message: `Would you like to create a pull request for your branch ${currentBranch}?`,
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    })
    .then(({ createpr }) => {
      if (createpr) {
        return getRepository()
      }
    })
    .then((data) => {
      if (data) {
        return inquirer.prompt([
          {
            type: 'input',
            name: 'destination',
            message: 'What branch should this pull request merge into?',
            default: data.mainbranch.name,
            validate: val => !!val,
            filter: val => val.trim(),
            when: () => true,
          },
          {
            type: 'input',
            name: 'title',
            message: 'Add pull request title?',
            default: currentBranch,
            validate: val => !!val,
            filter: val => val.trim(),
            when: () => true,
          },
          {
            type: 'input',
            name: 'description',
            message: 'Add pull request description?',
            filter: val => val.trim(),
          },
          {
            type: 'input',
            name: 'reviewers',
            message: 'Add reviewers? (Enter usernames as csv)',
            filter: val => val.trim(),
          }
        ])
        .then(({
          destination,
          title,
          description,
          reviewers,
        }) => createPullRequest({
          ...prObj,
          destination: { branch: { name: destination } },
          title,
          description,
          reviewers: reviewers ?
            reviewers.split(',').map(i => ({ username: i.trim() })) : [],
        }))
        .then(res => {
          console.log(`
${chalk.green('Pull request created!')}
${chalk.cyan('==>')} ${res.links.html.href}
`)
        })
        .catch(error => {
          console.log(error)
          throw error
        })
      }
    })
}

async function promptPullRequestList() {
  try {
    const list = await getPullRequests()

    if (list.length === 0) {
      return console.log('No pull requests found')
    }

    return inquirer.prompt({
        type: 'list',
        name: 'pullrequest',
        message: 'Select a pull request?',
        choices: list.map(({ author, state, id, title, ...pr }) => ({
          name: `(${state}) #${id} by ${author.display_name} - ${title}`,
          value: {
            actions: getPullRequestActions({ author, state, id, title, ...pr }),
            author,
            id,
            title,
            ...pr
          },
        })),
        validate: val => !!val,
        when: () => true,
      })
      .then(({ pullrequest }) => {
        // console.log(pullrequest)
        outputPRSummary(pullrequest)

        return inquirer.prompt({
          type: 'list',
          name: 'action',
          message: 'What action would you like to perform?',
          choices: () => Object.keys(pullrequest.actions).map(action => ({
            name: action,
            value: pullrequest.actions[action]
          })),
          validate: val => !!val,
          when: () => true,
        })
    })
    .then((res) => {
      if (res && res.action) {
        return res.action() || true
      }

      return null
    })
    .then((data) => {
      if (data && data.values) {
        res.data.values.map(console.log)
      }
    })
  } catch (e) {
    throw e
  }
}


export function promptPullRequestCommand(create) {
  if (create) {
    return promptCreatePullRequest()
  }

  return promptPullRequestList()
}

