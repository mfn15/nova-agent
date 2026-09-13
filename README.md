# Nova

A personal AI assistant you run from the terminal, backed by the Claude API. No SDK dependency -- it's a thin wrapper over `fetch` and the Messages API, kept deliberately small enough to read end-to-end in a few minutes.

## Features

- `nova ask "<question>"` -- one-shot question, printed and done.
- `nova chat` -- an interactive REPL that keeps conversation history for the session.
- `nova summarize <file>` -- summarizes a text file into a few bullet points.
- `nova note add/list/remove` -- a tiny personal notes store (`~/.nova/notes.json`), for jotting things down without leaving the terminal.

## Getting started

```bash
npm install
cp .env.example .env   # add your ANTHROPIC_API_KEY from console.anthropic.com
npm link                # optional: makes `nova` available globally
```

Then:

```bash
nova ask "What's a good default HTTP timeout for a public API?"
nova chat
nova summarize ./README.md
nova note add "Follow up with the client about the invoice"
nova note list
```

Without `npm link`, run any command as `node src/index.js <command>` instead.

## Why no SDK

The Messages API is a single HTTP endpoint with a simple JSON shape. Wrapping it directly in `src/claude.js` (about 30 lines) keeps the whole project's dependency count near zero and makes it obvious exactly what's being sent and received -- useful both as a personal tool and as a minimal reference for anyone integrating the API for the first time.

## Project structure

```
src/claude.js   Messages API wrapper (the only network call in the project)
src/notes.js    Local JSON-backed notes store
src/index.js    CLI entry point and command dispatch
```
