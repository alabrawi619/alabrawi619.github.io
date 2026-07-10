---
layout: post
title: "Notes on Force-Directed Graphs"
date: 2024-02-02 12:00:00 +0000
categories: [dev]
tags: [d3, design, dataviz]
excerpt: "A few things I learned wiring up D3's force simulation."
---

Force simulations feel like magic, but they're just a few forces stacked
together: charge, links, centering, and collision.

- **Charge** pushes nodes apart.
- **Link** pulls connected nodes together.
- **Collision** stops overlap.

Tune the strengths and the layout breathes.
