---
"_id": "cm4xkcr1b00000cl4bui3hr93"
title: "Zero Sync"
date: "2024-12-20"
slug: "zero-sync"
description: "Zero sync is a new sync engine from the team behind Replicache"
categories: ["Local First", "Sync Engine"]
author: "Ben Patton"
authorImage: "https://cdn.sanity.io/images/nfspldzq/production/3ceeda54221c7c0614ecc51f955c7be39a1da34e-512x512.jpg"
type: "Blog"
url: "zero-sync"
---

I have been trying to keep an up to date on the Local First space for the past few months. One of the technologies that was most exciting to me was Zero. 

Rather than giving a long list of everything that I admire about Zero and what Rocicorp is doing, I'll just simply share the differentiator(s) of Zero, in my mind. 

Zero is a sync engine that you can deploy on your own infrastructure. And Zero does partial sync. 

Those are the main two things that really excite me (to be clear the whole project excites me but I am saying differences between Zero and why I have waited and wanted to use it). 

Now, why is this a big deal? 

## Your Own Infrastructure

Inevitably Zero will support other databases, like mysql, sqlite, etc. Right now it only supports Postgres. But the beauty of running it on your own infrastructure is once you have it setup to where you can put it infront of your database, you now have a sync engine prebuilt that does the heavy lifting for you. 

I for one am stoked for the day we can do something like put it in front of a PlanetScale database. This is at the day job. Cause things just get so much easier with sync and I can start removing a lot of code for state management in our db and data fetching logic.

## Partial Sync

This is probably the biggest differentiator between Zero and other sync engines/approaches.

Partial sync, if I could sum it up in one sentence, is the ability of the sync engine to transfer partial amounts of data rather than the full set of data. Why is this a big deal? Full data sets are not bad up to a point. But for enterprise companies where you may have 100s of millions of rows in a database, or if a customer has millions of rows, you don't, you can't load all of that into the browser. So you need to have a way to partially load/sync data.

Zero handles this out of the box.

These are just a few things and I am looking forward to building a collaborative app wtih Zero for the [Local First Academy](https://localfirstacademy.com). 

If you make it this far, be on the lookout for some upcoming announcements from myself and/or Kevin Cunningham on BlueSky/LinkedIn. We have some cool/fun things around the 12 days of Christmas for Local First we will do. 

There is a gap in the Local First for learning resources and we are trying our best to step in and fill those gaps. 

If you have any questions, please reach out to me on [BlueSky](https://bsky.app/profile/benapatton.com) or [LinkedIn](https://www.linkedin.com/in/benjaminapatton/). 
