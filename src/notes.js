// A tiny personal notes store, kept in the user's home directory so notes
// persist across projects/sessions. Deliberately a flat JSON file, not a
// database -- this is a personal CLI tool, not a multi-user service.
const fs = require('fs');
const path = require('path');
const os = require('os');

const NOVA_DIR = path.join(os.homedir(), '.nova');
const NOTES_FILE = path.join(NOVA_DIR, 'notes.json');

function ensureStore() {
  if (!fs.existsSync(NOVA_DIR)) fs.mkdirSync(NOVA_DIR, { recursive: true });
  if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, '[]');
}

function loadNotes() {
  ensureStore();
  return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
}

function addNote(text) {
  const notes = loadNotes();
  const note = { id: notes.length ? notes[notes.length - 1].id + 1 : 1, text, created_at: new Date().toISOString() };
  notes.push(note);
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
  return note;
}

function removeNote(id) {
  const notes = loadNotes();
  const filtered = notes.filter(n => n.id !== Number(id));
  fs.writeFileSync(NOTES_FILE, JSON.stringify(filtered, null, 2));
  return filtered.length !== notes.length;
}

module.exports = { loadNotes, addNote, removeNote, NOTES_FILE };
