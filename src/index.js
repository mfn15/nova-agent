#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const { sendMessage } = require('./claude');
const { loadNotes, addNote, removeNote } = require('./notes');

const SYSTEM_PROMPT = 'You are Nova, a concise, helpful personal assistant running in a terminal. Keep answers direct and skip unnecessary preamble.';

async function cmdAsk(question) {
  if (!question) return console.error('Usage: nova ask "<question>"');
  const reply = await sendMessage([{ role: 'user', content: question }], { system: SYSTEM_PROMPT });
  console.log(reply);
}

async function cmdChat() {
  console.log("Nova chat -- type 'exit' or Ctrl+C to quit.\n");
  const history = [];
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'you> ' });
  rl.prompt();
  rl.on('line', async line => {
    const input = line.trim();
    if (!input) return rl.prompt();
    if (input === 'exit') return rl.close();

    history.push({ role: 'user', content: input });
    try {
      const reply = await sendMessage(history, { system: SYSTEM_PROMPT, maxTokens: 1024 });
      history.push({ role: 'assistant', content: reply });
      console.log(`nova> ${reply}\n`);
    } catch (e) {
      console.error(`Error: ${e.message}\n`);
    }
    rl.prompt();
  });
  rl.on('close', () => { console.log('\nGoodbye.'); process.exit(0); });
}

async function cmdSummarize(filePath) {
  if (!filePath) return console.error('Usage: nova summarize <file>');
  if (!fs.existsSync(filePath)) return console.error(`File not found: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8').slice(0, 50000); // keep well under context limits
  const reply = await sendMessage(
    [{ role: 'user', content: `Summarize the following file in a few bullet points:\n\n${content}` }],
    { system: SYSTEM_PROMPT, maxTokens: 512 }
  );
  console.log(reply);
}

function cmdNoteAdd(text) {
  if (!text) return console.error('Usage: nova note add "<text>"');
  const note = addNote(text);
  console.log(`Saved note #${note.id}.`);
}

function cmdNoteList() {
  const notes = loadNotes();
  if (!notes.length) return console.log('No notes yet.');
  notes.forEach(n => console.log(`#${n.id} [${n.created_at.slice(0, 10)}] ${n.text}`));
}

function cmdNoteRemove(id) {
  if (!id) return console.error('Usage: nova note remove <id>');
  console.log(removeNote(id) ? `Removed note #${id}.` : `No note with id ${id}.`);
}

function printHelp() {
  console.log(`Nova -- a personal AI assistant for your terminal.

Usage:
  nova ask "<question>"        One-shot question, printed and done.
  nova chat                    Interactive conversation (keeps context until you exit).
  nova summarize <file>        Summarize a text file.
  nova note add "<text>"       Save a personal note.
  nova note list                List all saved notes.
  nova note remove <id>        Delete a note by id.

Setup:
  Set ANTHROPIC_API_KEY in your environment or a .env file (see .env.example).
`);
}

async function main() {
  const [, , cmd, ...rest] = process.argv;
  try {
    switch (cmd) {
      case 'ask': return await cmdAsk(rest.join(' '));
      case 'chat': return await cmdChat();
      case 'summarize': return await cmdSummarize(rest[0]);
      case 'note':
        if (rest[0] === 'add') return cmdNoteAdd(rest.slice(1).join(' '));
        if (rest[0] === 'list') return cmdNoteList();
        if (rest[0] === 'remove') return cmdNoteRemove(rest[1]);
        return printHelp();
      default:
        return printHelp();
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exitCode = 1;
  }
}

main();
