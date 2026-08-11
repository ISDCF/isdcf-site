# ISDCF Site

## Overview

Hosted at https://www.isdcf.com/.

Raise issues and suggestions at https://github.com/ISDCF/new-site/issues.

(c) Inter-Society for the Enhancement of Cinema Presentation, Inc. All rights reserved.

## Architecture

The website is built as a static website using the [Hexo framework](https://hexo.io/). It uses a [theme](https://github.com/ISDCF/isdcf-hexo-theme) shared with other [Inter-society](https://www.intersociety.org) projects.

## Quick start

Prerequisites to test the website locally:
* [git](https://git-scm.com/)
* [Node](https://nodejs.org/en)

Quick start instructions:

```sh
git clone https://github.com/ISDCF/new-site.git
cd new-site
npm ci
npm run server
```

## Deploying

A new version of the website is automatically build and deployed to GitHub pages on every commit to the `main` branch.
