/* ========================================
   Management Pages Logic
   (Tasks & Equipment)
   LocalStorage-based persistence
   ======================================== */

// --- Mobile Nav (shared) ---
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
})();

/* ========================================
   Task Manager
   ======================================== */

function initTaskManager(defaultTasks) {
  const STORAGE_KEY = 'tasa_tasks';
  let tasks = loadData(STORAGE_KEY, defaultTasks);

  const listEl = document.getElementById('taskList');
  const progressBar = document.getElementById('progressBar');

  // Render
  function render(filter) {
    if (!filter) filter = 'all';
    listEl.innerHTML = '';

    const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.category === filter);

    // Group by category
    const groups = {};
    filtered.forEach((t) => {
      if (!groups[t.category]) groups[t.category] = [];
      groups[t.category].push(t);
    });

    Object.entries(groups).forEach(([category, items]) => {
      const group = document.createElement('div');
      group.className = 'category-group';

      const doneCount = items.filter((t) => t.status === 'done').length;
      group.innerHTML = `
        <div class="category-header">
          <h3>${category}</h3>
          <span class="category-count">${doneCount}/${items.length}</span>
          <div class="category-line"></div>
        </div>
      `;

      items.forEach((task) => {
        const el = document.createElement('div');
        el.className = `task-item${task.status === 'done' ? ' done' : ''}`;
        el.dataset.id = task.id;

        const statusLabel = { todo: '未着手', progress: '進行中', done: '完了' };
        const statusClass = { todo: '', progress: 'status-progress', done: 'status-done' };
        const priorityLabel = { high: '高', medium: '普通', low: '低' };

        el.innerHTML = `
          <input type="checkbox" class="task-check ${task.status === 'progress' ? 'in-progress' : ''}"
            ${task.status === 'done' ? 'checked' : ''}>
          <span class="task-name">${escapeHtml(task.name)}</span>
          <span class="task-priority priority-${task.priority}">${priorityLabel[task.priority]}</span>
          <button class="task-status-btn ${statusClass[task.status]}">${statusLabel[task.status]}</button>
          <button class="task-delete" title="削除">&times;</button>
        `;

        // Checkbox: toggle done
        el.querySelector('.task-check').addEventListener('change', (e) => {
          task.status = e.target.checked ? 'done' : 'todo';
          save();
          render(filter);
        });

        // Status button: cycle todo -> progress -> done
        el.querySelector('.task-status-btn').addEventListener('click', () => {
          const cycle = { todo: 'progress', progress: 'done', done: 'todo' };
          task.status = cycle[task.status];
          save();
          render(filter);
        });

        // Delete
        el.querySelector('.task-delete').addEventListener('click', () => {
          tasks = tasks.filter((t) => t.id !== task.id);
          save();
          render(filter);
        });

        group.appendChild(el);
      });

      listEl.appendChild(group);
    });

    updateStats();
  }

  function updateStats() {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const progress = tasks.filter((t) => t.status === 'progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statDone').textContent = done;
    document.getElementById('statProgress').textContent = progress;
    document.getElementById('statTodo').textContent = todo;

    const pct = total > 0 ? (done / total) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  // Filters
  let currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render(currentFilter);
    });
  });

  // Add task
  document.getElementById('addTaskBtn').addEventListener('click', () => {
    const nameEl = document.getElementById('newTaskName');
    const name = nameEl.value.trim();
    if (!name) return;

    const category = document.getElementById('newTaskCategory').value;
    const priority = document.getElementById('newTaskPriority').value;
    const maxId = tasks.reduce((max, t) => Math.max(max, t.id), 0);

    tasks.push({ id: maxId + 1, name, category, status: 'todo', priority });
    save();
    render(currentFilter);
    nameEl.value = '';
  });

  // Enter key
  document.getElementById('newTaskName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addTaskBtn').click();
  });

  render('all');
}

/* ========================================
   Equipment Manager
   ======================================== */

function initEquipmentManager(defaultEquipment) {
  const STORAGE_KEY = 'tasa_equipment';
  let items = loadData(STORAGE_KEY, defaultEquipment);

  const listEl = document.getElementById('equipList');
  const progressBar = document.getElementById('progressBar');

  function render(filter) {
    if (!filter) filter = 'all';
    listEl.innerHTML = '';

    const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter);

    // Group by category
    const groups = {};
    filtered.forEach((i) => {
      if (!groups[i.category]) groups[i.category] = [];
      groups[i.category].push(i);
    });

    Object.entries(groups).forEach(([category, catItems]) => {
      const group = document.createElement('div');
      group.className = 'category-group';

      const acquiredCount = catItems.filter((i) => i.status === 'acquired').length;
      group.innerHTML = `
        <div class="category-header">
          <h3>${category}</h3>
          <span class="category-count">${acquiredCount}/${catItems.length}</span>
          <div class="category-line"></div>
        </div>
      `;

      catItems.forEach((item) => {
        const el = document.createElement('div');
        el.className = 'equip-item';
        el.dataset.id = item.id;

        const statusLabel = { needed: '未調達', ordered: '発注中', acquired: '調達済' };
        const statusClass = { needed: '', ordered: 'status-ordered', acquired: 'status-acquired' };

        el.innerHTML = `
          <div class="equip-name">${escapeHtml(item.name)}</div>
          <div class="equip-field">
            <span class="equip-field-label">数量</span>
            <span class="editable" data-field="quantity">${escapeHtml(item.quantity)}</span>
          </div>
          <div class="equip-field">
            <span class="equip-field-label">予算</span>
            <span class="editable" data-field="budget">${escapeHtml(item.budget)}</span>
          </div>
          <button class="equip-status-btn ${statusClass[item.status]}">${statusLabel[item.status]}</button>
          <button class="equip-delete" title="削除">&times;</button>
        `;

        // Inline edit
        el.querySelectorAll('.editable').forEach((span) => {
          span.addEventListener('click', () => {
            const field = span.dataset.field;
            const currentVal = item[field];
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'editable-input';
            input.value = currentVal;
            span.replaceWith(input);
            input.focus();
            input.select();

            const commitEdit = () => {
              item[field] = input.value.trim() || currentVal;
              save();
              render(filter);
            };
            input.addEventListener('blur', commitEdit);
            input.addEventListener('keydown', (e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') render(filter);
            });
          });
        });

        // Status cycle
        el.querySelector('.equip-status-btn').addEventListener('click', () => {
          const cycle = { needed: 'ordered', ordered: 'acquired', acquired: 'needed' };
          item.status = cycle[item.status];
          save();
          render(filter);
        });

        // Delete
        el.querySelector('.equip-delete').addEventListener('click', () => {
          items = items.filter((i) => i.id !== item.id);
          save();
          render(filter);
        });

        group.appendChild(el);
      });

      listEl.appendChild(group);
    });

    updateStats();
  }

  function updateStats() {
    const total = items.length;
    const acquired = items.filter((i) => i.status === 'acquired').length;
    const ordered = items.filter((i) => i.status === 'ordered').length;
    const needed = items.filter((i) => i.status === 'needed').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statAcquired').textContent = acquired;
    document.getElementById('statOrdered').textContent = ordered;
    document.getElementById('statNeeded').textContent = needed;

    const pct = total > 0 ? (acquired / total) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // Filters
  let currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render(currentFilter);
    });
  });

  // Add equipment
  document.getElementById('addEquipBtn').addEventListener('click', () => {
    const nameEl = document.getElementById('newEquipName');
    const name = nameEl.value.trim();
    if (!name) return;

    const category = document.getElementById('newEquipCategory').value;
    const quantity = document.getElementById('newEquipQty').value || '未定';
    const budget = document.getElementById('newEquipBudget').value.trim() || '未定';
    const maxId = items.reduce((max, i) => Math.max(max, i.id), 0);

    items.push({ id: maxId + 1, name, category, quantity, budget, status: 'needed', note: '' });
    save();
    render(currentFilter);
    nameEl.value = '';
    document.getElementById('newEquipBudget').value = '';
  });

  // Enter key
  document.getElementById('newEquipName').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('addEquipBtn').click();
  });

  render('all');
}

/* ========================================
   Shared Utilities
   ======================================== */

function loadData(key, defaults) {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...defaults];
    }
  }
  return [...defaults];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
