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
      const targetId = tab.getAttribute('data-target');
      if (!targetId) return;

      // Deactivate all
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      // Activate clicked
      tab.classList.add('active');
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
  const KEY = 'tasa_tasks_v6';
  const DEF = [
    // STEP 1: フリースクール開校（最小構成）
    { id: 1, name: '【STEP1】共同出資者向け 最小開設プラン提示資料の確定', cat: '事業準備', pri: 'high', status: 'prog' },
    { id: 2, name: '【STEP1】開校時の収支シミュレーション（フリースクール単独）', cat: '事業準備', pri: 'high', status: 'todo' },
    { id: 3, name: '【STEP1】物件選定（PC20台＋運動スペースが入る広さ）', cat: '事業準備', pri: 'high', status: 'todo' },
    { id: 4, name: '【STEP1】PC20台・3Dプリンタ2台の見積もり取得', cat: '事業準備', pri: 'high', status: 'todo' },
    { id: 5, name: '【STEP1】ボルダリング壁／サンドバッグ／ストラックアウト設置プラン', cat: '事業準備', pri: 'medium', status: 'todo' },
    { id: 6, name: '【STEP1】Vibe Coding（MCP+Claude Code）環境セットアップ手順書', cat: 'カリキュラム', pri: 'high', status: 'todo' },
    { id: 7, name: '【STEP1】フリースクール料金プラン（週1/週3/週5）の最終決定', cat: '事業準備', pri: 'high', status: 'todo' },
    { id: 8, name: '【STEP1】不登校支援に関する保険・安全管理マニュアル整備', cat: '法務・許認可', pri: 'high', status: 'todo' },
    { id: 9, name: '【STEP1】開校時スタッフ（フリースクール担当）の採用計画', cat: '人材', pri: 'high', status: 'todo' },
    { id: 10, name: '【STEP1】体験会・説明会の告知と運営フロー作成', cat: '集客・マーケティング', pri: 'medium', status: 'todo' },
    // STEP 2: 学童併設
    { id: 11, name: '【STEP2】学童保育の許認可要件・自治体補助金の調査', cat: '法務・許認可', pri: 'medium', status: 'todo' },
    { id: 12, name: '【STEP2】学童併設時の追加スタッフ・追加備品の試算', cat: '事業準備', pri: 'low', status: 'todo' },
    // STEP 3: 出席扱い
    { id: 13, name: '【STEP3】出席扱い認定要件（文科省ガイドライン）の調査', cat: '法務・許認可', pri: 'low', status: 'todo' },
    { id: 14, name: '【STEP3】学習履歴の可視化システム設計（Vibe Codingで内製）', cat: 'カリキュラム', pri: 'low', status: 'todo' }
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
  const KEY = 'tasa_equip_v6';
  const DEF = [
    // === STEP 1：フリースクール開校時に必要な最小構成 ===
    { id: 1, name: '【STEP1】生徒・開発兼用PC', cat: 'IT機器', qty: '20台', reason: 'テクノロジー特化の主軸。Vibe Coding／3Dモデリング／動画編集を快適に動かす開校時の必須装備', status: 'need' },
    { id: 2, name: '【STEP1】モニター・周辺機器一式（キーボード/マウス/ヘッドセット）', cat: 'IT機器', qty: '20席分', reason: 'PC20台分の作業環境を整備', status: 'need' },
    { id: 3, name: '【STEP1】高速インターネット回線・業務用ルーター', cat: 'IT機器', qty: '1式', reason: '20台同時接続でAI／クラウド開発に支障が出ない通信環境', status: 'need' },
    { id: 4, name: '【STEP1】3Dプリンター', cat: 'デジタルファブリケーション', qty: '2台', reason: '作ったデータをすぐ物理化できる体験を提供。開校時の差別化装備', status: 'need' },
    { id: 5, name: '【STEP1】3Dプリンタ用フィラメント・消耗品', cat: 'デジタルファブリケーション', qty: '初期セット', reason: '稼働開始からの数か月分の材料費', status: 'need' },
    { id: 6, name: '【STEP1】ボルダリングウォール（低めの壁＋マット）', cat: 'スポーツ・運動', qty: '1面', reason: '省スペースで設置可能なリフレッシュ用クライミング設備', status: 'need' },
    { id: 7, name: '【STEP1】サンドバッグ（スタンド型 or 吊り下げ）', cat: 'スポーツ・運動', qty: '1〜2台', reason: 'ストレス発散の最短装置。技術指導不要で誰でも使える', status: 'need' },
    { id: 8, name: '【STEP1】ストラックアウト的＋柔らかいボール各種', cat: 'スポーツ・運動', qty: '1セット', reason: '一人でも複数でも遊べる的当て＋球技用具。リフレッシュ目的', status: 'need' },
    { id: 9, name: '【STEP1】運動マット・防音／防振マット', cat: 'スポーツ・運動', qty: '必要面積分', reason: '安全確保と階下への騒音／振動対策', status: 'need' },
    { id: 10, name: '【STEP1】物件（賃貸）', cat: '施設・家具', qty: '1拠点', reason: 'PC20台のクリエイティブゾーン＋運動ゾーンが収まる広さ', status: 'need' },
    { id: 11, name: '【STEP1】デスク・椅子（生徒用＋スタッフ用）', cat: '施設・家具', qty: '20席+α', reason: '長時間PC作業に耐える基本家具', status: 'need' },
    { id: 12, name: '【STEP1】収納・パーテーション・看板', cat: '施設・家具', qty: '1式', reason: '備品収納とゾーン分け、対外的な認知のための最低限の什器', status: 'need' },
    // === STEP 2 以降に追加検討 ===
    { id: 13, name: '【STEP2+】学童併設用 追加備品（おやつ／軽食設備等）', cat: '施設・家具', qty: '-', reason: '学童保育併設フェーズで追加投資。STEP1時点では不要', status: 'need' },
    { id: 14, name: '【将来】レーザーカッター', cat: 'デジタルファブリケーション', qty: '1台', reason: '需要が出てから追加投資。STEP1の最小構成からは除外', status: 'need' },
    { id: 15, name: '【将来】eスポーツ／配信スタジオ機材', cat: 'スタジオ・eスポーツ', qty: '1式', reason: '生徒の興味と運営余力を見て段階的に導入', status: 'need' }
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

  // Step 1: Typing 「居場所」
  const titlePart1 = document.createElement('span');
  titlePart1.className = 'gradient-hybrid';
  titleEl.appendChild(titlePart1);
  for(let char of '「居場所」') {
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
  for(let char of '「好き」が') {
      titlePart2b.textContent += char;
      await delay(80);
  }

  // Step 3: Fire "武器"
  const fireSpan = document.createElement('span');
  fireSpan.className = 'fire-text';
  fireSpan.textContent = '武器';
  titleEl.appendChild(fireSpan);
  await delay(600);

  // Step 4: Normal "になる。"
  const titlePart3 = document.createElement('span');
  titleEl.appendChild(titlePart3);
  for(let char of 'になる。') {
      titlePart3.textContent += char;
      await delay(80);
  }

  await delay(300);

  // Step 5: Desc paragraph
  const descLines = ["まずはフリースクールとして、小さく確実に開校。", "段階的に学童・出席扱い拠点へ拡張する3ステップモデル。"];
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

// --- 8. Highlight Card Sparkle Animation ---
document.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.catalog-item.highlight-card');
  if (!card) return;

  const sparkleContainer = document.createElement('div');
  sparkleContainer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:2;border-radius:16px;';
  card.appendChild(sparkleContainer);

  function createSparkle() {
    const s = document.createElement('div');
    const size = Math.random() * 6 + 2;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = Math.random() * 1.5 + 0.8;
    const colors = ['#ffd700', '#fff8dc', '#ffec8b', '#ffa500', '#ffffff', '#ffe4b5'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    s.style.cssText = `
      position:absolute;
      left:${x}%;
      top:${y}%;
      width:${size}px;
      height:${size}px;
      background:${color};
      border-radius:50%;
      box-shadow:0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color};
      animation:sparkle-anim ${duration}s ease-in-out forwards;
      pointer-events:none;
    `;
    sparkleContainer.appendChild(s);
    setTimeout(() => s.remove(), duration * 1000);
  }

  // Add sparkle keyframes dynamically
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes sparkle-anim {
      0% { opacity:0; transform:scale(0) rotate(0deg); }
      30% { opacity:1; transform:scale(1.2) rotate(90deg); }
      70% { opacity:0.8; transform:scale(0.8) rotate(180deg); }
      100% { opacity:0; transform:scale(0) rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);

  // Continuously spawn sparkles
  setInterval(() => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createSparkle(), Math.random() * 300);
    }
  }, 400);
});

