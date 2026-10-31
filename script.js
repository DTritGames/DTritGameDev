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
        'Images/Art/BOABFBodies.png',
        'Images/Art/BOABFhumvee.png',
        'Images/Art/BOABFCIty.png',
        'Images/Art/Watercolor.png',
        'Images/Art/InnerDemonsWide.jpg',
        'Images/Art/InnerDemons2.jpg',
        'Images/Art/Reflection.jpg',
        'Images/Art/Reflection2.jpg',
        'Images/Art/BrokenPeacesChina.png',
        'Gifs/boringdeskjob.gif',
        'Gifs/dino%20tower.gif',
        'Gifs/goofyfish.gif',
        'Gifs/hanhee1.gif',
        'Gifs/hanhee2.gif',
        'Gifs/head2head.gif',
        'Gifs/innerdemons.gif',
        'Gifs/misc.gif',
        'Gifs/misc2.gif',
        'Gifs/misc3.gif',
        'Gifs/Nodestrikeaction.gif',
        'Gifs/Nodestrikemap.gif',
        'Gifs/randomobjectspinulator.gif',
        'Gifs/reflection1.gif',
        'Gifs/reflection2.gif',
        'Gifs/slidefall.gif',
        'Gifs/slidefall2.gif',
        'Gifs/snowmanroadkill.gif',
        'Images/refheader.jpg',
        'Images/InnerHeader.jpg',
        'Images/IDHeader.jpg',
        'Images/header.jpg'
    ];

    const maxActiveImages = 5; // max images visible at once
    let activeImages = [];

    // Gifs and still images each get their own shuffled deck, so every image
    // in a group is used once before any of them repeats
    const isGif = src => /\.gif$/i.test(src);
    const pools = {
        gif: backgroundImages.filter(isGif),
        still: backgroundImages.filter(src => !isGif(src))
    };
    const decks = { gif: [], still: [] };

    // Every image currently in the DOM (including ones that are fading out)
    const onScreen = new Map(); // src -> img element

    function shuffled(list) {
        const copy = [...list];
        for (let i = copy.length - 1; i > 0; i--) {
            const k = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[k]] = [copy[k], copy[i]];
        }
        return copy;
    }

    // Next image of the given type that is not already on screen
    function takeSource(type) {
        const pool = pools[type];
        if (pool.length === 0) return null;
        for (let attempts = 0; attempts <= pool.length; attempts++) {
            if (decks[type].length === 0) decks[type] = shuffled(pool);
            const candidate = decks[type].pop();
            if (!onScreen.has(candidate)) return candidate;
            decks[type].unshift(candidate); // in use right now: try again later
        }
        return null;
    }

    // Keep about half of the images as gifs (ties go to a gif)
    function chooseType() {
        const gifCount = activeImages.filter(i => i.dataset.type === 'gif').length;
        const stillCount = activeImages.length - gifCount;
        return gifCount <= stillCount ? 'gif' : 'still';
    }

    function removeImage(img) {
        if (img.parentNode) img.remove();
        const index = activeImages.indexOf(img);
        if (index > -1) activeImages.splice(index, 1);
        if (onScreen.get(img.dataset.key) === img) onScreen.delete(img.dataset.key);
    }

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
            if (oldest) {
                oldest.classList.remove('active');
                setTimeout(() => removeImage(oldest), 3000);
            }
        }

        const img = document.createElement('img');
        img.className = 'background-image';

        // Pick gif or still, then the next unused image of that type
        let type = chooseType();
        let src = takeSource(type);
        if (!src) {
            type = type === 'gif' ? 'still' : 'gif';
            src = takeSource(type);
        }
        if (!src) return; // nothing free right now, try again next tick

        img.src = src;
        img.alt = 'Background Screenshot';
        img.dataset.type = type;
        img.dataset.key = src;
        onScreen.set(src, img);

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
                if (!img.isConnected) return; // stop once the image has been removed
                scale += 0.0005;
                img.style.transform = `scale(${scale})`;
                requestAnimationFrame(grow);
            }

            grow();
        }, 100);

        // Keep visible for a few seconds then fade out
        setTimeout(() => {
            img.classList.remove('active');
        }, 6000);

        // Remove after fade out
        setTimeout(() => removeImage(img), 7000);
    }

    // Start image cycle
    createBackgroundImage();
    setInterval(createBackgroundImage, 500); // add a new image every half second

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

    // Scroll fade-in of the page content is handled by reveal.js
});