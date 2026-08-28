const ops = document.querySelector('#priority-select');
const btnAdd = document.querySelector('.btn-add');
const todoList = document.querySelector('#todo-list');
const todoInput = document.querySelector('#todo-input');
const BtnFilters = document.querySelectorAll('.filter-btn');
const statsBadge = document.querySelector('.stats-badge');
const dateDisplay = document.querySelector('#date-display');
const progressBar = document.querySelector('#progress-bar');
const appContainer = document.querySelector('.app-container');
const parentBtnFilter = document.querySelector('.filter-buttons');

const allTask = JSON.parse(localStorage.getItem('task')) || [];

// date
const getDate = () => {
    const date = new Date();
    let time = Intl.DateTimeFormat('ar-EG', {
        month: 'long',
        day: 'numeric',
    }).format(date);

    return time;
};
dateDisplay.textContent = 'اليوم ,' + getDate();

// Create multi span
const createSpan = (className, text, priority = 'f') => {
    const createSpan = document.createElement('span');
    createSpan.className = className;
    createSpan.textContent = text;
    createSpan.classList.add(priority);
    return createSpan;
};

// task structure
const taskStructure = () => {
    let num = 0;
    return (checked, priority, text, taskText, id) => {
        num = id;
        const createLi = document.createElement('li');
        createLi.className = 'todo-item';
        createLi.setAttribute('data-id', num);

        const createLabel = document.createElement('label');
        createLabel.className = 'custom-checkbox';

        const createInput = document.createElement('input');
        createInput.type = 'checkbox';
        createInput.className = 'toggle-task';
        if (checked) {
            createInput.checked = true;
            createLi.classList.add('completed');
        }

        const createDiv = document.createElement('div');
        createDiv.classList = 'item-actions';

        const createButton = document.createElement('button');
        createButton.className = 'action-btn delete-btn';
        createButton.setAttribute('aria-label', 'حذف Task');

        const icon = document.createElement('i');
        icon.className = 'fa-regular fa-trash-can';

        createLabel.append(createInput, createSpan('checkmark'));
        createButton.appendChild(icon);
        createDiv.appendChild(createButton)
        createLi.append(createLabel, createSpan('task-text', taskText), createSpan('priority-tag', text, priority), createDiv);

        return todoList.appendChild(createLi);
    };
};
const fun = taskStructure();

//count Tasks
const countTasks = () => {
    let count = allTask.length;
    return {
        inc: () => {
            count++;
            statsBadge.children[1].textContent = count;
            return count;
        },

        dec: () => {
            if (count > 0) count--;
            statsBadge.children[1].textContent = count;
            return count;
        },

        reset: () => {
            count = 0;
            statsBadge.children[1].textContent = count;
            return count;
        },
    };
};
const count = countTasks();
statsBadge.children[1].textContent = allTask.length;

//count complete tasks with progress bar
const completeNum = () => {
    const completeCount = allTask.filter(task => task.completed).length;
    const taskCount = allTask.length;
    statsBadge.children[0].textContent = completeCount;

    let width = completeCount / taskCount * 100 + '%';
    if (taskCount > 0) {
        progressBar.style.width = width;
    } else {
        width = 0;
        progressBar.style.width = width;
    }

    return completeCount;
};

appContainer.addEventListener('click', e => {
    const taskItem = e.target.closest('.todo-item');
    const btnCompleted = e.target.closest('[data-filter="completed"]');
    const btnActive = e.target.closest('[data-filter="active"]');
    const btnAllTasks = e.target.closest('[data-filter="all"]');
    const btnDelete = e.target.closest('#clear-completed');
    //add a new task
    if (e.target.closest('.btn-add')) {
        e.preventDefault();
        if (todoInput.value.trim() === '') {
            return;
        } else {
            count.inc();
        }
        const selectedText = ops.options[ops.selectedIndex].text;

        let taskAbout = {
            id: Date.now(),
            taskText: todoInput.value,
            text: selectedText,
            importance: ops.value,
            completed: false,
        }
        allTask.push(taskAbout);
        localStorage.setItem('task', JSON.stringify(allTask));
        fun(taskAbout.completed, taskAbout.importance, taskAbout.text, taskAbout.taskText, taskAbout.id);
        todoInput.value = '';

        BtnFilters.forEach(btn => {
            btn.classList.remove('active');
        });
        BtnFilters[0].classList.add('active');

        const allTasks = todoList.querySelectorAll('.todo-item');
        allTasks.forEach(task => {
            task.classList.remove('hidden');
        });

        //delete completed task
    } else if (e.target.closest('.item-actions')) {
        const taskId = Number(taskItem.dataset.id);
        const taskIndex = allTask.findIndex(task => task.id === taskId);
        allTask.splice(taskIndex, 1);
        localStorage.setItem('task', JSON.stringify(allTask));


        taskItem.remove();
        count.dec();
        completeNum();

        //filter to display successful tasks
    } else if (btnCompleted) {
        BtnFilters.forEach(btn => {
            btn.classList.remove('active');
        });
        btnCompleted.classList.add('active');

        const allTasks = todoList.querySelectorAll('.todo-item');
        allTasks.forEach(task => {
            const checkBox = task.querySelector('.toggle-task');
            if (!checkBox.checked) {
                task.classList.add('hidden');
            } else {
                task.classList.remove('hidden');
            }
        });

        //incomplete tasks
    } else if (btnActive) {
        BtnFilters.forEach(btn => { btn.classList.remove('active') });
        btnActive.classList.add('active');

        const allTasks = todoList.querySelectorAll('.todo-item');
        allTasks.forEach(task => {
            const checkBox = task.querySelector('.toggle-task');

            if (checkBox.checked) {
                task.classList.add('hidden');
            } else {
                task.classList.remove('hidden');
            }
        });

        //remove all tasks
    } else if (btnDelete) {
        const allTasks = todoList.querySelectorAll('.todo-item');
        allTasks.forEach(task => {
            task.remove();
        });

        allTask.splice(0, allTask.length);
        localStorage.setItem('task', JSON.stringify(allTask));

        count.reset();
        completeNum();

        // show all tasks
    } else if (btnAllTasks) {
        BtnFilters.forEach(btn => {
            btn.classList.remove('active');
        });
        btnAllTasks.classList.add('active');

        const allTasks = todoList.querySelectorAll('.todo-item');
        allTasks.forEach(task => {
            task.classList.remove('hidden');
        });
    }
});

//task completed
appContainer.addEventListener('change', (e) => {
    if (e.target.matches('.custom-checkbox input')) {
        const taskItem = e.target.closest('.todo-item');
        taskItem?.classList.toggle('completed', e.target.checked);

        const taskId = Number(taskItem.dataset.id);
        const task = allTask.find(task => task.id === taskId);
        task.completed = e.target.checked;
        localStorage.setItem('task', JSON.stringify(allTask));

        const btnActive = document.querySelector('[data-filter="active"]');
        const btnCompleted = document.querySelector('[data-filter="completed"]');
        if (e.target.checked && btnActive.classList.contains('active')) {
            taskItem.classList.add('hidden');
        } else if (!e.target.checked && btnCompleted.classList.contains('active')) {
            taskItem.classList.add('hidden');
        }

        completeNum();
    }
});

allTask.forEach(task => {
    fun(task.completed, task.importance, task.text, task.taskText, task.id);
});
completeNum();