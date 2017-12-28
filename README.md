# hiflow

A tool to improve pull request and gitflow processes with bitbucket

```bash
npm install -g hiflow
```


## hi config

Run this to setup access to the bitbucket API so you can access your projects

```
hi config
```


## hi pr

Hiflow gives you access to your pull requests and gives you options to
checkout the branch for the pull request, approve, merge, or
decline the pull request.

```
hi pr
```


## hi pr --create

Create a new pull request with the create flag. Creates a new pull request
from the branch you are on with options on where to merge to, title,
description, and reviewers.

```
hi pr --create
```
