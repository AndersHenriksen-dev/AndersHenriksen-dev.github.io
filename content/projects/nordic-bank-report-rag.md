---
title: "Nordic Bank Report RAG"
date: 2026-11-03
author: "Anders Henriksen"
description: "Question answering over twelve annual reports from Danske Bank, Nordea and Jyske Bank, with page citations, hybrid search, reranking and a 44-question eval set."
image: /images/projects/bank-rag-answer.png
badges:
  - "Python"
  - "RAG"
  - "Qdrant"
  - "Evals"
  - "MCP"
links:
  - icon: fab fa-github
    name: "View the code on GitHub"
    url: https://github.com/AndersHenriksen-dev/nordic-bank-report-rag
tags: ["RAG", "LLM", "Search", "Evaluation", "Python"]
showInHome: true
toc: true
---

I built a question answering system over the 2022 to 2025 annual reports of Danske Bank, Nordea and Jyske Bank: twelve reports and 3,553 PDF pages. Ask a question in English or Danish and it answers from the reports, cites the report and page behind every claim, and refuses forecasts and investment advice.

<!--more-->

The point of the project was not only to make it work, but to measure it. A test set of 44 questions with known answers scores every part of the system, from the search to the final answer, so every design choice below has a number behind it.

*Built on public annual reports for demonstration. Not investment advice. Figures should be checked against the source page.*

## What it does

You type a question such as "Compare the CET1 ratio of the three banks at the end of 2025" or "Hvad var Nordeas egenkapitalforrentning i 2025?". The answer comes back with a numbered citation on every sentence, as in the screenshot at the top of this page, together with the cost and the time it took. Each citation opens the report page as an image, with the cited passage highlighted, so you can check the figure yourself:

![The Sources section of the web page: three tabs, one per cited page, and Nordea's page 40 with the cited paragraph on its CET1 ratio highlighted in yellow](/images/projects/bank-rag-source.png)

A question like "What will Danske Bank's share price be next year?" gets "Not in the documents." and a short explanation. The system only reports what the reports say. It will still report a bank's own published outlook, and says that it is the bank's expectation, not a forecast of its own.

The same search is also available as a read-only MCP server with three tools (`search_reports`, `get_kpi` and `compare_banks`), so an AI assistant can use the reports directly, and as a command line tool.

## Results

Measured on the 44 eval questions over all twelve reports, 35 of them answerable from the reports:

| Measure | Result |
|---|---|
| Recall@6 with hybrid search and a reranker | **0.94**, against 0.77 for keyword search alone |
| Numeric answers exactly right | **28 of 28** |
| Unanswerable questions refused | **9 of 9**, and no answerable question refused |
| Cost and time per question | **USD 0.001** (DKK 0.007) and **4.5 seconds** on average |

Recall@6 means that the 6 passages the model reads hold the evidence it needs 94% of the time, counting each bank or year a question needs.

## How it works

Once, when the reports are ingested:

1. **Parse.** PyMuPDF reads every page. Tables are rebuilt row by row from word positions, because the library's own cell output merged columns on many report tables. Each page keeps its bank, year, PDF page number and section.
2. **Chunk.** Paragraphs are packed into chunks of about 500 tokens that never cross a page, so every citation points at exactly one page. Tables are not split. That gives 8,700 chunks.
3. **Index.** Each chunk goes into a BM25 keyword index and, as a `BAAI/bge-m3` embedding, into an embedded Qdrant vector store.

For each question:

1. **Route.** Bank names and years in the question become filters. A question about three banks is searched once per bank and the results are interleaved, so one bank cannot take every slot.
2. **Expand Danish.** A glossary of 25 Danish finance terms adds the English wording the reports use ("egenkapitalforrentning" adds "return on equity").
3. **Search twice and fuse.** BM25 finds exact terms and figures. The dense vectors find meaning across languages. Reciprocal rank fusion merges the two rankings by rank, not by score.
4. **Rerank.** The cross-encoder `BAAI/bge-reranker-v2-m3` reads the question and each of the top 30 passages together and keeps the best 6. Both models run locally.
5. **Add key figures.** When a question names a key figure, a bank and a year, the checked row from a table of 42 key figures goes in with the passages.
6. **Answer.** Claude Haiku gets the passages with citations turned on and a cached system prompt: answer only from the passages, cite every figure, answer Danish questions in Danish, and refuse forecasts and advice.
7. **Check.** Every figure in the answer is looked up in the passages it cites. Any figure that is not there is shown as a warning, so the reader knows what to check by hand.

Every answer is logged with its sources, tokens, cost and latency.

## What I tried

I changed one thing at a time and measured each step on the 35 answerable questions:

| Step | Recall@1 | Recall@3 | Recall@6 |
|---|---|---|---|
| BM25 over fixed 500-token windows | 0.14 | 0.25 | 0.39 |
| + chunks that follow sections and keep tables whole | 0.19 | 0.28 | 0.47 |
| + search only the banks and years the question names | 0.23 | 0.44 | 0.68 |
| + English report wording for Danish finance terms | 0.23 | 0.53 | 0.77 |
| Dense vectors (`bge-m3`) alone, for comparison | 0.24 | 0.57 | 0.74 |
| BM25 and dense fused by reciprocal rank fusion | 0.39 | 0.68 | 0.82 |
| + cross-encoder reranker on the top 30 | **0.50** | **0.84** | **0.94** |

## What I learned

- **Quality came from the documents and the search, not the model.** Rebuilding tables, routing by bank and year, and reranking moved the numbers. The answer model stayed the cheapest one.
- **You only know it works when you have a test set.** Every gold answer and page in the eval set was checked against the page text. Without that, I would have shipped changes that felt better and measured worse.
- **Dense vectors alone do not replace keyword search on annual reports.** The reports are full of exact terms and figures. Vectors alone put the right page first about as often as BM25 (0.24 against 0.23), but found less of the evidence in the top 6 (0.74 against 0.77). Fused together, they put the right page first 70% more often.
- **For the figures people ask about most, a lookup beats a better search.** Sending the checked key figure row fixed both remaining numeric misses, at almost no extra cost. It does not fix reasoning: with every figure right and cited, one answer still called a 16.1% CET1 ratio the lowest, next to a 15.7% one.
- **The eval had to be debugged too.** My first citation metric scored 50%, but it measured my gold page lists more than the answers. Better searches also kept finding pages that hold the answer but were missing from my gold lists.
- **An LLM judge needs checking too.** The judge caught comparisons that contradict themselves, which no figure check could see. At low effort it also failed 3 good answers. Running it at medium effort cut the wrong verdicts to 1 of 34.
- **Doubling the corpus barely moved the search.** Going from six to twelve reports changed recall@6 from 0.95 to 0.94, because routing sends every question that names a year to that year's reports.

## Where it breaks

- **Group versus business unit.** The search sometimes prefers a business unit's page over the group's financial review, and the answer then reports both figures instead of choosing.
- **Rankings across currencies.** One answer called Danske Bank's DKK 23.0 billion larger than Nordea's EUR 4.8 billion, which is about DKK 36 billion.
- **Paragraphs split into pieces.** On some pages the parser breaks a paragraph into line-sized pieces, so a citation covers only part of a sentence.
- **Uncited quotes.** Some answers copy a sentence from the source without a citation marker. The figure check flags them.

## Mistakes along the way, and how I caught them

| Mistake | Caught by |
|---|---|
| Routed results sorted by score, which undid the balance between banks | Reading the eval misses |
| A citation metric that measured the gold lists more than the answers | Reading every failing answer |
| Gold evidence lists missing pages that hold the answer | Checking every unexpected page a search found against the PDF text |
| A refusal rule that also refused a bank's own published outlook | An eval question written to test that boundary |
| A judge stricter than its rubric | Reading every failed verdict against the answer |

## Tech stack

Python 3.12 and uv, PyMuPDF, BM25, Qdrant, `bge-m3` embeddings and the `bge-reranker-v2-m3` cross-encoder, the Anthropic API with citations and prompt caching, SQLite for the key figures, Streamlit for the web page, and an MCP server. The code is checked with ruff, mypy and 108 pytest tests, and GitHub Actions runs those checks, a retrieval check on a fixture of 533 real chunks and a gitleaks secret scan on every pull request.

I built it in about 10 hours over three days. The [README](https://github.com/AndersHenriksen-dev/nordic-bank-report-rag#readme) has the steps to run it yourself, and the repository has every design decision, experiment and eval result.
