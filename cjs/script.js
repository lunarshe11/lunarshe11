document.addEventListener('DOMContentLoaded', () => {

  const clock = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
  };
  tick();
  setInterval(tick, 1000);

  const items = document.querySelectorAll('.rail-item');
  const views = document.querySelectorAll('.view');
  const content = document.querySelector('.content');

  items.forEach(btn => btn.addEventListener('click', () => {
    items.forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    views.forEach(v => v.classList.toggle('active', v.id === 'view-' + btn.dataset.view));
    if (content) content.scrollTop = 0;

    if (btn.dataset.view === 'activity') loadActivity();
  }));

  const pfp = document.getElementById('pfp');
  if (pfp) pfp.addEventListener('error', () => {
    pfp.style.display = 'none';
    pfp.parentElement.style.background =
      'repeating-linear-gradient(45deg,#101118 0 12px,#0a0b0f 12px 24px)';
  });

  const shots = document.querySelectorAll('.shot');
  if (shots.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<img alt="">';
    document.body.appendChild(lb);

    const lbImg = lb.querySelector('img');
    shots.forEach(s => s.addEventListener('click', () => {
      lbImg.src = s.querySelector('img').src;
      lb.classList.add('open');
    }));
    lb.addEventListener('click', () => lb.classList.remove('open'));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') lb.classList.remove('open');
    });
  }

  const USER = 'lunarshe11';
  const TYPES = {
    PushEvent:        { cls: 'push',    label: 'push'    },
    WatchEvent:       { cls: 'star',    label: 'star'    },
    PullRequestEvent: { cls: 'pr',      label: 'pr'      },
    IssuesEvent:      { cls: 'issue',   label: 'issue'   },
    CreateEvent:      { cls: 'create',  label: 'create'  },
    ReleaseEvent:     { cls: 'release', label: 'release' },
    ForkEvent:        { cls: 'fork',    label: 'fork'    },
  };
  let actLoaded = false;

  async function loadActivity() {
    if (actLoaded) return;
    actLoaded = true;

    const list   = document.getElementById('actList');
    const status = document.getElementById('actStatus');

    try {
      const res = await fetch(
        `https://api.github.com/users/${USER}/events/public?per_page=30`,
        { headers: { 'Accept': 'application/vnd.github+json' } }
      );
      if (!res.ok) throw new Error('http ' + res.status);
      const data = await res.json();

      const allowed = Object.keys(TYPES);
      const evts = data.filter(e => allowed.includes(e.type)).slice(0, 12);

      if (!evts.length) {
        list.innerHTML = '<li class="act-empty">&gt; no recent activity</li>';
        status.textContent = 'empty';
        return;
      }

      list.innerHTML = evts.map((e, i) => {
        const t    = TYPES[e.type];
        const repo = e.repo.name.split('/')[1] || e.repo.name;
        const iso  = e.created_at;
        const date = iso.slice(0, 10);
        const time = iso.slice(11, 16);
        const num  = String(i + 1).padStart(2, '0');
        return `<li class="act-item">
          <span class="act-num">${num}</span>
          <div>
            <span class="act-type ${t.cls}">${t.label}</span>
            <span class="act-repo">${repo}</span>
          </div>
          <span class="act-date">${date} ${time}</span>
        </li>`;
      }).join('');

      status.textContent = evts.length + ' events';
    } catch (err) {
      list.innerHTML = `<li class="act-empty">&gt; failed: ${err.message}</li>`;
      status.textContent = 'error';
    }
  }

});
