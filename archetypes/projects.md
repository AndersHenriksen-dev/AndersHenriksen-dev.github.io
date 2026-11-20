---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
# Cards are ordered by weight, lowest first, not by date. 99 puts a new project last until you
# choose where it belongs; the others are spaced 10 apart so there is room between any two.
weight: 99
draft: true
author: "Anders Henriksen"
description: ""
image: /images/projects/{{ .File.ContentBaseName }}.png
badges:
  - "Python"
links:
  - icon: fab fa-github
    name: "View the code on GitHub"
    url: https://github.com/AndersHenriksen-dev/{{ .File.ContentBaseName }}
tags: []
showInHome: true
toc: true
---

One or two sentences on what the project is. The first part of the page becomes the summary on the project card.

<!--more-->

## What it does

## How it works

## Results

## What I learned

## Where it breaks
