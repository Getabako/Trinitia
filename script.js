/* ========================================
   Future Studio Trinitia - Main Logic
   ======================================== */

// --- 1. Ambient Background Particles ---
(function initAmbient() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initParticles() {
    particles = [];
    const num = Math.floor((canvas.width * canvas.height) / 20000);
    const colors = ['#00f0ff', '#ff5e00', '#ffd700', '#3b82f6'];
    
    for (let i = 0; i < num; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.5,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.3 + 0.1
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // update & draw
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = p.a;
      ctx.fill();
    });

    // links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = 0.05 * (1 - dist / 150);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1.0;
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize(); initParticles(); draw();
})();

// --- 2. Tab Navigation ---
(function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const sections = document.querySelectorAll('.view-section');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      
      // Activate clicked
      tab.classList.add('active');
      const targetId = tab.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
      window.scrollTo(0,0);
    });
  });
})();

// --- 3. Utilities ---
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function loadData(key, def) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [...def];
  } catch(e) { return [...def]; }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- 4. Task Management ---
(function initTasks() {
  const KEY = 'tasa_tasks_v5';
  const DEF = [
    { id: 1, name: '共同出資者への事業プラン共有と賛同獲得', cat: '事業準備', pri: 'high', status: 'prog' },
    { id: 2, name: 'Vibe Codingワークフロー(MCP+Claude)の構築', cat: 'カリキュラム', pri: 'high', status: 'todo' },
    { id: 3, name: 'ゲーミングPC・3Dプリンタ等の購入見積もり', cat: '事業準備', pri: 'high', status: 'todo' },
    { id: 4, name: 'ビジョントレーニング＆リアクションライト設置設計', cat: '事業準備', pri: 'medium', status: 'todo' },
    { id: 5, name: '生徒運営 駄菓子屋のモデル設計と仕入れルート確保', cat: '事業準備', pri: 'medium', status: 'todo' },
    { id: 6, name: '配信スタジオ(YouTube等)の防音・機材テスト', cat: '集客・マーケティング', pri: 'medium', status: 'todo' }
  ];
  let tasks = loadData(KEY, DEF);
  let currentFilter = 'all';

  const container = document.getElementById('taskListContainer');
  
  function render() {
    container.innerHTML = '';
    let filtered = currentFilter === 'all' ? tasks : tasks.filter(t => t.cat === currentFilter);
    
    filtered.forEach(t => {
      const el = document.createElement('div');
      el.className = `task-item ${t.status === 'done' ? 'status-done' : ''}`;
      if (t.isDeleted) {
        el.style.opacity = '0.6';
        el.style.textDecoration = 'line-through';
      }
      
      let stBtnClass = 'btn-todo', stLabel = 'TODO';
      if(t.status === 'prog') { stBtnClass = 'btn-prog'; stLabel = 'DOING'; }
      if(t.status === 'done') { stBtnClass = 'btn-done'; stLabel = 'DONE'; }

      el.innerHTML = `
        <div class="task-info flex-center" style="gap:10px; flex:1;">
          <input type="checkbox" ${t.status==='done'?'checked':''} class="t-chk" ${t.isDeleted?'disabled':''}>
          <span class="badge badge-cat">${t.cat}</span>
          <span class="task-name">${escapeHtml(t.name)}</span>
        </div>
        <div class="task-actions flex-center" style="gap:10px;">
          <button class="status-btn ${stBtnClass}" ${t.isDeleted?'disabled':''}>${stLabel}</button>
          <button class="delete-btn" title="${t.isDeleted ? 'Restore' : 'Delete'}" style="${t.isDeleted ? 'font-size:1.2rem;color:#10b981;' : ''}">${t.isDeleted ? '↺' : '×'}</button>
        </div>
      `;

      // Events
      el.querySelector('.t-chk').addEventListener('change', e => {
        t.status = e.target.checked ? 'done' : 'todo';
        saveAndRender();
      });

      el.querySelector('.status-btn').addEventListener('click', () => {
        const cycle = { todo:'prog', prog:'done', done:'todo' };
        t.status = cycle[t.status];
        saveAndRender();
      });

      el.querySelector('.delete-btn').addEventListener('click', () => {
        t.isDeleted = !t.isDeleted;
        saveAndRender();
      });

      container.appendChild(el);
    });

    // Update stats
    document.getElementById('t-total').innerText = tasks.filter(t=>!t.isDeleted).length;
    document.getElementById('t-done').innerText = tasks.filter(t=>!t.isDeleted && t.status==='done').length;
    document.getElementById('t-prog').innerText = tasks.filter(t=>!t.isDeleted && t.status==='prog').length;
  }

  function saveAndRender() {
    saveData(KEY, tasks);
    render();
  }

  // Add event
  document.getElementById('t-add-btn').addEventListener('click', () => {
    const nameInput = document.getElementById('t-name');
    const name = nameInput.value.trim();
    if(!name) return;
    const cat = document.getElementById('t-cat').value;
    const pri = document.getElementById('t-pri').value;
    const maxId = tasks.reduce((a,b)=>Math.max(a, b.id), 0);
    
    tasks.push({ id: maxId+1, name, cat, pri, status: 'todo' });
    nameInput.value = '';
    saveAndRender();
  });

  // Filters
  document.querySelectorAll('#t-filters .filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#t-filters .filter-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      render();
    });
  });

  render();
})();

// --- 5. Equipment Management ---
(function initEquipment() {
  const KEY = 'tasa_equip_v5';
  const DEF = [
    { id: 1, name: 'ゲーミング＆開発兼用PC', cat: 'IT機器', qty: '20', reason: 'クリエイティブソフトやUnityをノンストレスで動かすベース環境', status: 'need' },
    { id: 2, name: '3Dプリンター / レーザーカッター', cat: 'デジタルファブリケーション', qty: '各2台', reason: '作成した3Dデータや基板を物理プロトタイプ化するため', status: 'need' },
    { id: 3, name: 'eスポーツ/配信機材セット', cat: 'スタジオ・eスポーツ', qty: '1式', reason: '動画プロモーション実践やeスポーツ大会ノウハウの蓄積', status: 'need' },
    { id: 4, name: 'ビジョントレーニングボード', cat: 'スポーツ・運動', qty: '1面', reason: '周辺視野と動体視力向上によるワーキングメモリ拡張', status: 'need' },
    { id: 5, name: 'インタラクティブ・リアクションライト', cat: 'スポーツ・運動', qty: '2セット', reason: '判断力と敏捷性の向上。AIプログラミングと連動した測定に', status: 'need' },
    { id: 6, name: '駄菓子屋ショーケース・POSレジ端末', cat: '施設・家具', qty: '1式', reason: 'リアルな店舗運営を通した販売・在庫管理・収益化モデル実践', status: 'need' }
  ];
  let items = loadData(KEY, DEF);
  let currentFilter = 'all';

  const tbody = document.getElementById('equipListBody');

  function render() {
    tbody.innerHTML = '';
    let filtered = currentFilter === 'all' ? items : items.filter(i => i.cat === currentFilter);

    filtered.forEach(i => {
      const tr = document.createElement('tr');
      if (i.isDeleted) {
        tr.style.opacity = '0.6';
        tr.style.textDecoration = 'line-through';
      }
      
      let stBtnClass = 'btn-todo', stLabel = 'NEED';
      if(i.status === 'ord') { stBtnClass = 'btn-prog'; stLabel = 'ORDERED'; }
      if(i.status === 'acq') { stBtnClass = 'btn-done'; stLabel = 'ACQUIRED'; }

      tr.innerHTML = `
        <td>${escapeHtml(i.name)}</td>
        <td><span class="badge badge-cat">${i.cat}</span></td>
        <td><input type="text" class="edit-cell act-qty" value="${escapeHtml(i.qty)}" ${i.isDeleted?'disabled':''}></td>
        <td><input type="text" class="edit-cell act-reason text-sm" value="${escapeHtml(i.reason)}" ${i.isDeleted?'disabled':''}></td>
        <td><button class="status-btn ${stBtnClass}" ${i.isDeleted?'disabled':''}>${stLabel}</button></td>
        <td><button class="delete-btn" style="font-size:1.2rem; ${i.isDeleted?'color:#10b981;':''}">${i.isDeleted?'↺':'×'}</button></td>
      `;

      // Cycle status
      tr.querySelector('.status-btn').addEventListener('click', () => {
        const cycle = { need:'ord', ord:'acq', acq:'need' };
        i.status = cycle[i.status];
        saveAndRender();
      });

      // Delete
      tr.querySelector('.delete-btn').addEventListener('click', () => {
        i.isDeleted = !i.isDeleted;
        saveAndRender();
      });

      // Inline edits (blur/enter)
      const bindEdit = (selector, field) => {
        const inp = tr.querySelector(selector);
        const commit = () => { i[field] = inp.value.trim() || '-'; saveAndRender(); };
        inp.addEventListener('blur', commit);
        inp.addEventListener('keydown', e => { if(e.key === 'Enter') { inp.blur(); } });
      };
      bindEdit('.act-qty', 'qty');
      bindEdit('.act-reason', 'reason');

      tbody.appendChild(tr);
    });

    // Stats
    document.getElementById('e-total').innerText = items.filter(i=>!i.isDeleted).length;
    document.getElementById('e-acq').innerText = items.filter(i=>!i.isDeleted && i.status==='acq').length;
    document.getElementById('e-ord').innerText = items.filter(i=>!i.isDeleted && i.status==='ord').length;
    document.getElementById('e-need').innerText = items.filter(i=>!i.isDeleted && i.status==='need').length;
  }

  function saveAndRender() {
    saveData(KEY, items);
    render();
  }

  // Add
  document.getElementById('e-add-btn').addEventListener('click', () => {
    const nameInp = document.getElementById('e-name');
    const name = nameInp.value.trim();
    if(!name) return;
    const cat = document.getElementById('e-cat').value;
    const qty = document.getElementById('e-qty').value.trim() || '-';
    const bud = document.getElementById('e-reason').value.trim() || '-';
    const maxId = items.reduce((a,b)=>Math.max(a, b.id), 0);
    
    items.push({ id: maxId+1, name, cat, qty, reason: bud, status: 'need' });
    nameInp.value = ''; document.getElementById('e-qty').value = ''; document.getElementById('e-reason').value = '';
    saveAndRender();
  });

  // Filters
  document.querySelectorAll('#e-filters .filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#e-filters .filter-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      render();
    });
  });

  render();
})();

// --- Dynamic Background Observer ---
document.addEventListener('DOMContentLoaded', () => {
  const themeWrappers = document.querySelectorAll('.theme-wrapper');
  if(themeWrappers.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0
    };

    const bgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const color = entry.target.getAttribute('data-bg');
          if (color) {
            document.documentElement.style.backgroundColor = color;
          }
        }
      });
    }, observerOptions);

    themeWrappers.forEach(wrapper => bgObserver.observe(wrapper));

    // Reset to default on the hero section
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if(entry.isIntersecting) {
            document.documentElement.style.backgroundColor = '';
          }
        });
      }, { rootMargin: '0px', threshold: 0.3 });
      heroObserver.observe(hero);
    }
  }
});

// --- 6. Mobile Toggle ---
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('mobileToggle');
  const mainTabs = document.getElementById('mainTabs');
  if(toggle && mainTabs) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mainTabs.classList.toggle('show');
    });
  }
});

// --- 7. Hero Text Animation ---
document.addEventListener('DOMContentLoaded', async () => {
  const delay = ms => new Promise(r => setTimeout(r, ms));
  const titleEl = document.getElementById('anim-hero-title');
  const descEl = document.getElementById('anim-hero-desc');
  if(!titleEl || !descEl) return;
  
  titleEl.innerHTML = '';
  descEl.innerHTML = '';

  // Step 1: Typying 「好き」
  const titlePart1 = document.createElement('span');
  titlePart1.className = 'gradient-tech';
  titleEl.appendChild(titlePart1);
  for(let char of '「好き」') {
      titlePart1.textContent += char;
      await delay(150);
  }

  // Step 2: 1 by 1 
  const titlePart2 = document.createElement('span');
  titleEl.appendChild(titlePart2);
  for(let char of 'が見つかり、') {
      titlePart2.textContent += char;
      await delay(80);
  }

  // Line break
  titleEl.appendChild(document.createElement('br'));

  const titlePart2b = document.createElement('span');
  titleEl.appendChild(titlePart2b);
  for(let char of '「好き」を自分の') {
      titlePart2b.textContent += char;
      await delay(80);
  }

  // Step 3: Fire "武器"
  const fireSpan = document.createElement('span');
  fireSpan.className = 'fire-text';
  fireSpan.textContent = '武器';
  titleEl.appendChild(fireSpan);
  await delay(600);

  // Step 4: Normal "にする。"
  const titlePart3 = document.createElement('span');
  titleEl.appendChild(titlePart3);
  for(let char of 'にする。') {
      titlePart3.textContent += char;
      await delay(80);
  }

  await delay(300);

  // Step 5: Desc paragraph
  const descLines = ["学ぶ、熱狂する、稼ぐ。", "テクノロジーとスポーツを融合し、秋田発・世界基準のクリエイターへ。"];
  for(let i=0; i<descLines.length; i++) {
      const lineSpan = document.createElement('span');
      descEl.appendChild(lineSpan);
      for(let char of descLines[i]) {
          lineSpan.textContent += char;
          await delay(30);
      }
      if (i < descLines.length - 1) descEl.appendChild(document.createElement('br'));
  }
});

