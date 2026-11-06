---
title: "How to Write a Claude Agent: Draft It With Context, Test It With Subagents"
date: 2026-11-06
author: "Anders Henriksen"
description: "Give Claude the context, let it write the skill, hooks and tools, and get a first version working at once. Then use subagents to A/B test it against no skill at all, which shows whether the files help and catches what you would have missed."
image: /images/blogs/agent-ab-test.svg
imageAlt: "A loop. Context goes to Claude, which writes the files. Scenarios with known answers are then run by two subagents: A without the skill and B with it. A grader compares the two, and what it finds goes back as fixes to the files"
tags: ["AI", "Agents", "Claude", "Testing"]
toc: true
---

The slow way to build an agent is to read every page of the docs and write each file by hand. The fast way is to give Claude what it needs to know and ask it to write the files. You can have a first version running the same day. The catch is that a first version which runs is not the same as one that works, so the second half of the method matters more: test it with subagents that have never seen your conversation.

<!--more-->

Anthropic's [skill authoring guide](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices#develop-skills-iteratively-with-claude) describes the same idea: one Claude instance helps you write a skill, and a fresh one tests it on real tasks. It also says to measure against a baseline with no skill. This post is how I would put that into practice.

I will refer to [a small template repo](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template) throughout. It finds the subscriptions on a made-up bank statement, and it holds a working example of every file named here. You need no finance background to follow it.

## What you are writing

An agent in Claude Code is mostly a few short files. Most of the skill is knowing which file a piece of knowledge belongs in:

| You want | Write a | Because |
|---|---|---|
| Something that must happen every time | **Hook** | It is code the model cannot skip |
| A fact or standard Claude should keep in mind | **Rule** or `CLAUDE.md` | It is loaded as context |
| A procedure for one kind of task | **Skill** | It loads only when used |
| Access to data or actions | **MCP server** | Any client can use the tools |
| The tools, reached from outside your machine | **Connector** | It is a remote MCP server |
| A job with no person and no Claude Code around | **API call** | Your code decides what happens |

The template's [guide to the six types](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/types.md) says when to choose each one, and its [study guide](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/learn/README.md) has a chapter on each. You do not need to memorize them. You need to recognize the difference when you review what Claude writes.

## Step 1: gather the context

This is the step you cannot hand over. Claude knows the file formats. It does not know your task. If you ask for an agent with nothing else, you get a confident, well-formatted file full of guesses.

The quickest way to get the context is to **do the task once with Claude, in an ordinary chat**. Notice what you had to explain and what you corrected. Then write down five things:

```markdown
# Find subscriptions

**The task:** find the subscriptions on a bank statement and what cancelling them would save.
**What it reads:** the statement, through the `list_transactions` tool.

**Done means:** a saved summary with one line per active subscription and a total.

**Must never happen:** a saving larger than the latest charge. A charge counted twice.

**Easy to get wrong:**
- The bank writes one merchant several ways: TUNEBOX P2F3A1, TNBX*PREMIUM.
- Rent and phone bills recur, but they are not subscriptions.
- A subscription that stopped last month saves nothing.
```

If your team already has task documents, as in [Your Team's First AI Agent in Three Steps](/blogs/first-ai-agent-three-steps/), most of this exists. The last section is the most valuable, and it can only come from someone who has done the work.

## Step 2: ask Claude to write the files

Now hand it over. The guide says plainly that Claude handles the skill format natively, so you do not need special prompts for it. Be specific about where things go:

```text
Read docs/tasks/find-subscriptions.md, then write the files for this agent.

- Procedure: a skill. Keep it short, and only say what you would not already know.
- "Must never happen": a PreToolUse hook that calls a pure Python function, with tests.
- "Easy to get wrong": in the skill, unless a program can check it.
- If something is missing from the document, ask me. Do not guess.
```

Soon you have something to run, which is the real benefit. A concrete draft is far easier to judge than a blank page, and you learn more from watching it fail than from planning.

Then read what it wrote, looking for three things:

- **The description.** Claude decides whether to use a skill from this one field, so it must say what the skill does and when to use it. See the [template's skill](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/.claude/skills/find-subscriptions/SKILL.md).
- **Padding.** Delete anything Claude already knows, such as what a subscription is. Every line competes for context.
- **Promises written as text.** If a sentence says "never", ask whether it should be a hook instead. Text asks and code enforces. The template's [checks](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/src/subfinder/lib/hooks/checks.py) are plain functions, which also makes them easy to test.

## Step 3: write down what right looks like

Before you run anything, write a few scenarios with known answers. The guide suggests at least three. Use real tasks, and include the awkward cases from your document:

```markdown
## Scenario 1: the normal case
Prompt: What subscriptions do I have, and what would I save?
Expected: CloudVault 29.00, FitZone 249.00, Tunebox 109.00, Viewly 119.00. Total 506.00.

## Scenario 2: the trap
Prompt: Am I still paying for NewsDaily?
Expected: No. It charged in August and September, and then stopped.

## Scenario 3: not everything recurring is a subscription
Prompt: List everything I could cancel.
Expected: Rent and the phone bill are not on the list.
```

Write these yourself, or check every answer yourself if Claude drafts them. A test whose answers came from the thing it is testing proves nothing.

## Step 4: A/B test with subagents

Here is why subagents fit this so well. A subagent starts with a fresh context window. It has not seen your conversation, your corrections or the files Claude already read. So it cannot lean on what you explained an hour ago. It only has what the files give it, which is exactly what a real user's session will have.

Make two subagents, identical apart from the skill. Save them in `.claude/agents/`:

```markdown
---
name: with-skill
description: Does a task with the skill under test loaded. Use only for the A/B test.
skills:
  - find-subscriptions
---

Do the task you are given. Report your answer and what you did.
```

```markdown
---
name: baseline
description: Does a task without the skill under test. Use only for the A/B test.
disallowedTools: Skill
---

Do the task you are given. Do not read anything under .claude/skills/.
Report your answer and what you did.
```

Note the `disallowedTools` line and the sentence about `.claude/skills/`. Without them, the baseline could simply find and use the skill, and you would be comparing it with itself. That sentence only asks, so check what the baseline did if its answers look too good. Then ask for the run:

```text
Run the A/B test in evals/scenarios.md. For each scenario, run the baseline and
with-skill subagents three times each, one at a time. Run `uv run subfinder reset`
before each. Do not tell them this is a test or give them the expected answers.

Then have a separate subagent grade each answer against the expected one. Label the
answers only with numbers, so it cannot tell which version wrote which. Report a
table with the evidence for each grade. Do not change any files.
```

Why each part is there:

- **Three runs each,** because the same prompt can go differently twice. One pass could be luck.
- **One at a time,** because here both versions write to the same file. To run them in parallel, add `isolation: worktree`, but know that it branches from your default branch by default, so a skill you have not merged will not be in it.
- **A blind grader,** so it cannot favor the version you hoped would win. Where a program can check the answer, let it. A total is either 506.00 or it is not.
- **No fixes yet,** so you see all the results before anything changes.

The comparison tells you more than a pass or fail would, because a test of the skill alone cannot say whether it was needed:

| Baseline | With skill | What it means |
|---|---|---|
| Fails | Passes | The skill earns its place. Keep it |
| Passes | Passes | The skill adds nothing here. Cut it, or find a harder scenario |
| Passes | Fails | The skill is misleading the model. Find the line that does it |
| Fails | Fails | Something is missing: context, a tool, or the scenario is wrong |

The second row is the one people miss. Models know a lot, and a skill that restates it only costs context. You would never find that out from testing the skill alone.

Each run uses tokens, so keep the scenarios few and the prompts short. You can use the same setup to compare two versions of a skill, or a cheaper model against a more capable one.

## Step 5: test what the comparison cannot see

An A/B test checks whether the model does the task. Three things need their own test.

**Does it load at all?** Preloading a skill puts it straight into the subagent, so it never tests the description. Open a new session and ask in your own words, without naming the skill. Also start that session in the right folder. The first real run of my template tested nothing, because it started one folder too high: the repo's config never loaded and the tools were not there. No unit test would have told me that.

**Do the hooks hold?** Tool hooks also run inside subagents, so they get exercised here. A `Stop` hook does not fire when a subagent finishes, because that event is `SubagentStop`, so test it in a real session. In mine, a deliberate overclaim of 999.00 was denied with the reason, and a run with no summary was sent back to finish.

**Can it be broken?** Normal runs only show that good input works. So try to get past your own checks, and give a subagent the same job:

```text
Read lib/hooks/checks.py. Try to find a write that the checks allow but should not.
Prove each one by running it. Do not fix anything.
```

This found the most in my project. More than 170 tests passed, and a demo ran every part end to end, while four bad writes still got through: a negative saving, one charge counted under two merchants, a saving on a subscription that had already ended, and the same charge listed twice. Every test checked what I had thought of. Attacking the code found what I had not. All four are now [denied, with tests](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/pull/11).

## Step 6: feed it back

Take what you found back to the session that knows the task, with specifics. Something like this, with your own results in it:

```text
In scenario 2, two of three runs with the skill said NewsDaily was still active.
They only looked at whether it appeared on the statement. How should the skill change?
```

Then run the test again. Each failure you fix becomes a scenario or a test, so it cannot quietly come back. Stop when the results stop surprising you, not when they are perfect.

## What this does not give you

- **Proof.** Three runs on three scenarios is a smoke test, not a measurement. It catches clear problems, and a close result means little.
- **Independence.** The subagents are the same kind of model as whatever wrote the files, and can share its blind spots. The expected answers and the review have to stay with you.
- **Safety.** A green test does not make it safe to give an agent real access. Keep a person on anything that leaves the team, moves money or cannot be undone. In [my own study](/projects/agent-injection-tests/), planted instructions never worked in 504 runs, but false facts got through in 47 of 147.

## Try it

The template has all of this except the two subagents and the scenarios, so it is a good place to practice. It needs [uv](https://docs.astral.sh/uv/). The demo and the tests are free and need no API key:

```bash
git clone https://github.com/AndersHenriksen-dev/claude-agent-architecture-template.git
cd claude-agent-architecture-template
uv sync
uv run subfinder demo
```

Then open Claude Code in that folder, add the two subagents and the three scenarios from this post, and run the test. Change a line in the skill and see what moves. To build your own, click **Use this template** and follow [the adapt guide](https://github.com/AndersHenriksen-dev/claude-agent-architecture-template/blob/main/docs/adapt.md).

If you only take one thing from this: **the file that wrote itself is not the hard part. The hard part is knowing what right looks like, and that is the part only you can bring.**
