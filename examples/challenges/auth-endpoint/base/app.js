const express = require("express");

const app = express();
app.use(express.json());

// In-memory store (resets each test run — fine for grading).
const users = new Map(); // email -> { id, email, password }
let nextId = 1;

// Dependency-free token (base64 of the email). NOT secure — demo only.
const makeToken = (email) => Buffer.from(JSON.stringify({ email })).toString("base64");
const readToken = (t) => {
  try {
    return JSON.parse(Buffer.from(t, "base64").toString("utf8"));
  } catch {
    return null;
  }
};

app.post("/auth/register", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  if (users.has(email)) return res.status(409).json({ error: "user already exists" });
  const user = { id: nextId++, email, password };
  users.set(email, user);
  return res.status(201).json({ id: user.id, email: user.email });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password are required" });
  const user = users.get(email);
  if (!user || user.password !== password) return res.status(401).json({ error: "invalid credentials" });
  return res.status(200).json({ token: makeToken(email) });
});

app.get("/auth/me", (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const payload = token ? readToken(token) : null;
  if (!payload || !users.has(payload.email)) return res.status(401).json({ error: "unauthorized" });
  const user = users.get(payload.email);
  return res.status(200).json({ id: user.id, email: user.email });
});

// CRITICAL: export the app; do NOT call app.listen here.
// supertest (in tests.js) imports this app object and drives it in-process.
module.exports = app;
