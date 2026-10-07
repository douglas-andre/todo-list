/* ==============================
    DOM Elements
============================== */

const taskForm = document.querySelector("#task-form");
const editForm = document.querySelector("#edit-task-form");

const taskInput = document.querySelector("#task-input");
const taskCategory = document.querySelector("#task-category");

const editInput = document.querySelector("#edit-task-input");
const editCategory = document.querySelector("#edit-task-category");
const cancelBtn = document.querySelector("#cancel-edit-button");

const taskList = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");

const totalTasksElement = document.querySelector("#total-tasks");
const completedTasksElement = document.querySelector("#completed-tasks");
const pendingTasksElement = document.querySelector("#pending-tasks");

const categoryButtons = document.querySelectorAll(".category-button");

/* ==============================
    Data
============================== */

const tasks = loadTasks();

let currentCategory = "all";

let currentTask = null;

/* ==============================
    Render One Task
============================== */

function renderTask(task) {
  const taskItem = document.createElement("li");
  taskItem.classList.add("task-item");

  if (task.completed) {
    taskItem.classList.add("completed");
  }

  const taskDescription = document.createElement("span");
  taskDescription.classList.add("task-description");

  taskDescription.textContent = task.description;

  if (task.completed) {
    const completedText = document.createElement("span");
    completedText.classList.add("sr-only");
    completedText.textContent = " (completed)";
    taskDescription.append(completedText);
  }

  const taskCategoryLabel = document.createElement("span");
  taskCategoryLabel.classList.add("task-category-label");
  taskCategoryLabel.textContent =
    task.category.charAt(0).toUpperCase() + task.category.slice(1);

  const taskActions = document.createElement("div");
  taskActions.classList.add("task-actions");

  const completeButton = document.createElement("button");
  completeButton.type = "button";
  completeButton.classList.add("task-action", "task-complete");
  completeButton.setAttribute(
    "aria-label",
    `Complete task: ${task.description}`,
  );

  completeButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;

  completeButton.addEventListener("click", () =>
    actionCompleteButton(task.id),
  );

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.classList.add("task-action", "task-edit");
  editButton.setAttribute("aria-label", `Edit task: ${task.description}`);

  editButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
        </svg>
    `;

  editButton.addEventListener("click", () => actionEditButton(task.id));

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.classList.add("task-action", "task-remove");
  removeButton.setAttribute("aria-label", `Remove task: ${task.description}`);

  removeButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    `;

  removeButton.addEventListener("click", () => actionRemoveButton(task.id));

  if (task.completed === true) {
    taskActions.append(removeButton);
  } else {
    taskActions.append(completeButton, editButton, removeButton);
  }

  taskItem.append(taskDescription, taskCategoryLabel, taskActions);

  taskList.append(taskItem);
}

/* ==============================
    Edit Form
============================== */

function closeEditForm() {
  editInput.value = "";
  editCategory.value = "";
  editForm.hidden = true;
  taskForm.hidden = false;
  currentTask = null;
}

/* ==============================
    Task Actions
============================== */

function actionCompleteButton(id) {
  const task = tasks.find((task) => task.id === id);

  if (task) {
    if (id === currentTask) {
      closeEditForm();
    }

    task.completed = true;

    renderTasks();
    saveTasks();
    updateStats();
  }
}

function actionEditButton(id) {
  const task = tasks.find((task) => task.id === id);

  if (task) {
    taskForm.hidden = true;
    editForm.hidden = false;

    editInput.value = task.description;
    editCategory.value = task.category;

    editInput.focus();

    currentTask = id;
  }
}

function actionRemoveButton(id) {
  const index = tasks.findIndex((task) => task.id === id);

  if (index !== -1) {
    if (id === currentTask) {
      closeEditForm();
    }

    tasks.splice(index, 1);

    renderTasks();
    saveTasks();
    updateStats();
  }
}

/* ==============================
    Form Events
============================== */

editForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = editInput.value.trim();
  const category = editCategory.value;
  const task = tasks.find((task) => task.id === currentTask);

  if (description === "") {
    alert("Insert the new task description!");
    editInput.focus();
    return;
  }

  if (category === "") {
    alert("Insert the new task category!");
    editCategory.focus();
    return;
  }

  if (!task) {
    closeEditForm();
    return;
  }

  task.description = description;
  task.category = category;

  closeEditForm();

  taskInput.focus();

  renderTasks();
  saveTasks();
});

cancelBtn.addEventListener("click", () => {
  closeEditForm();
  taskInput.focus();
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const description = taskInput.value.trim();
  const category = taskCategory.value;

  if (description === "") {
    alert("Insert task description!");
    taskInput.focus();
    return;
  }

  if (category === "") {
    alert("Insert task category!");
    taskCategory.focus();
    return;
  }

  const taskObj = {
    id: getMaxId(),
    description: description,
    category: category,
    completed: false,
  };

  tasks.push(taskObj);

  taskInput.value = "";
  taskCategory.value = "";

  taskInput.focus();

  renderTasks();
  saveTasks();
  updateStats();
});

/* ==============================
    Data Management
============================== */

function loadTasks() {
  try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    return Array.isArray(savedTasks) ? savedTasks : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getMaxId() {
  if (tasks.length === 0) {
    return 1;
  } else {
    return Math.max(...tasks.map((task) => task.id)) + 1;
  }
}

/* ==============================
    Statistics
============================== */

function updateStats() {
  const completed = tasks.filter((task) => task.completed === true);
  const pending = tasks.filter((task) => task.completed === false);

  totalTasksElement.textContent = tasks.length;
  completedTasksElement.textContent = completed.length;
  pendingTasksElement.textContent = pending.length;
}

/* ==============================
    Rendering
============================== */

function renderTasks() {
  taskList.innerHTML = "";

  let tasksToRender;

  if (currentCategory === "all") {
    tasksToRender = tasks;
  } else {
    tasksToRender = tasks.filter((task) => {
      return task.category === currentCategory;
    });
  }

  tasksToRender.forEach((task) => {
    renderTask(task);
  });

  if (tasksToRender.length === 0) {
    if (currentCategory === "all") {
      emptyState.textContent = "No tasks yet.";
    } else {
      emptyState.textContent = `No tasks in ${currentCategory} yet.`;
    }

    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}

/* ==============================
    Category Filters
============================== */

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    currentCategory = button.dataset.category;

    renderTasks();
  });
});

/* ==============================
    Initialization
============================== */

renderTasks();
updateStats();