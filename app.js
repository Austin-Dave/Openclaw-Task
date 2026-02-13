const state = {
  tasks: [],
  filtered: [],
};

const selectors = {
  rows: document.getElementById('task-rows'),
  empty: document.getElementById('empty-state'),
  search: document.getElementById('search'),
  status: document.getElementById('status-filter'),
  time: document.getElementById('time-filter'),
  lastUpdated: document.getElementById('last-updated'),
  footerUpdated: document.getElementById('footer-updated'),
  statTotal: document.getElementById('stat-total'),
  statFollow: document.getElementById('stat-followup'),
  statToday: document.getElementById('stat-today'),
  template: document.getElementById('task-row-template'),
};

const relativeTime = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const shortDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' });

async function loadTasks() {
  try {
    const res = await fetch(`data/tasks.json?ts=${Date.now()}`);
    if (!res.ok) throw new Error('Unable to load tasks');
    const data = await res.json();
    state.tasks = data;
    selectors.lastUpdated.textContent = `Data refreshed ${shortDate.format(new Date())}`;
    selectors.footerUpdated.textContent = 'just now';
    applyFilters();
  } catch (err) {
    selectors.lastUpdated.textContent = 'Error loading tasks';
    selectors.rows.innerHTML = `<p class="empty">${err.message}</p>`;
  }
}

function applyFilters() {
  const q = selectors.search.value.trim().toLowerCase();
  const status = selectors.status.value;
  const timeframe = selectors.time.value;
  const boundary = timeframe === 'all' ? null : Date.now() - Number(timeframe) * 24 * 60 * 60 * 1000;

  state.filtered = state.tasks.filter((task) => {
    const timeOk = boundary ? new Date(task.completedAt).getTime() >= boundary : true;
    const statusOk = status === 'all' ? true : task.status === status;
    const haystack = [task.title, task.summary, task.result, task.followUp, ...(task.deliverables || [])]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const searchOk = q ? haystack.includes(q) : true;
    return timeOk && statusOk && searchOk;
  });

  updateStats();
  renderRows();
}

function updateStats() {
  selectors.statTotal.textContent = state.tasks.length;
  selectors.statFollow.textContent = state.tasks.filter((t) => t.status === 'follow-up').length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectors.statToday.textContent = state.tasks.filter((t) => new Date(t.completedAt) >= today).length;
}

function renderRows() {
  selectors.rows.innerHTML = '';
  selectors.empty.style.display = state.filtered.length ? 'none' : 'block';

  state.filtered
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .forEach((task) => {
      const node = selectors.template.content.cloneNode(true);
      node.querySelector('.date').textContent = shortDate.format(new Date(task.completedAt));
      node.querySelector('.title').textContent = task.title;
      node.querySelector('.description').textContent = task.summary;
      const meta = node.querySelector('.meta');
      const pieces = [];
      if (task.result) pieces.push(task.result);
      if (task.followUp) pieces.push(`Next: ${task.followUp}`);
      meta.textContent = pieces.join(' · ');

      const status = node.querySelector('.status');
      status.textContent = task.status === 'completed' ? 'Completed' : 'Needs follow-up';
      status.classList.add(task.status);

      const deliverableBox = node.querySelector('.deliverables');
      if (!task.deliverables?.length) {
        deliverableBox.innerHTML = '<span class="chip">Internal</span>';
      } else {
        task.deliverables.forEach((link) => {
          const a = document.createElement('a');
          a.href = link.url;
          a.target = '_blank';
          a.rel = 'noreferrer noopener';
          a.textContent = link.label;
          deliverableBox.appendChild(a);
        });
      }

      selectors.rows.appendChild(node);
    });
}

function wireControls() {
  ['input', 'change'].forEach((evt) => {
    selectors.search.addEventListener(evt, debounce(applyFilters, 150));
    selectors.status.addEventListener(evt, applyFilters);
    selectors.time.addEventListener(evt, applyFilters);
  });
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function boot() {
  wireControls();
  loadTasks();
  setInterval(() => {
    if (!state.tasks.length) return;
    const newest = Math.max(...state.tasks.map((t) => new Date(t.completedAt).getTime()));
    const diff = Math.round((Date.now() - newest) / (1000 * 60));
    if (Number.isFinite(diff)) {
      if (diff < 60) {
        selectors.footerUpdated.textContent = `${diff} min ago`;
      } else {
        selectors.footerUpdated.textContent = relativeTime.format(-Math.round(diff / 60), 'hour');
      }
    }
  }, 60000);
}

boot();
