// app.js
// Author: [Your Name] | Roll No: [Your Roll Number] | Date: [Submission Date]
// Assignment 4 - Flask-Powered Dynamic To-Do List Application
// All Fetch calls use async/await with try/catch error handling.

"use strict";

// ── State ──────────────────────────────────────────────────────────────────
let currentFilter = "all";   // Track active filter
let allTasks      = [];      // Local cache for counter & drag-drop

// ── DOM helpers ───────────────────────────────────────────────────────────
const taskList   = () => document.getElementById("task-list");
const errorSpan  = () => document.getElementById("input-error");
const showError  = (msg) => { errorSpan().textContent = msg; };
const clearError = ()    => { errorSpan().textContent = ""; };

// Show a dismissible toast for fetch/network errors
function showToast(msg) {
  let toast = document.getElementById("error-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "error-toast";
    Object.assign(toast.style, {
      position: "fixed", bottom: "1.5rem", right: "1.5rem",
      background: "#dc2626", color: "#fff",
      padding: "0.75rem 1.25rem", borderRadius: "8px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      fontSize: "0.9rem", zIndex: 9999, maxWidth: "320px"
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = "none"; }, 4000);
}

// ── Load & Render Tasks ────────────────────────────────────────────────────

/**
 * loadTasks — fetch tasks from the API (with optional status filter)
 * and render them into #task-list. Also refreshes counter and nav badge.
 */
async function loadTasks(status = currentFilter) {
  const url = status && status !== "all"
    ? `/api/tasks?status=${status}`
    : "/api/tasks";

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const tasks = await res.json();

    // Cache full list for counter (always fetch all for accurate count)
    if (status === "all") {
      allTasks = tasks;
    } else {
      // Also refresh allTasks in background for accurate counters
      fetchAllForCounter();
    }

    renderTasks(tasks);
    updateCounter();
  } catch (err) {
    showToast("Could not load tasks. Is the Flask server running?");
    console.error(err);
  }
}

async function fetchAllForCounter() {
  try {
    const res = await fetch("/api/tasks");
    if (!res.ok) return;
    allTasks = await res.json();
    updateCounter();
  } catch (_) { /* silent */ }
}

/** Render an array of task objects into the DOM. */
function renderTasks(tasks) {
  const list = taskList();
  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No tasks yet! Add your first task above.</p>
      </div>`;
    return;
  }

  tasks.forEach(task => list.appendChild(createTaskCard(task)));
  initDragAndDrop(); // Bonus: attach drag events
}

/** Build and return a task card DOM element. */
function createTaskCard(task) {
  const card = document.createElement("div");
  card.className = `task-card priority-border-${task.priority} ${task.completed ? "completed" : ""}`;
  card.dataset.id = task.id;
  card.draggable = true; // Bonus: drag-drop

  card.innerHTML = `
    <input
      type="checkbox"
      class="task-checkbox"
      ${task.completed ? "checked" : ""}
      title="Toggle complete"
      onchange="toggleTask(${task.id})"
    />
    <div class="task-body">
      <div class="task-header">
        <span class="task-title">${escHtml(task.title)}</span>
        <span class="badge priority-${task.priority}">${task.priority}</span>
      </div>
      ${task.description
        ? `<div class="task-desc">${escHtml(task.description)}</div>`
        : ""}
      <div class="task-meta">Added: ${task.created_at}</div>
    </div>
    <div class="task-actions">
      <button class="btn btn-sm btn-edit"   onclick="editTask(${task.id})">✏️ Edit</button>
      <button class="btn btn-sm btn-delete" onclick="deleteTask(${task.id})">🗑️ Delete</button>
    </div>`;

  return card;
}

// ── Add Task ───────────────────────────────────────────────────────────────

/**
 * addTask — read input fields, validate, POST to /api/tasks,
 * clear fields, and reload the list on success.
 */
async function addTask() {
  clearError();
  const title       = document.getElementById("task-title").value.trim();
  const description = document.getElementById("task-description").value.trim();
  const priority    = document.getElementById("task-priority").value;

  // Client-side validation — no fetch sent if title is empty
  if (!title) {
    showError("⚠️ Title is required — please enter a task title.");
    document.getElementById("task-title").focus();
    return;
  }

  try {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      showError(err.error || "Failed to add task.");
      return;
    }

    // Clear input fields on success
    document.getElementById("task-title").value       = "";
    document.getElementById("task-description").value = "";
    document.getElementById("task-priority").value    = "medium";

    await loadTasks(currentFilter);
    saveToLocalStorage(); // Bonus
  } catch (err) {
    showToast("Network error — could not add task.");
    console.error(err);
  }
}

// Allow pressing Enter in the title field to add
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("task-title")
    .addEventListener("keydown", (e) => { if (e.key === "Enter") addTask(); });

  loadTasks("all");
  loadFromLocalStorage(); // Bonus
});

// ── Delete Task ────────────────────────────────────────────────────────────

/**
 * deleteTask — send DELETE /api/tasks/{id}; animate card out, then remove from DOM.
 */
async function deleteTask(id) {
  const card = document.querySelector(`.task-card[data-id="${id}"]`);
  if (card) card.classList.add("removing");

  try {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) throw new Error(`Delete failed: ${res.status}`);

    // Wait for CSS slide-out then remove
    setTimeout(() => {
      if (card) card.remove();
      // If list is now empty, show empty state
      if (taskList().querySelectorAll(".task-card").length === 0) {
        renderTasks([]);
      }
    }, 300);

    allTasks = allTasks.filter(t => t.id !== id);
    updateCounter();
    saveToLocalStorage(); // Bonus
  } catch (err) {
    if (card) card.classList.remove("removing");
    showToast("Could not delete task. Please try again.");
    console.error(err);
  }
}

// ── Toggle Task ────────────────────────────────────────────────────────────

/**
 * toggleTask — PATCH /api/tasks/{id}/toggle; update card CSS in-place.
 */
async function toggleTask(id) {
  try {
    const res = await fetch(`/api/tasks/${id}/toggle`, { method: "PATCH" });
    if (!res.ok) throw new Error(`Toggle failed: ${res.status}`);
    const updated = await res.json();

    // Update local cache
    const idx = allTasks.findIndex(t => t.id === id);
    if (idx !== -1) allTasks[idx] = updated;

    // Update card DOM without full re-render
    const card     = document.querySelector(`.task-card[data-id="${id}"]`);
    const checkbox = card?.querySelector(".task-checkbox");
    if (card) {
      card.classList.toggle("completed", updated.completed);
      if (checkbox) checkbox.checked = updated.completed;
    }

    updateCounter();
    saveToLocalStorage(); // Bonus
  } catch (err) {
    showToast("Could not toggle task. Please try again.");
    console.error(err);
  }
}

// ── Edit Task (inline) ─────────────────────────────────────────────────────

/**
 * editTask — replace task card body with editable inputs in-place.
 */
function editTask(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;

  const card = document.querySelector(`.task-card[data-id="${id}"]`);
  if (!card) return;

  // Replace card body content with editable fields
  const body    = card.querySelector(".task-body");
  const actions = card.querySelector(".task-actions");

  body.innerHTML = `
    <input
      type="text"
      id="edit-title-${id}"
      class="edit-field edit-title-field"
      value="${escHtml(task.title)}"
      placeholder="Task title"
    />
    <input
      type="text"
      id="edit-desc-${id}"
      class="edit-field"
      value="${escHtml(task.description)}"
      placeholder="Optional description"
    />
    <select id="edit-priority-${id}" class="edit-select">
      ${["low","medium","high"].map(p =>
        `<option value="${p}" ${task.priority===p?"selected":""}>${p.charAt(0).toUpperCase()+p.slice(1)}</option>`
      ).join("")}
    </select>`;

  actions.innerHTML = `
    <button class="btn btn-sm btn-save"   onclick="saveEdit(${id})">💾 Save</button>
    <button class="btn btn-sm btn-cancel" onclick="cancelEdit(${id})">✖ Cancel</button>`;

  document.getElementById(`edit-title-${id}`).focus();
}

/**
 * saveEdit — send PUT /api/tasks/{id} with updated values.
 */
async function saveEdit(id) {
  const titleEl    = document.getElementById(`edit-title-${id}`);
  const descEl     = document.getElementById(`edit-desc-${id}`);
  const priorityEl = document.getElementById(`edit-priority-${id}`);

  const title       = titleEl.value.trim();
  const description = descEl.value.trim();
  const priority    = priorityEl.value;

  if (!title) {
    titleEl.style.borderColor = "var(--danger-color)";
    titleEl.focus();
    return;
  }

  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority }),
    });
    if (!res.ok) throw new Error(`Save failed: ${res.status}`);
    const updated = await res.json();

    // Update local cache
    const idx = allTasks.findIndex(t => t.id === id);
    if (idx !== -1) allTasks[idx] = updated;

    // Re-render updated card in place
    const card    = document.querySelector(`.task-card[data-id="${id}"]`);
    const newCard = createTaskCard(updated);
    card.replaceWith(newCard);

    saveToLocalStorage(); // Bonus
  } catch (err) {
    showToast("Could not save changes. Please try again.");
    console.error(err);
  }
}

/** cancelEdit — restore original card without making any changes. */
function cancelEdit(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;
  const card    = document.querySelector(`.task-card[data-id="${id}"]`);
  const newCard = createTaskCard(task);
  card.replaceWith(newCard);
}

// ── Filter Tasks ───────────────────────────────────────────────────────────

/**
 * filterTasks — highlight selected button, set currentFilter, reload tasks.
 */
async function filterTasks(status) {
  currentFilter = status;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.status === status);
  });

  await loadTasks(status);
}

// ── Update Counter ─────────────────────────────────────────────────────────

/**
 * updateCounter — recalculate total/active/completed from allTasks cache
 * and update all counter elements plus the nav badge.
 */
function updateCounter() {
  const total     = allTasks.length;
  const completed = allTasks.filter(t => t.completed).length;
  const active    = total - completed;

  document.getElementById("count-total").textContent     = total;
  document.getElementById("count-active").textContent    = active;
  document.getElementById("count-completed").textContent = completed;
  document.getElementById("nav-counter").textContent     = total;
}

// ── Utilities ──────────────────────────────────────────────────────────────

/** Escape HTML special characters to prevent XSS. */
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ═══════════════════════════════════════════════════════════════════════════
// BONUS TASK — Drag-to-Reorder + localStorage Persistence
// ═══════════════════════════════════════════════════════════════════════════

// ── localStorage ──────────────────────────────────────────────────────────

/** Save the current allTasks array to localStorage. */
function saveToLocalStorage() {
  try {
    localStorage.setItem("flask_todo_tasks", JSON.stringify(allTasks));
  } catch (_) { /* quota exceeded or private mode */ }
}

/**
 * loadFromLocalStorage — on first load, restore tasks from localStorage
 * if they exist; otherwise the API fetch in loadTasks() already ran.
 */
function loadFromLocalStorage() {
  try {
    const stored = localStorage.getItem("flask_todo_tasks");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        allTasks = parsed;
        renderTasks(allTasks);
        updateCounter();
      }
    }
  } catch (_) { /* corrupt data */ }
}

// ── Clear All Button (creates dynamically if wanted) ─────────────────────

/**
 * clearAll — deletes every task after a confirm() dialog.
 * Sends individual DELETE requests for each task.
 */
async function clearAll() {
  if (!allTasks.length) return;
  const confirmed = confirm(`Delete all ${allTasks.length} task(s)? This cannot be undone.`);
  if (!confirmed) return;

  const ids = allTasks.map(t => t.id);
  try {
    await Promise.all(
      ids.map(id => fetch(`/api/tasks/${id}`, { method: "DELETE" }))
    );
    allTasks = [];
    renderTasks([]);
    updateCounter();
    localStorage.removeItem("flask_todo_tasks");
  } catch (err) {
    showToast("Could not clear all tasks.");
    console.error(err);
  }
}

// ── Drag-and-Drop Reorder ─────────────────────────────────────────────────

let dragSrc = null;

function initDragAndDrop() {
  const cards = taskList().querySelectorAll(".task-card");

  cards.forEach(card => {
    card.addEventListener("dragstart", (e) => {
      dragSrc = card;
      e.dataTransfer.effectAllowed = "move";
      card.style.opacity = "0.5";
    });

    card.addEventListener("dragend", () => {
      card.style.opacity = "";
      taskList().querySelectorAll(".task-card").forEach(c => c.classList.remove("drag-over"));
    });

    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      taskList().querySelectorAll(".task-card").forEach(c => c.classList.remove("drag-over"));
      card.classList.add("drag-over");
    });

    card.addEventListener("drop", (e) => {
      e.preventDefault();
      if (dragSrc && dragSrc !== card) {
        // Reorder in DOM
        const list    = taskList();
        const cards   = [...list.querySelectorAll(".task-card")];
        const srcIdx  = cards.indexOf(dragSrc);
        const destIdx = cards.indexOf(card);

        if (srcIdx < destIdx) {
          card.after(dragSrc);
        } else {
          card.before(dragSrc);
        }

        // Reorder allTasks to match new DOM order
        const newOrder = [...list.querySelectorAll(".task-card")]
          .map(c => parseInt(c.dataset.id));
        allTasks.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
        saveToLocalStorage();
      }
      card.classList.remove("drag-over");
    });
  });
}
