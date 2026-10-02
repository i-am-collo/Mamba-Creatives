/**
 * Mamba Creatives - Avant-Garde Digital Exhibition Application
 * Real Local File Upload Support, Product Deletion & LocalStorage Management.
 */

// Application Configuration
const CONFIG = {
    brandName: 'Mamba Creatives',
    // Customize your WhatsApp phone number here (International format without leading +)
    whatsappNumber: '254705393762',
    socialLinks: {
        youtube: 'https://www.youtube.com/@mambacreatives',
        instagram: 'https://www.instagram.com/mambacreatives/',
        tiktok: 'https://www.tiktok.com/@mambacreatives'
    }
};

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxWq7pNgJz5EZ30HiIPDInN2SKzryEDt8",
  authDomain: "mambacreatives-2d052.firebaseapp.com",
  projectId: "mambacreatives-2d052",
  storageBucket: "mambacreatives-2d052.firebasestorage.app",
  messagingSenderId: "407514954011",
  appId: "1:407514954011:web:f281158a4c4f0654c37bbe",
  measurementId: "G-9WLHZCKPP7"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Sizing Configurations & Scale Multipliers
const SIZE_CONFIGS = {
    standard: [
        { label: '30cm x 30cm', multiplier: 1.0, scaleWidth: 60, scaleHeight: 60, scaleLabel: 'Compact Wall' },
        { label: '30cm x 40cm', multiplier: 1.15, scaleWidth: 60, scaleHeight: 80, scaleLabel: 'Gallery Medium' },
        { label: '40cm x 40cm', multiplier: 1.35, scaleWidth: 80, scaleHeight: 80, scaleLabel: 'Standard Feature' },
        { label: '40cm x 50cm', multiplier: 1.55, scaleWidth: 80, scaleHeight: 100, scaleLabel: 'Large Focus' },
        { label: '50cm x 50cm', multiplier: 1.80, scaleWidth: 105, scaleHeight: 105, scaleLabel: 'Grand Centerpiece' }
    ],
    clocks: [
        { label: '30cm Diameter', multiplier: 1.0, scaleWidth: 65, scaleHeight: 65, scaleLabel: 'Standard Clock' },
        { label: '40cm Diameter', multiplier: 1.30, scaleWidth: 85, scaleHeight: 85, scaleLabel: 'Executive Clock' },
        { label: '50cm Diameter', multiplier: 1.65, scaleWidth: 105, scaleHeight: 105, scaleLabel: 'Sculptural Statement' }
    ]
};

// App State
const state = {
    artworks: [],
    activeCategory: 'all',
    searchQuery: '',
    sortBy: 'featured',
    selectedSizes: {},
    activeModalArtId: null,
    activeModalSizeIdx: 0,
    logoClickCount: 0,
    logoClickTimer: null,
    pendingImageDataUrl: null
};

// DOM Elements
let artGridEl, emptyStateEl, searchInputEl, clearSearchBtnEl, sortSelectEl;
let acquireModalEl, modalBodyEl, modalCloseBtnEl;
let studioOverlayEl, studioFormEl, studioCloseBtnEl, resetStorageBtnEl, studioTriggerBtnEl;
let tabAddArtEl, tabManageArtEl, studioManagePanelEl, manageListEl, studioCountBadgeEl;
let heroFeaturedBoxEl, heroUploadBtnEl, emptyStateUploadBtnEl;
let cursorDotEl, cursorRingEl;
let artImageFileEl, fileDropzoneEl, dropzoneContentEl, imagePreviewContainerEl, imagePreviewImgEl, removePreviewBtnEl;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initDOMElements();
    initTheme();
    initCustomCursor();
    initScrollReveals();
    loadArtworks();
    setupEventListeners();
    setupFileUploadHandlers();
    setupSecretTriggers();
    setupStudioTabs();
    updateCopyrightYear();
});

function initTheme() {
    const themeBtn = document.getElementById('themeToggleBtn');
    if (!themeBtn) return;
    
    // Load saved theme
    const savedTheme = localStorage.getItem('mamba_theme') || 'light';
    document.documentElement.dataset.theme = savedTheme;
    
    // Toggle theme
    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.dataset.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = newTheme;
        localStorage.setItem('mamba_theme', newTheme);
    });
}

function initDOMElements() {
    artGridEl = document.getElementById('artGrid');
    emptyStateEl = document.getElementById('emptyState');
    searchInputEl = document.getElementById('searchInput');
    clearSearchBtnEl = document.getElementById('clearSearchBtn');
    sortSelectEl = document.getElementById('sortSelect');
    acquireModalEl = document.getElementById('acquireModal');
    modalBodyEl = document.getElementById('modalBody');
    modalCloseBtnEl = document.getElementById('modalCloseBtn');

    studioOverlayEl = document.getElementById('creatorStudioOverlay');
    studioFormEl = document.getElementById('studioForm');
    studioCloseBtnEl = document.getElementById('studioCloseBtn');
    resetStorageBtnEl = document.getElementById('resetStorageBtn');
    studioTriggerBtnEl = document.getElementById('studioTriggerBtn');

    tabAddArtEl = document.getElementById('tabAddArt');
    tabManageArtEl = document.getElementById('tabManageArt');
    studioManagePanelEl = document.getElementById('studioManagePanel');
    manageListEl = document.getElementById('manageList');
    studioCountBadgeEl = document.getElementById('studioCountBadge');

    heroFeaturedBoxEl = document.getElementById('heroFeaturedBox');
    heroUploadBtnEl = document.getElementById('heroUploadBtn');
    emptyStateUploadBtnEl = document.getElementById('emptyStateUploadBtn');
    cursorDotEl = document.getElementById('cursorDot');
    cursorRingEl = document.getElementById('cursorRing');

    artImageFileEl = document.getElementById('artImageFile');
    fileDropzoneEl = document.getElementById('fileDropzone');
    dropzoneContentEl = document.getElementById('dropzoneContent');
    imagePreviewContainerEl = document.getElementById('imagePreviewContainer');
    imagePreviewImgEl = document.getElementById('imagePreviewImg');
    removePreviewBtnEl = document.getElementById('removePreviewBtn');
}

// 1. Custom Avant-Garde Cursor Engine
function initCustomCursor() {
    if (!cursorDotEl || !cursorRingEl || window.innerWidth <= 768) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDotEl.style.left = `${mouseX}px`;
        cursorDotEl.style.top = `${mouseY}px`;
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        cursorRingEl.style.left = `${ringX}px`;
        cursorRingEl.style.top = `${ringY}px`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const addHoverListeners = () => {
        document.querySelectorAll('a, button, .tab-btn, .art-masonry-card, select, input, .file-dropzone').forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hovering-interactive'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hovering-interactive'));
        });
    };
    addHoverListeners();
    const observer = new MutationObserver(addHoverListeners);
    if (artGridEl) observer.observe(artGridEl, { childList: true, subtree: true });
}

// 2. IntersectionObserver Scroll Reveals
function initScrollReveals() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, { threshold: 0.12 });

    revealElements.forEach(el => observer.observe(el));
}

// 3. Load Artworks from Firestore
function loadArtworks() {
    db.collection('artworks').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        const customList = [];
        snapshot.forEach(doc => {
            customList.push({ id: doc.id, ...doc.data() });
        });
        
        state.artworks = [...customList];

        state.artworks.forEach(art => {
            if (!(art.id in state.selectedSizes)) {
                state.selectedSizes[art.id] = 0;
            }
        });

        if (studioCountBadgeEl) studioCountBadgeEl.textContent = state.artworks.length;
        updateHeroFeatured();
        renderStudioManageList();
        renderGallery();
    }, error => {
        console.error("Error fetching artworks: ", error);
        alert("Failed to load global gallery data. Please check connection.");
    });
}

// Update Hero Visual Box with rotating collage (independent of gallery artworks)
function updateHeroFeatured() {
    if (!heroFeaturedBoxEl) return;

    const collageImages = [
        'collage/House watch.jpeg',
        'collage/IMG_0012.jpg',
        'collage/IMG_0480.JPG.jpeg',
        'collage/IMG_5464.jpg',
        'collage/IMG_5866.JPG.jpeg',
        'collage/IMG_8131.jpg',
        'collage/Masai shuka.jpeg',
        'collage/REBIRTH.jpeg',
        'collage/WhatsApp Image 2026-10-02 at 16.57.29.jpeg',
        'collage/WhatsApp Image 2026-10-02 at 16.57.31.jpeg',
        'collage/WhatsApp Image 2026-10-02 at 16.57.35.jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.47 (1).jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.47 (2).jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.47.jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.48 (1).jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.48 (2).jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.48.jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.49 (1).jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.49 (2).jpeg',
        'collage/WhatsApp Image 2026-10-02 at 17.33.49.jpeg',
        'collage/house  watch.jpeg',
        'collage/housewatch.jpeg',
        'collage/night watch.jpeg'
    ];
    
    let collageHTML = '<div class="hero-rotating-collage">';
    collageImages.forEach((img, index) => {
        collageHTML += `<img src="${img}" alt="Gallery Art ${index + 1}" class="collage-slide ${index === 0 ? 'active' : ''}">`;
    });
    
    collageHTML += `
        <div class="collage-overlay-text">
            <h3>Mamba Creatives Gallery</h3>
            <p>Explore exclusive artworks</p>
        </div>
    </div>`;

    heroFeaturedBoxEl.innerHTML = collageHTML;
    
    if (!window.collageIntervalStarted) {
        window.collageIntervalStarted = true;
        setInterval(() => {
            const slides = document.querySelectorAll('.hero-rotating-collage .collage-slide');
            if (!slides.length) return;
            
            let activeIndex = 0;
            slides.forEach((slide, index) => {
                if (slide.classList.contains('active')) activeIndex = index;
            });
            
            slides[activeIndex].classList.remove('active');
            let nextIndex = (activeIndex + 1) % slides.length;
            slides[nextIndex].classList.add('active');
        }, 4000);
    }
}

// 4. Render Asymmetrical Masonry Gallery
function renderGallery() {
    let filtered = state.artworks.filter(art => {
        const matchesCat = (state.activeCategory === 'all') ||
            (art.category.toLowerCase() === state.activeCategory.toLowerCase());
        const query = state.searchQuery.toLowerCase().trim();
        const matchesSearch = !query ||
            art.title.toLowerCase().includes(query) ||
            art.category.toLowerCase().includes(query) ||
            (art.medium && art.medium.toLowerCase().includes(query));
        return matchesCat && matchesSearch;
    });

    filtered.sort((a, b) => {
        if (state.sortBy === 'price-low') return calculatePrice(a) - calculatePrice(b);
        if (state.sortBy === 'price-high') return calculatePrice(b) - calculatePrice(a);
        if (state.sortBy === 'title') return a.title.localeCompare(b.title);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

    if (filtered.length === 0) {
        artGridEl.innerHTML = '';
        emptyStateEl.classList.remove('hidden');
        return;
    }

    emptyStateEl.classList.add('hidden');
    artGridEl.innerHTML = filtered.map((art, idx) => createMasonryCardHTML(art, idx)).join('');

    bindCardEvents();
}

function calculatePrice(art, sizeIdx = null) {
    const idx = (sizeIdx !== null) ? sizeIdx : (state.selectedSizes[art.id] || 0);
    const sizeOptions = SIZE_CONFIGS[art.sizeType] || SIZE_CONFIGS.standard;
    const opt = sizeOptions[idx] || sizeOptions[0];
    return Math.round(art.basePrice * opt.multiplier);
}

function createMasonryCardHTML(art, index) {
    const price = calculatePrice(art);

    return `
        <article class="art-item" data-id="${art.id}">
            <div class="art-frame">
                <img src="${art.image}" alt="${art.title}" loading="lazy">
                <h3 class="overlap-title">${art.title}</h3>

                <div class="art-hover-overlay" style="z-index: 15;">
                    <div class="hover-content">
                        <span class="hover-cat-tag meta-text">${art.category}</span>
                        <p class="hover-medium meta-text">${art.medium || 'Original Masterwork'}</p>
                        
                        <div class="hover-actions-row">
                            <button class="btn-view-details" data-action="view" data-id="${art.id}" style="margin-right: 0.5rem; background: transparent; border: 1px solid var(--gallery-bone); color: var(--gallery-bone); padding: 0.8rem 1.5rem; cursor: pointer; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; transition: var(--transition);">
                                View Details
                            </button>
                            <button class="btn-acquire-glowing" data-action="acquire" data-id="${art.id}">
                                Acquire Piece
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `;
}

function bindCardEvents() {
    // Acquire Button
    document.querySelectorAll('[data-action="acquire"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openAcquireModal(btn.dataset.id);
        });
    });

    // View Details Button
    document.querySelectorAll('[data-action="view"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showDetailsModal(btn.dataset.id);
        });
    });

    // Click anywhere on card opens Acquire Modal
    document.querySelectorAll('.art-item').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="view"]')) return;
            openAcquireModal(card.dataset.id);
        });
    });
}

// Show Artwork Details Function
function showDetailsModal(artId) {
    const art = state.artworks.find(a => a.id === artId);
    if (!art) return;

    // Use existing modal structure or create a custom overlay
    let overlay = document.getElementById('detailsOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'detailsOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.85); z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s;
        `;
        overlay.innerHTML = `
            <div style="background: var(--bg-surface); padding: 2rem; max-width: 600px; width: 90%; border-radius: 8px; position: relative;">
                <button id="closeDetailsBtn" style="position: absolute; top: 15px; right: 20px; background: none; border: none; font-size: 1.5rem; color: var(--text-main); cursor: pointer;">&times;</button>
                <h2 id="detailsTitle" style="margin-top:0; font-family: var(--font-serif); font-size: 2rem; margin-bottom: 0.5rem; color: var(--text-main);"></h2>
                <p id="detailsMeta" style="color: var(--gallery-meta); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 1.5rem;"></p>
                <div id="detailsDesc" style="line-height: 1.6; color: var(--text-main);"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('#closeDetailsBtn').addEventListener('click', () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.style.display = 'none', 300);
            }
        });
    }

    document.getElementById('detailsTitle').innerText = art.title;
    document.getElementById('detailsMeta').innerText = `${art.category} • ${art.medium || 'Original Masterwork'}`;
    
    // Check if the artwork object has a description property; fallback if not
    const desc = art.description || "A masterfully crafted piece exhibiting distinct textures and emotional depth, characteristic of Mamba Creatives' exclusive collections. This artwork invites deep contemplation and serves as a striking centerpiece in any sophisticated space.";
    document.getElementById('detailsDesc').innerText = desc;

    overlay.style.display = 'flex';
    // Small delay to ensure display:flex is applied before changing opacity
    setTimeout(() => overlay.style.opacity = '1', 10);
}

// Delete Artwork Function
function deleteArtwork(artId) {
    const art = state.artworks.find(a => a.id === artId);
    if (!art) return;

    if (confirm(`Are you sure you want to delete "${art.title}" from the gallery?`)) {
        db.collection('artworks').doc(artId).delete().then(() => {
            if (state.activeModalArtId === artId) {
                closeAcquireModal();
            }
            showToast(`Removed "${art.title}" from gallery.`);
        }).catch(error => {
            console.error("Error removing document: ", error);
            alert("Delete failed. " + error.message);
        });
    }
}

// 5. Acquire Sizing Modal
function openAcquireModal(artId) {
    const art = state.artworks.find(a => a.id === artId);
    if (!art) return;

    state.activeModalArtId = art.id;
    state.activeModalSizeIdx = state.selectedSizes[art.id] || 0;

    const sizeOptions = SIZE_CONFIGS[art.sizeType] || SIZE_CONFIGS.standard;
    const currentSizeObj = sizeOptions[state.activeModalSizeIdx];
    const currentPrice = calculatePrice(art, state.activeModalSizeIdx);
    const waUrl = buildWhatsAppAcquireUrl(art.title, art.category, currentSizeObj.label, art.image);

    const sizePillsHTML = sizeOptions.map((opt, i) => `
        <button class="size-pill-btn ${i === state.activeModalSizeIdx ? 'selected' : ''}" data-size-idx="${i}">
            ${opt.label}
        </button>
    `).join('');

    modalBodyEl.innerHTML = `
        <div class="modal-artwork-grid">
            <div class="modal-media-col">
                <div class="modal-img-frame">
                    <img src="${art.image}" alt="${art.title}">
                </div>
                
                <div class="scale-visualizer-box">
                    <span class="scale-info-text"><i class="fa-solid fa-expand"></i> Visual Proportion Preview (${currentSizeObj.scaleLabel})</span>
                    <div class="scale-canvas-stage">
                        <div class="scale-canvas-preview" id="scaleCanvasPreview" 
                             style="width: ${currentSizeObj.scaleWidth}px; height: ${currentSizeObj.scaleHeight}px;">
                             ${currentSizeObj.label}
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-details-col">
                <span class="badge-cat">${art.category}</span>
                <h2>${art.title}</h2>
                <p class="art-medium"><i class="fa-solid fa-palette"></i> ${art.medium || 'Original Artwork'}</p>
                <p class="modal-description">${art.description || 'Handcrafted creation by Mamba Creatives.'}</p>

                <div class="size-picker-group">
                    <span class="size-picker-label"><i class="fa-solid fa-ruler-combined"></i> Select Dimensions</span>
                    <div class="size-pill-options" id="modalSizePills">
                        ${sizePillsHTML}
                    </div>
                </div>

                <div class="modal-acquisition-footer">
                    <div>
                        <span style="font-size:0.75rem; color: var(--text-dim); text-transform:uppercase;">Acquisition Investment</span>
                        <div class="modal-price-val" id="modalPriceVal">$${currentPrice}</div>
                    </div>
                    <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-acquire" id="modalWaBtn">
                        <i class="fa-brands fa-whatsapp"></i> Secure via WhatsApp
                    </a>
                </div>
            </div>
        </div>
    `;

    document.querySelectorAll('#modalSizePills .size-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.sizeIdx, 10);
            state.activeModalSizeIdx = idx;
            state.selectedSizes[art.id] = idx;

            document.querySelectorAll('#modalSizePills .size-pill-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            const newSizeObj = sizeOptions[idx];
            const newPrice = calculatePrice(art, idx);
            const newWaUrl = buildWhatsAppAcquireUrl(art.title, art.category, newSizeObj.label, art.image);

            document.getElementById('modalPriceVal').textContent = `$${newPrice}`;
            document.getElementById('modalWaBtn').href = newWaUrl;

            const scalePreview = document.getElementById('scaleCanvasPreview');
            if (scalePreview) {
                scalePreview.style.width = `${newSizeObj.scaleWidth}px`;
                scalePreview.style.height = `${newSizeObj.scaleHeight}px`;
                scalePreview.textContent = newSizeObj.label;
            }

            renderGallery();
        });
    });

    acquireModalEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAcquireModal() {
    acquireModalEl.classList.add('hidden');
    document.body.style.overflow = '';
}

function buildWhatsAppAcquireUrl(title, category, sizeLabel, imageUrl) {
    let message = `Hello Mamba Creatives. I am reaching out from your gallery to acquire ${title} (${category}) in the ${sizeLabel} format.`;
    
    // Only append image URL if it's a real link, not a massive base64 string
    if (imageUrl && !imageUrl.startsWith('data:')) {
        try {
            const absoluteImageUrl = new URL(imageUrl, window.location.origin).href;
            message += `\n\nArtwork Image Reference:\n${absoluteImageUrl}`;
        } catch(e) {
            // Ignore URL parsing errors
        }
    }
    
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
}

// 6. Studio Tabs Navigation & Manage Panel List
function setupStudioTabs() {
    if (!tabAddArtEl || !tabManageArtEl) return;

    tabAddArtEl.addEventListener('click', () => {
        tabAddArtEl.classList.add('active');
        tabManageArtEl.classList.remove('active');
        studioFormEl.classList.remove('hidden');
        studioManagePanelEl.classList.add('hidden');
    });

    tabManageArtEl.addEventListener('click', () => {
        tabManageArtEl.classList.add('active');
        tabAddArtEl.classList.remove('active');
        studioFormEl.classList.add('hidden');
        studioManagePanelEl.classList.remove('hidden');
        renderStudioManageList();
    });
}

function renderStudioManageList() {
    if (!manageListEl) return;

    if (state.artworks.length === 0) {
        manageListEl.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fa-solid fa-box-open" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                No uploaded artworks found in gallery storage.
            </div>
        `;
        return;
    }

    manageListEl.innerHTML = state.artworks.map(art => `
        <div class="manage-item">
            <div class="manage-item-info">
                <img src="${art.image}" alt="${art.title}" class="manage-item-thumb">
                <div class="manage-item-text">
                    <h4>${art.title}</h4>
                    <span>${art.category} &bull; $${art.basePrice} Base</span>
                </div>
            </div>
            <button class="btn-delete-item" data-id="${art.id}">
                <i class="fa-solid fa-trash-can"></i> Delete
            </button>
        </div>
    `).join('');

    manageListEl.querySelectorAll('.btn-delete-item').forEach(btn => {
        btn.addEventListener('click', () => {
            deleteArtwork(btn.dataset.id);
        });
    });
}

// 7. Local File Upload Engine (FileReader Base64 Conversion)
function setupFileUploadHandlers() {
    if (!artImageFileEl || !fileDropzoneEl) return;

    const processFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            alert('Please select a valid image file (PNG, JPG, WEBP, etc.).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1000;
                const MAX_HEIGHT = 1000;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                state.pendingImageDataUrl = dataUrl;
                imagePreviewImgEl.src = dataUrl;
                dropzoneContentEl.classList.add('hidden');
                imagePreviewContainerEl.classList.remove('hidden');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    artImageFileEl.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropzoneEl.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileDropzoneEl.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropzoneEl.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            fileDropzoneEl.classList.remove('dragover');
        });
    });

    fileDropzoneEl.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) processFile(file);
    });

    if (removePreviewBtnEl) {
        removePreviewBtnEl.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            resetImagePreview();
        });
    }
}

function resetImagePreview() {
    state.pendingImageDataUrl = null;
    if (artImageFileEl) artImageFileEl.value = '';
    if (imagePreviewImgEl) imagePreviewImgEl.src = '';
    if (dropzoneContentEl) dropzoneContentEl.classList.remove('hidden');
    if (imagePreviewContainerEl) imagePreviewContainerEl.classList.add('hidden');
}

// Submit New Uploaded Artwork
function handleStudioSubmit(e) {
    e.preventDefault();

    if (!state.pendingImageDataUrl) {
        alert('Please upload an image file for the artwork.');
        return;
    }

    const title = document.getElementById('artTitle').value.trim();
    const category = document.getElementById('artCategory').value;
    const basePrice = parseFloat(document.getElementById('artBasePrice').value);
    const medium = document.getElementById('artMedium').value.trim();
    const description = document.getElementById('artDescription').value.trim();

    if (!title || !category || isNaN(basePrice)) {
        alert('Please fill out all required fields.');
        return;
    }

    const newArt = {
        title,
        category,
        basePrice,
        image: state.pendingImageDataUrl,
        medium: medium || 'Handcrafted Original',
        description: description || 'Exclusive artwork created by Mamba Creatives.',
        featured: true,
        sizeType: category === 'Clocks' ? 'clocks' : 'standard',
        heightClass: 'card-height-tall',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const submitBtn = document.getElementById('uploadSubmitBtn');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...'; }

    db.collection('artworks').add(newArt).then(() => {
        studioFormEl.reset();
        resetImagePreview();
        closeCreatorStudio();
        showToast(`Successfully uploaded "${title}" to Live Gallery!`);

        const gallerySection = document.getElementById('gallery');
        if (gallerySection) gallerySection.scrollIntoView({ behavior: 'smooth' });
    }).catch(error => {
        console.error("Error adding document: ", error);
        alert("Upload failed. " + error.message);
    }).finally(() => {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Upload & Add to Gallery'; }
    });
}

function resetCustomStorage() {
    if (confirm('Are you sure you want to clear all uploaded artworks from the LIVE global gallery?')) {
        db.collection('artworks').get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                doc.ref.delete();
            });
            closeCreatorStudio();
            showToast('Cleared all gallery artwork files.');
        }).catch(err => {
            console.error("Error clearing gallery: ", err);
            alert("Failed to clear gallery.");
        });
    }
}

// Secret Triggers
function setupSecretTriggers() {
    const brandLogo = document.getElementById('brandLogo');
    if (brandLogo) {
        brandLogo.addEventListener('click', (e) => {
            e.preventDefault();
            state.logoClickCount++;
            if (state.logoClickTimer) clearTimeout(state.logoClickTimer);
            state.logoClickTimer = setTimeout(() => { state.logoClickCount = 0; }, 2000);

            if (state.logoClickCount >= 5) {
                state.logoClickCount = 0;
                openCreatorStudio();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
            e.preventDefault();
            openCreatorStudio();
        }
    });

}

function openCreatorStudio() {
    studioOverlayEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCreatorStudio() {
    studioOverlayEl.classList.add('hidden');
    document.body.style.overflow = '';
}

// Global Event Listeners
function setupEventListeners() {
    const categoryTabs = document.querySelectorAll('#categoryTabs .tab-btn');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.activeCategory = tab.dataset.category;
            renderGallery();
        });
    });

    document.querySelectorAll('.footer-filter-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const cat = link.dataset.category;
            if (cat) {
                state.activeCategory = cat;
                categoryTabs.forEach(t => {
                    t.classList.toggle('active', t.dataset.category.toLowerCase() === cat.toLowerCase());
                });
                renderGallery();
            }
        });
    });

    if (searchInputEl) {
        searchInputEl.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            clearSearchBtnEl.classList.toggle('show', state.searchQuery.length > 0);
            renderGallery();
        });
    }
    if (clearSearchBtnEl) {
        clearSearchBtnEl.addEventListener('click', () => {
            searchInputEl.value = '';
            state.searchQuery = '';
            clearSearchBtnEl.classList.remove('show');
            renderGallery();
        });
    }

    if (sortSelectEl) {
        sortSelectEl.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            renderGallery();
        });
    }

    if (modalCloseBtnEl) modalCloseBtnEl.addEventListener('click', closeAcquireModal);
    if (acquireModalEl) {
        acquireModalEl.addEventListener('click', (e) => {
            if (e.target === acquireModalEl) closeAcquireModal();
        });
    }

    if (studioFormEl) studioFormEl.addEventListener('submit', handleStudioSubmit);
    if (studioCloseBtnEl) studioCloseBtnEl.addEventListener('click', closeCreatorStudio);
    if (resetStorageBtnEl) resetStorageBtnEl.addEventListener('click', resetCustomStorage);
    if (studioOverlayEl) {
        studioOverlayEl.addEventListener('click', (e) => {
            if (e.target === studioOverlayEl) closeCreatorStudio();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!acquireModalEl.classList.contains('hidden')) closeAcquireModal();
            if (!studioOverlayEl.classList.contains('hidden')) closeCreatorStudio();
        }
    });

    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenu');
    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            navMenu.classList.toggle('open');
        });
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                navMenu.classList.remove('open');
            });
        });
    }

    const backToTopBtn = document.getElementById('backToTopBtn');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-sparkles" style="color:var(--accent-gold);"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

function updateCopyrightYear() {
    const yearEl = document.getElementById('copyrightYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}
