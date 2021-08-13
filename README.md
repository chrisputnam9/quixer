# Quixer

The hacker's bookmarks.

[Current POC](http://quixer.cmp.onl/)

## Inspiration
 - Save clicks, searching, loading, go directly to the info you want
 - Quicksilver or Alfred for the web
 - Custom Search Engines with useful defaults and syncing
 - DuckDuckGo Bangs with better discovery, usability, and customization

## Vision for 1.0 Milestone
[See Github Milestone](https://github.com/chrisputnam9/quixer/milestone/4)

## Contributing Default Services
New default service suggestions are welcome via [issue](https://github.com/chrisputnam9/quixer/issues/new) or pull request of [default-config.js](https://github.com/chrisputnam9/quixer/blob/master/src/data/default-config.js).

Suggestions will be evaluated based on:
 - Popularity
 - Usefulness
 - Comfort
 - Creativity / Uniqueness
 - Whim

Basically, the services built-in will aim to be the core, most popular, most useful, and demonstrate the capabilities of Quixer. Anything else can be added/installed by users on-demand.

## Full Local Development Setup
This will not be needed for most contributors (ie. not needed just to contribute a service - test that in config import instead)
 1. Install [Node](https://nodejs.org/en/)
 1. Install [Caddy](https://caddyserver.com/)
 1. Install [mkcert](https://github.com/FiloSottile/mkcert)
 1. Add line to hosts file
    `127.0.0.1 quixer.dev`
 1. Run `mkcert -install` to set up local CA
 1. Run `mkcert quixer.dev localhost`
 1. Move the newly created files to:
    - dev/ssl/quixer.dev.pem
    - dev/ssl/quixer.dev-key.pem
 1. Copy .env.sample to .env and fill in details as needed
    - Create a new Google Drive API project for yourself - "Quixer DEV" to use in development - keep the API key secret, fill in details in .env file
 1. Run `npm install`
 1. Follow the dev workflow steps

### Optional
 1. Set up your text editor. [Steps for vim](https://codechips.me/vim-setup-for-svelte-development/)

## Development Workflow
 1. `npm run dev` in one terminal tab or screen buffer
 1. `caddy run` in another terminal tab or screen buffer
 1. Visit https://quixer.dev in browser
