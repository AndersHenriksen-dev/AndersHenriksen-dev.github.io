---
title: "Food Classifier on Azure"
date: 2026-11-08
author: "Anders Henriksen"
description: "A food image classifier run as a measured service on Azure for 24 hours: 91.66% on the Food-101 test set, 507,121 requests with 0 failures in a 20-hour load test, and a cost limit built into the infrastructure."
image: /images/projects/fruity-card-dishes.jpg
imageAlt: "66 food photos in a grid, each named, from macarons and waffles to hamburgers and hot dogs, placed by how alike the model finds the dishes"
thumbnail: /images/projects/fruity-card-dishes.jpg
images:
  - /images/projects/fruity-card-dishes.jpg
badges:
  - "Python"
  - "MLOps"
  - "Azure"
  - "Terraform"
  - "Docker"
links:
  - icon: fab fa-github
    name: "View the code on GitHub"
    url: https://github.com/AndersHenriksen-dev/fruity
tags: ["MLOps", "Azure", "Terraform", "Computer vision", "Python"]
showInHome: true
toc: true
---

I took a food image classifier from a university group project and turned it into a service I could measure: trained and chosen by rules set in advance, served without PyTorch, deployed to Azure with Terraform, load tested for 20 hours, and taken down again by a timer. The model is ordinary on purpose. The point is everything around it.

<!--more-->

The starting point was the group project for the DTU course 02476 Machine Learning Operations, by William Diedrichsen Marstrand, Karl Byberg Ulbæk, August Semrau Andersen and me. It no longer ran, and its one result, about 76%, was on our own split at 100 by 100 pixels. The hand-in is tagged `dtu-2024` in the repo, and everything described here I added afterwards.

![The group project in 2024 beside the fork now: data, model, serving, cloud, CI and monitoring](/images/projects/fruity-then-and-now.svg)

## What it does

You upload a photo of food and get the three most likely of 101 dishes, with a probability for each. A demo page in Streamlit calls an API in FastAPI, which runs the model with ONNX Runtime. On Azure, both ran as Container Apps for 24 hours, reachable only from my own address, and then a timer removed them.

## Results

| Measure | Result |
|---|---|
| Test accuracy, `convnext_tiny` as ONNX | **91.66%** top-1 on 25,250 images, 98.78% top-5 |
| Without deep learning, same validation images | **12.84%** with colour, shape and texture features, against 88.13% for the model |
| Photos from outside Food-101, one per dish | **90 of 101** right, 100 of 101 in the top 5 |
| Steady load, 10 users for 20 hours | **507,121 requests, 0 failures**, p95 1,000 ms |
| One API replica at 0.5 vCPU | about **3 requests per second** before requests queue |
| Cold start, from zero replicas | median **47.9 seconds** |
| Memory over 20 hours | **43%** of the limit in the first hour and the last |

With 101 classes, guessing is right about 1% of the time, not the 50% many people expect. The best published method without deep learning reached 50.76% on the same test set, so that is the fair line to compare with.

What Azure measured over the 24 hours, with the 20-hour steady load shaded:

![Four charts of the API over 24 hours on Azure: about 420 requests per minute during a 20-hour steady load, average response time near 400 ms, 2 replicas for almost all of it, and memory flat at 43% of the limit](/images/projects/fruity-cloud.png)

## What the model sees

To show the model at work without republishing Food-101's photos, which may only be used for research, I took one openly licensed photo per dish from Wikimedia Commons, checked each by eye and credited every photographer in the [repo](https://github.com/AndersHenriksen-dev/fruity/blob/main/docs/images/photos/CREDITS.md). The model named 90 of the 101 right. Here is every ninth dish, so the sample was not picked by how well it did:

![Twelve food photos, each with the model's three first answers and their probabilities, including clam chowder mistaken for chicken curry](/images/projects/fruity-gallery.jpg)

And all 101 dishes, placed by how alike the model finds them. Nobody told it which dishes belong together, yet desserts, soups and pasta, salads and fried food each end up in their own region:

![All 101 dishes as photos on a grid, with similar dishes next to each other](/images/projects/fruity-dish-map.jpg)

## What I learned

- **Fix the rule before the results.** I committed the rule for choosing a model before training any: the smallest model within 3 points of the best on validation. It picked `convnext_tiny` over a model 7 times larger that scored 2 points more, and I could not argue my way to a different answer afterwards.
- **A test set is used once.** Every choice was made on validation data. The test set was opened once, by a command that first checks the exported model matches PyTorch, and that refuses to read it a second time.
- **Azure has no spending limit for a pay-as-you-go subscription, and its budgets are late.** Cost data arrives 8 to 24 hours late, and budgets check it every 24 hours. So the limit had to be built in: replica caps that bound compute per hour, a kill switch on a 24-hour timer inside Azure, an address allowlist, and a budget as the last layer.
- **A safety system you have not seen work is a hope.** Before relying on the kill switch, I ran it by hand. Checking Azure directly showed its timer was not linked to it at all, because each Terraform apply had replaced the runbook. A safety net that would never have fired looked fine in Terraform's output.
- **Scaling rules have thresholds that matter.** A second replica only starts when one has more than 10 requests in flight. At 10 users the service was slow on one replica, and at 20 it scaled, which made it faster.
- **Scaling to zero has a price.** Paying nothing while idle cost a median 47.9 seconds on the first request.

![The kill switch's two jobs in the Azure portal: one started by hand to test it, and one started by the 24-hour timer, both completed](/images/projects/fruity-kill-switch.png)

## Where it breaks

- **Photos from elsewhere.** The test images were reviewed by hand. On 101 photos from outside the dataset it got 89% right, but one photo per dish is good to about 6 points either way, and the service has no drift detection to notice if its inputs change.
- **Small scale.** The load came from one machine. It says nothing about much larger traffic.
- **Cold starts.** Almost 48 seconds is long for a first visitor. A smaller image or one warm replica would help, at the cost of paying while idle.
- **The final cost is not known yet.** Azure had not reported the compute usage when I finished. Everything else it reported came to 0.0009 DKK, and the replica history puts the compute at about half of the monthly free grant. I will add the real figure when Azure reports it.

## How it works

![The architecture: a demo page and an API in Azure Container Apps, watched by Azure Monitor, with a kill switch runbook, and images, model and deploys from GitHub](/images/projects/fruity-architecture.svg)

- **Training:** four pretrained models from timm, trained with Lightning and Hydra on a local GPU, then a Weights & Biases sweep on the chosen one.
- **Serving:** the model is exported to ONNX and published as a GitHub release with a SHA-256 checksum. The image build refuses a file whose checksum differs, and the API needs no PyTorch.
- **Infrastructure:** Terraform for Azure Container Apps, Azure Monitor alerts and a dashboard. GitHub Actions signs in to Azure with a short-lived token, so no key is stored, and deploys only while a repository variable says so.
- **Measuring:** Locust for the load test, and a report generated from metrics saved out of Azure while the service ran.

![The Azure dashboard during the load stages: requests, response time, replicas scaling from 0 to 2, and memory](/images/projects/fruity-dashboard.png)

The repo has the code, the results behind every number here, and a study guide to how it works.
