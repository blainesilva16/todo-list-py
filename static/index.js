document.addEventListener('DOMContentLoaded', function () {

    // Toggle the navbar menu
    const toggleButton = document.getElementById('toggle-navbar');
    const sideBar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    toggleButton.addEventListener('click', function () {
        sideBar.classList.toggle('active');
        overlay.classList.toggle('active');
    });
    // Close the sidebar when clicking outside of it
    document.addEventListener('click', function (event) {
        if (!sideBar.contains(event.target) && !toggleButton.contains(event.target)) {
            sideBar.classList.remove('active');
            overlay.classList.remove('active');
        }
    });

    // Clicking on input for add task to expand the div
    const taskInput = document.getElementById('taskInput');
    const optionsTask = document.getElementById('optionsTask');
    const addHolder = document.getElementById('addHolder');

    taskInput.addEventListener('focus', () => {
        optionsTask.style.display = 'flex';
    });

    document.addEventListener('click', (event) => {
        // Delay to allow inputs like date to register clicks
        setTimeout(() => {
            if (!addHolder.contains(event.target)) {
                optionsTask.style.display = 'none';
            }
        }, 100);
    });

    // Styling the calendar
    const deadlineInput = document.getElementById('deadline');
    const calendarIcon = document.getElementById('calendarIcon');

    // Initialize Flatpickr on the hidden input
    flatpickr(deadlineInput, {
        onChange: function(selectedDates, dateStr) {
            document.getElementById("deadline").value = dateStr;
        },
        altInput: true,       // pretty input
        altFormat: "F j, Y", // display format
        dateFormat: "Y-m-d", // data format
        allowInput: true,
        minDate: "today" // ← disables past dates
    });

    // Trigger the picker when icon is clicked
    calendarIcon.addEventListener('click', function () {
        deadlineInput._flatpickr.open();
    });

});

// Open date input
document.getElementById('deadline').previousElementSibling.addEventListener('click', function () {
    document.getElementById('deadline').showPicker?.(); // Modern way to open date input
});

// Create new list
const newList = document.getElementById("newList")
const newListSidebar = document.getElementById("newListSidebar")
const listsList = document.getElementById("listsList")
const listsListSidebar = document.getElementById("listsListSidebar")

newList.addEventListener("click", () => {
    const inputList = document.getElementById("inputList").value
    if (inputList === "") {
        alert("Please enter a list name")
        return
    }
    form = new FormData();
    form.append('name', inputList);
    fetch('/new_list', {
        method: 'POST',
        body: form
    }).then(response => response.json())
        .then(data => {
            const div = document.createElement("div");
            div.classList.add("category");
            div.setAttribute("data-id",data.id)
            div.innerHTML = `<div>
                                 • ${data.name}
                            </div>
                            <input type="checkbox">`;
            listsList.appendChild(div);
            document.getElementById("inputList").value = ""
        })
        .catch(error => {
        alert('Error creating List:', error);
        console.error("Error", error)
        });
})
newListSidebar.addEventListener("click", () => {
    const inputList = document.getElementById("inputListSidebar").value
    if (inputList === "") {
        alert("Please enter a list name")
        return
    }
    form = new FormData();
    form.append('name', inputList);
    fetch('/new_list', {
        method: 'POST',
        body: form
    }).then(response => response.json())
        .then(data => {
            const div = document.createElement("div");
            div.classList.add("category");
            div.setAttribute("data-id",data.id)
            div.innerHTML = `<div>
                                 • ${data.name}
                            </div>
                            <input type="checkbox">`;
            listsListSidebar.appendChild(div);
            document.getElementById("inputListSidebar").value = ""
        })
        .catch(error => {
        alert('Error creating List:', error);
        console.error("Error", error)
        });
});

// When clicking on one list name, change visibility of some items
const todoList = document.getElementById("todoList")
const addHolder = document.getElementById("addHolder")

// ✅ Event delegation to handle future .category elements
listsList.addEventListener("click", function(event) {
    let targetCategory = event.target.closest(".category"); // Use closest to handle clicks on children of .category
    if (targetCategory) {
        // Remove 'active' class from all other categories
        document.querySelectorAll('.category.active').forEach(el => {
            el.classList.remove('active');
        });

        // Add 'active' class to the clicked one
        targetCategory.classList.add('active');
        todoList.style.display = "flex"
        addHolder.style.display = "flex"
        let name_list = targetCategory.querySelector("div:first-child").innerText.replace("• ", ""); // Get list name correctly
        document.getElementById("listName").innerText = name_list

        const listIdAttr = targetCategory.getAttribute("data-id");
        // Store selected list ID for task creation
        document.getElementById("taskInput").setAttribute("data-list-id", listIdAttr);
        loadTasksForList(listIdAttr); // Call a function to load tasks
    }
});
listsListSidebar.addEventListener("click", function(event) {
    let targetCategory = event.target.closest(".category"); // Use closest to handle clicks on children of .category
    if (targetCategory) {
        // Remove 'active' class from all other categories
        document.querySelectorAll('.category.active').forEach(el => {
            el.classList.remove('active');
        });

        // Add 'active' class to the clicked one
        targetCategory.classList.add('active');
        todoList.style.display = "flex"
        addHolder.style.display = "flex"
        let name_list = targetCategory.querySelector("div:first-child").innerText.replace("• ", ""); // Get list name correctly
        document.getElementById("listName").innerText = name_list

        const listIdAttr = targetCategory.getAttribute("data-id");
        // Store selected list ID for task creation
        document.getElementById("taskInput").setAttribute("data-list-id", listIdAttr);
        loadTasksForList(listIdAttr); // Call a function to load tasks
    }
});

// Function to load tasks for a given list
async function loadTasksForList(listId) {
    const response = await fetch(`/api/tasks/${listId}`);
    const tasks = await response.json();

    const todoList = document.getElementById('todoList');
    todoList.innerHTML = "";  // Clear current tasks

    tasks.forEach(task => {
        const taskHTML = `
            <div class="todoItem" id="${listId + "_" + task.id}" data-task-id="${task.id}" draggable="true">
                
                <div class="todoItemContent">
                    <div class="drag-handle">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-grip-vertical" viewBox="0 0 16 16">
                            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0M9 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0m0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
                        </svg>
                    </div>
                    <div class="todoColor" style="background-color:${task.color};"></div>
                    <input type="checkbox" name="task" ${task.is_completed === "True" ? "checked" : ""}>
                    <p class="p-m0 ${task.is_completed === "True" ? "lineThrough" : ""}">${task.todo}</p>
                    <div class="todoDate">Due to: ${task.due_to || "N/A"}</div>
                </div>
                <div class="todoItemOptions">
                    <span style="cursor:pointer" class="fa fa-star ${task.highlighted ? 'checked' : ''}"></span>
                    <i style="cursor:pointer" class="fa fa-pencil"></i>
                    <i style="cursor:pointer" class="fa fa-trash"></i>
                </div>
            </div>
            <div class="todoItemEdit" data-task-edit-id="${task.id}">
                <input style="cursor:pointer;width:40px;padding:8px" type="color" value="${task.color}">
                <input type="text" value="${task.todo.replace(/"/g, '&quot;')}">

                <input type="date" value="${task.due_to}">
                <i style="cursor:pointer" class="fa fa-close"></i>
                <i style="cursor:pointer" class="fa fa-check"></i>
            </div>
            `;
        todoList.innerHTML += taskHTML;
    });

    // Attach event listeners to newly created tasks
    attachTaskEventListeners(listId);
}

// Function to attach event listeners to tasks
function attachTaskEventListeners(currentListId) {
    document.querySelectorAll('.todoItem').forEach(todoItem => {
        const taskId = todoItem.dataset.taskId;

        // Delete task functionality
        todoItem.querySelector('.fa-trash').addEventListener('click', async () => {
            deleteTask(taskId, todoItem);
        });

        // Toggle edit mode
        todoItem.querySelector('.fa.fa-pencil').addEventListener('click', () => {
            document.querySelector(`.todoItemEdit[data-task-edit-id="${taskId}"]`).style.display = 'flex';
            todoItem.style.display = 'none';
        });

        // Close edit mode
        const todoItemEdit = document.querySelector(`.todoItemEdit[data-task-edit-id="${taskId}"]`);
        todoItemEdit.querySelector(".fa.fa-close").addEventListener('click', () => {
            todoItemEdit.style.display = 'none';
            todoItem.style.display = 'flex';
        });

        // Edit functionality
        todoItemEdit.querySelector(".fa.fa-check").addEventListener('click', () => {
            const todo = todoItemEdit.querySelector('input[type="text"]').value;
            const color = todoItemEdit.querySelector('input[type="color"]').value;
            const due_to = todoItemEdit.querySelector('input[type="date"]').value;
            const content = JSON.stringify({
                todo: todo,
                due_to: due_to,
                color: color
            });
            editTask(taskId, currentListId, content);
        });

        // Toggle star
        todoItem.querySelector('.fa.fa-star').addEventListener('click', () => {
            highlightTask(taskId, currentListId);
        });

        // Toggle complete
        todoItem.querySelector('input[type="checkbox"]').addEventListener("click", () => {
            toggleTask(taskId, currentListId);
        });

        // Drag and Drop Events for tasks
        todoItem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', taskId);
            // Optionally add a class for styling the dragged item
            e.target.classList.add('dragging');
        });

        todoItem.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
        });
    });

    // Attach drag and drop listeners to categories (lists)
    document.querySelectorAll('.category').forEach(categoryEl => {
        categoryEl.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            categoryEl.classList.add('drag-over');
        });

        categoryEl.addEventListener('dragenter', (e) => {
            e.preventDefault();
        });

        categoryEl.addEventListener('dragleave', () => {
            categoryEl.classList.remove('drag-over');
        });

        categoryEl.addEventListener('drop', async (e) => {
            e.preventDefault();
            categoryEl.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const newlistId = categoryEl.dataset.id;

            if (taskId && newlistId) {
                await moveTask(taskId, newlistId);
                // After moving, reload the tasks for the original list (if different)
                // and the new list to reflect changes visually.
                // A simpler approach is to reload the currently active list.
                const activeList = document.querySelector('.category.active');
                if (activeList) {
                    loadTasksForList(activeList.dataset.id);
                } else { // if no active list, reload the new target list if it was a direct drop
                    loadTasksForList(newlistId);
                }
            }
        });
    });
}


// Add new task
document.querySelector('#optionsTask button').addEventListener('click', async () => {
    await addTask();
});
document.addEventListener('keydown', async function(event) {
  if (event.key === 'Enter') {
    await addTask();
  }
});
async function addTask() {
    const todo = document.getElementById("taskInput").value;
    const listId = document.getElementById("taskInput").getAttribute("data-list-id");
    const dueDate = document.getElementById("deadline").value;
    const color = document.getElementById("colorPicker").value

    if (!todo || !listId) {
        alert("Please select a list or/and enter a task name.");
        return;
    }

    const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            todo: todo,
            list_id: parseInt(listId),
            due_to: dueDate,
            color: color
        })
    });

    const result = await response.json();
    if (result.success) {
        document.getElementById("taskInput").value = "";
        document.getElementById("deadline").value = "";
        // Optionally: Trigger a reload of task list (simulate click again)
        document.querySelector(`.category[data-id="${listId}"]`).click();
    }
}

// Delete task function
function deleteTask(taskId, element) {
    fetch(`/delete-task/${taskId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                element.remove();
                // Optionally re-load tasks for the current list to keep the display fresh
                const activeList = document.querySelector('.category.active');
                if (activeList) {
                    loadTasksForList(activeList.dataset.id);
                }
            }
            else {
                alert("Error deleting task");
            }
        });
}

// Edit task function
function editTask(taskId, listId, newContent) { // Removed 'element' as it's not strictly needed here
    fetch(`/edit-task/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: newContent
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector(`.category[data-id="${listId}"]`).click();
        }
        else {
            alert("Error updating task")
        }
    });
}

// Highlight task function
function highlightTask(taskId, listId) {
    fetch(`/highlight-task/${taskId}`, { method: 'PUT' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector(`.category[data-id="${listId}"]`).click();
            }
            else {
                alert("Error highlighting task");
            }
        });
}

// Complete task function
function toggleTask(taskId, listId) {
    fetch(`/toggle-task/${taskId}`, { method: 'PUT' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.querySelector(`.category[data-id="${listId}"]`).click();
            }
            else {
                alert("Error toggling task");
            }
        });
}

// New function to move a task
async function moveTask(taskId, newlistId) {
    const response = await fetch(`/api/move_task/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ list_id: parseInt(newlistId) })
    });
    const data = await response.json();
    if (!data.success) {
        alert("Error moving task.");
    }
}


// Edit list name
document.querySelectorAll(".category div:first-child").forEach(div => {
    div.addEventListener("dblclick", function () {
        const currentText = this.textContent.trim().replace(/^•\s*/, "");
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        this.replaceWith(input);
        input.focus();

        input.addEventListener("keydown", async function (e) {
            if (e.key === "Enter") {
                const newName = input.value.trim();
                const parent = input.closest(".category");
                const listId = parent.getAttribute("data-id");

                // Update on backend via fetch/AJAX
                const response = await fetch(`/update_list_name/${listId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify({ name: newName })
                });

                if (response.ok) {
                    const newDiv = document.createElement("div");
                    newDiv.textContent = `• ${newName}`;
                    input.replaceWith(newDiv);
                } else {
                    alert("Error updating list name.");
                }
            }
        });

        input.addEventListener("blur", function () {
            const parent = input.closest(".category");
            const originalDiv = document.createElement("div");
            originalDiv.textContent = `• ${currentText}`; // Revert to original text if blur without enter
            input.replaceWith(originalDiv);
            // Re-attach dblclick listener to the new div
            originalDiv.addEventListener("dblclick", this.handler); // Assuming 'this.handler' refers to the original dblclick function
        }.bind(this)); // Bind 'this' to refer to the original 'div'
        // Store the handler on the input for later re-attachment
        input.handler = this.handler; // This might need a more robust way to store/retrieve the event listener
    });
});


// Delete list
const deleteBtn = document.getElementById("deleteList");
// Initial call to set the correct state for the delete button
updateDeleteButtonState();

// Delete list from sidebar
const deleteBtnSidebar = document.getElementById("deleteListSidebar");
updateDeleteButtonState()

// Re-fetch checkboxes whenever a new list is added or deleted
function getCheckboxes() {
    return document.querySelectorAll("#listsList input[type='checkbox']");
}

function updateDeleteButtonState() {
    const checkboxes = getCheckboxes();
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
    deleteBtn.disabled = !anyChecked;
}

// Attach event listeners to existing checkboxes
getCheckboxes().forEach(cb => {
    cb.addEventListener("change", updateDeleteButtonState);
});

// For newly added lists, you'll need to attach this listener in the new_list success callback.
// In newList.addEventListener, after appending the new div:
// new_list_checkbox = div.querySelector("input[type='checkbox']");
// new_list_checkbox.addEventListener("change", updateDeleteButtonState);


deleteBtn.addEventListener("click", async () => {
    const selectedIds = Array.from(getCheckboxes())
        .filter(cb => cb.checked)
        .map(cb => cb.closest(".category").dataset.id);

    if (!selectedIds.length) {
        alert("No list selected.");
        return
    };

    const confirmed = confirm(`Do you really want to delete ${selectedIds.length} list(s)?`);
    if (!confirmed) return;

    const response = await fetch("/delete_lists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ ids: selectedIds })
    });

    if (response.ok) {
        selectedIds.forEach(id => {
            const el = document.querySelector(`.category[data-id='${id}']`);
            el?.remove();
        });
        updateDeleteButtonState();
        // Clear tasks if the currently viewed list was deleted
        const activeList = document.querySelector('.category.active');
        if (!activeList || selectedIds.includes(activeList.dataset.id)) {
            document.getElementById("listName").innerText = "Click on a List to see its tasks!";
            document.getElementById("todoList").innerHTML = "";
            document.getElementById("addHolder").style.display = "none";
        }
    } else {
        alert("Error deleting list(s).");
    }
});
deleteBtnSidebar.addEventListener("click", async () => {
    const selectedIds = Array.from(document.querySelectorAll("#listsListSidebar input[type='checkbox']"))
        .filter(cb => cb.checked)
        .map(cb => cb.closest(".category").dataset.id);

    if (!selectedIds.length) {
        alert("No list selected.");
        return
    };

    const confirmed = confirm(`Do you really want to delete ${selectedIds.length} list(s)?`);
    if (!confirmed) return;

    const response = await fetch("/delete_lists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({ ids: selectedIds })
    });

    if (response.ok) {
        selectedIds.forEach(id => {
            const el = document.querySelector(`.category[data-id='${id}']`);
            el?.remove();
        });
        updateDeleteButtonState();
        // Clear tasks if the currently viewed list was deleted
        const activeList = document.querySelector('.category.active');
        if (!activeList || selectedIds.includes(activeList.dataset.id)) {
            document.getElementById("listName").innerText = "Click on a List to see its tasks!";
            document.getElementById("todoList").innerHTML = "";
            document.getElementById("addHolder").style.display = "none";
        }
    } else {
        alert("Error deleting list(s).");
    }
});

// Drag task to reorder list
document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('todoList');
    let draggedItem = null;

    taskList.addEventListener('dragstart', (e) => {
        // Set the dragged item
        draggedItem = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        // You might want to store the task ID for later use on drop
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    });

    taskList.addEventListener('dragover', (e) => {
        e.preventDefault(); // This is crucial to allow a drop
        const target = e.target.closest('.todoItem'); // Ensure we're targeting a task item
        if (target && target !== draggedItem) {
            const boundingBox = target.getBoundingClientRect();
            const offset = e.clientY - boundingBox.top;

            // Remove 'over' class from all items first
            document.querySelectorAll('.task-item').forEach(item => {
                item.classList.remove('over');
            });

            // Determine if dragging over the top or bottom half of the target item
            if (offset < boundingBox.height / 2) {
                // Dragging over the top half, insert before target
                target.classList.add('over');
                taskList.insertBefore(draggedItem, target);
            } else {
                // Dragging over the bottom half, insert after target
                target.classList.add('over');
                taskList.insertBefore(draggedItem, target.nextSibling);
            }
        }
    });

    taskList.addEventListener('dragleave', (e) => {
        // Remove 'over' class when leaving an item
        e.target.classList.remove('over');
    });

    taskList.addEventListener('dragend', (e) => {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.todoItem').forEach(item => {
            item.classList.remove('over');
        });
        draggedItem = null;

        // *** Send the new order to the backend ***
        updateTaskOrder();
    });

    // Function to send the new order to the Flask backend
    function updateTaskOrder() {
        const taskItems = Array.from(taskList.children);
        const newOrder = taskItems.map(item => {if (item.dataset.taskId) return item.dataset.taskId; else return null;}).filter(Boolean);
        console.log(newOrder)
        fetch('/update_task_order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ new_order: newOrder }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Task order updated successfully!');
            } else {
                console.error('Failed to update task order:', data.message);
                // Optionally, revert the UI or show an error
            }
        })
        .catch(error => {
            console.error('Error sending update request:', error);
            // Optionally, revert the UI or show an error
        });
    }

    // (Keep your existing drag-and-drop logic for moving tasks between lists if you have it,
    // and ensure it doesn't conflict with this internal reordering.)
});