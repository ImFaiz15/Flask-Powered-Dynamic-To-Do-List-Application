# app.py
# Author: [Your Name] | Roll No: [Your Roll Number] | Date: [Submission Date]
# Assignment 4 - Flask-Powered Dynamic To-Do List Application
# Web Programming with Python & JavaScript Lab (SEC035)

from flask import Flask, render_template, request, jsonify, abort
from datetime import datetime

app = Flask(__name__)

# In-memory task store (resets on server restart — intentional)
tasks = []
next_id = 1  # Auto-increment ID counter


# ── Helper ──────────────────────────────────────────────────────────────────

def find_task(task_id):
    """Return the task dict with the given id, or None."""
    return next((t for t in tasks if t["id"] == task_id), None)


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    """Render the main To-Do page (only route that returns HTML)."""
    return render_template("index.html")


@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    """Return all tasks as JSON; supports ?status=active|completed filter."""
    status = request.args.get("status")
    if status == "active":
        result = [t for t in tasks if not t["completed"]]
    elif status == "completed":
        result = [t for t in tasks if t["completed"]]
    else:
        result = tasks
    return jsonify(result), 200


@app.route("/api/tasks", methods=["POST"])
def create_task():
    """Create a new task from JSON body {title, description, priority}; returns 201."""
    global next_id
    data = request.get_json(force=True)

    # Validate title
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "Title is required and cannot be empty."}), 400

    # Validate / default priority
    priority = data.get("priority", "medium").lower()
    if priority not in ("low", "medium", "high"):
        priority = "medium"

    task = {
        "id": next_id,
        "title": title,
        "description": (data.get("description") or "").strip(),
        "priority": priority,
        "completed": False,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    tasks.append(task)
    next_id += 1
    return jsonify(task), 201


@app.route("/api/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    """Update any subset of {title, description, priority, completed} for a task; 404 if missing."""
    task = find_task(task_id)
    if task is None:
        abort(404)

    data = request.get_json(force=True)

    if "title" in data:
        title = (data["title"] or "").strip()
        if not title:
            return jsonify({"error": "Title cannot be empty."}), 400
        task["title"] = title

    if "description" in data:
        task["description"] = (data["description"] or "").strip()

    if "priority" in data:
        priority = (data["priority"] or "medium").lower()
        task["priority"] = priority if priority in ("low", "medium", "high") else "medium"

    if "completed" in data:
        task["completed"] = bool(data["completed"])

    return jsonify(task), 200


@app.route("/api/tasks/<int:task_id>/toggle", methods=["PATCH"])
def toggle_task(task_id):
    """Toggle the completed state of a task between True and False."""
    task = find_task(task_id)
    if task is None:
        abort(404)
    task["completed"] = not task["completed"]
    return jsonify(task), 200


@app.route("/api/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task by id; returns 204 No Content on success, 404 if not found."""
    global tasks
    task = find_task(task_id)
    if task is None:
        abort(404)
    tasks = [t for t in tasks if t["id"] != task_id]
    return "", 204


if __name__ == "__main__":
    app.run(debug=True)
