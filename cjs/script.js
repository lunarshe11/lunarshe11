window.addEventListener('load', () => {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }

    const loadingTyped = new Typed('#loading-typed', {
        strings: ['she11'],
        typeSpeed: 150,
        showCursor: false,
        onComplete: () => {
            document.querySelector('.loading-cursor').style.animation = 'none';
            setTimeout(() => {
                document.getElementById('loading').classList.add('hidden');
                startMainAnimations();
            }, 1000);
        }
    });

    function startMainAnimations() {
        anime({
            targets: '.card',
            opacity: [0, 1],
            translateY: [50, 0],
            duration: 1000,
            easing: 'easeOutExpo'
        });

        anime({
            targets: '.avatar',
            scale: [0, 1],
            duration: 1000,
            easing: 'easeOutElastic(1, .8)',
            delay: 300
        });

        new Typed('#typed-name', {
            strings: ['she11', 'lunarshe11', 'wittylunar', 'witt', 'witty', '4witty'],
            typeSpeed: 100,
            backSpeed: 50,
            backDelay: 1500,
            loop: true,
            showCursor: false
        });

        new Typed('#typed-bio', {
            strings: ['termux user on android<br>learning linux bash python<br>keenetic with entware<br>coding stuff and breaking things<br>always online never sleep'],
            typeSpeed: 30,
            showCursor: false,
            startDelay: 1500,
            onComplete: () => {
                document.querySelectorAll('.cursor').forEach(el => {
                    el.style.animation = 'none';
                    el.style.opacity = '1';
                });
            }
        });

        anime({
            targets: '.links',
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutQuad',
            delay: 3000
        });
    }
});