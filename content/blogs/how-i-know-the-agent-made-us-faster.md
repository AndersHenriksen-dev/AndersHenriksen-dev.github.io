---
title: "How I Know the Agent Made Us Faster"
date: 2026-11-21
author: "Anders Henriksen"
description: "Work in my team that took one to three days now almost always lands inside a day. The audit rules that freeze our process are also what let me say the agent is the reason."
image: /images/blogs/agent-attribution.svg
imageAlt: "Two columns. What the audit fixed: multi-stage deployment, a colleague's risk approval, change approval on high-risk cards, a fixed test and import process, and cards that carry refinement, acceptance criteria and test scenarios. What I changed: a skill for every SOP, an agent that works the cards, a board that logs the trail, and a page behind every card. Under both columns, work that took one to three days now lands inside a day"
tags: ["AI", "Agents", "Ways of working"]
toc: true
---

Every card in my DevOps team at Capital Four carries the number of days it took, filled in when the card closes. Work that used to take one to three days now almost always lands inside a day.

<!--more-->

Saying that is easy. Knowing why is the part most posts skip, and it is the first thing a sceptical colleague will ask about. I built the AI colleague myself, so I am the last person who should be trusted on whether it works. This is the reasoning I would want to see from someone else.

## The baseline came from a habit, not a plan

Every card is sized low, medium or high before the work starts, and gets a volume when it closes: the number of days the task actually took. Nobody set either of those up to measure AI. They were there so the team could see trends and plan the next week.

That habit is the only reason I have a before. The finished cards sit in the archive, so before and after are the same field, filled in the same way, by the same people, on the same three kinds of work: bugs that need a code change, new features in the system the team owns, and the larger support problems.

What I do not have yet is a precise figure. I can see the shape of the change in the archive, and I would rather say "one to three days, now inside a day" than dress it up as a median I have not counted.

## An audit requirement did the hard part

In a regulated company the process is not mine to change. We are audited under ISAE 3402, an assurance standard for service organisations, which puts our internal controls in front of an external auditor every year. Our change management therefore has to look the same this month as it did last month:

- multi-stage deployment
- a risk evaluation and an approval from a colleague
- change approval on every high-risk card
- a testing and code import process that stays exactly as it is
- every card with a description, technical refinement, user acceptance criteria and test scenarios

That list is normally the part people complain about. For a measurement, it is the best thing that could have happened. The usual explanation for a team that suddenly gets faster is that it quietly changed how it works, in ten small ways nobody wrote down. We could not. The steps, the approvals and the paperwork are fixed, so when the days per card drop, the process is not available as an explanation.

## The audit and the agent want the same card

Read that list again and look at the last line: a description, technical refinement, user acceptance criteria and test scenarios on every card.

That is also the perfect brief for a model. The refinement says how the work is meant to be done, so the agent does not have to choose between three reasonable approaches. The acceptance criteria and the test scenarios say what done means, so it can check its own work before a person sees it. I wrote about this in [Your Team's First AI Agent in Three Steps](/blogs/first-ai-agent-three-steps/): teams have been writing these for each other for years, and they turn out to be very good instructions for an agent too.

The approvals work the same way. Multi-stage deployment and a colleague's sign-off mean an agent cannot ship anything on its own, however confident it sounds. The control that keeps an auditor happy is the same control that makes an agent safe to let near production.

So the compliance work was not a tax I had to pay before I could automate anything. It was most of the groundwork.

## One skill per SOP

Saga, [the AI colleague I built for the team](/blogs/seemingly-useless-dtu-course/), got a skill for every SOP we run, starting with the tasks that come up most. A card arrives with its refinement and acceptance criteria, Saga reads the SOP behind it, does the work and puts the result up for review. A person still approves it, because the audit says so and because that is where a mistake would matter.

Nothing else about the way we work changed, which is the whole point.

## A board that writes the trail by itself

The requirements above used to be met by hand. So I built the team a board that looks like the Trello they were used to, with GitHub underneath: every card is an issue, every piece of work a branch and a pull request. The trail the audit asks for is now a by-product of doing the work rather than a second job after it.

The part that matters here is that the agent uses the same board as everyone else, through an API and an MCP server, and not a side route around the controls. I A/B tested those two ways in. The MCP route came out 78% cheaper in model cost than the API alone, for the same work.

## Every card leaves a page behind

Every card also ends with a documentation page: what the task was, how it was done, and what went wrong on the way. One page is tidy record keeping. The pile is worth a great deal more.

The team used to write these by hand. It was the first thing I handed over, because it is the kind of work a model is genuinely good at: the card, the change, the review and the tests are all in front of it, and the page is a summary of them.

That is worth saying out loud, because it means the agent now writes a good part of what the next agent reads. What keeps it from drifting is that every page starts from what people put on the card, and that the next person to do this kind of work is the one who reads it.

- **It makes backtesting possible.** A new skill can be run against cards that are already finished, where the right answer is known and nothing is at stake, before it is let anywhere near live work.
- **It is training material with the trade-offs already in it.** The pages say why an approach was chosen and what it cost, not just the steps. That is what a new colleague needs in order to choose well rather than copy, and a model needs exactly the same thing.
- **It shows how this work fails.** The same handful of failure cases keep coming back. A page that records one is worth more than a warning nobody ever wrote down.
- **It carries the team's language.** How we name things, how we describe a fix, the order we do things in. The pages the team wrote by hand set that, and an agent that reads them sounds like the team instead of like a model.

Step 1 of [the three steps](/blogs/first-ai-agent-three-steps/) was to document every task before automating anything. A page per card is that step running by itself: the material an agent needs keeps arriving as a by-product of the work, so nobody has to start a documentation project to get it.

It is also how the number in this post will get sharper. The cards hold the days, and the pages hold what those days went on.

## What else could explain it

Four candidates, and I only get to rule out three of them.

- **The move to new tools.** We also moved from Trello, Confluence, SharePoint, network drives and SSMS to GitHub and VS Code in the same period. It earns its place: a few steps could be automated, and the audit trail stopped being manual. But it barely touches the days a card takes, and I would give it very little of the change.
- **Smaller cards.** A team can look faster by cutting the work into smaller pieces. Card size is set by the same refinement rules it always was, and the large tasks still take more than a day, with the agent as without it. It is also the one explanation on this list I can settle with data I already have, by holding the size a card was given against the days it ended up taking. I have not run that comparison yet.
- **A different mix of work.** The three kinds of work are what they were. Bugs, features and support problems come in at the same rate they always did.
- **Me learning the systems.** I was new, so I got faster at this work on my own. That explains my cards. The field is on everyone's cards, and the trend is in the team's.

What I cannot rule out: this is one team over a few months, with no slice of work left alone as a control, and I am both the person who built the agent and the person reading the archive. That is why the claim is a range rather than a single number, and why I will keep it a range until I have counted.

## What I would do differently

Three things I would set up at the start of the next one. Two of them cannot be recovered later.

1. **Write the baseline down on purpose.** We had one by luck, because someone wanted to plan the week.
2. **Compare the estimate with the actual.** Both numbers are already on every card, the size before the work and the days after it. Together they answer the smaller-cards objection on their own. I did not think to put them side by side until I had to defend the claim.
3. **Leave one kind of work alone for a few weeks.** A small holdout settles in a month what debate never will.

## Try it

If you are thinking about an agent for your team, add two fields to your cards today: the size you expect before the work starts, and the days it actually took. Then carry on as normal for a while. In six months you will be able to say what your agent changed, and defend it in front of the person who doubts it.

That is worth more than the demo you could build this week.
