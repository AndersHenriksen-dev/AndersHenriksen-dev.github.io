---
title: "Beating My Insulin Pump's Glucose Forecast"
date: 2026-11-14
author: "Anders Henriksen"
description: "Ten weeks of my own data from an open-source automated insulin delivery system, and a learned model whose 60-minute glucose forecast has 31% lower error than the system's own algorithm, in every one of 7 test weeks."
image: /images/projects/aaps-card.jpg
imageAlt: "Six charts of glucose forecasts: in three, the insulin system's forecast shoots up to its cap while glucose falls and the learned model follows it; in the other three, glucose keeps rising after carbs and only the system's forecast sees it coming"
thumbnail: /images/projects/aaps-card.jpg
images:
  - /images/projects/aaps-card.jpg
badges:
  - "Python"
  - "Machine learning"
  - "scikit-learn"
  - "PyTorch"
  - "Google Cloud"
links:
  - icon: fab fa-github
    name: "View the code on GitHub"
    url: https://github.com/AndersHenriksen-dev/aaps_automation
tags: ["Machine learning", "Time series", "Health data", "Python", "Forecasting"]
showInHome: true
toc: true
---

I have type 1 diabetes, and my insulin pump is run by AAPS, an open-source system that forecasts my blood glucose every 5 minutes and doses insulin from that forecast. I set out to see whether a model that learns from my own data could forecast better. On 10 weeks of my data it does: 31% lower error at 60 minutes, and better in every test week.

<!--more-->

This is a research analysis of my own data. It is not a medical device, and nothing here should be used to make dosing decisions.

## What it does

AAPS (AndroidAPS) runs the OpenAPS oref algorithm on my phone, talking to an Omnipod Dash pump and a Dexcom G7 sensor. Every loop it projects four glucose curves from insulin on board, carbs on board and recent deviations, then doses from them. Those curves are hand-built with fixed shapes and never learn from past data, which leaves room for a model that does.

The project collects everything AAPS records, rebuilds the insulin it actually delivered, and compares learned models with oref's own forecast at exactly the same moments: 20,294 sensor readings, 9,000+ treatments and 19,217 loop runs with oref's forecast attached, all in mmol/L.

![One day of my data: glucose against the 3.9 to 10 target range, carbs and boluses as entered, and the basal insulin AAPS delivered against what the profile scheduled](/images/projects/aaps-day.png)

## Results

The main test is walk-forward: before each of 7 test weeks, the model is retrained on all data before that week, so every forecast is made without seeing the future.

| Measure | AAPS (oref) | Learned model |
|---|---|---|
| Error at 30 minutes (mean absolute, mmol/L) | 1.08 | **0.83** |
| Error at 60 minutes | 1.88 | **1.30** |
| Error at 120 minutes | 2.45 | **1.60** |
| Test weeks where the model is better | | **7 of 7**, at every horizon |
| Average bias at 60 minutes | **0.8 too low** | 0.07 |
| Warning of a low within 30 minutes (PR AUC) | 0.69 | **0.84** |
| Warning of a low before it starts, 30 minutes (PR AUC) | 0.46 | **0.53** |

![Forecast error by horizon for AAPS, the learned model and a forecast that assumes glucose stays flat: the learned model's error is 23% to 35% lower than AAPS's at every horizon](/images/projects/aaps-error-by-horizon.png)

![The 60-minute error for each of the 7 test weeks: the learned model is better than AAPS in every week, by 26% to 35%](/images/projects/aaps-weekly.png)

oref's forecast is, on average, no better than assuming glucose stays where it is, and it runs low. That is by design: it errs towards predicting lows so the pump doses carefully. It also clips its curves at 2.2 and 22.3 mmol/L.

![Forecast against measured glucose 60 minutes later: AAPS's cloud sits below the diagonal with a band of forecasts stuck at 2.2, while the learned model's cloud is centred on it](/images/projects/aaps-forecast-vs-actual.png)

## Where they disagree

The most telling picture is the moments where the two forecasts differ most. When glucose has just risen fast, oref extrapolates the rise until its 22.3 mmol/L cap, while glucose actually turns. When glucose keeps rising after a meal, oref's carb model sees it coming, and the learned model, trained to be right on average, turns too early.

![Six forecasts side by side: in the top row oref's curve shoots to 22.3 while glucose falls and the learned model follows it; in the bottom row glucose keeps rising after carbs and only oref's curve follows](/images/projects/aaps-disagreements.png)

I also use carb entries for more than meals. After fatty or protein-heavy food my insulin need rises for hours, so I enter extra carbs in steps to cover it. AAPS has no idea of that, and those stepwise series of 3 or more entries are where oref fails hardest: it forecasts about 2 mmol/L too low for hours.

![Average 60-minute forecast error by hours since a carb episode started: after a series of 3 or more entries AAPS stays up to 2.2 mmol/L too low for 4 hours, while the learned model stays close to zero](/images/projects/aaps-bias-after-carbs.png)

## The data

![The spread of 10 weeks of glucose readings by time of day: median, 25 to 75% and 5 to 95% bands against the target range](/images/projects/aaps-glucose-profile.png)

![Median glucose for every hour of every day as a heatmap: grey in range, red low, blue high; highs cluster in the afternoon and evening](/images/projects/aaps-heatmap.png)

## What I learned

- **A safety algorithm is not a forecaster.** oref's curves are built to dose carefully, not to be right on average. Judged as a forecast, it loses to "glucose stays flat" at 60 minutes. That is not a flaw in AAPS, but it is the gap a learned model can fill.
- **One test split can mislead.** My first 3-week test set happened to be harder than average. Retraining and testing week by week gave a steadier and more honest result, and it showed how often the model wins, not just by how much.
- **A perfect score is a bug.** My first low-glucose classifier scored a perfect 1.000. The answer had leaked into its inputs. I now have tests that check no input ever uses information from after the forecast.
- **Look at the cases, not just the averages.** Plotting the biggest disagreements showed two of the model's "best wins" were sensor errors: values below the sensor's 39 mg/dL floor, such as a flat 25 for 45 minutes followed by an impossible jump. I now drop the 63 such readings.
- **Missing information beats more features.** Describing each carb series in detail made no difference: the 60-minute error went from 1.297 to 1.309 and was worse in 5 of 7 weeks. What drives those long rises is how much fat and protein I ate, and that is not recorded anywhere.
- **The model leans on glucose history first.** Shuffling the sensor history raises the error by 0.55 mmol/L, more than every other input group together. Sequence models (GRU and TCN) beat gradient boosting at 60 minutes by only 0.02 to 0.03 mmol/L on 10 weeks of data.

![How much the 60-minute error rises when each group of inputs is shuffled: glucose history 0.55, AAPS's insulin and carbs on board 0.16, basal 0.13, time of day 0.08, the rest 0.03 or less](/images/projects/aaps-feature-importance.png)

## Where it breaks

- **Predicting the start of a low is still hard.** The classifier beats AAPS overall, but for lows that have not started yet it is ahead in 6 of 7 weeks at 30 minutes and only 4 of 7 at 60 minutes.

![Precision and recall for warning of a low before it starts, at 30 and 60 minutes: the classifier is above AAPS's curve at 30 minutes and level with it at 60](/images/projects/aaps-low-warnings.png)

- **One person, 10 weeks.** The model is trained on my body and my habits. It says nothing about anyone else, and more data will change the numbers.
- **Meals with lots of fat and protein.** Both forecasts make their largest errors after them, because the cause is not in the data.
- **Not a dosing tool.** A better forecast on average is not the same as safer dosing. oref's caution around lows is there for a reason.

## How it works

- **Data:** AAPS uploads to my own Nightscout server on a free-tier Google Cloud VM. A Python pipeline mirrors it through the API, converts everything to mmol/L and rebuilds the basal insulin delivered minute by minute from the temp basals and my profile.
- **Models:** gradient boosting (scikit-learn) on glucose history, insulin, carbs and AAPS's own state; GRU and TCN networks (PyTorch) on 3 hours of 5-minute sequences; a classifier for lows within 30 or 60 minutes; and quantile forecasts with conformal calibration.
- **Evaluation:** every method is scored on the same loop runs and targets as oref's forecast, with walk-forward weekly tests, and an ablation for each idea that did not work.
- **Automation:** a Windows scheduled task syncs new data and retrains everything once a week, catches up after missed runs, and warns if AAPS stops uploading.

The repo has the code, the results behind every number here, and 16 figures.
