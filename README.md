![Careful Chat Logo](/docs/logo.png)

## Overview

This Messenger System allows you to chat with team members on the monday.com platform. It builds on top of monday APIs and is available in the monday.com marketplace soon.

This app was developed for the monday apps challenge. It runs soley on monday.com infrastructure and renders as a board view.

[![Button](https://dapulse-res.cloudinary.com/image/upload/f_auto,q_auto/remote_mondaycom_static/uploads/Tal/4b5d9548-0598-436e-a5b6-9bc5f29ee1d9_Group12441.png)](https://auth.monday.com/oauth2/authorize?client_id=5712597f896dd54767f00d6849af909e&response_type=install)

### Features

- Close to Realtime updates
- Unread Message functionality
- Emojis
- Giphy Integration
- Conversation Starter Suggestions
- Dark Mode
- Notification System
- Great UX for typing, tabbing with smart local storage caching of settings and messages.

For the App challenge following things were important to me:

- **Sustainability**: I didn’t want to use any kind of infrastructure that needed external hosting or any other services that needed attention. The application should live in monday.com only, no other services involved.
- **Robust & Simple**: The result of the project should be a finished, simple and lovable product incl. zero config setup, this will be the reason why many people will try it.
- **Challenge myself**: I know some reactJS, but I have never built a messenger - it is important that in terms of UX the messaging experience is close to other messengers.

Core functionality of this app is the `MondayChatDataLayer.js`, which abstracts Database functionality into a parallel client side API processing. The monday storage API is a key_value storage, that is requested via HTTP requests, therefor parallel data requesting was part of ensuring a performant and good UX for the messaging experience.

## Prerequisites

This is an application that runs only on monday.com, so before installing please make sure you know how to create an app on monday.com. You find more information on their [developer platform](https://monday.com/developers/apps/intro).

## Installation

Please make sure you have the latest Version of [nodeJs](https://nodejs.org/en/download/) & [npm](https://www.npmjs.com/get-npm) installed.

```bash
git clone git@github.com:flobauer/monday_messenger.git
cd monday_messenger
npm install
```

You can now run your app with

```bash
npm start
```

You can also expose the App with [ngrok](ngrok.io), this will be vital for development because the app only runs in monday.com developer Context.

A quick Guide through their process:

1. Open monday.com, login to your account and go to a "Developers" section.
2. Create a new "You name it App"
3. Open "OAuth & Permissions" section and add `me:read`, `users:read`, `notifications:write` (experimental) scope
4. Open "Features" section and create a new "Boards View" feature
5. Open "View setup" tab and fulfill in "Custom URL" field your ngrok public URL, which you got previously (f.e. https://021eb6330099.ngrok.io)
6. Click "Preview button"
7. The messenger is up and running!

## Deployment

1. Run script `npm run build`
2. Zip your "./build" folder
3. Open "Build" tab in your Feature
4. Click "New Build" button
5. Click "Upload" radio button and upload zip file with your build
6. Go to any board and add your just released view
7. Enjoy!

## Possible new features

- Group Chat possibility (Architecture allows it, add new Data type that stores members)
- Security (Talk to monday.com security team to ask for permitted storage API requests, so that "hackers" cannot read messages between people when knowing their UserIds)
- Notification System: I currently need an ItemId (can be configured in settings) to guide my notification -> discussion: [monday community](https://community.monday.com/t/notification-handling-via-graphql/13730/2)

## Architecture

As I have no experience in developing messenger systems, especially not on key_value data stores I am very certain that the Design has flaws. I think the structure as it is will work well until ~1000 sent or recieved messages between two people are reached. The bandwith would request pagination, which we already have a place for. I thought about chunking the message streams between people when they get too big and load them when requested (scrolled up).

Some general principles:

![System Diagram of Data flows](/docs/arch1.png)

To avoid data corruption i designed writing processes in a way, that only one entity is allowed to write on a key_value store. Only the unread chat container of people can be written to by multiple people. If the event that two different entities are written on the list at the same time, no message will be lost, just an unread status might be lost which will be updated for the next message nevertheless.

![System Diagram of Data flows](/docs/arch2.png)

![System Diagram of Data flows](/docs/bundle.png)
