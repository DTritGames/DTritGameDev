document.addEventListener('DOMContentLoaded', function() {
    const backgroundImages = [
        'Images/ss_5b106830067f9ab8923dfcbb2da83d6374e72a1e.600x338.jpg',
        'Images/ss_05f2acc6370630327610f3f50f3dfb88c12e75d2.600x338.jpg',
        'Images/ss_99d3afdbbd701ded2cc7fa74090e9bc6106a6384.600x338.jpg',
        'Images/ss_8a475702f625f4e025316460dc2a26fa3a9605ae.600x338.jpg',
        'Images/ss_ab018b4d68115b3e8dd387f8a61578e5b43cb650.600x338.jpg',
        'Images/ss_3544119c34347d948b7ab0774ac655c1a20d4893.600x338.jpg',
        'Images/ss_24bc33ee7c980a958b8a0e7a8d928ee4cb1b96d6.600x338.jpg',
        'Images/ss_656d3006a18ffef8b0f3eed138bd45b431737144.600x338.jpg',
        'Images/ss_42b6deabce47d07c8b9d47bd164a1337b7e0ab77.600x338.jpg',
        'Images/ss_bfb48d51c5ca88be06896f23339e05d97c7a7de8.600x338.jpg',
        'Images/ss_8f797c689c6e199dd23745719b07d6766f3ce716.600x338.jpg',
        'Images/ss_0c31c6b1957e07f7911659653a5fe61e046f82dc.600x338.jpg',
        'Images/ss_f3785ff745936edecf7b8b2012fa5a2332266298.600x338.jpg',
        'Images/ss_208717b5d3a6d49df2d1f5bbebadf7b378838522.600x338.jpg',
        'Images/ss_6db1d0c80c24c0379e44f99ea15cd86f03ec6d15.1920x1080.jpg',
        'Images/ss_9a8f3af3a89e0e50eebc0f714de0d1f7eed4c6e1.600x338.jpg',
        'Images/ss_9f48f83c9b1b34cfeef789a6841d969085c543ef.600x338.jpg',
        'Images/ss_3d5598407206c5342e239b0b26dfbbfb9e44bd4a.600x338.jpg',
        'Images/ss_b73a180318308fabdbdadbf12f1e333085979637.600x338.jpg',
        'Images/ss_98ad7540a1d4264d3d0598bfb2f88d50e7df9304.600x338.jpg',
        'Images/ss_c26ba4ecfa49aed969d340c4d8822034fa1cc249.600x338.jpg',
        'Images/refheader.jpg',
        'Images/InnerHeader.jpg',
        'Images/IDHeader.jpg',
        'Images/header.jpg'
    ];

    const maxActiveImages = 5; // max images visible at once
    let activeImages = [];

    const fixedSizes = [
        { width: 250, height: 150 },
        { width: 270, height: 160 },
        { width: 230, height: 140 },
        { width: 260, height: 155 },
        { width: 240, height: 145 }
    ];

    // Finds a position where image won't overlap existing images
    function getNonOverlappingPosition(imgWidth, imgHeight, maxAttempts = 30) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = Math.random() * (viewportWidth - imgWidth);
            const y = Math.random() * (viewportHeight - imgHeight);

            const overlaps = activeImages.some(img => {
                const rect = img.getBoundingClientRect();
                return !(
                    x + imgWidth < rect.left ||
                    x > rect.right ||
                    y + imgHeight < rect.top ||
                    y > rect.bottom
                );
            });

            if (!overlaps) {
                return { x, y };
            }
        }
        // Fallback to random if no free space found
        return {
            x: Math.random() * (viewportWidth - imgWidth),
            y: Math.random() * (viewportHeight - imgHeight)
        };
    }

    // Create and show a background image with fade in/out and continuous growth
    function createBackgroundImage() {
        // Remove oldest image if max reached
        if (activeImages.length >= maxActiveImages) {
            const oldest = activeImages.shift();
            if (oldest && oldest.parentNode) {
                oldest.classList.remove('active');
                setTimeout(() => {
                    if (oldest.parentNode) oldest.remove();
                }, 3000);
            }
        }
    
        const img = document.createElement('img');
        img.className = 'background-image';
    
        // Choose a random image source (prevent immediate duplicates)
        let src;
        do {
            src = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
        } while (activeImages.some(i => i.src.includes(src)));
    
        img.src = src;
        img.alt = 'Background Screenshot';
    
        // Pick a fixed size for consistency
        const size = fixedSizes[Math.floor(Math.random() * fixedSizes.length)];
        img.style.width = size.width + 'px';
        img.style.height = size.height + 'px';
    
        // Get non-overlapping position
        const pos = getNonOverlappingPosition(size.width, size.height);
        img.style.left = pos.x + 'px';
        img.style.top = pos.y + 'px';
    
        // Initial styles
        img.style.transform = 'scale(1)';
    
        document.querySelector('.background-container').appendChild(img);
        activeImages.push(img);
    
        // Fade in and start growing
        setTimeout(() => {
            img.classList.add('active');
    
            let scale = 1;
    
            function grow() {
                scale += 0.0005;
                img.style.transform = `scale(${scale})`;
                requestAnimationFrame(grow);
            }
    
            grow();
        }, 100);
    
        // Keep visible for 4 seconds then fade out
        setTimeout(() => {
            img.classList.remove('active');
        }, 6000);
    
        // Remove after fade out
        setTimeout(() => {
            if (img.parentNode) img.remove();
            const index = activeImages.indexOf(img);
            if (index > -1) activeImages.splice(index, 1);
        }, 7000);
    }
    

    // Start image cycle
    // Start image cycle

    createBackgroundImage();


    setInterval(createBackgroundImage, 500); // add a new image every second
 // add a new image every second

    // === PARTICLES CANVAS ===
    (function() {
        const canvas = document.getElementById('particle-canvas');
        const ctx = canvas.getContext('2d');

        let width, height;
        let particles = [];
        const particleCount = 80;

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        window.addEventListener('resize', resize);
        resize();

        function createParticles() {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.3,
                    speedY: (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.3 + 0.1,
                    flickerSpeed: Math.random() * 0.002 + 0.001,
                    flickerDirection: 1
                });
            }
        }

        function updateParticles() {
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around edges
                if (p.x > width) p.x = 0;
                if (p.x < 0) p.x = width;
                if (p.y > height) p.y = 0;
                if (p.y < 0) p.y = height;

                // Flicker opacity
                p.opacity += p.flickerSpeed * p.flickerDirection;
                if (p.opacity >= 0.3) p.flickerDirection = -1;
                if (p.opacity <= 0.2) p.flickerDirection = 1;
            });
        }

        function drawParticles() {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
                ctx.shadowBlur = 4;
                ctx.fill();
            });
        }

        function animate() {
            updateParticles();
            drawParticles();
            requestAnimationFrame(animate);
        }

        createParticles();
        animate();
    })();

    // === TITLE FADE ON SCROLL ===
    const titleOverlay = document.querySelector('.background-overlay');
    let titleFaded = false;

    function handleScroll() {
        const scrollY = window.scrollY;
        const fadeThreshold = 100;

        if (scrollY > fadeThreshold && !titleFaded) {
            titleOverlay.classList.add('fade-out');
            titleFaded = true;
        } else if (scrollY <= fadeThreshold && titleFaded) {
            titleOverlay.classList.remove('fade-out');
            titleFaded = false;
        }
    }
    window.addEventListener('scroll', handleScroll);

    // === INTERSECTION OBSERVERS FOR APPEAR/DISAPPEAR ===
    const headings = document.querySelectorAll('h2');
    const paragraphs = document.querySelectorAll('main > p:not(.game-section p)');
    const gameSections = document.querySelectorAll('.game-section');

    const appearObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const disappearObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -100px 0px'
    });

    headings.forEach(h => appearObserver.observe(h));
    paragraphs.forEach(p => appearObserver.observe(p));
    gameSections.forEach(s => {
        appearObserver.observe(s);
        disappearObserver.observe(s);
    });
});
