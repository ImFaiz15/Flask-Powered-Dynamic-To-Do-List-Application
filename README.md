# ✅ Flask To-Do List App
### Assignment 4 — Web Programming with Python & JavaScript Lab (SEC035)
**B.Tech Computer Science and Engineering | SOET**

---

## 📌 Overview

A full-stack **Dynamic To-Do List Application** built with:

- **Backend:** Python 3 + Flask (REST API)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Data Storage:** In-memory Python list (resets on server restart — intentional)

Users can **Add, Edit, Delete, Toggle Complete, Filter, and Prioritise** tasks — all without any page reload, using JavaScript Fetch (AJAX) calls to the Flask REST API.

---

## 👤 Student Details

| Field             | Value                        |
|-------------------|------------------------------|
| **Student Name**  | ____________________________  |
| **Roll Number**   | ____________________________  |
| **Submission Date** | __________________________  |
| **Faculty**       | Ms. Mansi Kajal, Asst. Professor |

---

## 📁 Project Structure

```
todo_app/
├── app.py                  # Flask app — all routes & in-memory task store
├── requirements.txt        # Python dependencies (Flask only)
├── README.md               # This file
├── templates/
│   ├── base.html           # Shared layout (navbar, head, footer)
│   └── index.html          # Main To-Do page (extends base.html)
└── static/
    ├── css/
    │   └── style.css       # All application styles (9 sections)
    └── js/
        └── app.js          # All JavaScript — Fetch calls & DOM logic
```

---

## ⚙️ Requirements

- Python 3.x
- Flask

Install Flask with:

```bash
pip install flask
```

Or install from the requirements file:

```bash
pip install -r requirements.txt
```

---

## 🚀 How to Run

### 1. Clone or Extract the Project

Extract `todo_app.zip` into a folder of your choice.

### 2. Open the Project in VS Code

```
File → Open Folder → select the todo_app folder
```

### 3. Open the Integrated Terminal

Press **Ctrl + `** (backtick)

### 4. Install Dependencies

```bash
pip install flask
```

### 5. Start the Flask Server

```bash
python app.py
```

> On Mac/Linux use `python3 app.py` if needed.

### 6. Open in Browser

```
http://127.0.0.1:5000/
```

Press **Ctrl + C** in the terminal to stop the server.

---

## 🔗 API Endpoints

| # | Method | Route | Description | Status Code |
|---|--------|-------|-------------|-------------|
| 1 | `GET` | `/` | Serve the main HTML page | 200 |
| 2 | `GET` | `/api/tasks` | Get all tasks (supports `?status=active\|completed`) | 200 |
| 3 | `POST` | `/api/tasks` | Create a new task `{title, description, priority}` | 201 |
| 4 | `PUT` | `/api/tasks/<id>` | Update task fields | 200 |
| 5 | `PATCH` | `/api/tasks/<id>/toggle` | Toggle completed status | 200 |
| 6 | `DELETE` | `/api/tasks/<id>` | Delete a task | 204 |

### Example — Create a Task (POST)

**Request:**
```json
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete Assignment 4",
  "description": "Submit before the deadline",
  "priority": "high"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "title": "Complete Assignment 4",
  "description": "Submit before the deadline",
  "priority": "high",
  "completed": false,
  "created_at": "2025-01-15 10:30:00"
}
```

---

## 🎯 Features

### Core Features
- ➕ **Add Task** — title (required), description (optional), priority (Low / Medium / High)
- ✏️ **Edit Task** — inline editing inside the task card, no page reload
- 🗑️ **Delete Task** — smooth slide-out animation on removal
- ✅ **Toggle Complete** — strikethrough title, counter updates instantly
- 🔍 **Filter Tasks** — All / Active / Completed views
- 🔢 **Live Counter** — Total / Active / Completed badge counts
- ⚠️ **Validation** — empty title shows inline error; no fetch sent
- 📱 **Responsive** — stacked layout on screens under 600px

### Bonus Features
- 🖱️ **Drag-to-Reorder** — HTML5 drag-and-drop to reorder task cards
- 💾 **localStorage Persistence** — tasks survive a browser page refresh
- 🗑️ **Clear All** — deletes all tasks at once with a confirmation dialog

---

## 🎨 CSS Sections (style.css)

| Section | Contents |
|---------|----------|
| Section 1 | Global Reset & CSS Variables (`:root`) |
| Section 2 | Layout & Base (body, navbar, container) |
| Section 3 | Input Panel (inputs, textarea, select, button) |
| Section 4 | Filter Bar (button group, active state) |
| Section 5 | Task Counter (colour-coded badges) |
| Section 6 | Task Cards (priority borders, completed style) |
| Section 7 | Edit Mode (inline input fields, Save/Cancel buttons) |
| Section 8 | Animations (`@keyframes fadeIn`, slide-out on delete) |
| Section 9 | Responsive (`@media` for screens < 600px) |

---

## 🧪 Test Scenarios

| # | Scenario | Expected Result |
|---|----------|-----------------|
| 1 | Add task with title + High priority | Card appears with red **High** badge |
| 2 | Add task with empty title | Inline error shown; no API call made |
| 3 | Click checkbox on a task | Strikethrough title; counters update |
| 4 | Edit title → Save | Card updates in place; no page reload |
| 5 | Delete a task | Card slides out; counter decrements |
| 6 | Click **Completed** filter | Only completed tasks shown; button highlighted |
| 7 | Delete all tasks | Empty-state message shown; counters show 0 |
| 8 | Resize to < 600px | Layout stacks vertically; remains readable |

---

## 📦 Submission Checklist

- [ ] Folder structure matches the assignment requirement
- [ ] `app.py` — Name, Roll No, and Date in header comment
- [ ] `app.js` — Name, Roll No, and Date in header comment
- [ ] `style.css` — Name, Roll No, and Date in header comment
- [ ] All 6 API routes working correctly
- [ ] All 7 JavaScript functions implemented
- [ ] All 9 CSS sections present with comments
- [ ] All 8 test scenarios passing
- [ ] No jQuery, Axios, Bootstrap, or Tailwind used
- [ ] Zip named as `RollNo_Assignment4.zip` (e.g. `22CSE042_Assignment4.zip`)
- [ ] `__pycache__/`, `*.pyc`, and `venv/` excluded from zip

---

## ⚠️ Notes

- Task data is stored **in-memory** — it resets every time you restart `python app.py`. This is intentional for this assignment.
- The **Bonus localStorage** feature saves tasks in the browser so they survive a *page refresh*, but not a server restart.
- Do **not** include `venv/` or `__pycache__/` in your submission zip.

---

## 📄 License

Submitted for academic purposes — B.Tech CSE, SOET.  
*Prepared by: Ms. Mansi Kajal, Assistant Professor, SOET*
