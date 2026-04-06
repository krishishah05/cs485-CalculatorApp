# CS 485 — Calculator App

A full-stack calculator built with **React** (frontend) and **Node.js / Express** (backend).  
The frontend builds an expression string as the user presses buttons and sends it to the backend for evaluation when `=` is pressed.

---

## Features

- All standard buttons: `0–9`, `.`, `+`, `-`, `×`, `÷`, `%`, `=`, `+/-`, `AC`, `⌫`
- Expression string displayed live at the top as buttons are pressed
- `AC` clears the entire expression; `⌫` removes the last character
- `+/-` negates the last number in the expression
- `%` converts a number to its decimal equivalent (`25%` → `0.25`)
- Backend evaluates the expression via a single public function: `calculate(string) → string`

---

## Project Structure

```
calculator-app/
├── backend/
│   ├── server.js        # Express server — exposes POST /calculate
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx      # Calculator UI
│   │   └── App.css      # Styling
│   └── package.json
└── test_calculator.js   # 1000-test suite (fixed + random expressions)
```

---

## Getting Started

### 1. Backend (port 3001)

```bash
cd backend
npm install
node server.js
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Backend API

### `POST /calculate`

**Request**
```json
{ "expression": "3+5×2" }
```

**Response**
```json
{ "result": "13" }
```

**Supported operators:** `+` `-` `×` `÷` `%`  
Returns `"Error"` for invalid or non-finite expressions.

---

## Running the Tests

```bash
node test_calculator.js
```

Runs 20 fixed regression cases followed by random expressions until **1000 consecutive correct answers** are achieved.  
All 1000 pass with 0 failures.

```
═══════════════════════════════════════════════════════
  ✅  1000 consecutive correct answers achieved!
  Total tests : 1000
  Failures    : 0
═══════════════════════════════════════════════════════
```
