# Git workflow

How branches, commits and pull requests are made in this repo, by a human or an agent. It is my standard git workflow, with this repo's trunk branch, `master`, and its scopes.

[.claude/settings.json](../settings.json) decides what an agent may run without asking; it does not forbid the workflow below. Plain `git push --force`, `-f`, `--mirror` and `git filter-branch` are denied, because they rewrite history other people may share. `git push --force-with-lease` asks first: it is the normal last step of catching up your own branch.

## Branches

Trunk-based development: every change goes on a short branch from an up-to-date `master` and lands through a pull request. One branch per task. A push to `master` deploys the site, so nothing is pushed to `master` directly.

- **Names:** `category/description-with-dashes`, lower case, no underscores or spaces. Categories: `feature/`, `bug/`, `docs/`, `hotfix/`, and `release/` if one is ever needed. Pick the category from what the change does: a new project page is `feature/`, a broken link is `bug/`, a README fix is `docs/`.
- **Size:** one atomic piece of work. `docs/fix-typo` is too small (fix it on the branch it belongs to). A branch whose description needs "and" is probably two.
- **Catching up:** rebase your branch onto `master` (`git pull --rebase origin master`), then `git push --force-with-lease`. Never merge `master` into a feature branch: it leaves a merge commit inside the branch, so the branch no longer reads as a clean sequence of decisions. The one exception is a branch someone else has built on, which was never yours to rebase.
- **Direction:** rebase out of `master`, merge into `master`. Never rebase `master` itself.
- **Theme updates:** the `upstream` remote is the Hugo Profile theme. Bring its changes in on a branch (`git fetch upstream`, then merge `upstream/master` into that branch, which is the one place a merge commit is expected) and open a pull request like any other change.

## Commit messages

```text
tag(scope): Header

Body

Footer
```

- **Header:** imperative mood, at most 50 characters, for example `feat(projects): Add the bank report RAG project`.
- **Tags:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. The scope is the part of the repo it touches: `site` (hugo.yaml and site-wide changes), `layouts`, `css`, `projects`, `blogs`, `images`, `pages` (the deploy), `ci`, `claude`, `readme`.
- **Body:** what changed and why, not how. Name the design choices and their reasons, with numbers where there are any. Lines of at most 72 characters.
- **Footer:** issue references and breaking changes.
- **One working step per commit.** Each commit leaves the site building with `hugo --gc --minify --panicOnWarning`. If the header needs "and", it is probably two commits.
- **Author:** `Anders Henriksen <anhenr.dev@gmail.com>`. Never override the author.
- **Attribution:** I am the only author. No co-author trailers for tools or assistants, and no generated-by lines in pull requests (see [CLAUDE.md](../../CLAUDE.md)).

## Pull requests

- Open from the branch into `master` with `gh pr create`. The title is the commit header; GitHub uses it as the header of the squash commit.
- The body has a `## Summary` (what changed and why) and a `## Test plan` (what was run and checked, including how the change looks in dark mode at desktop and phone width).
- CI must be green: the strict Hugo build and the secret scan.
- I review and squash-merge; the branch is deleted on merge. Merging deploys the site. An agent opens a pull request when the task asks for one, and never merges it.

The [commit-push-pr](../commands/commit-push-pr.md) command runs the whole sequence.
