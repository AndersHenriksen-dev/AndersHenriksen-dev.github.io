---
title: "Your Team's First AI Agent in Three Steps"
date: 2026-11-05
author: "Anders Henriksen"
description: "Almost any team can get a working digital colleague in three steps: document every task, put the work on a board, and only then build agents on what those two give you."
image: /images/blogs/agent-three-steps.svg
imageAlt: "Two boxes feed a third. Step 1, document every task, says what the work is. Step 2, track work on a board, says what needs doing now. Together, after a few weeks or months, they feed step 3, agents and skills. An arrow from step 3 back to step 1 shows corrections going back into the documents"
tags: ["AI", "Agents", "Ways of working"]
toc: true
---

When a team asks me where to start with AI agents, they usually expect me to name a tool. I tell them to start writing things down. Three steps can give almost any team a working digital colleague, and the first two involve no AI at all.

<!--more-->

1. **Document every task the team does.**
2. **Put the work on a task board.**
3. **After a few weeks or months, start running agents and making skills from what exists in 1 and 2.**

Steps 1 and 2 are what make step 3 work. The agent is built on the tasks the team really does, and at any moment it can see what the task is and what is expected.

## Why most first agents disappoint

A typical first attempt gives a capable model a vague request: "help with the monthly report". The model has never seen your monthly report. It does not know where the numbers come from, which customer always needs a special case, or who has to see it before it goes out. That knowledge lives in the heads of two colleagues. So the agent guesses, the result looks plausible and it is wrong in ways only those two can spot.

The usual reaction is to blame the model or look for a better tool. But a new colleague with the same instructions would fail in the same way. An agent is a new colleague who starts every day with no memory, so it can only be as good as what the team has written down.

## Step 1: document every task

Write down every task the team does, in the place the team already looks. I recommend **Confluence for non-technical teams** and **Markdown files in the repository for technical teams**. In a repository, a change to a document gets reviewed like a change to code, and it sits next to the work it describes. If your company already has standard operating procedures (SOPs), start with those.

"Every task" sounds huge, so do not treat it as a project. The next time you do a task, write it down while you do it. Each document starts short and gets better every time someone uses it. A few weeks later, the tasks that come up most are the ones that are covered.

A task document only needs to answer what a new colleague would ask:

```markdown
# Monthly customer report

**When:** the first working day of each month.
**You need:** last month's export from the billing system.

## Steps
1. Download the export and check that it covers the whole month.
2. Fill in the report template, one row per customer.
3. Mark any customer whose revenue moved by more than 10%, and say why.

## Done means
The report is in the shared folder, and the team lead has approved it.

## Stop and ask if
- The export is missing days.
- You cannot explain a change of more than 10%.
```

The last two sections do the most work. "Done means" lets anyone check the result, and "Stop and ask if" tells the reader where their judgement should end. Most documentation leaves out both, because the author never needed them. An agent needs them more than anyone.

One rule keeps it alive: **whoever does a task and finds the document wrong fixes the document, then and there.** A document that is out of date is worse than none, for a person and for an agent.

## Step 2: put the work on a board

The documents say what each kind of work is. A board says what needs doing now, who has it and how far it has come. I recommend **Trello for non-technical or split teams** and **GitHub Projects for purely technical teams** (the current version, which you will also see called Projects V2).

A few simple rules matter more than the tool:

- **If it is not on the board, it is not being done.** That includes the request that came in by chat.
- **Every card links to its task document.** This one link is what ties steps 1 and 2 together.
- **Every card says what is specific this time:** which month, which customer, by when.

```markdown
Title:  Monthly customer report, October
Task:   link to "Monthly customer report"
Input:  link to the October export
Due:    3 November

Technical refinement
- Use the new template, which has a column for the contract type.
- Leave out customers who closed their account before October.

Acceptance criteria
- Every active customer has one row.
- The total matches the billing system's total for October.
- Any change of more than 10% has a reason next to it.
```

That is a complete brief. A colleague back from holiday could take it, and so could an agent.

The best part of writing cards like this is what those last two sections do for an agent. **Technical refinement tells it exactly how the task is meant to be done**, so it does not have to choose between several reasonable approaches. **User acceptance criteria tell the model what the definition of done is**, so it knows when to stop and can check its own work, and the person reviewing it checks against the same list. Teams have written these for each other for years, and they turn out to be very good instructions for a model too.

### You will pick up parts of agile anyway

Scrum and agile make sense in this context, and you do not have to set out to use them. Parts of them appear on their own once a team works this way:

- The board becomes a **backlog**.
- Writing a clear card is **refinement**.
- "Done means" and the acceptance criteria are a **definition of done**.
- Cards shrink into **small increments**, because a large card is hard to finish or check, for a person and for an agent.
- The review step at the end of a card is a **review**.
- Fixing a document after a mistake is a small **retrospective**.

A team that already runs Scrum has most of step 2 in place. It mainly needs to link its cards to task documents. A team that has never heard of Scrum can ignore the words and still get the benefit, and it can add the ceremonies later if they help.

## Then wait

This is the step people want to skip. Give it a few weeks or months, depending on how often your tasks come up. You need the documents to have been used and corrected, and you need the board to show what the team really spends its time on, which is rarely what the team would have guessed.

You also lose nothing while you wait. The first two steps pay for themselves if you never run an agent: new colleagues get up to speed faster, holidays stop being a risk, and it is clear what everyone is doing. There is no budget to approve and no tool to pick that you cannot change later.

You are ready when **someone new can do a task from its document, without asking anyone.** If a person cannot, an agent will not either.

## Step 3: run agents on what you have

**Every SOP and every recurring task can become a Claude skill, or the equivalent in the tool you use.** That is what the documents from step 1 have been building towards: each one is already most of a skill, so you are not starting from nothing. A team with 30 documented tasks has a list of 30 things an agent could learn.

Do not build them all at once. Pick one task. The best first task is one that:

- comes up often, so that you get feedback quickly
- has a document that has survived real use
- is easy to check, because "Done means" is clear
- can be undone, because a mistake only costs a redo

Then let the agent work the way a colleague would: it takes a card, reads the linked document, does the work, checks it against the acceptance criteria and puts the result up for review. A person stays in the loop at the point where a mistake would matter. When that works, take the next task from the list.

![A board with four columns. In Ready, a person adds a card. In Agent, the agent reads the card and its linked document and does the work. In Review, a person checks the result, and can send it back to the agent. In Done, the card is finished, and the team fixes the document if it was wrong](/images/blogs/agent-board-flow.svg)

Which tool you use depends on the team. This is what I have been recommending:

| | Technical | Non-technical or split |
|---|---|---|
| **1. Docs** | Markdown in the repository | Confluence |
| **2. Board** | GitHub Projects | Trello |
| **3. Agent** | `.claude/` and `CLAUDE.md` | Claude plugin, Claude Project or Copilot Studio |

### Technical teams: `.claude/` and `CLAUDE.md`

`CLAUDE.md` is read at the start of every session, so it holds how the team works. A skill is a small file that turns one task into something the agent can do on request. Both live in the repository, so the team reviews them like any other change.

```markdown
# CLAUDE.md

Task documents are in docs/tasks/. Our work is on the GitHub Project "Team board".
Only take cards in the Ready column. When you finish, move the card to Review
and say what you did. Never send anything outside the team.
```

```markdown
---
description: Prepares the monthly customer report. Use when a card asks for it.
---

Follow docs/tasks/monthly-customer-report.md. The card says which month, links to
the export, and lists any refinement and the acceptance criteria. Check your work
against those criteria. Stop and ask if the document tells you to.
```

Save the second file as `.claude/skills/monthly-customer-report/SKILL.md`, and make one skill like it per task. Notice how little is in it. **The skill points at the document instead of copying it**, so there is still only one place to fix, and every correction reaches people and agents alike. Claude Code can reach the board through the `gh project` commands.

### Less technical teams: three options

These three are not equal, so choose by how much you want the agent to do. In each one, a documented task has its own natural form:

- **A Claude Project** is the simplest start: shared instructions and uploaded documents in one place. A recurring task becomes a section of those instructions, or a Project of its own. A person starts each chat, so it is more of a well-briefed assistant than a colleague working a board. Uploaded files are copies, so someone has to replace them when a document changes.
- **A Claude plugin** packs skills, commands and connectors into something the whole team can install, and it needs no code. Each recurring task becomes a skill, which is the closest match to what technical teams get. Connectors are what give it access to your tools: Atlassian's [Rovo MCP server](https://support.atlassian.com/rovo/docs/atlassian-remote-mcp-server) covers Confluence, and [Trello has its own](https://support.atlassian.com/trello/docs/connect-trello-to-ai-assistants-with-trello-mcp/).
- **Microsoft Copilot Studio** makes sense if your company already lives in Microsoft 365. A recurring task becomes a topic, or an agent of its own. It can use [Confluence as a knowledge source](https://learn.microsoft.com/en-us/microsoft-copilot-studio/knowledge-unstructured-data), and a [Microsoft 365 Copilot connector](https://learn.microsoft.com/en-in/microsoft-365/copilot/connectors/trello-overview) can index Trello cards so that an agent can find them. Check that this gives you enough, because indexing lets an agent read the board, which is not the same as working on it.

These products change quickly, so check what your plan includes before you settle on one.

## Keep a person where it matters

An agent that reads your documents and board will believe what it finds there, so be careful about who can write there, and about what the agent can do.

I measured this in [a study of my own](/projects/agent-injection-tests/), on a test agent with made-up data. Planted instructions never worked in 504 runs, but false facts from a believable address got through in 47 of 147. That is one model and attacks I wrote myself, so it is not a general result. But I take one lesson from it for any team: **agents are better at refusing to act than at doubting what they read.**

So start small. Give the agent read access and let it draft, and add tools only when a task needs them. Keep a person on anything that leaves the team, moves money or cannot be undone. The Review column is what makes this cheap, because reviewing is already part of how the work flows.

When the agent gets something wrong, ask first whether the document was clear. Often it was not, and fixing it improves the result for the next person too. That loop is the real payoff: the team's knowledge ends up written down, tested every time it is used, and better each month.

## Start this week

You do not need a budget or a decision for this. Pick the task you will do next, and write down the steps as you do it. Make a board with four columns, and put that task on it, with a link to the document.

The agent can wait a few weeks. By then, you will know exactly what to ask it for.
