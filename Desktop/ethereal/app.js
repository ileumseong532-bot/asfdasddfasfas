/* ==========================================================================
   ETHEREAL — main.js
   히어로 슬라이더 · 헤더 스크롤 · 스크롤 리빌 · 큐레이션 캐러셀
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroSlider();
  initReveal();
  initCurationCarousel();
  initStoreFilter();
  initJournalFilter();
  initModal();
  initCart();
  initJournalReadMore();
  initStudioInquiry();
  initSiteSearch();
  initMyPage();
  initCheckout();
  initRouter();
});

/* ---------------------------------------------------------------------- */
/* 헤더: 스크롤에 따라 배경 전환                                             */
/* ---------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });

  const toggle = header.querySelector('.nav-toggle');
  const mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => mobileNav.classList.remove('is-open'));
    });
    mobileNav.querySelectorAll('.mobile-quick-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        const action = btn.dataset.quick;
        if (action === 'search') {
          document.querySelector('.header-icons [aria-label="검색"]')?.click();
        } else if (action === 'mypage') {
          document.querySelector('.header-icons [aria-label="마이페이지"]')?.click();
        } else if (action === 'cart') {
          window.location.hash = '#!checkout';
        }
      });
    });
  }
}

/* ---------------------------------------------------------------------- */
/* 이미지 슬라이더: 5장의 이미지를 켄번즈 효과로 자동 전환 (페이지 내 여러 개 지원) */
/* ---------------------------------------------------------------------- */
function initHeroSlider() {
  document.querySelectorAll('[data-hero]').forEach(initSingleSlider);
}

function initSingleSlider(hero) {
  const slides = Array.from(hero.querySelectorAll('.hero-slide'));
  const dots = Array.from(hero.querySelectorAll('.hero-dot'));
  const countEl = hero.querySelector('.hero-count-current');
  const prevBtn = hero.querySelector('.hero-arrow.prev');
  const nextBtn = hero.querySelector('.hero-arrow.next');
  const burstEl = hero.querySelector('.hero-burst');
  const flashEl = hero.querySelector('.hero-flash');

  if (!slides.length) return;

  const DURATION = Number(hero.dataset.interval) || 6000;
  let current = 0;
  let timer = null;
  let isPaused = false;

  function render() {
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
      dot.classList.toggle('is-done', i < current);
    });
    if (countEl) countEl.textContent = String(current + 1).padStart(2, '0');
    triggerBurst();
  }

  function triggerBurst() {
    if (!burstEl) return;
    burstEl.innerHTML = '';

    const originX = 50 + (Math.random() * 30 - 15);
    const originY = 42 + (Math.random() * 24 - 12);

    if (flashEl) {
      flashEl.style.setProperty('--sx', originX + '%');
      flashEl.style.setProperty('--sy', originY + '%');
      flashEl.style.animation = 'none';
      void flashEl.offsetWidth;
      flashEl.style.animation = '';
    }

    const sparkCount = 20;
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      const angle = (Math.PI * 2 * i) / sparkCount + Math.random() * 0.4;
      const distance = 70 + Math.random() * 160;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      const size = 4 + Math.random() * 6;
      const delay = Math.random() * 0.12;
      spark.style.setProperty('--sx', originX + '%');
      spark.style.setProperty('--sy', originY + '%');
      spark.style.setProperty('--tx', tx + 'px');
      spark.style.setProperty('--ty', ty + 'px');
      spark.style.setProperty('--size', size + 'px');
      spark.style.setProperty('--delay', delay + 's');
      burstEl.appendChild(spark);
    }

    setTimeout(() => {
      burstEl.innerHTML = '';
    }, 1400);
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    render();
    restart();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function restart() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!isPaused) next();
    }, DURATION);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);

  hero.addEventListener('mouseenter', () => (isPaused = true));
  hero.addEventListener('mouseleave', () => (isPaused = false));

  render();
  restart();
}

/* ---------------------------------------------------------------------- */
/* 스크롤 리빌: 뷰포트에 들어오면 자연스럽게 페이드 업                          */
/* ---------------------------------------------------------------------- */
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach((el) => observer.observe(el));

  document.querySelectorAll('.reveal-stagger').forEach((group) => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
      child.classList.add('reveal');
      observer.observe(child);
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 큐레이션 캐러셀: 화살표로 상품 트랙을 스크롤                                */
/* ---------------------------------------------------------------------- */
function initCurationCarousel() {
  const track = document.querySelector('[data-product-track]');
  const prevBtn = document.querySelector('.curation-nav .prev');
  const nextBtn = document.querySelector('.curation-nav .next');
  if (!track || !prevBtn || !nextBtn) return;

  const scrollByCard = (dir) => {
    const card = track.querySelector('.product-card');
    const gap = parseFloat(getComputedStyle(track).columnGap || 32);
    const distance = card ? card.getBoundingClientRect().width + gap : 320;
    track.scrollBy({ left: dir * distance, behavior: 'smooth' });
  };

  const updateButtons = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    prevBtn.disabled = track.scrollLeft <= 2;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  };

  prevBtn.addEventListener('click', () => scrollByCard(-1));
  nextBtn.addEventListener('click', () => scrollByCard(1));
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);

  updateButtons();
}

/* ---------------------------------------------------------------------- */
/* 스토어 로케이터: 지역 필터 (store.html)                                   */
/* ---------------------------------------------------------------------- */
function initStoreFilter() {
  const tabs = document.querySelectorAll('[data-store-filter]');
  const cards = document.querySelectorAll('[data-store-region]');
  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const region = tab.dataset.storeFilter;
      cards.forEach((card) => {
        const match = region === 'all' || card.dataset.storeRegion === region;
        card.classList.toggle('is-hidden', !match);
      });

      const map = window.__etherealMap;
      const markers = window.__etherealMarkers;
      if (map && markers) {
        const visible = markers.filter((m) => region === 'all' || m.region === region);
        if (visible.length) {
          const group = visible.map((m) => m.marker.getLatLng());
          map.fitBounds(group, { padding: [60, 60], maxZoom: 13 });
        }
        markers.forEach((m) => {
          const match = region === 'all' || m.region === region;
          m.marker.setOpacity(match ? 1 : 0.25);
        });
      }
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 스토어 로케이터: Leaflet 지도 (store.html)                                */
/* ---------------------------------------------------------------------- */
function initStoreMap() {
  if (window.__etherealMap) return; // 이미 생성됨 — 중복 초기화 방지

  const mapEl = document.getElementById('store-map');
  if (!mapEl) return;

  if (typeof L === 'undefined') {
    mapEl.innerHTML = `
      <div class="map-fallback">
        <p>지도를 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 새로고침해주세요.</p>
        <ul>
          <li>청담 플래그십 — 서울 강남구 압구정로 452</li>
          <li>더현대 서울 — 서울 영등포구 여의대로 108</li>
          <li>롯데 에비뉴엘 잠실 — 서울 송파구 올림픽로 240</li>
          <li>신세계 센텀시티 — 부산 해운대구 센텀남대로 35</li>
          <li>제주 애월 쇼룸 — 제주 제주시 애월읍 애월로 129</li>
        </ul>
      </div>
    `;
    return;
  }

  const stores = [
    { name: '청담 플래그십', region: 'seoul', lat: 37.5240, lng: 127.0388 },
    { name: '더현대 서울', region: 'seoul', lat: 37.5254, lng: 126.9287 },
    { name: '롯데 에비뉴엘 잠실', region: 'seoul', lat: 37.5125, lng: 127.1025 },
    { name: '신세계 센텀시티', region: 'busan', lat: 35.1691, lng: 129.1305 },
    { name: '제주 애월 쇼룸', region: 'jeju', lat: 33.4625, lng: 126.3242 },
  ];

  const map = L.map('store-map', {
    scrollWheelZoom: true,
    zoomControl: false,
    minZoom: 6,
    maxZoom: 16,
  }).setView([36.4, 127.9], 7);

  window.__etherealMap = map;

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '지도 데이터 &copy; OpenStreetMap 기여자',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
  }).addTo(map);

  // 배경 타일의 해역 표기(조선서해)를 가리고 정확한 한글 라벨(서해)을 덧표시
  L.marker([35.4, 123.9], {
    icon: L.divIcon({
      className: 'sea-label',
      html: '<span>서해</span>',
      iconSize: [96, 30],
    }),
    interactive: false,
    keyboard: false,
    zIndexOffset: 500,
  }).addTo(map);

  const goldIcon = L.divIcon({
    className: 'store-pin',
    html: '<span></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  const markers = stores.map((store) => {
    const marker = L.marker([store.lat, store.lng], { icon: goldIcon })
      .addTo(map)
      .bindPopup(`<strong>${store.name}</strong>`);
    return { ...store, marker };
  });

  window.__etherealMap = map;
  window.__etherealMarkers = markers;

  const cards = document.querySelectorAll('[data-store-card]');
  cards.forEach((card) => {
    const idx = Number(card.dataset.storeCard);
    const target = markers[idx];
    if (!target) return;

    card.addEventListener('mouseenter', () => {
      cards.forEach((c) => c.classList.remove('is-active'));
      card.classList.add('is-active');
      map.panTo(target.marker.getLatLng());
      target.marker.openPopup();
      target.marker._icon?.classList.add('is-highlighted');
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-active');
      target.marker._icon?.classList.remove('is-highlighted');
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 저널 카테고리 필터 (journal.html)                                        */
/* ---------------------------------------------------------------------- */
function initJournalFilter() {
  const tabs = document.querySelectorAll('[data-journal-filter]');
  const cards = document.querySelectorAll('[data-journal-category]');
  if (!tabs.length || !cards.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const category = tab.dataset.journalFilter;
      cards.forEach((card) => {
        const match = category === 'all' || card.dataset.journalCategory === category;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 공용 모달 (Quick View)                                                   */
/* ---------------------------------------------------------------------- */
function ensureModal() {
  let overlay = document.getElementById('siteModal');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'siteModal';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="modal-panel" role="dialog" aria-modal="true">
      <button type="button" class="modal-close" aria-label="닫기">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
      </button>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

function initModal() {
  const triggers = document.querySelectorAll('[data-modal-title]');
  if (!triggers.length) return;

  const overlay = ensureModal();
  const body = overlay.querySelector('.modal-body');
  const closeBtn = overlay.querySelector('.modal-close');

  function openModal(data) {
    const tagHtml = data.tag ? `<span class="modal-tag">${data.tag}</span><br>` : '';
    const eyebrowHtml = data.eyebrow ? `<p class="eyebrow">${data.eyebrow}</p>` : '';
    const metaHtml = data.meta ? `<p class="modal-meta">${data.meta}</p>` : '';
    const ctaHtml = data.ctaText
      ? `<a href="${data.ctaHref || '#'}" class="btn btn-solid modal-cta">${data.ctaText}</a>`
      : '';

    body.innerHTML = `
      ${eyebrowHtml}
      ${tagHtml}
      <h3>${data.title || ''}</h3>
      ${metaHtml}
      <div class="modal-text">${data.body || ''}</div>
      ${ctaHtml}
    `;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal({
        eyebrow: trigger.dataset.modalEyebrow,
        tag: trigger.dataset.modalTag,
        title: trigger.dataset.modalTitle,
        meta: trigger.dataset.modalMeta,
        body: trigger.dataset.modalBody,
        ctaText: trigger.dataset.modalCtaText,
        ctaHref: trigger.dataset.modalCtaHref,
      });
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.__etherealOpenModal = openModal;
  window.__etherealCloseModal = closeModal;
}

/* ---------------------------------------------------------------------- */
/* 토스트 알림                                                              */
/* ---------------------------------------------------------------------- */
function ensureToastStack() {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  return stack;
}

function showToast(message) {
  const stack = ensureToastStack();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 6L9 17l-5-5"/></svg>
    <span>${message}</span>
  `;
  stack.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('is-visible'));

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 450);
  }, 2400);
}

/* ---------------------------------------------------------------------- */
/* 장바구니: localStorage 기반 카트 (전 페이지 공유)                          */
/* ---------------------------------------------------------------------- */
const CART_KEY = 'etherealCart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  syncCartBadge();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((c) => c.name === item.name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: item.name, price: item.price, img: item.img, qty: 1 });
  }
  saveCart(cart);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function syncCartBadge() {
  const cartBtn = document.querySelector('.header-icons [aria-label="장바구니"]');
  if (!cartBtn) return;

  let badge = cartBtn.querySelector('.cart-badge');
  if (!badge) {
    cartBtn.classList.add('icon-wrap');
    badge = document.createElement('span');
    badge.className = 'cart-badge';
    cartBtn.appendChild(badge);
  }

  const count = cartCount();
  badge.textContent = String(count);
  badge.classList.toggle('is-visible', count > 0);
}

function initCart() {
  syncCartBadge();

  const cartBtn = document.querySelector('.header-icons [aria-label="장바구니"]');
  if (cartBtn) {
    cartBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '#!checkout';
    });
  }

  const buttons = document.querySelectorAll('.product-quickadd');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const name = btn.dataset.productName || '상품';
      const price = Number(btn.dataset.productPrice) || 0;
      const img = btn.dataset.productImg || '';

      addToCart({ name, price, img });
      showToast(`${name}이(가) 장바구니에 담겼습니다`);
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 저널 카드 "자세히 보기" → 모달                                            */
/* ---------------------------------------------------------------------- */
function initJournalReadMore() {
  const buttons = document.querySelectorAll('.journal-read');
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const card = btn.closest('.journal-card');
      if (!card) return;

      const category = card.querySelector('.journal-cat')?.textContent?.trim() || '';
      const title = card.querySelector('h3')?.textContent?.trim() || '';
      const date = card.querySelector('.journal-date')?.textContent?.trim() || '';
      const excerpt = card.querySelector('.journal-info p')?.textContent?.trim() || '';

      if (window.__etherealOpenModal) {
        window.__etherealOpenModal({
          eyebrow: '저널',
          tag: category,
          title,
          meta: date,
          body: excerpt + ' 전체 아티클은 준비 중입니다. 곧 만나보실 수 있어요.',
          ctaText: '목록으로 돌아가기',
          ctaHref: '#grid',
        });
      }
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 아카이브 스튜디오 "스튜디오 문의하기" → 문의 폼 모달                        */
/* ---------------------------------------------------------------------- */
function initStudioInquiry() {
  const btn = document.getElementById('studioInquiryBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!window.__etherealOpenModal) return;
    window.__etherealOpenModal({
      eyebrow: '아카이브 스튜디오',
      title: '스튜디오에 문의하기',
      body: `협업 제안, 방문 상담, 프레스 문의 등 궁금하신 점을 남겨주시면 빠르게 회신드리겠습니다.
        <form id="studioInquiryForm" class="inquiry-form">
          <input type="text" name="name" placeholder="이름" required>
          <input type="email" name="email" placeholder="이메일 주소" required>
          <textarea name="message" rows="4" placeholder="문의 내용을 남겨주세요" required></textarea>
          <button type="submit" class="btn btn-solid">문의 보내기</button>
        </form>`,
    });
  });

  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'studioInquiryForm') {
      e.preventDefault();
      if (window.__etherealCloseModal) window.__etherealCloseModal();
      showToast('문의가 정상적으로 접수되었습니다');
    }
  });
}

/* ---------------------------------------------------------------------- */
/* 헤더 검색 아이콘 → 사이트 통합 검색                                       */
/* ---------------------------------------------------------------------- */
const SEARCH_INDEX = [
  { cat: 'product', tag: '상품', title: '엘리멘탈 미스트 No. 1', excerpt: '82,000원', href: '#!home:curation', img: 'https://images.unsplash.com/photo-1622618991746-fe6004db3a47?auto=format&fit=crop&w=200&q=80', keywords: '미스트 토너 스킨케어' },
  { cat: 'product', tag: '상품', title: '보태니컬 밤', excerpt: '45,000원', href: '#!home:curation', img: 'https://images.unsplash.com/photo-1622618991227-412b19e4fef9?auto=format&fit=crop&w=200&q=80', keywords: '밤 크림 보습' },
  { cat: 'product', tag: '상품', title: '스컬프팅 리추얼 키트', excerpt: '68,000원', href: '#!home:curation', img: 'https://images.unsplash.com/photo-1630398777649-cdfc7c5e8a24?auto=format&fit=crop&w=200&q=80', keywords: '마사지 페이셜 롤러' },
  { cat: 'product', tag: '상품', title: '나이트 리페어 컴플렉스', excerpt: '120,000원', href: '#!home:curation', img: 'https://images.unsplash.com/photo-1755699192991-1f49f76a8f0d?auto=format&fit=crop&w=200&q=80', keywords: '나이트 세럼 안티에이징' },
  { cat: 'page', tag: '페이지', title: '브랜드 소개', excerpt: '아카이브 스튜디오', href: '#!about', keywords: '어바웃 브랜드 철학 회사소개' },
  { cat: 'page', tag: '페이지', title: '스토어', excerpt: '전국 매장 안내', href: '#!store', keywords: '매장 위치 지도' },
  { cat: 'page', tag: '페이지', title: '저널', excerpt: '브랜드 저널', href: '#!journal', keywords: '블로그 아티클 매거진' },
  { cat: 'page', tag: '페이지', title: '주문 / 결제', excerpt: '장바구니 결제', href: '#!checkout', keywords: '체크아웃 카트 결제' },
  { cat: 'store', tag: '매장', title: '청담 플래그십', excerpt: '서울 강남구', href: '#!store:locator', keywords: '서울 강남 압구정' },
  { cat: 'store', tag: '매장', title: '더현대 서울', excerpt: '서울 영등포구', href: '#!store:locator', keywords: '서울 여의도 백화점' },
  { cat: 'store', tag: '매장', title: '롯데 에비뉴엘 잠실', excerpt: '서울 송파구', href: '#!store:locator', keywords: '서울 잠실 백화점' },
  { cat: 'store', tag: '매장', title: '신세계 센텀시티', excerpt: '부산 해운대구', href: '#!store:locator', keywords: '부산 해운대 백화점' },
  { cat: 'store', tag: '매장', title: '제주 애월 쇼룸', excerpt: '제주 제주시', href: '#!store:locator', keywords: '제주 애월 쇼룸' },
  { cat: 'journal', tag: '저널', title: '레이어링의 순서가 결과를 바꾼다', excerpt: '뷰티 인사이트', href: '#!journal:grid', img: 'https://images.unsplash.com/photo-1643168343279-3f93c2e592ef?auto=format&fit=crop&w=200&q=80', keywords: '스킨케어 루틴 순서' },
  { cat: 'journal', tag: '저널', title: '그라스에서 온 편지', excerpt: '브랜드 스토리', href: '#!journal:grid', img: 'https://images.unsplash.com/photo-1629380108599-ea06489d66f5?auto=format&fit=crop&w=200&q=80', keywords: '조향 원료 프랑스' },
  { cat: 'journal', tag: '저널', title: '비우는 루틴, 미니멀 스킨케어', excerpt: '라이프스타일', href: '#!journal:grid', img: 'https://images.unsplash.com/photo-1629732047356-30c7e14e712b?auto=format&fit=crop&w=200&q=80', keywords: '미니멀 심플 루틴' },
  { cat: 'journal', tag: '저널', title: '조향사 클레어와의 대화', excerpt: '인터뷰', href: '#!journal:grid', img: 'https://images.unsplash.com/photo-1585832622886-272fb3a927e0?auto=format&fit=crop&w=200&q=80', keywords: '인터뷰 조향사' },
  { cat: 'journal', tag: '저널', title: '성분표 읽는 법, 세 가지 원칙', excerpt: '뷰티 인사이트', href: '#!journal:grid', img: 'https://images.unsplash.com/photo-1575330933415-cea1e7ce53eb?auto=format&fit=crop&w=200&q=80', keywords: '성분 원료 인사이트' },
  { cat: 'journal', tag: '저널', title: '지속가능한 패키지를 향한 여정', excerpt: '브랜드 스토리', href: '#!journal:grid', img: 'https://images.unsplash.com/photo-1748543668699-a8a9398e9161?auto=format&fit=crop&w=200&q=80', keywords: '친환경 패키지 지속가능성' },
];

const SEARCH_CATEGORIES = [
  { key: 'all', label: '전체' },
  { key: 'product', label: '상품' },
  { key: 'store', label: '매장' },
  { key: 'journal', label: '저널' },
  { key: 'page', label: '페이지' },
];

let currentSearchCategory = 'all';

function renderSearchResultRow(item) {
  return `
    <a class="search-result-item" href="${item.href}">
      ${item.img ? `<span class="thumb"><img src="${item.img}" alt=""></span>` : '<span class="thumb thumb-empty"></span>'}
      <span class="info">
        <span class="tag">${item.tag}</span>
        <span class="title">${item.title}</span>
      </span>
      <span class="excerpt">${item.excerpt}</span>
    </a>`;
}

function renderSearchResults(query) {
  const resultsEl = document.getElementById('siteSearchResults');
  if (!resultsEl) return;

  const q = query.trim().toLowerCase();
  const pool = currentSearchCategory === 'all' ? SEARCH_INDEX : SEARCH_INDEX.filter((i) => i.cat === currentSearchCategory);

  if (!q) {
    const popular = pool.slice(0, 5);
    resultsEl.innerHTML = `
      <p class="search-section-label">인기 검색</p>
      ${popular.map(renderSearchResultRow).join('')}
    `;
    return;
  }

  const matches = pool
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.excerpt.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
    )
    .slice(0, 12);

  if (!matches.length) {
    resultsEl.innerHTML = `<p class="search-empty">"${query}"에 대한 검색 결과가 없습니다.<br>다른 키워드로 다시 검색해보세요.</p>`;
    return;
  }

  resultsEl.innerHTML = `<p class="search-section-label">검색 결과 ${matches.length}건</p>${matches.map(renderSearchResultRow).join('')}`;
}

function initSiteSearch() {
  const triggers = document.querySelectorAll('.header-icons [aria-label="검색"]');
  if (!triggers.length) return;

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!window.__etherealOpenModal) return;
      currentSearchCategory = 'all';

      window.__etherealOpenModal({
        eyebrow: '검색',
        title: '무엇을 찾고 계신가요?',
        body: `
          <div class="site-search">
            <input type="text" id="siteSearchInput" placeholder="상품, 매장, 저널 검색…" autocomplete="off">
            <div class="search-tabs" id="siteSearchTabs">
              ${SEARCH_CATEGORIES.map(
                (c, i) => `<button type="button" class="search-tab${i === 0 ? ' is-active' : ''}" data-search-cat="${c.key}">${c.label}</button>`
              ).join('')}
            </div>
            <div class="search-results" id="siteSearchResults"></div>
          </div>`,
      });

      const input = document.getElementById('siteSearchInput');
      const tabsWrap = document.getElementById('siteSearchTabs');

      renderSearchResults('');

      if (input) {
        input.focus();
        input.addEventListener('input', () => renderSearchResults(input.value));
      }

      if (tabsWrap) {
        tabsWrap.querySelectorAll('.search-tab').forEach((tab) => {
          tab.addEventListener('click', () => {
            tabsWrap.querySelectorAll('.search-tab').forEach((t) => t.classList.remove('is-active'));
            tab.classList.add('is-active');
            currentSearchCategory = tab.dataset.searchCat;
            renderSearchResults(input ? input.value : '');
          });
        });
      }
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 헤더 마이페이지 아이콘 → 로그인 / 회원가입 / 소셜 로그인 · 계정 · 주문 내역     */
/* (소셜 로그인은 실제 OAuth 연동이 아닌, 프론트엔드 전용 데모 시뮬레이션입니다) */
/* ---------------------------------------------------------------------- */
const USER_KEY = 'etherealUser';
const USERS_KEY = 'etherealUsers';
const ORDERS_KEY = 'etherealOrders';

function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function getRegisteredUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function getOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

const SOCIAL_PROVIDERS = {
  google: { label: 'Google', mockName: 'Google 사용자', mockEmail: 'user@gmail.com' },
  naver: { label: '네이버', mockName: '네이버 사용자', mockEmail: 'user@naver.com' },
  github: { label: 'GitHub', mockName: 'GitHub 사용자', mockEmail: 'user@github.com' },
};

function socialIconSvg(provider) {
  if (provider === 'google') {
    return `<svg viewBox="0 0 24 24" width="18" height="18"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.7-2.6C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.7 6.6 2.7 11.7S6.9 21 12 21c6.9 0 8.9-4.9 8.9-7.4 0-.5 0-.9-.1-1.4H12z"/></svg>`;
  }
  if (provider === 'naver') {
    return `<svg viewBox="0 0 24 24" width="18" height="18"><rect width="24" height="24" rx="4" fill="#03C75A"/><path fill="#fff" d="M13.6 12.9L9.9 7.2H7v9.6h2.5v-5.7l3.7 5.7h2.9V7.2h-2.5z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="#181717"><path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.3 3.6 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.2 0 0 1-.3 3.4 1.2a11.6 11.6 0 0 1 6.2 0c2.3-1.6 3.4-1.2 3.4-1.2.7 1.7.2 3 .1 3.2.8.9 1.3 2 1.3 3.2 0 4.6-2.7 5.6-5.4 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z"/></svg>`;
}

function renderMyPageAuth(initialTab) {
  if (!window.__etherealOpenModal) return;
  const tab = initialTab === 'signup' ? 'signup' : 'login';

  window.__etherealOpenModal({
    eyebrow: '마이페이지',
    title: '에테리얼과 함께하기',
    body: `
      <div class="auth-tabs">
        <button type="button" class="auth-tab${tab === 'login' ? ' is-active' : ''}" data-auth-tab="login">로그인</button>
        <button type="button" class="auth-tab${tab === 'signup' ? ' is-active' : ''}" data-auth-tab="signup">회원가입</button>
      </div>

      <div class="auth-panel${tab === 'login' ? ' is-active' : ''}" data-auth-panel="login">
        <form id="mypageLoginForm" class="inquiry-form">
          <input type="email" name="email" placeholder="이메일 주소" required>
          <input type="password" name="password" placeholder="비밀번호" required minlength="4">
          <span class="field-error" id="loginError"></span>
          <button type="submit" class="btn btn-solid">로그인</button>
        </form>
      </div>

      <div class="auth-panel${tab === 'signup' ? ' is-active' : ''}" data-auth-panel="signup">
        <form id="mypageSignupForm" class="inquiry-form">
          <input type="text" name="name" placeholder="이름" required>
          <input type="email" name="email" placeholder="이메일 주소" required>
          <input type="password" name="password" placeholder="비밀번호 (4자 이상)" required minlength="4">
          <input type="password" name="passwordConfirm" placeholder="비밀번호 확인" required minlength="4">
          <span class="field-error" id="signupError"></span>
          <button type="submit" class="btn btn-solid">회원가입</button>
        </form>
      </div>

      <div class="auth-divider"><span>또는</span></div>

      <div class="social-login">
        <button type="button" class="social-btn" data-social="google">${socialIconSvg('google')}Google로 계속하기</button>
        <button type="button" class="social-btn" data-social="naver">${socialIconSvg('naver')}네이버로 계속하기</button>
        <button type="button" class="social-btn" data-social="github">${socialIconSvg('github')}GitHub로 계속하기</button>
      </div>

      <p class="auth-disclaimer">* 소셜 로그인은 실제 계정 연동이 아닌 데모용 시뮬레이션입니다.</p>`,
  });

  bindAuthModalEvents();
}

function bindAuthModalEvents() {
  const tabs = document.querySelectorAll('.auth-tab');
  const panels = document.querySelectorAll('.auth-panel');

  tabs.forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tabBtn.classList.add('is-active');
      panels.forEach((p) => p.classList.toggle('is-active', p.dataset.authPanel === tabBtn.dataset.authTab));
    });
  });

  document.querySelectorAll('.social-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.social;
      const info = SOCIAL_PROVIDERS[provider];
      if (!info) return;

      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `${socialIconSvg(provider)}${info.label} 연결 중…`;

      setTimeout(() => {
        const user = { name: info.mockName, email: info.mockEmail, provider };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (window.__etherealCloseModal) window.__etherealCloseModal();
        showToast(`${info.label} 계정으로 로그인되었습니다`);
      }, 900);
    });
  });
}

function renderMyPageAccount(user) {
  if (!window.__etherealOpenModal) return;
  const orders = getOrders();

  const providerLabel = {
    google: 'Google 계정으로 로그인',
    naver: '네이버 계정으로 로그인',
    github: 'GitHub 계정으로 로그인',
  }[user.provider];

  const ordersHtml = orders.length
    ? orders
        .slice()
        .reverse()
        .map(
          (o) => `
        <div class="mypage-order">
          <div class="row title">${o.orderNumber}</div>
          <div class="row"><span>주문 일시</span><span>${o.date}</span></div>
          <div class="row"><span>결제 수단</span><span>${o.payMethod}</span></div>
          <div class="row"><span>주문 상품</span><span>${o.itemSummary}</span></div>
          <div class="row"><span>결제 금액</span><span>${o.total}</span></div>
        </div>`
        )
        .join('')
    : '<div class="mypage-empty-orders">아직 주문 내역이 없습니다.</div>';

  window.__etherealOpenModal({
    eyebrow: '마이페이지',
    title: `${user.name}님, 안녕하세요`,
    body: `
      <p class="mypage-welcome"><strong>${user.email}</strong>${providerLabel ? ` · ${providerLabel}` : '로 로그인되어 있습니다'}</p>
      <div class="mypage-orders">${ordersHtml}</div>
      <div class="mypage-actions">
        <button type="button" class="btn btn-solid" id="mypageLogoutBtn">로그아웃</button>
      </div>`,
  });
}

function initMyPage() {
  const triggers = document.querySelectorAll('.header-icons [aria-label="마이페이지"]');
  if (!triggers.length) return;

  triggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      const user = getUser();
      if (user) {
        renderMyPageAccount(user);
      } else {
        renderMyPageAuth('login');
      }
    });
  });

  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'mypageLoginForm') {
      e.preventDefault();
      const formData = new FormData(e.target);
      const email = (formData.get('email') || '').toString().trim().toLowerCase();
      const password = (formData.get('password') || '').toString();
      const errorEl = document.getElementById('loginError');

      const match = getRegisteredUsers().find((u) => u.email === email && u.password === password);
      if (!match) {
        if (errorEl) errorEl.textContent = '이메일 또는 비밀번호가 일치하지 않습니다. 계정이 없다면 회원가입해주세요.';
        return;
      }

      const user = { name: match.name, email: match.email, provider: 'email' };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (window.__etherealCloseModal) window.__etherealCloseModal();
      showToast(`${user.name}님, 환영합니다`);
    }

    if (e.target && e.target.id === 'mypageSignupForm') {
      e.preventDefault();
      const formData = new FormData(e.target);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim().toLowerCase();
      const password = (formData.get('password') || '').toString();
      const passwordConfirm = (formData.get('passwordConfirm') || '').toString();
      const errorEl = document.getElementById('signupError');

      if (password !== passwordConfirm) {
        if (errorEl) errorEl.textContent = '비밀번호가 서로 일치하지 않습니다.';
        return;
      }

      const users = getRegisteredUsers();
      if (users.some((u) => u.email === email)) {
        if (errorEl) errorEl.textContent = '이미 가입된 이메일입니다. 로그인 탭을 이용해주세요.';
        return;
      }

      users.push({ name, email, password });
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      const user = { name, email, provider: 'email' };
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      if (window.__etherealCloseModal) window.__etherealCloseModal();
      showToast(`${name}님, 회원가입이 완료되었습니다`);
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'mypageLogoutBtn') {
      localStorage.removeItem(USER_KEY);
      if (window.__etherealCloseModal) window.__etherealCloseModal();
      showToast('로그아웃 되었습니다');
    }
  });
}
/* ==========================================================================
   ETHEREAL — checkout.js
   장바구니 렌더링 · 배송 정보 검증 · 결제 수단 전환 · 쿠폰 · 결제 시뮬레이션
   (localStorage 기반 데모 결제 — 실제 카드사/PG 연동은 포함되어 있지 않습니다)
   ========================================================================== */

const SHIPPING_FEE = 3000;
const FREE_SHIPPING_THRESHOLD = 100000;
const COUPONS = {
  ETHEREAL10: { label: '10% 할인', rate: 0.1 },
  WELCOME5000: { label: '5,000원 할인', flat: 5000 },
};

let appliedCoupon = null;
let currentPayMethod = 'card';

function won(n) {
  return `${Math.max(0, Math.round(n)).toLocaleString('ko-KR')}원`;
}

function initCheckout() {
  renderCartItems();
  bindPayMethodTabs();
  bindCoupon();
  bindCardInputFormatting();
  bindValidationListeners();
  bindPayButton();
  updateSummary();
}

/* ---------------------------------------------------------------------- */
/* 장바구니 렌더링                                                          */
/* ---------------------------------------------------------------------- */
function renderCartItems() {
  const listEl = document.getElementById('cartItemsList');
  const mainEl = document.getElementById('checkoutMain');
  const summaryEl = document.getElementById('checkoutSummary');
  const emptyEl = document.getElementById('checkoutEmptyState');
  if (!listEl) return;

  const cart = typeof getCart === 'function' ? getCart() : [];

  if (!cart.length) {
    mainEl.style.display = 'none';
    summaryEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }

  mainEl.style.display = '';
  summaryEl.style.display = '';
  emptyEl.style.display = 'none';

  listEl.innerHTML = cart
    .map(
      (item, i) => `
    <div class="cart-item" data-index="${i}">
      <div class="cart-item-thumb">
        ${item.img ? `<img src="${item.img}" alt="${item.name}">` : ''}
      </div>
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <div class="cart-item-qty">
          <button type="button" data-qty-action="dec" aria-label="수량 줄이기">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty-action="inc" aria-label="수량 늘리기">+</button>
        </div>
      </div>
      <div class="cart-item-right">
        <span class="cart-item-price">${won(item.price * item.qty)}</span>
        <button type="button" class="cart-item-remove" data-qty-action="remove">삭제</button>
      </div>
    </div>
  `
    )
    .join('');

  listEl.querySelectorAll('[data-qty-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.cart-item');
      const index = Number(row.dataset.index);
      const action = btn.dataset.qtyAction;
      const cartNow = getCart();
      const item = cartNow[index];
      if (!item) return;

      if (action === 'inc') {
        item.qty += 1;
      } else if (action === 'dec') {
        item.qty -= 1;
        if (item.qty <= 0) cartNow.splice(index, 1);
      } else if (action === 'remove') {
        cartNow.splice(index, 1);
      }

      saveCart(cartNow);
      renderCartItems();
      updateSummary();
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 결제 수단 탭 전환                                                        */
/* ---------------------------------------------------------------------- */
function bindPayMethodTabs() {
  const tabs = document.querySelectorAll('.pay-method');
  const panels = {
    card: document.getElementById('payPanelCard'),
    kakao: document.getElementById('payPanelKakao'),
    bank: document.getElementById('payPanelBank'),
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      currentPayMethod = tab.dataset.payMethod;

      Object.entries(panels).forEach(([key, panel]) => {
        if (!panel) return;
        panel.classList.toggle('is-active', key === currentPayMethod);
      });

      validateForm();
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 쿠폰 적용                                                                */
/* ---------------------------------------------------------------------- */
function bindCoupon() {
  const btn = document.getElementById('couponApplyBtn');
  const input = document.getElementById('couponInput');
  const msg = document.getElementById('couponMessage');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const code = input.value.trim().toUpperCase();
    if (!code) {
      msg.textContent = '쿠폰 코드를 입력해주세요.';
      msg.style.color = 'var(--color-muted)';
      appliedCoupon = null;
      updateSummary();
      return;
    }

    const coupon = COUPONS[code];
    if (coupon) {
      appliedCoupon = coupon;
      msg.textContent = `"${code}" 쿠폰이 적용되었습니다 (${coupon.label})`;
      msg.style.color = 'var(--color-gold)';
    } else {
      appliedCoupon = null;
      msg.textContent = '유효하지 않은 쿠폰 코드입니다.';
      msg.style.color = '#b0492f';
    }
    updateSummary();
  });
}

/* ---------------------------------------------------------------------- */
/* 카드 입력 포맷팅 (번호 / 유효기간)                                        */
/* ---------------------------------------------------------------------- */
function bindCardInputFormatting() {
  const numberEl = document.getElementById('cardNumber');
  const expiryEl = document.getElementById('cardExpiry');
  const cvcEl = document.getElementById('cardCvc');

  if (numberEl) {
    numberEl.addEventListener('input', () => {
      const digits = numberEl.value.replace(/\D/g, '').slice(0, 16);
      numberEl.value = digits.replace(/(.{4})/g, '$1 ').trim();
    });
  }

  if (expiryEl) {
    expiryEl.addEventListener('input', () => {
      let digits = expiryEl.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) {
        digits = `${digits.slice(0, 2)}/${digits.slice(2)}`;
      }
      expiryEl.value = digits;
    });
  }

  if (cvcEl) {
    cvcEl.addEventListener('input', () => {
      cvcEl.value = cvcEl.value.replace(/\D/g, '').slice(0, 3);
    });
  }
}

/* ---------------------------------------------------------------------- */
/* 금액 요약 업데이트                                                       */
/* ---------------------------------------------------------------------- */
function updateSummary() {
  const cart = typeof getCart === 'function' ? getCart() : [];
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.rate ? subtotal * appliedCoupon.rate : appliedCoupon.flat;
    discount = Math.min(discount, subtotal);
  }

  const total = subtotal + shipping - discount;

  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const discountRowEl = document.getElementById('summaryDiscountRow');
  const discountEl = document.getElementById('summaryDiscount');
  const totalEl = document.getElementById('summaryTotal');

  if (subtotalEl) subtotalEl.textContent = won(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? '무료' : won(shipping);
  if (discountRowEl) discountRowEl.style.display = discount > 0 ? 'flex' : 'none';
  if (discountEl) discountEl.textContent = `−${won(discount)}`;
  if (totalEl) totalEl.textContent = won(total);

  validateForm();
}

/* ---------------------------------------------------------------------- */
/* 폼 검증                                                                  */
/* ---------------------------------------------------------------------- */
function setError(fieldId, message) {
  const el = document.querySelector(`[data-error-for="${fieldId}"]`);
  if (el) el.textContent = message || '';
}

function validateForm(showErrors) {
  const cart = typeof getCart === 'function' ? getCart() : [];
  const payButton = document.getElementById('payButton');
  if (!payButton) return false;

  if (!cart.length) {
    payButton.disabled = true;
    return false;
  }

  const name = document.getElementById('recvName');
  const phone = document.getElementById('recvPhone');
  const address = document.getElementById('recvAddress');
  const agreeTerms = document.getElementById('agreeTerms');
  const agreePrivacy = document.getElementById('agreePrivacy');

  let valid = true;

  const nameOk = !!name.value.trim();
  if (showErrors) setError('recvName', nameOk ? '' : '받는 분 이름을 입력해주세요.');
  valid = valid && nameOk;

  const phoneOk = /^[0-9-]{9,14}$/.test(phone.value.trim());
  if (showErrors) setError('recvPhone', phoneOk ? '' : '올바른 연락처를 입력해주세요.');
  valid = valid && phoneOk;

  const addressOk = !!address.value.trim();
  if (showErrors) setError('recvAddress', addressOk ? '' : '주소를 입력해주세요.');
  valid = valid && addressOk;

  if (currentPayMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvc = document.getElementById('cardCvc');

    const numberOk = cardNumber.value.replace(/\D/g, '').length === 16;
    if (showErrors) setError('cardNumber', numberOk ? '' : '카드 번호 16자리를 입력해주세요.');
    valid = valid && numberOk;

    const expiryOk = /^\d{2}\/\d{2}$/.test(cardExpiry.value.trim());
    if (showErrors) setError('cardExpiry', expiryOk ? '' : 'MM/YY 형식으로 입력해주세요.');
    valid = valid && expiryOk;

    const cvcOk = /^\d{3}$/.test(cardCvc.value.trim());
    if (showErrors) setError('cardCvc', cvcOk ? '' : 'CVC 3자리를 입력해주세요.');
    valid = valid && cvcOk;
  }

  valid = valid && agreeTerms.checked && agreePrivacy.checked;

  payButton.disabled = !valid;
  return valid;
}

function bindValidationListeners() {
  const watchIds = [
    'recvName',
    'recvPhone',
    'recvAddress',
    'cardNumber',
    'cardExpiry',
    'cardCvc',
  ];
  watchIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => validateForm());
  });

  const agreeAll = document.getElementById('agreeAll');
  const agreeTerms = document.getElementById('agreeTerms');
  const agreePrivacy = document.getElementById('agreePrivacy');
  const agreeMarketing = document.getElementById('agreeMarketing');

  if (agreeAll) {
    agreeAll.addEventListener('change', () => {
      [agreeTerms, agreePrivacy, agreeMarketing].forEach((el) => {
        if (el) el.checked = agreeAll.checked;
      });
      validateForm();
    });
  }

  [agreeTerms, agreePrivacy, agreeMarketing].forEach((el) => {
    if (!el) return;
    el.addEventListener('change', () => {
      if (agreeAll) {
        agreeAll.checked = agreeTerms.checked && agreePrivacy.checked && agreeMarketing.checked;
      }
      validateForm();
    });
  });
}

/* ---------------------------------------------------------------------- */
/* 결제하기 → 시뮬레이션 → 완료 화면                                         */
/* ---------------------------------------------------------------------- */
function bindPayButton() {
  const payButton = document.getElementById('payButton');
  if (!payButton) return;

  payButton.addEventListener('click', () => {
    const valid = validateForm(true);
    if (!valid) {
      showToast('입력 정보를 다시 확인해주세요');
      return;
    }

    const processing = document.getElementById('payProcessing');
    processing.classList.add('is-active');
    payButton.disabled = true;

    setTimeout(() => {
      processing.classList.remove('is-active');
      completeOrder();
    }, 1600);
  });
}

function completeOrder() {
  const payLabels = { card: '신용/체크카드', kakao: '카카오페이', bank: '무통장 입금' };
  const totalText = document.getElementById('summaryTotal').textContent;
  const receiverName = document.getElementById('recvName').value.trim();
  const cartNow = getCart();

  const orderNumber = `ETH-${Date.now().toString().slice(-8)}`;
  const orderDate = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  document.getElementById('orderNumber').textContent = orderNumber;
  document.getElementById('orderDate').textContent = orderDate;
  document.getElementById('orderPayMethod').textContent = payLabels[currentPayMethod] || '—';
  document.getElementById('orderReceiver').textContent = receiverName;
  document.getElementById('orderTotal').textContent = totalText;

  // 마이페이지 주문 내역에 저장
  try {
    const itemSummary =
      cartNow.length > 1
        ? `${cartNow[0].name} 외 ${cartNow.length - 1}건`
        : cartNow[0]?.name || '';
    const orders = JSON.parse(localStorage.getItem('etherealOrders') || '[]');
    orders.push({
      orderNumber,
      date: orderDate,
      payMethod: payLabels[currentPayMethod] || '—',
      itemSummary,
      total: totalText,
    });
    localStorage.setItem('etherealOrders', JSON.stringify(orders));
  } catch (e) {
    /* localStorage 사용 불가 시 조용히 무시 */
  }

  // 장바구니 비우기
  saveCart([]);

  document.getElementById('checkoutForm').style.display = 'none';
  const success = document.getElementById('checkoutSuccess');
  success.classList.add('is-active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   ETHEREAL — SPA 라우터
   해시(#!view 또는 #!view:anchor) 기반으로 5개 뷰를 전환합니다.
   ========================================================================== */
const VIEW_TITLES = {
  home: 'ETHEREAL — 당신의 아침을 여는 고요한 럭셔리',
  about: 'ETHEREAL — Our Story',
  store: 'ETHEREAL — Store',
  journal: 'ETHEREAL — Journal',
  checkout: 'ETHEREAL — 주문 / 결제',
};

const VALID_VIEWS = ['home', 'about', 'store', 'journal', 'checkout'];

function parseHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#!')) return null;
  const raw = hash.slice(2);
  const [view, anchor] = raw.split(':');
  return { view: view || 'home', anchor: anchor || null };
}

function forceRevealInView(view) {
  const section = document.getElementById(`view-${view}`);
  if (!section) return;
  const vh = window.innerHeight;
  section.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vh + 200 && rect.bottom > -200) {
      el.classList.add('is-visible');
    }
  });
}

function switchView(rawView, anchor) {
  const view = VALID_VIEWS.includes(rawView) ? rawView : 'home';

  document.querySelectorAll('.page-view').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.view === view);
  });

  document.title = VIEW_TITLES[view] || 'ETHEREAL';

  const header = document.querySelector('.site-header');
  if (header) header.classList.toggle('is-hero-dark', view !== 'checkout');

  document.querySelectorAll('.mobile-nav-main a').forEach((a) => {
    const m = (a.getAttribute('href') || '').match(/^#!([a-z]+)/);
    a.classList.toggle('is-current', !!(m && m[1] === view));
  });

  document.querySelectorAll('.main-nav a').forEach((a) => {
    const m = (a.getAttribute('href') || '').match(/^#!([a-z]+)/);
    const isCurrent = !!(m && m[1] === view);
    a.classList.toggle('is-current', isCurrent);
    a.classList.toggle('link-underline', !isCurrent);
  });

  if (view === 'store') {
    initStoreMap();
    setTimeout(() => {
      if (window.__etherealMap) window.__etherealMap.invalidateSize();
    }, 80);
  }

  if (view === 'checkout') {
    const formWrap = document.getElementById('checkoutForm');
    const successWrap = document.getElementById('checkoutSuccess');
    if (formWrap) formWrap.style.display = '';
    if (successWrap) successWrap.classList.remove('is-active');
    if (typeof renderCartItems === 'function') renderCartItems();
    if (typeof updateSummary === 'function') updateSummary();
  }

  window.scrollTo({ top: 0, behavior: 'auto' });
  forceRevealInView(view);

  if (anchor) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = document.getElementById(anchor);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }
}

function initRouter() {
  window.addEventListener('hashchange', () => {
    const parsed = parseHash();
    if (!parsed) return;
    switchView(parsed.view, parsed.anchor);
  });

  // 모달/검색 결과 등에서 #! 라우팅 링크를 클릭하면 모달을 닫아준다
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#!"]');
    if (link && window.__etherealCloseModal) {
      window.__etherealCloseModal();
    }
  });

  const initial = parseHash();
  switchView(initial ? initial.view : 'home', initial ? initial.anchor : null);
}
