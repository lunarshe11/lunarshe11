document.addEventListener('DOMContentLoaded', () => {

    const BOOT_VISIBLE = 1000;
    const BOOT_FADE    = 150;
    const BOOT_TOTAL   = BOOT_VISIBLE + BOOT_FADE;

    const bootEl  = document.getElementById('boot');
    const bootLog = document.getElementById('bootLog');
    const bootBar = document.getElementById('bootBar');

    const BOOT_LINES = [
        '> mounting /dev/root',
        '> kernel modules',
        '> network stack',
        '> loading assets',
        '> transmission ready'
    ];

    if (bootEl) {
        BOOT_LINES.forEach((line, i) => {
            setTimeout(() => {
                const d = document.createElement('div');
                d.className = 'line';
                const isLast = i === BOOT_LINES.length - 1;
                if (isLast) {
                    d.textContent = line;
                } else {
                    d.innerHTML = line + ' <span class="ok">OK</span>';
                }
                bootLog.appendChild(d);
            }, i * 90);
        });

        let p = 0;
        const barIv = setInterval(() => {
            p += 14;
            if (p >= 100) { p = 100; clearInterval(barIv); }
            if (bootBar) bootBar.style.width = p + '%';
        }, 55);

        setTimeout(() => {
            bootEl.classList.add('hidden');
            setTimeout(() => bootEl.remove(), BOOT_FADE + 50);
        }, BOOT_VISIBLE);
    }

    setTimeout(() => {
        if (typeof Typed !== 'undefined') {
            new Typed('#typed-name', {
                strings: ['she11', 'lunarshe11', 'wittylunar'],
                typeSpeed: 90,
                backSpeed: 50,
                backDelay: 1400,
                loop: true,
                showCursor: false
            });

            new Typed('#typed-bio', {
                strings: ['> 16 лет, lunarshe11 / wittylunar<br>> пишу код и ломаю вещи'],
                typeSpeed: 30,
                showCursor: false,
                startDelay: 400
            });
        }
    }, BOOT_TOTAL);

    const btns = document.querySelectorAll('.rail-btn');
    const secs = document.querySelectorAll('.sec');
    btns.forEach(btn => btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        secs.forEach(s => s.classList.toggle('active', s.id === 'sec-' + btn.dataset.sec));
        const stage = document.querySelector('.stage');
        if (stage) stage.scrollTop = 0;
    }));

    document.querySelectorAll('[data-work]').forEach(w => {
        const row = w.querySelector('.work-row');
        if (!row) return;
        row.addEventListener('click', e => {
            if (e.target.closest('.w-link')) return;
            w.classList.toggle('open');
        });
    });

    const idEl = document.getElementById('hud-id');
    if (idEl) {
        let id = null;
        try { id = localStorage.getItem('she11_id'); } catch (e) {}
        if (!id) {
            id = '0x' + Math.floor(Math.random() * 0xFFFFFFFF)
                .toString(16).toUpperCase().padStart(8, '0');
            try { localStorage.setItem('she11_id', id); } catch (e) {}
        }
        idEl.textContent = 'ID: ' + id;
    }

    const timeEl = document.getElementById('hud-time');
    if (timeEl) {
        const tick = () => { timeEl.textContent = new Date().toLocaleTimeString('ru-RU'); };
        tick();
        setInterval(tick, 1000);
    }

    const vid = document.getElementById('bg-video');
    if (vid) {
        vid.addEventListener('error', () => { vid.style.display = 'none'; }, true);
    }

    const mega = document.getElementById('megaTitle');
    if (mega) {
        const JP_TEXT   = 'シェル';
        const FIN_TEXT  = 'SHE11';
        const HOLD      = 5000;
        const STAGGER   = 45;
        const CHAR_DUR  = 420;
        const BOOT_OFF  = BOOT_TOTAL + 400;

        let current = 'jp';
        let running = false;

        const waveTransition = (target) => {
            if (running) return;
            running = true;

            const targetText = target === 'jp' ? JP_TEXT : FIN_TEXT;
            const oldText    = current === 'jp' ? JP_TEXT : FIN_TEXT;
            const oldChars   = [...oldText];
            const newChars   = [...targetText];
            const maxLen     = Math.max(oldChars.length, newChars.length);

            let html = '';
            for (let i = 0; i < maxLen; i++) {
                const o = oldChars[i] || '';
                const n = newChars[i] || '';
                html += `<span class="wave-ch" data-n="${n}" style="--i:${i}">${o}</span>`;
            }
            mega.innerHTML = html;
            mega.classList.add('waving');

            const chars = mega.querySelectorAll('.wave-ch');

            chars.forEach((ch, i) => {
                const peak = i * STAGGER + CHAR_DUR * 0.42;
                setTimeout(() => {
                    ch.textContent = ch.dataset.n;
                }, peak);
            });

            const totalMs = (maxLen - 1) * STAGGER + CHAR_DUR + 60;
            setTimeout(() => {
                mega.classList.remove('waving');
                mega.textContent = targetText;
                mega.setAttribute('data-text', targetText);
                current = target;
                running = false;
            }, totalMs);
        };

        const loop = () => {
            const next = current === 'jp' ? 'fin' : 'jp';
            waveTransition(next);
            setTimeout(loop, STAGGER * 5 + CHAR_DUR + HOLD);
        };

        setTimeout(loop, BOOT_OFF);

        mega.addEventListener('click', () => {
            if (running) return;
            const next = current === 'jp' ? 'fin' : 'jp';
            waveTransition(next);
        });
    }

});