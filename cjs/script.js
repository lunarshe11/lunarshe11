document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    card.style.opacity = '1';
    card.style.transform = 'scale(1)';
    card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    anime({
        targets: '.avatar',
        scale: [0, 1],
        duration: 900,
        easing: 'easeOutElastic(1, .7)',
        delay: 200
    });

    anime({
        targets: '.links',
        opacity: [0, 1],
        duration: 700,
        easing: 'easeOutQuad',
        delay: 1200
    });

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
            startDelay: 800
        });
    }

    let pathTyped = null;
    const pathEl = document.getElementById('address-path');

    function setPath(newPath, callback) {
        if (pathTyped) {
            pathTyped.destroy();
            pathTyped = null;
        }
        pathEl.textContent = '';
        pathTyped = new Typed(pathEl, {
            strings: [newPath],
            typeSpeed: 60,
            showCursor: false,
            onComplete: () => { if (callback) callback(); }
        });
    }

    setPath('/info');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const panes = {
        info: document.getElementById('pane-info'),
        accident: document.getElementById('pane-accident'),
        project: document.getElementById('pane-project')
    };
    const linksContainer = document.getElementById('links-container');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            Object.keys(panes).forEach(key => {
                panes[key].classList.toggle('active', key === tab);
            });
            const newPath = '/' + tab;
            setPath(newPath);

            // Показываем ссылки только на вкладке info
            if (tab === 'info') {
                linksContainer.classList.remove('hidden');
            } else {
                linksContainer.classList.add('hidden');
            }
        });
    });

    // Project cards toggle
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Чтобы клик по ссылке внутри не закрывал карточку
            if (e.target.closest('.project-link')) return;
            this.classList.toggle('open');
        });
    });

    const idEl = document.getElementById('card-id');
    let storedId = localStorage.getItem('she11_id');
    if (!storedId) {
        const randomHex = Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0');
        storedId = '0x' + randomHex;
        localStorage.setItem('she11_id', storedId);
    }
    idEl.textContent = 'ID: ' + storedId;
});