const body = document.querySelector("body");
const themeToggle = document.querySelector(".theme-toggle");
const moonIcon = document.querySelector(".moon");
const sunIcon = document.querySelector(".sun");
const newTodoInput = document.querySelector(".new-todo input");
const newTodoCheckCircle = document.querySelector(".new-todo .check-circle");
const todoList = document.querySelector(".todo-list");
const itemsLeftCount = document.querySelector(".items-left");
const filterButtons = document.querySelectorAll(".filter");
const clearCompletedButton = document.querySelector(".clear-completed");
const todoItems = document.querySelectorAll(".todo-item");

// Start with an empty todos array
let todos = [];
let currentFilter = "all";

// Initialize the app
function init() {
  // Check for saved theme preference, default to dark mode
  const darkMode = localStorage.getItem("darkMode");
  if (darkMode === "false") {
    disableDarkMode();
  } else {
    // Default to dark mode if no preference is saved
    enableDarkMode();
  }

  // Check for saved todos
  const savedTodos = localStorage.getItem("todos");
  if (savedTodos) {
    todos = JSON.parse(savedTodos);
  }

  renderTodos();
  updateItemsLeft();
  setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);
  // Add new todo
  newTodoInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && this.value.trim() !== "") {
      addTodo(this.value.trim());
      this.value = "";
    }
  });

  // Add new todo via check circle click
  newTodoCheckCircle.addEventListener("click", function () {
    if (newTodoInput.value.trim() !== "") {
      addTodo(newTodoInput.value.trim());
      newTodoInput.value = "";
    }
  });

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentFilter = button.getAttribute("data-filter");
      renderTodos();
    });
  });

  // Clear completed
  clearCompletedButton.addEventListener("click", clearCompleted);

  // Setup drag and drop
  setupDragAndDrop();
}

// Theme toggle
function toggleTheme() {
  if (body.classList.contains("dark")) {
    disableDarkMode();
  } else {
    enableDarkMode();
  }
}

function enableDarkMode() {
  body.classList.add("dark");
  moonIcon.classList.add("hidden");
  sunIcon.classList.remove("hidden");
  localStorage.setItem("darkMode", "true");
}

function disableDarkMode() {
  body.classList.remove("dark");
  moonIcon.classList.remove("hidden");
  sunIcon.classList.add("hidden");
  localStorage.setItem("darkMode", "false");
}

// Todo functions
function addTodo(text) {
  const newId =
    todos.length > 0 ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;
  const newTodo = {
    id: newId,
    text: text,
    completed: false,
  };

  todos.push(newTodo);
  saveTodos();
  renderTodos();
  updateItemsLeft();
}

function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
  updateItemsLeft();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
  updateItemsLeft();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
  updateItemsLeft();
}

// Filtering
function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

// Rendering
function renderTodos() {
  const filteredTodos = getFilteredTodos();

  // Remove all existing todo items except the footer
  const todoItems = todoList.querySelectorAll(".todo-item");
  todoItems.forEach((item) => item.remove());

  const todoFooter = todoList.querySelector(".todo-footer");

  // Add new todo items before the footer
  filteredTodos.forEach((todo) => {
    const todoItem = createTodoElement(todo);
    todoList.insertBefore(todoItem, todoFooter);
  });

  // Update the items left counter
  updateItemsLeft();
  // Update visibility of todo list elements based on if we have any todos
  if (todos.length === 0) {
    clearCompletedButton.classList.add("invisible");
  } else {
    clearCompletedButton.classList.remove("invisible");
  }
}

function createTodoElement(todo) {
  const todoItem = document.createElement("div");
  todoItem.classList.add("todo-item");
  todoItem.setAttribute("data-id", todo.id);
  if (todo.completed) {
    todoItem.classList.add("completed");
  }

  todoItem.draggable = true;
  todoItem.addEventListener("dragstart", handleDragStart);
  todoItem.addEventListener("dragover", handleDragOver);
  todoItem.addEventListener("drop", handleDrop);
  todoItem.addEventListener("dragend", handleDragEnd);

  const checkCircle = document.createElement("button");
  checkCircle.classList.add("check-circle");
  checkCircle.setAttribute(
    "aria-label",
    todo.completed ? "Mark as incomplete" : "Mark as complete"
  );  if (todo.completed) {
    checkCircle.classList.add("checked");
    const checkIcon = document.createElement("img");
    checkIcon.src = "./images/icon-check.svg";
    checkIcon.alt = "";
    checkCircle.appendChild(checkIcon);
  }

  checkCircle.addEventListener("click", () => toggleTodo(todo.id));
  const todoText = document.createElement("p");
  todoText.classList.add("todo-text");
  todoText.textContent = todo.text;
  todoText.addEventListener("click", () => toggleTodo(todo.id));

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete");
  deleteButton.setAttribute("aria-label", "Delete todo");
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "./images/icon-cross.svg";
  deleteIcon.alt = "Delete";

  deleteButton.appendChild(deleteIcon);
  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  todoItem.appendChild(checkCircle);
  todoItem.appendChild(todoText);
  todoItem.appendChild(deleteButton);

  return todoItem;
}

// Update items count
function updateItemsLeft() {
  const activeCount = todos.filter((todo) => !todo.completed).length;
  itemsLeftCount.textContent = `${activeCount} ${
    activeCount === 1 ? "item" : "items"
  } left`;
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Drag and drop functionality
let draggedItem = null;

function setupDragAndDrop() {
  const todoItems = todoList.querySelectorAll(".todo-item");
  todoItems.forEach((item) => {
    item.draggable = true;
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedItem = this;
  this.style.opacity = "0.5";
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  return false;
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    const allItems = Array.from(todoList.querySelectorAll(".todo-item"));
    const draggedIndex = allItems.indexOf(draggedItem);
    const droppedIndex = allItems.indexOf(this);

    // Reorder todos array
    const itemId1 = parseInt(draggedItem.getAttribute("data-id"));
    const itemId2 = parseInt(this.getAttribute("data-id"));
    const todo1 = todos.find((t) => t.id === itemId1);
    const todo2 = todos.find((t) => t.id === itemId2);

    // Store original positions
    const index1 = todos.indexOf(todo1);
    const index2 = todos.indexOf(todo2);

    // Reorder in DOM
    if (draggedIndex < droppedIndex) {
      todoList.insertBefore(draggedItem, this.nextSibling);
    } else {
      todoList.insertBefore(draggedItem, this);
    }

    // Reorder in array
    todos.splice(index1, 1);
    todos.splice(index2 > index1 ? index2 - 1 : index2, 0, todo1);

    // Save to localStorage
    saveTodos();
  }
  return false;
}

function handleDragEnd() {
  this.style.opacity = "1";
  draggedItem = null;
}

init();