# hiflow

A tool to improve pull request and gitflow processes with bitbucket

```bash
npm install -g hiflow
```


## hi config

Run this to setup access to the bitbucket API so you can access your
repositories for pull request maintenance.

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/config-steps.png "hi config display")

## hi pr

Hiflow gives you access to your pull requests and gives you options to
checkout the branch for the pull request, approve, merge, or
decline the pull request.

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/pr-step-2.png "hi pr display")


## hi pr --create

Create a new pull request with the create flag. Creates a new pull request
from the branch you are on with options on where to merge to, title,
description, and reviewers.

*Be sure to configure your bitbucket default reviewers to get the full
experience*

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/pr-create-steps.png "hi pr create display")


## hi checkout

Hiflow checkout wants help you with your branch naming. Current branch options
are feature, improvement, fix, and hotfix.

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/checkout-step-1.png "hi checkout display")

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/checkout-step-2.png "hi checkout display")

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/checkout-step-3.png "hi checkout display")


## hi commit

Hiflow commit helps to prefix and format your commit messages.

```bash
hi commit

```

![alt text](https://raw.githubusercontent.com/hixme/hiflow/master/images/commit-step-1.png "hi commit display")
