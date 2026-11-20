
(() => {
    'use strict';

    // ==========================================
    // HELPER
    // ==========================================

    const $ = (selector, context = document) =>
        context.querySelector(selector);

    const $$ = (selector, context = document) =>
        [...context.querySelectorAll(selector)];

    const placeholder = (label) => {
        const safeLabel = String(label).replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;'
        })[char]);

        return 'data:image/svg+xml;charset=UTF-8,' +
            encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="800" height="600" viewBox="0 0 800 600">

                    <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stop-color="#FFF8DE"/>
                            <stop offset="1" stop-color="#FFD83D"/>
                        </linearGradient>
                    </defs>

                    <rect width="800" height="600" fill="url(#g)"/>
                    <circle cx="400" cy="260" r="64"
                        fill="#FFFCF1" opacity=".8"/>

                    <text x="400" y="400"
                        text-anchor="middle"
                        font-family="Arial,sans-serif"
                        font-size="34"
                        font-weight="700"
                        fill="#493B24">${safeLabel}</text>

                    <text x="400" y="440"
                        text-anchor="middle"
                        font-family="Arial,sans-serif"
                        font-size="20"
                        fill="#8B7956">Ganti dengan fotomu</text>
                </svg>
            `);
    };


    // ==========================================
    // IMAGE FALLBACK
    // ==========================================

    const guard = (img) => {
        const fix = () => {
            img.onerror = null;
            img.src = placeholder(img.dataset.ph || 'Placeholder');
        };

        img.onerror = fix;

        if (img.complete && img.naturalWidth === 0) {
            fix();
        }
    };

    $$('img[data-ph]').forEach(guard);


    // ==========================================
    // LOADING SCREEN
    // ==========================================

    const loader = $('#loader');
    const num = $('#loaderNum');
    const bar = $('#loaderBar');

    let p = 0;
    let pageReady = document.readyState === 'complete';

    window.addEventListener('load', () => {
        pageReady = true;
    });

    if (loader && num && bar) {
        document.body.style.overflow = 'hidden';

        const tick = setInterval(() => {
            p += pageReady ? 6 : Math.random() * 3.5;

            if (!pageReady && p > 90) {
                p = 90;
            }

            if (p >= 100) {
                p = 100;
                clearInterval(tick);

                setTimeout(() => {
                    loader.classList.add('done');
                    document.body.style.overflow = '';
                }, 250);
            }

            num.textContent = Math.floor(p);
            bar.style.width = p + '%';

        }, 40);
    }


    // ==========================================
    // DARK / LIGHT MODE
    // ==========================================

    const root = document.documentElement;
    const themeBtn = $('#themeBtn');

    let saved = null;

    try {
        saved = localStorage.getItem('theme');
    } catch (e) {}

    root.dataset.theme = saved || 'light';

    themeBtn?.addEventListener('click', () => {
        const next =
            root.dataset.theme === 'dark' ? 'light' : 'dark';

        root.dataset.theme = next;

        try {
            localStorage.setItem('theme', next);
        } catch (e) {}
    });


    // ==========================================
    // NAVIGATION & SCROLL
    // ==========================================

    const links = $$('.nav a');

    const sections = links
        .map(a => {
            const href = a.getAttribute('href');

            return href && href.startsWith('#')
                ? $(href)
                : null;
        })
        .filter(Boolean);

    const toTop = $('#toTop');

    const onScroll = () => {
        const y = window.scrollY + window.innerHeight * 0.35;

        let cur = sections[0];

        sections.forEach(section => {
            if (section.offsetTop <= y) {
                cur = section;
            }
        });

        links.forEach(a => {
            a.classList.toggle(
                'active',
                cur && a.getAttribute('href') === '#' + cur.id
            );
        });

        toTop?.classList.toggle('show', window.scrollY > 600);
    };

    window.addEventListener('scroll', onScroll, {
        passive: true
    });

    onScroll();

    toTop?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });


    // ==========================================
    // SCROLL REVEAL
    // ==========================================

    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15
        });

        $$('.reveal').forEach(el => {
            io.observe(el);
        });

    } else {
        $$('.reveal').forEach(el => {
            el.classList.add('in');
        });
    }


    // ==========================================
    // EXPERIENCE PHOTO STACK
    // ==========================================

    $$('[data-stack]').forEach(stack => {
        const btn = $('.swap', stack);

        if (!btn) return;

        btn.addEventListener('click', () => {
            stack.classList.toggle('flip');

            btn.textContent = (
                stack.classList.contains('flip') ? '2/2' : '1/2'
            ) + ' • Ganti foto ›';
        });
    });


    // ==========================================
    // IMAGE MODAL
    // ==========================================

    const modal = $('#modal');
    const mImg = $('#modalImg');

    function openModal(src, alt) {
        if (!modal || !mImg) return;

        mImg.src = src;
        mImg.alt = alt;

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        if (!modal) return;

        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }

    $('#modalX')?.addEventListener('click', closeModal);

    modal?.addEventListener('click', e => {
        if (e.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });


    // ==========================================
    // CONTACT FORM
    // ==========================================

    const form = $('#form');
    const msg = $('#formMsg');

    form?.addEventListener('submit', e => {
        e.preventDefault();

        let ok = true;

        $$('input, textarea', form).forEach(field => {
            const bad = !field.value.trim() ||
                (
                    field.type === 'email' &&
                    !/^\S+@\S+\.\S+$/.test(field.value)
                );

            field.classList.toggle('invalid', bad);

            if (bad) {
                ok = false;
            }
        });

        if (!ok) {
            if (msg) {
                msg.textContent =
                    'Lengkapi nama, email yang valid, dan pesan.';
            }

            return;
        }

        const data = new FormData(form);

        const body = encodeURIComponent(
            `${data.get('message')}\n\nDari: ${data.get('name')} (${data.get('email')})`
        );

        window.location.href =
            `mailto:email@anda.com?subject=${encodeURIComponent('Pesan dari portfolio')}&body=${body}`;

        if (msg) {
            msg.textContent = 'Membuka aplikasi email Anda...';
        }

        form.reset();
    });


// ==========================================
// MY PROJECTS SLIDER
// ==========================================

const projects = [
    {
        category: 'WEB DEVELOPMENT',
        title: 'Personal Website || Bloomly — Flower E-Commerce Website',
        desc: 'Website toko bunga online dengan tampilan modern dan nuansa ungu pastel. Menampilkan koleksi bunga, harga produk, rating, serta fitur keranjang belanja.',
        tech: 'HTML · CSS · JavaScript',
        image: 'project-1.PNG',
        link: 'https://alunlianat1212.github.io/Web_Toko/'
    },

    {
        category: 'WEB DEVELOPMENT',
        title: 'Personal Website || Naory Bakery — Bakery Website',
        desc: 'Website toko kue dengan desain elegan bernuansa cokelat dan cream. Menampilkan berbagai pilihan kue, deskripsi produk, harga, serta navigasi pemesanan dan pelacakan pesanan.',
        tech: 'HTML · CSS · JavaScript',
        image: 'project-2.PNG',
        link: 'https://alunlianat1212.github.io/Web_Naory/'
    },

    {
        category: 'CREATIVE WRITING',
        title: 'My Written Stories',
        desc: 'Kumpulan cerita fiksi dan karya sastra yang saya tulis berdasarkan imajinasi, ide, serta kreativitas. Setiap tulisan menjadi ruang untuk mengembangkan karakter dan membangun sebuah cerita.',
        tech: 'Creative Writing · Storytelling',
        image: 'project-3.jpg',
        link: null
    },

    {
        category: 'CREATIVE DESIGN',
        title: 'My Creative Designs',
        desc: 'Berbagai karya visual yang saya buat, mulai dari poster, infografis, hingga desain kreatif lainnya. Project ini menjadi wadah untuk mengeksplorasi ide dan kreativitas melalui desain.',
        tech: 'Canva · Graphic Design',
        image: 'project-4.jpg',
        link: null
    }
];

const projectSlider = $('.project-slider');

const projectImg = $('#projectImg');
const projectCategory = $('#projectCategory');
const projectNumber = $('#projectNumber');
const projectTitle = $('#projectTitle');
const projectDesc = $('#projectDesc');
const projectTech = $('#projectTech');
const projectLink = $('#projectLink');
const projectDots = $('#projectDots');

const prevProject = $('#prevProject');
const nextProject = $('#nextProject');

let projectIndex = 0;

function showProject(index) {
    if (
        !projectImg ||
        !projectCategory ||
        !projectNumber ||
        !projectTitle ||
        !projectDesc ||
        !projectTech ||
        !projectLink ||
        !projectDots
    ) {
        return;
    }

    // Loop 4 project
    projectIndex =
        (index + projects.length) % projects.length;

    const project = projects[projectIndex];

    // Ganti seluruh konten slide
    projectCategory.textContent = project.category;

    projectNumber.textContent =
        `PROJECT 0${projectIndex + 1} / 04`;

    projectTitle.textContent = project.title;
    projectDesc.textContent = project.desc;
    projectTech.textContent = project.tech;

    // Ganti gambar
    projectImg.onerror = () => {
        projectImg.onerror = null;
        projectImg.src = placeholder(project.title);
    };

    projectImg.src = project.image;
    projectImg.alt = project.title;

    // Ganti link project
    if (project.link) {
        projectLink.href = project.link;
        projectLink.style.setProperty('display', 'inline-flex');
    } else {
        projectLink.removeAttribute('href');
        projectLink.style.setProperty('display', 'none', 'important');
    }

    // Perbarui dot navigation
    projectDots.innerHTML = '';

    projects.forEach((item, i) => {
        const dot = document.createElement('button');

        dot.type = 'button';

        dot.className =
            'project-dot' +
            (i === projectIndex ? ' active' : '');

        dot.setAttribute(
            'aria-label',
            `Project ${i + 1}`
        );

        dot.setAttribute(
            'aria-current',
            i === projectIndex ? 'true' : 'false'
        );

        dot.addEventListener('click', () => {
            showProject(i);
        });

        projectDots.appendChild(dot);
    });
}


// ==========================================
// NEXT & PREVIOUS BUTTON
// ==========================================

prevProject?.addEventListener('click', () => {
    showProject(projectIndex - 1);
});

nextProject?.addEventListener('click', () => {
    showProject(projectIndex + 1);
});


// ==========================================
// KEYBOARD NAVIGATION
// ==========================================

projectSlider?.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        showProject(projectIndex - 1);
    }

    if (e.key === 'ArrowRight') {
        showProject(projectIndex + 1);
    }
});


// ==========================================
// SWIPE / TOUCH SLIDER
// ==========================================

let startX = 0;
let startY = 0;

projectSlider?.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
}, {
    passive: true
});

projectSlider?.addEventListener('touchend', e => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;

    // Hindari mengganggu scroll vertikal
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        showProject(projectIndex + (dx < 0 ? 1 : -1));
    }
}, {
    passive: true
});


// ==========================================
// INITIALIZE PROJECT
// ==========================================

showProject(0);


    // ==========================================
    // FOOTER YEAR
    // ==========================================

    const year = $('#year');

    if (year) {
        year.textContent = new Date().getFullYear();
    }

})();
