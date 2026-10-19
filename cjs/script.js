document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = ms => new Promise(r => setTimeout(r, ms));

  const NOTES_CONFIG = {
    base: 'https://raw.githubusercontent.com/lunarshe11/lunarshe11/notes/notes/',
    indexFile: 'notes.json',
  };

  fetch('https://api.github.com/repos/lunarshe11/lunarshe11/commits?per_page=1')
    .then(res => res.json())
    .then(data => {
      if (data && data[0]) {
        const date = new Date(data[0].commit.author.date).toLocaleDateString();
        document.getElementById('lastCommitWidget').innerHTML = `<span class="dot"></span> commit: ${date}`;
      }
    })
    .catch(() => {
      document.getElementById('lastCommitWidget').innerHTML = `<span class="dot" style="background:#ff6b8a;box-shadow:none;"></span> offline`;
    });

  (() => {
    const ball  = document.querySelector('.c-ball');
    const trail = document.querySelector('.c-trail');
    if (!ball || !trail) return;
    if (!matchMedia('(pointer: fine)').matches) return;
    let mx = -100, my = -100, tx = -100, ty = -100, live = false;
    const show = () => { ball.style.opacity = '1'; trail.style.opacity = '1'; };
    const hide = () => { ball.style.opacity = '0'; trail.style.opacity = '0'; };
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      if (!live) { live = true; show(); }
    });
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', () => { if (live) show(); });
    if (reduced) {
      window.addEventListener('mousemove', () => {
        const t = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
        ball.style.transform = t; trail.style.transform = t;
      });
      return;
    }
    (function loop(){
      tx += (mx - tx) * 0.14; ty += (my - ty) * 0.14;
      ball.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      trail.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
  })();

  (() => {
    const wrap   = document.getElementById('heroName');
    const reveal = wrap && wrap.querySelector('.hero-name-reveal');
    if (!wrap || !reveal) return;
    if (!matchMedia('(pointer: fine)').matches) return;
    wrap.addEventListener('mousemove', e => {
      const r = wrap.getBoundingClientRect();
      reveal.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      reveal.style.setProperty('--my', (e.clientY - r.top) + 'px');
      wrap.classList.add('is-hover');
      document.body.classList.add('c-hover');
    });
    wrap.addEventListener('mouseenter', () => document.body.classList.add('dark'));
    wrap.addEventListener('mouseleave', () => {
      wrap.classList.remove('is-hover');
      document.body.classList.remove('c-hover');
      if (current !== 'notes') document.body.classList.remove('dark');
    });
  })();

  if (window.SplitType && window.gsap && !reduced) {
    const split = new SplitType('.hero-name', { types: 'chars' });
    gsap.set(split.chars, { yPercent: 110 });
    gsap.to(split.chars, { yPercent: 0, duration: 1, stagger: 0.04, ease: 'power4.out', delay: 0.15 });
    gsap.from('.tagline, .hero-links', { y: 20, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out', delay: 0.6 });
  }

  (() => {
    if (!matchMedia('(pointer: fine)').matches || reduced) return;
    document.querySelectorAll('.mag').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r  = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.15;
        const dy = (e.clientY - (r.top  + r.height / 2)) * 0.15;
        el.style.transform = `translate(${dx}px,${dy}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  })();

  const tabBtns = document.querySelectorAll('.tab');
  const panels  = document.querySelectorAll('.panel');
  let current   = 'home';
  let animating = false;

  function swapTo(name) {
    if (name === current || animating) return;
    const from = document.querySelector(`.panel[data-panel="${current}"]`);
    const to   = document.querySelector(`.panel[data-panel="${name}"]`);
    if (!from || !to) return;

    document.body.classList.remove('c-hover');

    if (name === 'notes' && window.gsap && !reduced) {
      animating = true;
      document.body.classList.add('dark');
      gsap.to(from, {
        opacity: 0, scale: 0.4, rotate: -10, duration: 0.45, ease: 'power2.in',
        onComplete: () => {
          from.classList.remove('active');
          gsap.set(from, { clearProps: 'all' });
          tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === 'notes'));
          current = 'notes';
          animating = false;
          runNotesBoot();
        }
      });
      return;
    }

    if (name === 'notes') document.body.classList.add('dark');
    else document.body.classList.remove('dark');

    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === name));

    if (!window.gsap || reduced) {
      from.classList.remove('active');
      to.classList.add('active');
      current = name;
      return;
    }

    animating = true;
    gsap.to(from, {
      opacity: 0, y: -16, duration: 0.28, ease: 'power2.in',
      onComplete: () => {
        from.classList.remove('active');
        gsap.set(from, { clearProps: 'all' });
        to.classList.add('active');
        gsap.fromTo(to,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
            onComplete: () => { animating = false; } }
        );
      }
    });
    current = name;
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => swapTo(btn.dataset.tab)));

  const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  function parseIndexEntry(entry) {
    if (typeof entry === 'string') {
      const m = entry.match(/(\d{4}-\d{2}-\d{2})/);
      return { path: entry, date: m ? m[1] : '' };
    }
    return { path: entry.path || entry.id || '', date: entry.date || '' };
  }
  function buildNoteUrl(path) {
    if (path.endsWith('.json')) return NOTES_CONFIG.base + path;
    return NOTES_CONFIG.base + path + '/context.json';
  }
  function buildNoteBaseUrl(path) {
    if (path.endsWith('.json')) return NOTES_CONFIG.base;
    return NOTES_CONFIG.base + path + '/';
  }
  function monthLabel(ym) {
    const [y, m] = ym.split('-');
    const idx = parseInt(m, 10) - 1;
    return `${MONTHS[idx] || m} ${y}`;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  async function loadNotesWithProgress(index, progressLine) {
    const total = index.length;
    const results = [];
    for (let i = 0; i < index.length; i++) {
      const entry = index[i];
      const { path, date } = parseIndexEntry(entry);
      progressLine.update(`fetching notes (${i}/${total})`, path);
      try {
        const r = await fetch(buildNoteUrl(path), { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        const note = await r.json();
        results.push({ ...note, date: note.date || date, _path: path, _baseUrl: buildNoteBaseUrl(path) });
      } catch (e) { }
      progressLine.update(`fetching notes (${i + 1}/${total})`, path);
    }
    results.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return results;
  }
  let cachedNotes = null;
  marked.setOptions({ breaks: true, gfm: true });
  function buildFilters(notes) {
    const filters = [{ key: 'all', label: 'all' }];
    const years = new Set(); const months = new Set();
    notes.forEach(n => {
      if (!n.date || n.date.length < 7) return;
      years.add(n.date.slice(0, 4)); months.add(n.date.slice(0, 7));
    });
    [...years].sort().reverse().forEach(y => filters.push({ key: 'year:' + y, label: y }));
    [...months].sort().reverse().forEach(ym => filters.push({ key: 'month:' + ym, label: monthLabel(ym) }));
    return filters;
  }
  function filterNotes(notes, key) {
    if (key === 'all') return notes;
    if (key.startsWith('year:')) return notes.filter(n => (n.date || '').startsWith(key.slice(5)));
    if (key.startsWith('month:')) return notes.filter(n => (n.date || '').startsWith(key.slice(6)));
    return notes;
  }
  function renderNoteItem(n) {
    let md = n.content || '';
    if (n.images && n.images.length) {
      n.images.forEach(img => { if (!md.includes(img)) md += `\n\n![image](${img})`; });
    }
    md = md.replace(/!\[([^\]]*)\]\((?!http)([^)]+)\)/g, (match, alt, path) => `![${alt}](${n._baseUrl}${path})`);
    const htmlContent = marked.parse(md);
    return `<li class="note-item">
      <div class="note-date">${escapeHtml(n.date || '')}</div>
      <div class="note-title">${escapeHtml(n.title || 'untitled')}</div>
      <div class="note-content">${htmlContent}</div>
    </li>`;
  }
  function wireImageLightbox() {
    document.querySelectorAll('.note-content img').forEach(img => {
      img.addEventListener('click', () => {
        const lb = document.getElementById('lightbox');
        lb.querySelector('img').src = img.src;
        lb.classList.add('open');
      });
    });
  }
  function renderNotes(notes) {
    const list = document.getElementById('notesList');
    const meta = document.getElementById('notesMeta');
    const filters = document.getElementById('notesFilters');
    if (!list) return;
    if (!notes || !notes.length) {
      meta.textContent = '0 notes'; filters.innerHTML = '';
      list.innerHTML = '<li class="notes-empty">&gt; no notes yet</li>';
      return;
    }
    const filterList = buildFilters(notes);
    let activeFilter = 'all';
    function apply() {
      const filtered = filterNotes(notes, activeFilter);
      list.innerHTML = filtered.map(renderNoteItem).join('');
      meta.textContent = `${filtered.length} / ${notes.length}`;
      wireImageLightbox();
      if (window.gsap && !reduced) gsap.from('.note-item', { opacity: 0, y: 12, duration: 0.35, stagger: 0.04, ease: 'power2.out' });
    }
    filters.innerHTML = filterList.map(f => `<button class="filter-chip ${f.key === 'all' ? 'active' : ''}" data-key="${f.key}">${f.label}</button>`).join('');
    filters.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.key;
        filters.querySelectorAll('.filter-chip').forEach(b => b.classList.toggle('active', b === btn));
        apply();
      });
    });
    apply();
  }

  function makeLogLine(container) {
    const line = document.createElement('div');
    line.className = 'notes-boot-log-line';
    line.innerHTML = `<span class="k"></span><span class="v"></span>`;
    container.appendChild(line);
    if (window.gsap && !reduced) gsap.fromTo(line, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    else line.style.opacity = 1;
    return line;
  }
  function addLogLine(container, key, value, isError) {
    const line = makeLogLine(container);
    line.querySelector('.k').textContent = '> ' + key;
    const v = line.querySelector('.v');
    v.textContent = value;
    if (isError) v.classList.add('err');
    return Promise.resolve();
  }
  function addProgressLine(container, key, value) {
    const line = makeLogLine(container);
    const k = line.querySelector('.k'); const v = line.querySelector('.v');
    k.textContent = '> ' + key; v.textContent = value;
    return { update(kk, vv) { k.textContent = '> ' + kk; v.textContent = vv; } };
  }

  async function runNotesBoot() {
    const boot = document.getElementById('notesBoot');
    const title = document.getElementById('notesBootTitle');
    const log = document.getElementById('notesBootLog');
    boot.style.display = 'flex';
    log.innerHTML = '';
    title.innerHTML = 'notes';
    title.style.opacity = '1';
    if (window.gsap) gsap.set(title, { clearProps: 'all' });
    if (window.gsap && !reduced) {
      gsap.fromTo(title, { opacity: 0, scale: 0.7, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'power3.out' });
      await delay(600);
    } else await delay(200);
    title.innerHTML = 'notes<span class="sh">.sh</span>';
    await delay(350);
    if (window.gsap && !reduced) gsap.to(title, { y: -100, duration: 0.4, ease: 'power2.out' });
    await delay(350);

    if (cachedNotes) {
      await addLogLine(log, 'init', 'initializing notes system');
      await delay(250);
      await addLogLine(log, 'cache hit', `${cachedNotes.length} notes loaded`);
      await delay(250);
      await addLogLine(log, 'loading ui', 'rendering');
      await delay(200);
      if (window.gsap && !reduced) {
        const rect = title.getBoundingClientRect();
        gsap.to(title, { x: 40 - rect.left, y: 100 - rect.top, scale: 0.15, opacity: 0, duration: 0.7, ease: 'power3.inOut' });
        await delay(700);
      } else await delay(200);
      boot.style.display = 'none';
      document.querySelector('.panel[data-panel="notes"]').classList.add('active');
      renderNotes(cachedNotes);
      if (window.gsap && !reduced) gsap.from('.notes-view', { opacity: 0, y: 30, duration: 0.5 });
      return;
    }

    await addLogLine(log, 'init', 'initializing notes system');
    await delay(300);
    await addLogLine(log, 'reading index', NOTES_CONFIG.indexFile);
    await delay(300);

    let index = [];
    try {
      const r = await fetch(NOTES_CONFIG.base + NOTES_CONFIG.indexFile, { cache: 'no-store' });
      if (!r.ok) throw new Error('http ' + r.status);
      index = await r.json();
    } catch (err) {
      await addLogLine(log, 'error', 'index: ' + err.message, true);
      await delay(400);
      boot.style.display = 'none';
      document.querySelector('.panel[data-panel="notes"]').classList.add('active');
      renderNotes([]);
      return;
    }

    await addLogLine(log, 'index loaded', `${index.length} notes in queue`);
    await delay(300);
    const progress = addProgressLine(log, `fetching notes (0/${index.length})`, '');
    await delay(150);
    const notes = await loadNotesWithProgress(index, progress);
    await delay(200);
    await addLogLine(log, 'loaded', `${notes.length} note${notes.length === 1 ? '' : 's'}`);
    await delay(250);
    await addLogLine(log, 'loading ui', 'rendering');
    await delay(200);
    cachedNotes = notes;

    if (window.gsap && !reduced) {
      const rect = title.getBoundingClientRect();
      gsap.to(title, { x: 40 - rect.left, y: 100 - rect.top, scale: 0.15, opacity: 0, duration: 0.7, ease: 'power3.inOut' });
      await delay(700);
    } else await delay(200);

    boot.style.display = 'none';
    document.querySelector('.panel[data-panel="notes"]').classList.add('active');
    renderNotes(notes);
    if (window.gsap && !reduced) gsap.from('.notes-view', { opacity: 0, y: 30, duration: 0.5, ease: 'power2.out' });
  }

  (() => {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    lb.addEventListener('click', () => lb.classList.remove('open'));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
  })();

  (() => {
    const USER = 'lunarshe11';
    const list = document.getElementById('actList');
    if (!list) return;
    const TYPES = {
      PushEvent:{cls:'push',label:'push'}, WatchEvent:{cls:'star',label:'star'},
      PullRequestEvent:{cls:'pr',label:'pr'}, IssuesEvent:{cls:'issue',label:'issue'},
      CreateEvent:{cls:'create',label:'create'}, ReleaseEvent:{cls:'release',label:'release'},
      ForkEvent:{cls:'fork',label:'fork'},
    };
    (async () => {
      try {
        const res = await fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`, { headers: { 'Accept': 'application/vnd.github+json' } });
        if (!res.ok) throw new Error('http ' + res.status);
        const data = await res.json();
        const evts = data.filter(e => TYPES[e.type]).slice(0, 8);
        if (!evts.length) { list.innerHTML = '<li class="act-empty">&gt; no recent activity</li>'; return; }
        list.innerHTML = evts.map(e => {
          const t = TYPES[e.type];
          const repo = e.repo.name.split('/')[1] || e.repo.name;
          const iso  = e.created_at;
          return `<li class="act-item">
            <span class="act-type ${t.cls}">${t.label}</span>
            <span class="act-repo">${repo}</span>
            <span class="act-date">${iso.slice(0,10)} ${iso.slice(11,16)}</span>
          </li>`;
        }).join('');
      } catch (err) {
        list.innerHTML = `<li class="act-empty">&gt; failed: ${err.message}</li>`;
      }
    })();
  })();

  (() => {
    const overlay = document.getElementById('palette');
    const input   = document.getElementById('paletteInput');
    const ul      = document.getElementById('paletteList');
    const trigger = document.getElementById('cmdTrigger');
    const openURL = url => { close(); if (url && url !== '#') window.open(url, '_blank'); };
    
    const ITEMS = [
      { label: 'home',      hint: 'tab', act: () => { close(); swapTo('home'); } },
      { label: 'projects',  hint: 'tab', act: () => { close(); swapTo('projects'); } },
      { label: 'skills',    hint: 'tab', act: () => { close(); swapTo('skills'); } },
      { label: 'activity',  hint: 'tab', act: () => { close(); swapTo('activity'); } },
      { label: 'notes',     hint: 'tab', act: () => { close(); swapTo('notes'); } },
      { label: 'readme',    hint: 'tab', act: () => { close(); swapTo('readme'); } },
      { label: 'fetch',     hint: 'tab', act: () => { close(); swapTo('fetch'); } },
      { label: 'github',    hint: '↗ open', act: () => openURL('https://github.com/lunarshe11') },
      { label: 'pinterest', hint: '↗ open', act: () => openURL('https://pinterest.com/lunarshe11/') },
      { label: 'vk',        hint: '↗ open', act: () => openURL('https://vk.ru/wittylunar') },
    ];

    let filtered = ITEMS.slice(); let sel = 0;
    const render = () => {
      if (!filtered.length) { ul.innerHTML = '<li class="palette-empty">no matches</li>'; return; }
      ul.innerHTML = filtered.map((it, i) =>
        `<li class="palette-item ${i === sel ? 'sel' : ''}" data-i="${i}"><span>${it.label}</span><span class="hint">${it.hint}</span></li>`
      ).join('');
    };
    const open = () => {
      overlay.classList.add('open'); overlay.setAttribute('aria-hidden', 'false');
      input.value = ''; filtered = ITEMS.slice(); sel = 0; render();
      setTimeout(() => input.focus(), 20);
    };
    const close = () => { overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true'); };
    trigger && trigger.addEventListener('click', open);
    document.addEventListener('keydown', e => {
      const isOpen = overlay.classList.contains('open');
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault(); isOpen ? close() : open(); return;
      }
      if (!isOpen) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowDown') { e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
      else if (e.key === 'Enter') { const it = filtered[sel]; if (it) it.act(); }
    });
    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      filtered = ITEMS.filter(i => i.label.includes(q)); sel = 0; render();
    });
    ul.addEventListener('click', e => {
      const li = e.target.closest('.palette-item');
      if (!li) return;
      const it = filtered[+li.dataset.i]; if (it) it.act();
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  })();

});
