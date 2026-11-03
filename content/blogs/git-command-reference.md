---
title: "A Practical Git Command Reference"
date: 2025-10-09
author: "Anders Henriksen"
description: "The Git commands I reach for, from the daily basics to recovering lost work with the reflog."
image: /images/blogs/git-command-reference.svg
tags: ["Git", "Version control"]
toc: true
---

Like many other skills in programming, truly understanding Git requires messing up (intentionally or otherwise) and learning how to fix it. Even so, it is useful to have a list of commands to look at every once in a while, so that new commands can be added to one's toolbelt. That is exactly the purpose of this post.

<!--more-->

## The Foundation
These commands are used every time a new Git repository is used, and often several times per day.

For `git add -p`, another option is the VS Code source control view. Choose a file with changes, hover over a hunk and click the plus to stage the hunk or the minus to revert the change. This is much easier to read than the command line.

| Command                          | What it Does                                                              |
|:---------------------------------|:--------------------------------------------------------------------------|
| `git config --global user.name`  | Set your Git username.                                                    |
| `git config --global user.email` | Set your Git email address.                                               |
| `git init`                       | Create a new local repository.                                            |
| `git clone <url>`                | Copy a remote repository to your computer.                                |
| `git status`                     | Show changes (staged, unstaged, untracked).                               |
| `git status -s`                  | Show changes in a shorter format.                                         |
| `git add .`                      | Add all files to the staging area.                                        |
| `git add -p`                     | Interactive staging of hunks (parts of files).                            |
| `git add <file>`                 | Stage file changes for commit.                                            |
| `git commit -m "message"`        | Record a snapshot of staged changes.                                      |
| `git fetch`                      | Download new commits and update `origin/<branch>`, without touching your branches or files. |
| `git pull`                       | Fetch + merge remote changes.                                             |
| `git pull --rebase`              | Fetch + rebase instead of merge (cleaner).                                |
| `git push`                       | Upload commits to remote.                                                 |
| `git push --force-with-lease`    | Safely rewrite remote branch (after rebase).                              |
| `git log`                        | View commit history.                                                      |
| `git log --stat`                 | View commit history with number of changes per file.                      |
| `git log -p`                     | View commit history in combination with diff.                             |
| `git diff`                       | Compare working directory and index or commits.                           |
| `git restore <file>`             | Throw away uncommitted changes to a file (cannot be undone).              |
| `git restore --staged <file>`    | Unstage a previously staged file.                                         |

## Branching and Merging
At the core of teamwork in development are feature branches. Managing these branches takes many of the commands below, often a couple of times per week, depending on how many features each developer is responsible for at the same time.

| Command                                      | What it Does                               |
|:---------------------------------------------|:-------------------------------------------|
| `git branch`                                 | List local branches.                       |
| `git branch -a`                              | List all branches, local and remote.       |
| `git branch <name>`                          | Create a new branch.                       |
| `git switch <branch>`                        | Switch branches.                           |
| `git merge <branch>`                         | Merge another branch into the current one. |
| `git log --oneline --graph --decorate --all` | Visualize branch structure.                |
| `git merge --abort`                          | Cancel a merge in progress.                |

## Rebase, Cherry-pick, and History Editing
Inevitably, some branches end up too large, small bug fixes land on the wrong branches, or too many messy checkpoint commits are created to make pulling possible or to get started on new work. This leads to an unclear commit history, where the purpose of each change is hidden from other developers and from yourself in the future. When you catch these errors, the commands below help you clean up and reshape the commit history.

Depending on how strict your team is about keeping the commit history clean, these commands can be used about once a week.
Do not rebase branches other people have pulled. Rebasing rewrites history, so their copies no longer match, and you have to push with `git push --force-with-lease`.

| Command                    | What it Does                                                     |
|:---------------------------|:-----------------------------------------------------------------|
| `git rebase <branch>`      | Replay commits from your branch on top of another.               |
| `git rebase -i HEAD~N`     | Interactive rebase: reorder, squash and edit the last N commits. |
| `git cherry-pick <hash>`   | Copy a specific commit onto your current branch as a new commit. |
| `git commit --amend`       | Modify the last commit.                                          |
| `git reset --soft <hash>`  | Move HEAD but keep changes staged.                               |
| `git reset --mixed <hash>` | Move HEAD and unstage changes.                                   |
| `git reset --hard <hash>`  | Reset everything to a previous commit and remove the changes.    |

The last three commands also work with the `HEAD~N` syntax.

`git reset --hard` is dangerous. It throws away every uncommitted change in tracked files, and the reflog cannot bring those back, because it only records commits. Use it only when nothing uncommitted is worth keeping. Commits it moves away from can still be found with the reflog.

## Recovery, Reflog, and Time Travel
If you are great at Git and never make mistakes, these commands will never come in handy. Because everyone stumbles sometimes, knowing how to get your lost work back pays off fast.

| Command                      | What it Does                                    |
|:-----------------------------|:------------------------------------------------|
| `git reflog`                 | Show all HEAD movements (your time machine).    |
| `git log -g`                 | View reflog as a commit log.                    |
| `git checkout <commit>`      | Inspect an old snapshot (detached HEAD: create a branch before committing). |
| `git branch <name> <commit>` | Create a branch from a lost commit.             |
| `git revert <commit>`        | Create a new commit that undoes a previous one. |

The contents of the reflog and why it is so useful is a complicated topic, and I will not take it apart in this post.
If you want to learn more about the internals that make the reflog a useful tool, read chapter 10 of the Pro Git book. It can be read for free here: [Git Internals - Plumbing and Porcelain](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain).

## Stashing, Tagging, and Ignoring
Save, mark, and organize work efficiently. I get a lot of use out of stash, especially in messy codebases where the lines between commits, branches and temporary work that might come in handy later are blurry.

A stash is a last in, first out stack. Like a stack of plates, the most recent stash is put on top and is the first one taken off.

| Command                      | What it Does                                                      |
|:-----------------------------|:------------------------------------------------------------------|
| `git stash -m "message"`     | Temporarily save uncommitted changes.                             |
| `git stash -u -m "message"`  | Temporarily save uncommitted changes (including untracked files). |
| `git stash pop`              | Get the changes in the most recent stash and remove the entry.    |
| `git stash apply`            | Get the changes in the most recent stash and keep the entry.      |
| `git stash list`             | Show all stashes.                                                 |
| `git tag <name>`             | Create a lightweight tag (like version v1.0).                     |
| `git tag -a <name> -m "msg"` | Annotated tag with message.                                       |
| `git push origin --tags`     | Push tags to remote.                                              |
| `git rm --cached <file>`     | Stop tracking a file in Git.                                      |

## Inspection, Debugging, and Advanced Diffing
These commands are here for completeness. They are useful to get an overview of a project or of the changes in a specific commit, but VS Code and other editors show the same information without the commands. Except for `git bisect` and perhaps `git grep`, you will probably not use these often.

| Command                               | What it Does                                              |
|:--------------------------------------|:----------------------------------------------------------|
| `git bisect start`                    | Binary search to find the commit that introduced a bug.   |
| `git bisect good`                     | Mark a commit in the binary search as not having the bug. |
| `git bisect bad`                      | Mark a commit in the binary search as having the bug.     |
| `git grep <pattern>`                  | Search for text in tracked files.                         |
| `git blame <file>`                    | Show who last changed each line.                          |
| `git show <commit>`                   | Display info and diff for a commit.                       |
| `git diff <commit1> <commit2>`        | Compare two commits.                                      |
| `git shortlog -sn`                    | Show commit counts by author.                             |
| `git shortlog --author="Author Name"` | Show all messages from a certain author.                  |
| `git rev-parse HEAD`                  | Get current commit hash.                                  |

## GUI Equivalents
If you use VS Code, consider installing the [Git Blame extension](https://marketplace.visualstudio.com/items?itemName=waderyan.gitblame) to show blame information inline. It replaces the `git blame <file>` command and even shows line-by-line changes.
With the Timeline view at the bottom of the Explorer, you can compare several commits of a file with each other, much like `git diff <commit1> <commit2>`.
While I do love the `git grep <pattern>` command, it covers almost the same need as the `Ctrl+Shift+F` search in VS Code (if most of the files in your project are tracked by Git).

## Git Wizardry
Commands for rewriting, filtering, optimizing and scripting.

| Command                                             | What it Does                                                   |
|:----------------------------------------------------|:---------------------------------------------------------------|
| `git filter-repo --path secrets.txt --invert-paths` | Rewrite entire repo history to remove a file. Rotate any leaked secret first: old clones still have it. |
| `git worktree add <dir> <branch>`                   | Check out a branch in a second folder, so two branches are open at once. |
| `git submodule add <url> <path>`                    | Include another repo inside yours.                             |
| `git subtree`                                       | Merge and split subprojects.                                   |
| `git config --global alias.<name> "<cmd>"`          | Create custom Git shortcuts.                                   |
| `git rerere`                                        | Remember merge conflict resolutions so you can use them again. |
| `git notes add -m "info" <commit>`                  | Attach metadata to commits.                                    |
| `git bundle`                                        | Export repo to a single portable file.                         |
| `git replace`                                       | Temporarily substitute one commit for another.                 |

## Signs of Git Mastery
After you have put in plenty of effort and focused practice for each of the sections above, you:

- Understand that commits are immutable snapshots, not diffs.
- Can get lost commits back using reflog + reset + checkout.
- Know when to use merge and when to use rebase.
- Can keep history clean with interactive rebases.
