# Developer Guide

> **⚠️ This page is still under construction ⚠️**

This document is a guide for yam development.

## Installing and testing yam

[Build yam and test locally.](https://github.com/ddupont808/yam/blob/main/docs/installing.md)

## Running the UI proof of concept

Currently yam is bundled with the UI proof of concept, see [docs/installing.md](https://github.com/ddupont808/yam/blob/main/docs/installing.md) to start a web server that you can view in a browser.

## Running tests

TODO

## Adding new API functions to yam

All new API functions in yam should be implemented as a [plugin](https://github.com/ddupont808/yam/blob/main/docs/plugins.md), and use the RPC interface provided by [muxrpc](https://github.com/ssbc/muxrpc) to allow these methods to be remotely called by any peer with the proper permissions. 

See [docs/plugins.md](https://github.com/ddupont808/yam/blob/main/docs/plugins.md) for more information on creating plugins.


## How to rebase and squash your commits

When submitting a pull request for review, please first rebase and squash your commits.

1. Checkout the latest version from main, e.g.: `git checkout main && git pull upstream main`
2. Checkout your feature branch, e.g.: `git checkout your_branch`
3. Optionally make a backup branch just in case something goes wrong, e.g.: `git checkout -b your_branch_bkp && git checkout your_branch`
4. Rebase on main: `git rebase main`
5. Squash your commits: `git reset --soft <last hash before your first commit>`
6. Commit your changes to a single commit: `git commit`
7. Push your local branch to your remote repository: `git push --force`

If you have a PR open on that branch, it'll be updated automatically.

## Protocol Guide

For documentation of the yam protocol, see [docs/protocol.md](protocol.md).