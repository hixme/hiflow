import inquirer from 'inquirer'
import chalk from 'chalk'

import {
  getBitbucketUsername,
} from './config'
import {
  bitbucketRequest,
  getPullRequests,
  getRepository,
  getRepositoryDefaultReviewers,
  createPullRequest,
  addPullRequestComment,
} from './bitbucket'

import {
  getRemoteURL,
  getBranch,
  pullAndRebase,
  checkoutBranch,
} from './git-cli'

import {
  logPRHeader,
  logPRStatus,
  logPRDescription,
  logPRApprovals,
  logPRLink,
} from './log'

const CURRENT_USERNAME = getBitbucketUsername()

export function parseUserApprovals(activity) {
  return activity
    .filter(({ approval }) => approval)
    .map(({ approval }) => approval.user.username)
}

async function renderPRSummary(pullrequest) {
  try {
    const [statuses, activity] = await Promise.all([
      bitbucketRequest(pullrequest.links.statuses.href).then(({ values }) => values),
      bitbucketRequest(pullrequest.links.activity.href).then(({ values }) => values),
    ])

    logPRHeader(pullrequest)
    logPRApprovals(parseUserApprovals(activity))

    if (statuses && statuses.length) {
      statuses.forEach(logPRStatus)
    }

    if (pullrequest.description.trim().length) {
      logPRDescription(pullrequest.description)
    }

    return true
  } catch (e) {
    throw e
  }
}

async function getPullRequestActions(pr) {
  const activity = (await bitbucketRequest(pr.links.activity.href)).values

  // based on activity, setup approve or unapprove link
  const hasApproved = parseUserApprovals(activity).includes(CURRENT_USERNAME)
  const approvalType = hasApproved ? 'unapprove' : 'approve'
  const approvalMethod = hasApproved ? 'delete' : 'post'

  return {
    checkout: () => pullAndRebase && checkoutBranch(pr.source.branch.name),
    [approvalType]: () => bitbucketRequest(pr.links.approve.href, {}, approvalMethod),
    decline: () => bitbucketRequest(pr.links.decline.href, {}, 'post'),
    // comment: () => promptComment(pr.id),
    // activity: () => bitbucketRequest(pr.links.activity.href),
    merge: () => bitbucketRequest(pr.links.merge.href, {}, 'post'),
    quit: () => {},
  }
}

// not support with bitbucket API 2.0
export function promptComment() {
  return inquirer.prompt({
    type: 'input',
    name: 'comment',
    message: 'Your comment:',
    validate: val => !!val,
    filter: val => val.trim(),
    when: () => true,
  })
    .then(({ comment }) => addPullRequestComment(comment))
    .catch(e => console.log(e))
}

async function promptCreatePullRequest() {
  const currentBranch = getBranch()
  const prObj = {
    source: { branch: { name: currentBranch } },
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

    const [repository, defaultReviewers = []] = await Promise.all([
      getRepository(),
      // if default reviewers has an error, skip this step
      // by giving an empty list
      getRepositoryDefaultReviewers().catch(() => []),
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
          message: 'Pull request title:',
          default: currentBranch,
          validate: val => !!val,
          filter: val => val.trim(),
          when: () => true,
        },
        {
          type: 'confirm',
          name: 'addDescription',
          message: 'Add pull request description?',
          when: () => true,
        },
        {
          type: 'editor',
          name: 'description',
          message: 'Description:',
          filter: val => val.trim(),
          when: ({ addDescription }) => addDescription,
        },
        {
          type: 'checkbox',
          name: 'reviewers',
          message: 'Select your reviewers:',
          choices: defaultReviewers
            .filter(u => u.username !== CURRENT_USERNAME)
            .map(i => ({
              name: i.display_name,
              value: i.username,
              checked: true,
            })),
          when: () => defaultReviewers.length,
        },
        {
          type: 'input',
          name: 'addReviewers',
          message: 'Add reviewers? (Enter usernames as csv)',
          filter: val => val.trim(),
        },
      ])

      const allReviewers = [
        ...reviewers,
        ...addReviewers.split(','),
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
      logPRLink(pullRequest.links.html.href)
    }

    return { success: true }
  } catch (e) {
    const { fields: { source } } = e || {}
    if (source && source.length) {
      source.forEach(m => {
        if (m.includes('branch not found')) {
          console.log(`\n${chalk.yellow('** Did you push your branch?')}\n`)
        }
        console.log(`${chalk.red('  Error: ' + m)}\n`)
      })
    } else {
      console.log(e)
    }

    throw e
  }
}

export function promptRepeatActionsList() {
  return inquirer.prompt({
    type: 'confirm',
    name: 'repeat',
    message: 'See actions again?',
    validate: val => !!val,
    when: () => true,
  })
}

async function runStatus() {
  try {
    const pullrequests = await getPullRequests()
    if (pullrequests.length === 0) {
      console.log(chalk.yellow('No pull requests available'))
      return true
    }

    console.log(`\n${pullrequests.length} Pull request(s)`)

    const prGroups = await Promise.all(pullrequests.map(async (pullrequest) => {
      const [prstatus, activity] = await Promise.all([
        bitbucketRequest(pullrequest.links.statuses.href).then(({ values }) => values),
        bitbucketRequest(pullrequest.links.activity.href).then(({ values }) => values),
      ])

      return {
        id: pullrequest.id,
        pullrequest,
        statuses: prstatus,
        approvals: parseUserApprovals(activity),
      }
    }))

    prGroups.sort(pr => pr.id).forEach(({ pullrequest, statuses, approvals }, index) => {
      if (index === 0) {
        console.log(chalk.dim('===================================='))
      } else {
        console.log('-------------------------------------')
      }

      logPRHeader(pullrequest)

      if (approvals.length) {
        console.log(`${chalk.green('\u2713')} Approved by ${approvals.join(', ')}\n`)
      } else {
        console.log(`${chalk.red('\u2717')} Not yet approved \n`)
      }
      if (statuses && statuses.length) {
        statuses.forEach(logPRStatus)
      }

      logPRLink(pullrequest.links.html.href)
    })

    return true
  } catch (e) {
    throw e
  }
}

async function promptPullRequestActions(pullrequest) {
  try {
    const actions = await getPullRequestActions(pullrequest)
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What action would you like to perform?',
      choices: Object.keys(actions).map(a => ({
        name: a,
        value: actions[a],
      })),
      validate: val => !!val,
      when: () => true,
    })

    if (action) {
      const data = await action()
      logPRLink(pullrequest.links.html.href)
      if (data && data.values) {
        // data.values.map((i) => console.log('i - ', JSON.stringify(i)))
      }
    }

    return null
  } catch (e) {
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
      choices: list.map(({
        author, state, id, title, ...pr
      }) => ({
        name: `(${state}) #${id} by ${author.display_name} - ${title}`,
        value: {
          author,
          state,
          id,
          title,
          ...pr,
        },
      })),
      validate: val => !!val,
      when: () => true,
    })

    await renderPRSummary(pullrequest)

    return await promptPullRequestActions(pullrequest)
  } catch (e) {
    throw e
  }
}

export function promptPullRequestCommand({ create, status }) {
  if (!getRemoteURL().includes('bitbucket')) {
    console.log(chalk.cyan('hi pr currently supported with bitbucket only'))
    return Promise.resolve(true)
  }

  if (create) {
    return promptCreatePullRequest()
  }

  if (status) {
    return runStatus()
  }

  return promptPullRequestList()
}

