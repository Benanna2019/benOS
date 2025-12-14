---
"_id": "cmdgpd6nx000007le3338g2e1"
title: "Functional Web Apps"
date: "2025-07-25"
slug: "functional-web-apps"
description: "Smaller functions and greater visibility with Inngest"
categories: ["Inngest", "FWA"]
author: "Ben Patton"
authorImage: "https://cdn.sanity.io/images/nfspldzq/production/3ceeda54221c7c0614ecc51f955c7be39a1da34e-512x512.jpg"
type: "Blog"
url: "functional-web-apps"
image: "https://media.istockphoto.com/id/1172217208/vector/lambda-greek-symbol.jpg?s=612x612&w=0&k=20&c=uJHKeN9oXrxaU8qEX3qwSzG3HPu3nowlfLNlupMkB5g="
---

This post is somewhat of a tribute to many things I love. One is the Architect/enhance.dev/Begin team who was acquired by Sanity to build out many awesome features for Sanity's Content Operating System. Another are the mentor's I've had along the way who have always opted for clarity and elegance in software design. And lastly, and most recently, Inngest. 

I always start out blog articles intending to be technical but they usually morph into sociotechnical content. Everything in my world is connected like the meme of red strings all across the board. So, as the Joker says, "Here...we...go!"

## What is a functional web app?

In the original understanding, as was made known to me by the team behind Architect (https://arc.codes) functional web apps are apps that are made up of "cloud functions", ie lambdas for the most part. The real differentiator of fwa's though is in the definition below. It is long but worth the read/understanding. 

> A different way to solve all this complexity is to move up the cloud vendor stack. A Functional Web App (FWA) is authored completely as single-responsibility cloud functions that can render HTML-first dynamically, incorporating the full-stack such as a managed database. FWA presentation and application logic is modelled in the backend with pure cloud functions. These *cloud functions* talk to a *managed database* in the same network. The application is *deterministically deployed* with Infrastructure as Code to guarantee the **entire app** is always completely reproducible to any version at any time. The resulting logical architecture of an FWA is identical to the physical architecture eliminating many delivery and maintenance headaches. The code you write is the same as the code that is deployed; all while achieving high availability with perfect 100% utilization.

### How we currently work

Many people, I believe, would say the above FWA approach feels like a pipe dream. The idea that all of your infrastructure can be replicated locally and be deterministic is so foreign and why so many 'test in prod'. 

The architect team, since probably 2017-2018 had queues, lambdas, sockets (not sure when this arrived but early), dynamodb, s3 and other aws features working locally that could be cloned through their .arc manifest file. It was a manifest of cloud resources with local emulation and you knew exactly what you would get when you deployed. 

Locally environments are often neglected cause services used don't provide good ways of getting the same deterministic result locally as you do in production. 

In architect's manifest file the resources outlined would compile to cloud formation which they like to describe as your package.json file. A file describing resources need for your app to run. 

## Inngest

Something recently clicked for me when reading more about Inngest's *steps* and made a connection to FWA's (I'm in process of converting all this blog stuff to custom things so the process of image uploads will be much nicer, ie there will be images here in the future).

It is common for AI, I mean developers to write endpoints that handle lots of logic. There will be long trails of functions and each function may be doing large db operations or handling a signficant piece of business logic and all of this is put into one or many try catch blocks. The issues tend to increase, and so do monitoring bills. Why? Because finding the specific reason for the error means you have to wade neck deep into many large complicated areas in the code. 

Inngest gracefully leads developers to break up functionality into what I've been referring to as Single Responsibility Steps. Obviously I did not come up with the idea of single responsibility but steps encourage you to do that. Why? Because a step in Inngest gives you: 

- Clarity and readability
- Precision with errors
- Retries from _point of failure_
- Easily testable 

Single responsibility is another piece of FWA's. FWA's want to be broken up into the smallest executable task for visibility and tracing. Mentally you can think of this as breaking each express handler into a separate Lambda function. That way each route is handling one piece of logic and we can narrow down what went wrong very quickly

Steps encourage this behavior with business logic and subsequent events that follow. Instead of doing massive chained together operations and if that block fails having to try digging through, a steps encourage you to wrap each piece of logic in a step (clearly images would be very helpful right now).

### Local Dev

One of the major pieces of FWA's is the ability to replicate the production environment locally and having a local dev server to interact with. The benefits are clear. You don't have to use a remote project. You don't have to pay for resources used. What you write locally will be what is in production. 

Inngest gives you a nice local development environment to test functions against as well and you get the full functionalty of Inngest. This is a big deal cause it gets us over that "well it worked on my computer issue." 

## Developer Experience

What makes for good developer experience? I have grown in my belief on this over the years. Honestly, and maybe embarassingly so, it used to just be in the realm of feelings. If it felt good I would thing it was good DX. A lot has been said on the pitfall's of solely looking at developer experience as the metric. So I want look at a different metric that I heard one of Inngest's founders, Tony, mention. 

Time To Value or in my longer less elegant phrasing, Time To First Win. 

DX must be in service of UX. We care about users and end value. Often times libraries will promise incredible value but the experience of using them and seeking to deliver their value is like non-visible thorns on a flower. 

FWA's and like minded developer tools that gently lead developers in good patterns and practices, are a delight to use, and give DX that serves UX are a breath of fresh air. 

## Conclusion

There is definitely more to say and more examples to give in images and code samples. Connecting the dots between tools and design patterns often gives particular insight as to why these things delight us. 
