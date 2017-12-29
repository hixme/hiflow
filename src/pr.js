import axios from 'axios'
import inquirer from 'inquirer'
import chalk from 'chalk'

import { HOME } from './args'
import { getConfig } from './config'
import {
  bitbucketRequest,
  getPullRequests,
  getRepository,
  getRepositoryDefaultReviewers,
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

const CURRENT_USERNAME = getConfig().BITBUCKET_USERNAME
function outputPRLink(link) {
  console.log(`${chalk.cyan('==>')} ${link}`)
}

function outputPRSummary(pullrequest) {
  const { id, title, description, author } = pullrequest || {}
  console.log(`
${chalk.cyan(`#${pullrequest.id} ${pullrequest.title}`)}
Author: ${author.display_name}
Description:
  ${pullrequest.description}
`)
}

async function getPullRequestActions(pr) {
  const activity = (await bitbucketRequest(pr.links.activity.href)).values

  // based on activity, setup approve or unapprove link
  const hasApproved = activity.find(({ approval }) =>
    (approval ? approval.user.username === CURRENT_USERNAME : false))
  const approvalType = hasApproved ? 'unapprove' : 'approve'
  const approvalMethod = hasApproved ? 'delete' : 'post'

  return {
    checkout: () => refreshRepo && checkoutBranch(pr.source.branch.name),
    [approvalType]: () => bitbucketRequest(pr.links.approve.href, {}, approvalMethod),
    decline: () => bitbucketRequest(pr.links.decline.href, {}, 'post'),
    // comment: () => promptComment(pr.id),
    // activity: () => bitbucketRequest(pr.links.activity.href),
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

async function promptCreatePullRequest() {
  const currentBranch = getRepositoryBranch()
  const prObj = {
    source: { branch: { name: currentBranch, }, },
    title: '',
    description: '',
    reviewers: [],
  }

  try {
    const { createpr } = await inquirer.prompt({
      type: 'confirm',
      name: 'createpr',
      message: `Would you like to create a pull request for your branch ${currentBranch}?`,
      validate: val => !!val,
      filter: val => val.trim(),
      when: () => true,
    })

    if (!createpr) {
      return true
    }

    const [ repository, defaultReviewers ] = await Promise.all([
      getRepository(),
      getRepositoryDefaultReviewers(),
    ])

    if (repository) {
      const {
        destination,
        closeBranch,
        title,
        description,
        reviewers = [],
        addReviewers,
      } = await inquirer.prompt([
        {
          type: 'input',
          name: 'destination',
          message: 'What branch should this pull request merge into?',
          default: repository.mainbranch.name,
          validate: val => !!val,
          filter: val => val.trim(),
          when: () => true,
        },
        {
          type: 'confirm',
          name: 'closeBranch',
          message: 'Close branch on merge?',
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
          type: 'editor',
          name: 'description',
          message: 'Add pull request description?',
          filter: val => val.trim(),
        },
        {
          type: 'checkbox',
          name: 'reviewers',
          message: 'Select your reviewers:',
          choices: defaultReviewers.map(i => ({
            name: i.display_name,
            value: i.username,
            checked: true,
          })),
          when: () => defaultReviewers.length
        },
        {
          type: 'input',
          name: 'addReviewers',
          message: 'Add reviewers? (Enter usernames as csv)',
          filter: val => val.trim(),
        }
      ])

      const allReviewers = [
          ...reviewers,
          ...addReviewers.split(',')
        ]
        .filter(i => i && i.trim().length)
        .map(i => ({ username: i.trim() }))

      const pullRequest = await createPullRequest({
        ...prObj,
        destination: { branch: { name: destination } },
        title,
        description,
        close_source_branch: closeBranch,
        reviewers: allReviewers,
      })

      console.log(`${chalk.green('Pull request created!')}`)
      outputPRLink(pullRequest.links.html.href)
    }

    return { success: true }
  } catch (e) {
    console.log(error)
    throw e
  }
}

async function promptPullRequestList() {
  try {
    const list = await getPullRequests()

    if (list.length === 0) {
      return console.log('No pull requests found')
    }

    const { pullrequest } = await inquirer.prompt({
      type: 'list',
      name: 'pullrequest',
      message: 'Select a pull request?',
      choices: list.map(({ author, state, id, title, ...pr }) => ({
        name: `(${state}) #${id} by ${author.display_name} - ${title}`,
        value: {
          author,
          id,
          title,
          ...pr
        },
      })),
      validate: val => !!val,
      when: () => true,
    })

    outputPRSummary(pullrequest)

    const actions = await getPullRequestActions(pullrequest)
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What action would you like to perform?',
      choices: Object.keys(actions).map(action => ({
        name: action,
        value: actions[action]
      })),
      validate: val => !!val,
      when: () => true,
    })

    if (action) {
      const data = await action()
      outputPRLink(pullrequest.links.html.href)
      if (data && data.values) {
        // data.values.map((i) => console.log('i - ', JSON.stringify(i)))
      }
    }

    return { success: true }
  } catch (e) {
    throw e
  }
}


export default function promptPullRequestCommand(create) {
  if (create) {
    return promptCreatePullRequest()
  }

  return promptPullRequestList()
}

