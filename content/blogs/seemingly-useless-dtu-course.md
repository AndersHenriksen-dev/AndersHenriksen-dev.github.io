---
title: "The Seemingly Useless DTU Course I Refer Back to Daily"
date: 2026-11-07
author: "Anders Henriksen"
description: "A forced entrepreneurship course at DTU taught me the build-measure-learn cycle. I never planned to use it. It now shapes how I build tools for my colleagues, and three stories from work show why."
image: /images/blogs/build-measure-learn.svg
imageAlt: "A loop of three steps, using my SAS to Python agent as the example. Build: the smallest version that works, one script moved to Python. Measure: talk to the people using it, who found the classes frustrating to read. Learn: what you could not have guessed, that the code has to read from top to bottom like SAS. An arrow leads back to Build, and the loop repeats"
tags: ["Ways of working", "AI", "Agents"]
toc: true
---

In the first year of my master's at DTU, I had to take 15 ECTS points of entrepreneurship courses. That is a quarter of a year of full-time study. I was a computer scientist, I had already co-founded a company once, and I had no intention of doing it again.

<!--more-->

One of those courses was UX Design Prototyping, worth 5 ECTS points. It taught me the build-measure-learn cycle, and that cycle may be the thing I believe in most at work. I refer back to it almost every day, in jobs that have nothing to do with startups.

## Why we did not take it seriously

Technical students at DTU shared a belief: the very soft courses belonged at the University of Copenhagen and Roskilde University, with the humanities. Nobody took them very seriously.

The course did not look like it would change our minds. Each week, my team built and improved an app idea, then got feedback on it. Our app made travel itineraries and let users rate their experiences. We had no customers, of course. The feedback came from other students.

Along the way we learned about lean, which includes the cycle Eric Ries describes in *The Lean Startup*. Build the smallest thing you can. Measure what happens when people use it. Learn from that, and go again.

The funny part is that I had already done the opposite. At Absis, the company I co-founded in 2020, we built an OCR pipeline for financial documents, and we built for a long time before we showed it to anyone. I did not connect the two at the time.

## The first time I noticed: a small knowledge base

The idea came back to me at my first job at Danske Bank, as a Data Scientist in Portfolio Intelligence, when I built my first AI helpers.

I wanted to give the team a knowledge base in the repo, so that the model knew our systems. A full version would take a long time, and it would sit in the pipeline for 2 months before anyone got anything from it.

So I made the smallest version I could: a short blurb on each of the central systems. It added value immediately. Then I looked at where the model did not do well, and I added details there.

I did not have to guess which details were worth writing, because the model's mistakes showed me.

![Two timelines over the same 2 months, drawn as a sketch and not from data. In the first, the work sits in the pipeline, and first use and first feedback only come at the end. In the second, a small version is in use near the start, and it gets better in steps as users show what to fix](/images/blogs/pipeline-vs-cycle.svg)

## What I could not have guessed: the SAS agent

In my next role, as Data Analyst (Tech Lead) in Group Treasury at Danske Bank, my colleagues had SAS code to move to Python. I built an agent in GitHub Copilot for it. It migrates the code, fetches test data and checks that the outputs match.

I made the smallest working version I could and iterated with my colleagues. After the first script, they told me what bothered them. The code used classes, and they found it frustrating that they could not read it from one end to the other, as they could with the old SAS code.

It turned out the code had to read almost like normal English. A check can tell you that the new output matches the old. It cannot tell you that the people who will own the code find it hard to read. Their expertise was treasury and SAS, so the tools had to fit them. I kept making the code simpler and the agent easier to use.

If I had built the complete agent first, I would have finished something that wrote code my colleagues did not want. Instead, that feedback became my coding standard, which I wrote up in [Python Anyone Can Read](/blogs/python-anyone-can-read/). It is still built around the reader with the least context.

## No finish line: Saga

At Capital Four, I built an AI colleague for my team and called it Saga, because it finishes and holds all of the team's user stories.

I put the skeleton together within the first month. It held the docs from Confluence and our SQL code, and nothing else. The rest came later:

- **Screenshots of our EDM desktop client.** It has no API or MCP server to connect to, so screenshots are how the agent learns the program.
- **XSLT files**, added to what it can read.
- **A skill for every SOP the team runs**, starting with the tasks that have the most impact.

Five months in, I am still improving it. If I had waited until all of this was ready, the team would have had nothing to use in the meantime, and I would have had nothing to learn from.

## Measure is mostly talking

"Measure" sounds like dashboards. Mine is usually informal. I talk to people about the solution. They tell me the problems, or I notice the problems while they use it.

Early on, that is enough, because the question is simple: does this help, and what is in the way? No usage number would have told me that my colleagues wanted to read code from top to bottom.

It is not the only kind of measuring I do. When the right answers are known, I use a test set, and for agents I [A/B test against no skill at all](/blogs/write-and-test-claude-agents/). Those tell me whether the thing is correct. Talking to people tells me whether it is the right thing.

## When the cycle needs a guard

The cycle depends on a small version that is safe to hand over, and not everything has one.

You cannot give a bank half an IFRS9 Expected Credit Loss model to see what happens. When I co-owned the migration of those models to Python, we proved the new version through shadow production and regression testing until the numbers matched. There is still a loop in that, but nobody relies on the result until it is proven. The same goes for anything that moves money or cannot be undone, which is why I [keep a person there](/blogs/first-ai-agent-three-steps/#keep-a-person-where-it-matters).

Small also does not mean broken. The blurbs in that first knowledge base were short, but they were useful from the first day. A small version nobody wants to use teaches you very little.

## What the course was really about

I still think it is funny to make a computer scientist learn how to start a company. But I was wrong about what I was learning. The course looked like it was about startups. It was really about how to build anything for other people.

The people I build for now are my colleagues, and that makes the cycle easier than it was in the course. My team's travel app only ever had other students to ask. My users are one message away.

## Try it

Next time you plan a two-month build, find the version you can hand to a colleague this week.

Watch them use it. Ask what got in the way. Build that next, and then ask again.

You do not need 15 ECTS points for it.
