<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pro Streamline Kanban</title>
    <style>
        :root {
            --bg: #f8fafc;
            --card-bg: #ffffff;
            --primary: #2563eb;
            --todo: #f59e0b;
            --doing: #3b82f6;
            --done: #10b981;
            --text-main: #1e293b;
            --text-sub: #64748b;
        }

        body {
            font-family: 'Inter', -apple-system, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            margin: 0;
            padding: 2rem;
        }

        .header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .input-section {
            max-width: 600px;
            margin: 0 auto 2rem;
            display: flex;
            gap: 10px;
        }

        input[type="text"] {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            outline: none;
            transition: border-color 0.2s;
        }

        input[type="text"]:focus { border-color: var(--primary); }

        .add-btn {
            background: var(--primary);
            color: white;
            border: none;
            padding: 0 24px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }

        .board {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 24px;
            max-width: 1200px;
            margin: 0 auto;
        }

        .column {
            background: #f1f5f9;
            border-radius: 12px;
            padding: 1rem;
            min-height: 600px;
            display: flex;
            flex-direction: column;
        }

        .column h3 {
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-sub);
            margin-bottom: 1.5rem;
            padding-left: 0.5rem;
            border-left: 4px solid #cbd5e1;
        }

        #todo-col h3 { border-color: var(--todo); }
        #doing-col h3 { border-color: var(--doing); }
        #done-col h3 { border-color: var(--done); }

        .task-list {
            flex-grow: 1;
            min-height: 50px;
        }

        .card {
            background: var(--card-bg);
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: transform 0.1s, box-shadow 0.2s;
        }

        .card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .card.dragging { opacity: 0.5; transform: scale(0.98); }

        .delete-task {
            color: #cbd5e1;
            cursor: pointer;
            font-size: 1.2rem;
            border: none;
            background: none;
            padding: 0 5px;
        }

        .delete-task:hover { color: #ef4444; }

        .drag-over { background: #e2e8f0; }
    </style>
</head>
<body>

<div class="header">
    <h1>Kanban Dashboard</h1>
</div>

<div class="input-section">
    <input type="text" id="taskInput" placeholder="Enter task and press Enter...">
    <button class="add-btn" onclick="addTask()">Add Task</button>
</div>

<div class="board">
    <div class="column" id="todo-col">
        <h3>To Do</h3>
        <div class="task-list" id="todo" ondrop="drop(event)" ondragover="allowDrop(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)"></div>
    </div>
    
    <div class="column" id="doing-col">
        <h3>Doing / In Progress</h3>
        <div class="task-list" id="doing" ondrop="drop(event)" ondragover="allowDrop(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)"></div>
    </div>
    
    <div class="column" id="done-col">
        <h3>Done</h3>
        <div class="task-list" id="done" ondrop="drop(event)" ondragover="allowDrop(event)" ondragenter="dragEnter(event)" ondragleave="dragLeave(event)"></div>
    </div>
</div>

<script>
    // Load and Setup
    const taskInput = document.getElementById('taskInput');
    taskInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTask());

    window.onload = () => {
        const saved = JSON.parse(localStorage.getItem('kanban_data')) || { todo: [], doing: [], done: [] };
        Object.keys(saved).forEach(colId => {
            saved[colId].forEach(text => renderTask(text, colId));
        });
    };

    function updateStorage() {
        const data = {
            todo: Array.from(document.getElementById('todo').querySelectorAll('span')).map(s => s.innerText),
            doing: Array.from(document.getElementById('doing').querySelectorAll('span')).map(s => s.innerText),
            done: Array.from(document.getElementById('done').querySelectorAll('span')).map(s => s.innerText)
        };
        localStorage.setItem('kanban_data', JSON.stringify(data));
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (!text) return;
        renderTask(text, 'todo');
        taskInput.value = '';
        updateStorage();
    }

    function renderTask(text, colId) {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        card.id = 'task-' + Date.now() + Math.random();
        card.innerHTML = `<span>${text}</span><button class="delete-task" onclick="removeTask(this)">&times;</button>`;
        
        card.ondragstart = (e) => {
            e.dataTransfer.setData("text", e.target.id);
            card.classList.add('dragging');
        };
        card.ondragend = () => card.classList.remove('dragging');
        
        document.getElementById(colId).appendChild(card);
    }

    function removeTask(btn) {
        btn.parentElement.remove();
        updateStorage();
    }

    // Drag Logic
    function allowDrop(e) { e.preventDefault(); }
    function dragEnter(e) { e.target.closest('.task-list')?.classList.add('drag-over'); }
    function dragLeave(e) { e.target.closest('.task-list')?.classList.remove('drag-over'); }

    function drop(e) {
        e.preventDefault();
        const list = e.target.closest('.task-list');
        list.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData("text");
        list.appendChild(document.getElementById(taskId));
        updateStorage();
    }
</script>

</body>
</html>
