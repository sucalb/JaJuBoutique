(() => {
  'use strict';

  /* =====================================================
     JaJu Boutique — storefront
     Nội dung lấy từ data/store.js (sửa qua admin.html).
     index.html?preview=1 hiển thị bản nháp đang sửa trong trang quản trị.
     ===================================================== */
  const PREVIEW = new URLSearchParams(location.search).has('preview');
  const readJSON = k => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } };
  const RAW = (PREVIEW && readJSON('jaju-admin-draft')) || window.JAJU_STORE;
  document.body.classList.remove('is-loading');
  if (!RAW) { document.querySelector('#main').innerHTML = '<p style="padding:40px;text-align:center">Không tải được dữ liệu cửa hàng. Vui lòng tải lại trang.</p>'; return; }

  // Chuẩn hóa dữ liệu để trang không lỗi khi thiếu trường
  const STORE = {
    settings: {}, groups: [], categories: [], products: [], vouchers: [], slides: [],
    miniBanners: [], promos: [], posts: [], spotlight: null, ...RAW
  };
  const S = STORE.settings;
  const FREESHIP = +S.freeship || 0;
  const SHIPPING = +S.shippingFee || 0;
  const CATS = Object.fromEntries(STORE.categories.map(c => [c.id, c]));
  const PRODUCTS = STORE.products
    .filter(p => p && !p.hidden && p.name && CATS[p.cat])
    .map((p, i) => ({ ...p, price: +p.price || 0, compare: +p.compare || 0, opts: p.opts || [], gallery: p.gallery || [], order: i }));
  const GROUPS = STORE.groups;
  const VOUCHERS = STORE.vouchers.filter(v => v && v.code);

  // Giỏ hàng xem trước tách riêng, không đụng giỏ hàng thật của khách
  const KEY = PREVIEW ? { cart: 'jaju-preview-cart', coupon: 'jaju-preview-coupon', fav: 'jaju-preview-fav' } : { cart: 'jaju-cart-v6', coupon: 'jaju-coupon-v6', fav: 'jaju-fav' };

  /* ================= Tiện ích ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + (+n).toFixed(2);
  const byId = id => PRODUCTS.find(p => p.id === id);
  const isSale = p => p.compare > p.price;
  const offPct = p => isSale(p) ? Math.round((1 - p.price / p.compare) * 100) : 0;
  const catName = id => CATS[id]?.name || '';
  const groupOf = p => CATS[p.cat]?.group;
  const inFilter = (p, f) => f === 'all' || p.cat === f || groupOf(p) === f || (f === 'sale' && isSale(p)) || (f === 'fav' && favs.has(p.id));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const safeUrl = u => { u = String(u || '').trim(); return /^(https?:|mailto:|tel:|#|\/|\.{0,2}\/?[\w-])/i.test(u) && !/^\s*javascript:/i.test(u) ? u : '#'; };
  const ext = u => /^https?:/i.test(u || '') ? ' target="_blank" rel="noopener"' : '';
  const tone = c => 'tone-' + (/^(peach|mint|pink|lavender|sky|cream)$/.test(c) ? c : 'lavender');
  const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua */ } }
  };
  const I = {
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6L4 9"/><path d="M4 4v5h5"/></svg>',
    gift: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8S10 3 7.5 4.5 9 8 12 8Zm0 0s2-5 4.5-3.5S15 8 12 8Z"/></svg>',
    tag: '<svg viewBox="0 0 24 24"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    msg: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4Z"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>'
  };

  let cart = store.get(KEY.cart, []).filter(i => i && byId(i.id) && i.qty > 0);
  let coupon = store.get(KEY.coupon, null);
  const favs = new Set(store.get(KEY.fav, []).filter(byId));
  const state = { filter: 'all', sort: 'featured' };

  /* ================= Màu và thông tin chung ================= */
  const hexRgb = h => { const m = String(h).replace('#', '').match(/^([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i); return m ? m.slice(1).map(x => parseInt(x, 16)) : null; };
  const rgbHex = r => '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (h, w) => { const r = hexRgb(h); return r ? rgbHex(r.map(v => v + (255 - v) * w)) : h; };
  const shade = (h, k) => { const r = hexRgb(h); return r ? rgbHex(r.map(v => v * (1 + k))) : h; };

  function applySettings() {
    const t = S.theme || {}, root = document.documentElement.style;
    if (hexRgb(t.primary)) { root.setProperty('--c', t.primary); root.setProperty('--c-700', shade(t.primary, -.22)); root.setProperty('--c-50', mix(t.primary, .93)); root.setProperty('--c-100', mix(t.primary, .84)); root.setProperty('--soft', mix(t.primary, .955)); }
    if (hexRgb(t.accent)) { root.setProperty('--a', t.accent); root.setProperty('--a-50', mix(t.accent, .93)); }
    if (hexRgb(t.bg)) root.setProperty('--bg', t.bg);
    $('meta[name="theme-color"]').content = hexRgb(t.primary) ? t.primary : '#7b3f9e';

    $$('[data-text]').forEach(el => { el.textContent = S[el.dataset.text] ?? ''; });
    const links = { tel: 'tel:' + String(S.hotline || '').replace(/[^\d+]/g, ''), email: 'mailto:' + (S.email || ''), facebook: safeUrl(S.facebook) };
    $$('[data-link]').forEach(el => { el.href = links[el.dataset.link] || '#'; });
    $('[data-pay-cards]').innerHTML = payCard('zelle') + payCard('venmo');
    $('[data-year]').textContent = new Date().getFullYear();
    if (PREVIEW) $('[data-preview-bar]').hidden = false;

    // Thông báo chạy
    const msgs = [S.promoText, 'Hàng chính hãng Nhật, Hàn', `Hotline ${S.hotlineDisplay || ''}`].filter(Boolean);
    const box = $('[data-announce]');
    box.innerHTML = msgs.map((m, i) => `<span class="${i ? '' : 'on'}">${esc(m).replace(/(\$\d+)/, '<b>$1</b>')}</span>`).join('');
    if (msgs.length > 1) {
      let k = 0;
      setInterval(() => {
        const items = box.children;
        items[k].className = 'off';
        k = (k + 1) % items.length;
        items[k].className = '';
        void items[k].offsetWidth;
        items[k].className = 'on';
      }, 4000);
    }
  }

  function payCard(type) {
    return type === 'zelle'
      ? `<div class="pay"><span class="pay__logo zelle">Zelle</span><div>${esc(S.zelleName)}<br><b>${esc(S.zellePhone)}</b></div></div>`
      : `<div class="pay"><span class="pay__logo venmo">venmo</span><div><b>${esc(S.venmo)}</b></div></div>`;
  }

  /* ================= Thẻ sản phẩm ================= */
  function card(p) {
    const off = offPct(p);
    const demo = /minh họa/i.test(p.brand || '');
    return `
      <article class="pc">
        <div class="pc__media">
          <button class="pc__open" data-view="${p.id}" aria-label="Xem ${esc(p.name)}" style="position:absolute;inset:0;z-index:1"></button>
          <img src="${esc(p.img)}" alt="" loading="lazy" decoding="async">
          <div class="pc__badges">
            ${off ? `<span class="badge badge--sale">-${off}%</span>` : ''}
            ${p.tag ? `<span class="badge">${esc(p.tag)}</span>` : ''}
          </div>
          <button class="pc__fav ${favs.has(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Yêu thích" aria-pressed="${favs.has(p.id)}">${I.heart}</button>
          <button class="pc__quick" data-add="${p.id}">${p.opts.length ? 'Chọn phân loại' : `${I.bag} Thêm vào giỏ`}</button>
        </div>
        <div class="pc__info">
          <span class="pc__brand ${demo ? 'demo' : ''}">${esc(p.brand || catName(p.cat))}</span>
          <h3 class="pc__name" data-view="${p.id}">${esc(p.name)}</h3>
          <div class="pc__price ${off ? 'sale' : ''}"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s>` : ''}
            <button class="pc__add" data-add="${p.id}" aria-label="Thêm ${esc(p.name)} vào giỏ">${I.plus}</button>
          </div>
        </div>
      </article>`;
  }

  /* ================= Header: menu, tìm kiếm ================= */
  function renderNav() {
    $('[data-group-links]').innerHTML = GROUPS.filter(g => PRODUCTS.some(p => groupOf(p) === g.id))
      .map(g => `<a class="hdr__link" href="#group-${esc(g.id)}">${esc(g.name.split(/\s[&,]\s|,/)[0])}</a>`).join('');

    const countIn = id => PRODUCTS.filter(p => p.cat === id).length;
    $('[data-mega]').innerHTML = GROUPS.map(g => {
      const cats = STORE.categories.filter(c => c.group === g.id);
      if (!cats.length) return '';
      return `<div><h4>${esc(g.name)}</h4>${cats.map(c => `
        <a href="#shop" data-filter="${esc(c.id)}"><img src="${esc(c.img)}" alt="" loading="lazy"><span>${esc(c.name)}<small>${countIn(c.id)} sản phẩm</small></span></a>`).join('')}</div>`;
    }).join('');

    $('[data-menu-list]').innerHTML = GROUPS.map(g => {
      const cats = STORE.categories.filter(c => c.group === g.id);
      if (!cats.length) return '';
      return `<div class="menu-group"><h3>${esc(g.name)}</h3>${cats.map(c => `<a class="menu-link" href="#shop" data-filter="${esc(c.id)}"><img src="${esc(c.img)}" alt="" loading="lazy">${esc(c.name)}</a>`).join('')}</div>`;
    }).join('') + `
      <div class="menu-extra">
        <a href="#flash">Flash sale</a><a href="#vouchers">Mã giảm giá</a><a href="#blog">Cẩm nang</a><a href="#contact">Liên hệ</a>
        <a href="tel:${esc(String(S.hotline || '').replace(/[^\d+]/g, ''))}">Gọi ${esc(S.hotlineDisplay)}</a>
      </div>`;

    $('[data-footer-cats]').innerHTML = STORE.categories.slice(0, 7).map(c => `<a href="#shop" data-filter="${esc(c.id)}">${esc(c.name)}</a>`).join('');
    $('[data-hot-keys]').innerHTML = (S.hotKeys || []).length ? `<span>Tìm nhiều:</span>${S.hotKeys.map(k => `<button type="button" data-key="${esc(k)}">${esc(k)}</button>`).join('')}` : '';
  }

  function searchResults(q) {
    const box = $('[data-search-results]');
    const n = norm(q).trim();
    if (!n) { box.innerHTML = ''; return; }
    const words = n.split(/\s+/);
    const list = PRODUCTS.filter(p => { const t = norm(`${p.name} ${p.brand} ${catName(p.cat)}`); return words.every(w => t.includes(w)); });
    box.innerHTML = list.length
      ? list.slice(0, 8).map(p => `<button class="result" data-view="${p.id}"><img src="${esc(p.img)}" alt=""><div><b>${esc(p.name)}</b><span>${money(p.price)}</span></div></button>`).join('') +
        (list.length > 8 ? `<button class="btn btn--ghost results__all" data-search-all>Xem tất cả ${list.length} kết quả</button>` : '')
      : `<p class="results__empty">Chưa tìm thấy "${esc(q)}". Thử từ khóa khác hoặc gọi ${esc(S.hotlineDisplay)} để hỏi Vân.</p>`;
  }

  /* ================= Hero ================= */
  function renderHero() {
    const slides = STORE.slides.filter(s => s && (s.title || s.photo || s.images?.length));
    $('[data-slides]').innerHTML = slides.map((s, i) => {
      const link = safeUrl(s.link || '#shop');
      const H = i ? 'h2' : 'h1';
      return `
      <a class="slide ${tone(s.color)} ${i ? '' : 'is-active'}" href="${esc(link)}"${ext(link)} aria-hidden="${i ? 'true' : 'false'}" ${i ? 'tabindex="-1"' : ''}>
        ${s.photo ? `<img class="slide__photo" src="${esc(s.photo)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>` : ''}
        <div class="slide__copy">
          ${s.eyebrow ? `<span class="slide__eyebrow">${esc(s.eyebrow)}</span>` : ''}
          <${H}>${esc(s.title)}${s.subtitle ? `<span>${esc(s.subtitle)}</span>` : ''}</${H}>
          ${s.text ? `<p>${esc(s.text)}</p>` : ''}
          <span class="slide__cta">${esc(s.deal || 'Mua ngay')} <i>${I.arrow}</i></span>
        </div>
        ${!s.photo && s.images?.length ? `<div class="slide__art">${s.images.slice(0, 3).map((im, k) => `<img class="a${k + 1}" src="${esc(im)}" alt="" ${i ? 'loading="lazy"' : ''}>`).join('')}</div>` : ''}
      </a>`;
    }).join('');
    $('[data-slider]').hidden = !slides.length;

    $('[data-tiles]').innerHTML = STORE.miniBanners.slice(0, 3).map(b => {
      const link = safeUrl(b.link || '#shop');
      return `<a class="tile ${tone(b.color)}" href="${esc(link)}"${ext(link)}>
        ${b.img ? `<img src="${esc(b.img)}" alt="" loading="lazy" class="${/emblem/.test(b.img) ? 'round' : ''}">` : I.truck}
        <b>${esc(b.title)}</b><span>${esc(b.text)}</span>
      </a>`;
    }).join('');
    $('[data-tiles]').hidden = !STORE.miniBanners.length;
  }

  function initSlider() {
    const slider = $('[data-slider]'), slides = $$('.slide', slider), dots = $('[data-dots]');
    const DUR = 6000;
    let i = 0, timer = null, paused = false;
    if (slides.length < 2) { $('.slider__ui', slider).hidden = true; return { next() {} }; }
    slider.style.setProperty('--dur', DUR + 'ms');
    dots.innerHTML = slides.map((_, k) => `<button aria-label="Banner ${k + 1}" class="${k ? '' : 'is-active'}"><i></i></button>`).join('');
    const go = n => {
      slides[i].classList.remove('is-active'); slides[i].setAttribute('aria-hidden', 'true'); slides[i].tabIndex = -1;
      dots.children[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active'); slides[i].setAttribute('aria-hidden', 'false'); slides[i].removeAttribute('tabindex');
      const d = dots.children[i]; d.classList.remove('is-active'); void d.offsetWidth; d.classList.add('is-active');
      play();
    };
    const play = () => { clearTimeout(timer); if (!paused) timer = setTimeout(() => go(i + 1), DUR); };
    [...dots.children].forEach((b, k) => b.addEventListener('click', () => go(k)));
    slider.addEventListener('mouseenter', () => { paused = true; clearTimeout(timer); dots.children[i].firstChild.style.animationPlayState = 'paused'; });
    slider.addEventListener('mouseleave', () => { paused = false; dots.children[i].firstChild.style.animationPlayState = ''; play(); });
    // vuốt trên điện thoại
    let x0 = null;
    slider.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); x0 = null; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(timer); else play(); });
    play();
    return { next: d => go(i + d) };
  }

  /* ================= Các khu vực ================= */
  function renderCats() {
    const box = $('[data-cats]');
    box.innerHTML = STORE.categories.map(c => `
      <a class="cat" href="#shop" data-filter="${esc(c.id)}"><span class="cat__img"><img src="${esc(c.img)}" alt="" loading="lazy"></span>${esc(c.name)}</a>`).join('') +
      `<a class="cat" href="#shop" data-filter="sale"><span class="cat__img cat__img--sale">${I.tag}</span>Đang giảm giá</a>`;
    box.style.setProperty('--n', Math.min(STORE.categories.length + 1, 10));
  }

  function renderVouchers() {
    $('#vouchers').hidden = !VOUCHERS.length;
    $('[data-vouchers]').innerHTML = VOUCHERS.map(v => `
      <div class="voucher">
        <div class="voucher__big">${esc(v.big || v.code)}<small>${esc(v.small || '')}</small></div>
        <div class="voucher__body"><b>${esc(v.title)}</b><span>${esc(v.note)}</span><code>${esc(v.code)}</code></div>
        <button class="save-btn ${coupon === v.code ? 'done' : ''}" data-copy="${esc(v.code)}">${coupon === v.code ? 'Đã lưu' : 'Lưu mã'}</button>
      </div>`).join('');
  }

  function renderFlash() {
    const list = PRODUCTS.filter(p => p.flash && isSale(p)).sort((a, b) => offPct(b) - offPct(a));
    $('#flash').hidden = !list.length;
    $('[data-rail="flash"]').innerHTML = list.map(card).join('');
  }

  function renderPromos() {
    const list = STORE.promos.filter(p => p && p.title);
    $('[data-promos]').closest('section').hidden = !list.length;
    $('[data-promos]').innerHTML = list.map(p => {
      const link = safeUrl(p.link || '#shop');
      return `<a href="${esc(link)}" class="coll ${tone(p.color)}"${ext(link)}>
        <small>${esc(p.label)}</small>
        <div><b>${esc(p.title)}</b><span class="go">Khám phá ${I.arrow}</span></div>
        ${p.img ? `<img src="${esc(p.img)}" alt="" loading="lazy">` : ''}
      </a>`;
    }).join('');
  }

  function renderGroups() {
    const spot = STORE.spotlight && byId(STORE.spotlight.productId);
    let spotDone = !spot;
    $('[data-groups]').innerHTML = GROUPS.map(g => {
      const items = PRODUCTS.filter(p => groupOf(p) === g.id);
      if (!items.length) return '';
      const cats = STORE.categories.filter(c => c.group === g.id && items.some(p => p.cat === c.id));
      let html = `
      <section class="wrap sec reveal" id="group-${esc(g.id)}">
        <div class="sec__head">
          <h2>${esc(g.name)}</h2>
          <div class="rail-nav only-d"><button data-scroll="g-${esc(g.id)}" data-dir="-1" aria-label="Trước"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button><button data-scroll="g-${esc(g.id)}" data-dir="1" aria-label="Sau"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button></div>
          ${cats.length > 1 ? `<div class="chips" style="flex-basis:100%;order:4" data-chips="${esc(g.id)}">
            <button class="chip is-active" data-gchip="${esc(g.id)}" data-group="${esc(g.id)}">Tất cả</button>
            ${cats.map(c => `<button class="chip" data-gchip="${esc(c.id)}" data-group="${esc(g.id)}">${esc(c.name)}</button>`).join('')}
          </div>` : ''}
        </div>
        <div class="group">
          <a class="group__banner ${tone(g.color)}" href="#shop" data-filter="${esc(g.id)}">
            ${g.bannerTag ? `<small>${esc(g.bannerTag)}</small>` : ''}
            <b>${esc(g.bannerTitle || g.name)}</b>
            <span class="go">Xem tất cả <i>${I.arrow}</i></span>
            ${(g.bannerImages || []).slice(0, 2).map(im => `<img src="${esc(im)}" alt="" loading="lazy">`).join('')}
          </a>
          <div class="rail group__rail" data-rail="g-${esc(g.id)}">${items.slice(0, 12).map(card).join('')}</div>
        </div>
      </section>`;
      if (!spotDone) { html += spotlightHtml(spot); spotDone = true; }
      return html;
    }).join('');
  }

  function spotlightHtml(p) {
    const sp = STORE.spotlight || {};
    const img = sp.image || p.img;
    const thumbs = [...new Set(p.gallery.filter(g => g && g !== img))].slice(0, 4);
    return `
      <section class="wrap sec reveal" aria-label="Sản phẩm nổi bật">
        <div class="spot">
          <div class="spot__img"><img src="${esc(img)}" alt="${esc(p.name)}" loading="lazy"></div>
          <div class="spot__info">
            <span class="spot__label">${esc(sp.label || 'Sản phẩm nổi bật')}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.desc)}</p>
            ${thumbs.length ? `<div class="spot__thumbs">${thumbs.map(g => `<button data-view="${p.id}" aria-label="Xem ảnh"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
            <div class="spot__price"><b>${money(p.price)}</b>${isSale(p) ? `<s>${money(p.compare)}</s>` : ''}</div>
            <div class="spot__actions">
              <button class="btn" data-add="${p.id}">${I.bag} Thêm vào giỏ</button>
              <button class="btn btn--ghost" data-view="${p.id}">Xem chi tiết</button>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderPosts() {
    const list = STORE.posts.filter(p => p && p.title);
    $('#blog').hidden = !list.length;
    $('[data-posts]').innerHTML = list.map(p => {
      const link = safeUrl(p.link || '#blog');
      return `<a class="post" href="${esc(link)}"${ext(link)}>
        <div class="post__img"><img src="${esc(p.img)}" alt="" loading="lazy"></div>
        <small>${esc(p.tag)}<time>${esc(p.date)}</time></small>
        <h3>${esc(p.title)}</h3>
      </a>`;
    }).join('');
  }

  /* ================= Lưới sản phẩm ================= */
  function renderTabs() {
    const items = [['all', 'Tất cả'], ['sale', 'Đang giảm giá'], ...(favs.size ? [['fav', `Yêu thích (${favs.size})`]] : []),
      ...STORE.categories.filter(c => PRODUCTS.some(p => p.cat === c.id)).map(c => [c.id, c.name])];
    if (!items.some(([k]) => k === state.filter) && !GROUPS.some(g => g.id === state.filter)) state.filter = 'all';
    $('[data-tabs]').innerHTML = items.map(([k, n]) =>
      `<button class="chip ${state.filter === k ? 'is-active' : ''}" data-filter="${esc(k)}" role="tab" aria-selected="${state.filter === k}">${esc(n)}</button>`).join('');
    $$('.hdr__link[href^="#group-"]').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#group-' + state.filter));
  }

  function renderShop() {
    const sorters = {
      featured: (a, b) => a.order - b.order,
      discount: (a, b) => offPct(b) - offPct(a) || a.order - b.order,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price
    };
    renderTabs();
    const list = PRODUCTS.filter(p => inFilter(p, state.filter)).sort(sorters[state.sort] || sorters.featured);
    $('[data-grid="shop"]').innerHTML = list.map(card).join('');
    const empty = $('[data-empty]');
    empty.hidden = list.length > 0;
    empty.innerHTML = state.filter === 'fav'
      ? 'Bạn chưa thả tim sản phẩm nào.'
      : `Chưa có sản phẩm phù hợp. Gọi <a href="tel:${esc(String(S.hotline || '').replace(/[^\d+]/g, ''))}">${esc(S.hotlineDisplay)}</a> hoặc xem <a href="${esc(safeUrl(S.facebook))}" target="_blank" rel="noopener">live trên Facebook</a> nha.`;
    const g = GROUPS.find(x => x.id === state.filter);
    $('[data-shop-title]').textContent = state.filter === 'all' ? 'Khám phá tất cả'
      : state.filter === 'sale' ? 'Đang giảm giá'
      : state.filter === 'fav' ? 'Sản phẩm yêu thích'
      : g ? g.name : catName(state.filter) || 'Sản phẩm';
  }

  function setFilter(f) { state.filter = f; renderShop(); }

  /* ================= Giỏ hàng ================= */
  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

  function pricing() {
    const sub = subtotal();
    let ship = !cart.length || (FREESHIP && sub >= FREESHIP) ? 0 : SHIPPING;
    let discount = 0, ok = false;
    const v = coupon && VOUCHERS.find(x => x.code === coupon);
    if (v && cart.length && sub >= (+v.min || 0)) {
      ok = true;
      if (v.type === 'ship') ship = 0;
      if (v.type === 'amount') discount = Math.min(+v.value || 0, sub);
      if (v.type === 'percent') discount = Math.round(sub * (+v.value || 0)) / 100;
    }
    return { sub, ship, discount, total: Math.max(0, sub - discount + ship), v, ok };
  }

  function addToCart(id, qty = 1, opt = '', fromEl = null) {
    const p = byId(id); if (!p) return;
    const line = cart.find(i => i.id === id && i.opt === opt);
    if (line) line.qty = Math.min(99, line.qty + qty); else cart.push({ id, qty, opt });
    saveCart();
    if (fromEl) flyToCart(fromEl);
    $$('[data-cart-count]').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    toast('Đã thêm vào giỏ hàng', p.img);
  }

  function flyToCart(fromEl) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const img = fromEl.closest('.pc, .pd, .spot')?.querySelector('img');
    const target = [...$$('[data-cart-count]')].find(el => el.offsetParent) ;
    if (!img || !target) return;
    const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    const f = Object.assign(document.createElement('img'), { src: img.src, className: 'fly', alt: '' });
    f.style.left = a.left + a.width / 2 - 30 + 'px'; f.style.top = a.top + a.height / 2 - 30 + 'px';
    document.body.appendChild(f);
    requestAnimationFrame(() => {
      f.style.transform = `translate(${b.left - a.left - a.width / 2 + 30}px, ${b.top - a.top - a.height / 2 + 30}px) scale(.2)`;
      f.style.opacity = '.4';
    });
    setTimeout(() => f.remove(), 750);
  }

  function saveCart() { store.set(KEY.cart, cart); store.set(KEY.coupon, coupon); renderCart(); }

  function totalsHtml(pr) {
    return `
      <div><span>Tạm tính</span><span>${money(pr.sub)}</span></div>
      ${pr.discount ? `<div class="disc"><span>Mã ${esc(pr.v.code)}</span><span>-${money(pr.discount)}</span></div>` : ''}
      <div><span>Vận chuyển</span><span>${pr.ship ? money(pr.ship) : 'Miễn phí'}</span></div>
      <div class="grand"><span>Tổng cộng</span><b>${money(pr.total)}</b></div>`;
  }

  function renderCart() {
    const pr = pricing(), n = count();
    $$('[data-cart-count]').forEach(b => { b.textContent = n; b.classList.toggle('is-zero', !n); });
    $('[data-cart-count-text]').textContent = n ? `(${n})` : '';
    const left = FREESHIP - pr.sub;
    $('[data-ship-note]').innerHTML = !FREESHIP ? '' : left > 0
      ? `Mua thêm <b>${money(left)}</b> để được miễn phí vận chuyển`
      : 'Đơn hàng của bạn được <b>miễn phí vận chuyển</b>';
    $('.ship').hidden = !FREESHIP || !n;
    $('[data-ship-bar]').style.width = Math.min(100, FREESHIP ? pr.sub / FREESHIP * 100 : 100) + '%';
    $('[data-totals]').innerHTML = totalsHtml(pr);
    $('[data-cart-foot]').hidden = !n;

    const msg = $('[data-coupon-msg]');
    if (pr.v && n) {
      msg.className = 'coupon-msg ' + (pr.ok ? 'ok' : 'err');
      msg.textContent = pr.ok ? `Đã áp dụng mã ${pr.v.code}` : `Mã ${pr.v.code}: ${String(pr.v.note || 'chưa đủ điều kiện').toLowerCase()}`;
      $('[data-coupon-form] input').value = pr.v.code;
    } else { msg.className = 'coupon-msg'; msg.textContent = ''; }

    $('[data-cart-items]').innerHTML = !n
      ? `<div class="cart-empty">${I.bag}<p>Giỏ hàng đang trống</p><button class="btn" data-action="close-all">Tiếp tục mua sắm</button></div>`
      : cart.map((i, idx) => {
        const p = byId(i.id);
        return `<div class="line">
          <img class="line__img" src="${esc(p.img)}" alt="" data-view="${p.id}">
          <div>
            <h4 data-view="${p.id}">${esc(p.name)}</h4>
            <small>${esc(i.opt ? 'Phân loại: ' + i.opt : p.brand)}</small>
            <div class="line__row">
              <div><span class="qty"><button data-qty="${idx}" data-d="-1" aria-label="Giảm">−</button><span>${i.qty}</span><button data-qty="${idx}" data-d="1" aria-label="Tăng">+</button></span><button class="rm" data-remove="${idx}">Xóa</button></div>
              <b>${money(p.price * i.qty)}</b>
            </div>
          </div>
        </div>`;
      }).join('');
  }

  /* ================= Lớp phủ: menu, giỏ, hộp thoại, tìm kiếm ================= */
  const scrim = $('[data-scrim]'), drawer = $('[data-drawer]'), menu = $('[data-menu]'), modal = $('[data-modal]'), modalContent = $('[data-modal-content]'), panel = $('[data-search-panel]');
  let lastFocus = null;
  const lock = on => document.body.classList.toggle('lock', on);
  const setOpen = (el, on) => { el.classList.toggle('is-open', on); el.setAttribute('aria-hidden', String(!on)); el.inert = !on; };
  function remember() { if (!drawer.contains(document.activeElement) && !menu.contains(document.activeElement) && !modal.contains(document.activeElement)) lastFocus = document.activeElement; }
  function restore() { if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true }); lastFocus = null; }

  function openSheet(el) {
    remember(); closeMega(); closeSearch(false);
    [drawer, menu].forEach(s => setOpen(s, s === el));
    scrim.classList.add('is-open'); lock(true);
    setTimeout(() => $('button, a, input', el)?.focus({ preventScroll: true }), 50);
  }
  function closeSheets(refocus = true) {
    const was = drawer.classList.contains('is-open') || menu.classList.contains('is-open');
    [drawer, menu].forEach(s => setOpen(s, false));
    scrim.classList.remove('is-open');
    if (!modal.classList.contains('is-open') && panel.hidden) lock(false);
    if (was && refocus) restore();
  }
  function openModal(html, label) {
    remember(); closeSheets(false); closeSearch(false);
    modalContent.innerHTML = html;
    $('.modal__box').setAttribute('aria-label', label || 'Chi tiết');
    setOpen(modal, true); lock(true);
    $('.modal__box').scrollTop = 0;
    setTimeout(() => $('.modal__close').focus({ preventScroll: true }), 60);
  }
  function closeModal() {
    if (!modal.classList.contains('is-open')) return;
    setOpen(modal, false); lock(false); restore();
  }
  function openSearch() {
    remember(); closeMega();
    panel.hidden = false; lock(true);
    const input = $('[data-search] input'); input.focus(); input.select();
    searchResults(input.value);
  }
  function closeSearch(refocus = true) {
    if (panel.hidden) return;
    panel.hidden = true;
    if (!modal.classList.contains('is-open') && !drawer.classList.contains('is-open') && !menu.classList.contains('is-open')) lock(false);
    if (refocus) restore();
  }
  const megaBtn = $('[data-action="toggle-mega"]'), mega = $('[data-mega]');
  function closeMega() { mega.hidden = true; megaBtn.setAttribute('aria-expanded', 'false'); }
  function toggleMega(force) {
    const open = force ?? mega.hidden;
    mega.hidden = !open; megaBtn.setAttribute('aria-expanded', String(open));
  }
  let megaT;
  $('.mega-wrap').addEventListener('mouseenter', () => { clearTimeout(megaT); if (matchMedia('(hover: hover)').matches) toggleMega(true); });
  $('.mega-wrap').addEventListener('mouseleave', () => { megaT = setTimeout(closeMega, 180); });

  // Giữ phím Tab bên trong lớp đang mở
  document.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const box = modal.classList.contains('is-open') ? modal : drawer.classList.contains('is-open') ? drawer : menu.classList.contains('is-open') ? menu : !panel.hidden ? panel : null;
    if (!box) return;
    const f = $$('a[href], button:not([disabled]), input, select, textarea', box).filter(el => el.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
    else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
  });

  /* ================= Chi tiết sản phẩm, thanh toán ================= */
  function viewProduct(id, notice = '') {
    const p = byId(id); if (!p) return;
    const gallery = [...new Set([p.img, ...p.gallery].filter(Boolean))];
    const off = offPct(p);
    openModal(`
      <div class="pd">
        <div>
          <div class="pd__main"><img src="${esc(gallery[0])}" alt="${esc(p.name)}" data-pd-main></div>
          ${gallery.length > 1 ? `<div class="pd__thumbs">${gallery.map((g, i) => `<button class="${i ? '' : 'is-active'}" data-thumb="${esc(g)}" aria-label="Ảnh ${i + 1}"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
        </div>
        <div class="pd__info">
          <span class="pc__brand ${/minh họa/i.test(p.brand || '') ? 'demo' : ''}">${esc(p.brand || '')}${p.brand ? ' · ' : ''}${esc(catName(p.cat))}</span>
          <h2>${esc(p.name)}</h2>
          <div class="pd__price ${off ? 'sale' : ''}"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s><em>Tiết kiệm ${off}%</em>` : ''}</div>
          ${p.desc ? `<p class="pd__desc">${esc(p.desc)}</p>` : ''}
          ${p.opts.length ? `<div><span class="opt-label">Phân loại${notice ? ` <span style="color:var(--sale);font-weight:600">· ${esc(notice)}</span>` : ''}</span><div class="opts" data-opts style="margin-top:8px" role="radiogroup">${p.opts.map((o, i) => `<button class="opt ${i ? '' : 'is-active'}" data-opt="${esc(o)}" role="radio" aria-checked="${!i}">${esc(o)}</button>`).join('')}</div></div>` : ''}
          <div class="pd__buy">
            <div class="qty"><button data-pdq="-1" aria-label="Giảm">−</button><span data-pd-qty>1</span><button data-pdq="1" aria-label="Tăng">+</button></div>
            <button class="btn" data-pd-add="${p.id}">${I.bag} Thêm vào giỏ · ${money(p.price)}</button>
          </div>
          <div class="pd__perks">
            <span>${I.shield}Hàng chính hãng</span>
            <span>${I.truck}${FREESHIP ? `Freeship từ ${money(FREESHIP)}` : 'Giao toàn nước Mỹ'}</span>
            <span>${I.back}Đổi trả 7 ngày</span>
            <span>${I.gift}Gói quà miễn phí</span>
          </div>
        </div>
      </div>`, p.name);
  }

  function checkout() {
    if (!cart.length) return;
    const pr = pricing();
    openModal(`
      <div class="checkout">
        <h2>Thông tin đặt hàng</h2>
        <form class="checkout__grid" data-checkout-form novalidate>
          <div>
            <div class="field"><label for="c-name">Họ tên *</label><input id="c-name" name="name" required autocomplete="name"></div>
            <div class="field"><label for="c-phone">Số điện thoại *</label><input id="c-phone" name="phone" type="tel" required autocomplete="tel" inputmode="tel" pattern="[0-9+()\\-\\s.]{7,}"></div>
            <div class="field"><label for="c-addr">Địa chỉ nhận hàng *</label><textarea id="c-addr" name="address" rows="2" required autocomplete="street-address"></textarea></div>
            <div class="field"><label>Thanh toán</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Zelle" checked><span class="pay__logo zelle">Zelle</span>${esc(S.zelleName)} · ${esc(S.zellePhone)}</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Venmo"><span class="pay__logo venmo">venmo</span>${esc(S.venmo)}</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Nhận tại Houston">Nhận hàng và trả tiền tại Houston</label>
            </div>
            <div class="field"><label for="c-note">Ghi chú</label><textarea id="c-note" name="note" rows="2" placeholder="Giờ nhận hàng, gói quà..."></textarea></div>
          </div>
          <div class="summary">
            <h3>Đơn hàng (${count()} sản phẩm)</h3>
            ${cart.map(i => { const p = byId(i.id); return `<div class="sum-line"><img src="${esc(p.img)}" alt=""><span>${esc(p.name)}${i.opt ? ` (${esc(i.opt)})` : ''} × ${i.qty}</span><b>${money(p.price * i.qty)}</b></div>`; }).join('')}
            <div class="totals">${totalsHtml(pr)}</div>
            <button class="btn btn--block" type="submit">Đặt hàng</button>
          </div>
        </form>
      </div>`, 'Thanh toán');
  }

  // Website tĩnh chưa có máy chủ nhận đơn: sau khi đặt, khách gửi đơn cho shop qua tin nhắn hoặc email.
  function placeOrder(form) {
    if (!form.checkValidity()) { form.reportValidity(); $(':invalid', form)?.focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    const pr = pricing();
    const code = 'JJ' + Date.now().toString().slice(-6);
    const lines = cart.map(i => { const p = byId(i.id); return `- ${p.name}${i.opt ? ` (${i.opt})` : ''} x${i.qty}: ${money(p.price * i.qty)}`; });
    const text = [`Đơn hàng ${code} - ${S.shopName || 'JaJu Boutique'}`, `Tên: ${d.name}`, `SĐT: ${d.phone}`, `Địa chỉ: ${d.address}`, ...lines,
      pr.discount ? `Mã giảm giá ${pr.v.code}: -${money(pr.discount)}` : '', `Vận chuyển: ${pr.ship ? money(pr.ship) : 'Miễn phí'}`,
      `Tổng cộng: ${money(pr.total)}`, `Thanh toán: ${d.pay}`, d.note ? `Ghi chú: ${d.note}` : ''].filter(Boolean).join('\n');
    const phone = String(S.hotline || '').replace(/[^\d+]/g, '');
    const sms = `sms:${phone}${/iPhone|iPad|Mac/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(text)}`;
    const mail = `mailto:${S.email || ''}?subject=${encodeURIComponent('Đơn hàng ' + code)}&body=${encodeURIComponent(text)}`;
    cart = []; coupon = null; saveCart(); renderVouchers();
    $('[data-coupon-form] input').value = '';
    const pay = d.pay === 'Zelle' ? payCard('zelle') : d.pay === 'Venmo' ? payCard('venmo') : '';
    openModal(`
      <div class="success">
        <div class="success__icon">${I.check}</div>
        <h2>Gần xong rồi, ${esc(d.name)}!</h2>
        <p>Mã đơn <b>${code}</b> · Tổng tiền <b>${money(pr.total)}</b></p>
        <p>Bấm một nút bên dưới để <b>gửi đơn cho shop</b>, Vân sẽ xác nhận ngay.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:16px 0">
          <a class="btn" href="${esc(sms)}">${I.msg} Gửi qua tin nhắn</a>
          <a class="btn btn--ghost" href="${esc(mail)}">${I.mail} Gửi qua email</a>
          <button class="btn btn--ghost" data-copy-order>${I.copy} Sao chép đơn</button>
        </div>
        ${pay ? `<p>Chuyển khoản và ghi mã <b>${code}</b> trong nội dung:</p>${pay}` : '<p>Vân sẽ gọi để hẹn giờ nhận hàng tại Houston.</p>'}
        <textarea hidden data-order-text>${esc(text)}</textarea>
      </div>`, 'Đặt hàng');
  }

  let toastT;
  function toast(msg, img) {
    const t = $('[data-toast]');
    t.innerHTML = (img ? `<img src="${esc(img)}" alt="">` : '') + `<span>${esc(msg)}</span>`;
    t.classList.toggle('no-img', !img);
    t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-show'), 2200);
  }

  /* ================= Hiệu ứng ================= */
  function initCountdown() {
    const el = $('[data-countdown]'), pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((end - now) / 1000));
      $('[data-h]', el).textContent = pad(Math.floor(s / 3600));
      $('[data-m]', el).textContent = pad(Math.floor(s / 60) % 60);
      $('[data-s]', el).textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // Hiện dần khi cuộn tới; kiểm tra bằng vị trí thật nên không bao giờ để nội dung bị ẩn
  let revealEls = [];
  function initReveal() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { $$('.reveal').forEach(e => e.classList.add('in')); return; }
    revealEls = $$('.reveal');
    checkReveal();
    setTimeout(() => { revealEls.forEach(e => e.classList.add('in')); revealEls = []; }, 4000);
  }
  function checkReveal() {
    if (!revealEls.length) return;
    const h = innerHeight * .92;
    revealEls = revealEls.filter(e => { if (e.getBoundingClientRect().top < h) { e.classList.add('in'); return false; } return true; });
  }

  function updateRailNav() {
    $$('[data-rail]').forEach(r => {
      const btns = $$(`[data-scroll="${r.dataset.rail}"]`);
      if (btns.length < 2) return;
      btns[0].disabled = r.scrollLeft < 8;
      btns[1].disabled = r.scrollLeft + r.clientWidth >= r.scrollWidth - 8;
    });
  }

  /* ================= Khởi chạy ================= */
  applySettings();
  renderNav();
  renderHero();
  renderCats();
  renderVouchers();
  renderFlash();
  renderPromos();
  renderGroups();
  renderPosts();
  renderShop();
  renderCart();
  const slider = initSlider();
  initCountdown();
  initReveal();
  updateRailNav();
  $$('[data-rail]').forEach(r => r.addEventListener('scroll', () => requestAnimationFrame(updateRailNav), { passive: true }));
  addEventListener('resize', updateRailNav);
  [drawer, menu, modal].forEach(el => { el.inert = true; });

  /* ================= Sự kiện ================= */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-filter],[data-add],[data-view],[data-action],[data-qty],[data-remove],[data-opt],[data-pdq],[data-pd-add],[data-thumb],[data-slide],[data-copy],[data-gchip],[data-key],[data-scroll],[data-fav],[data-search-all],[data-copy-order],a[href^="#"]');
    if (!t) { if (!mega.hidden && !e.target.closest('.mega-wrap')) closeMega(); return; }
    const d = t.dataset;

    if (d.filter) { setFilter(d.filter); closeSheets(false); closeMega(); closeSearch(false); return; }
    if (d.gchip) {
      $$(`[data-chips="${d.group}"] .chip`).forEach(c => c.classList.toggle('is-active', c === t));
      const rail = $(`[data-rail="g-${d.group}"]`);
      rail.innerHTML = PRODUCTS.filter(p => inFilter(p, d.gchip)).slice(0, 12).map(card).join('');
      rail.scrollLeft = 0; updateRailNav();
      return;
    }
    if (d.add) {
      const p = byId(d.add);
      if (p?.opts.length) viewProduct(d.add, 'Vui lòng chọn');
      else addToCart(d.add, 1, '', t);
      return;
    }
    if (d.view) { e.preventDefault(); viewProduct(d.view); return; }
    if (d.fav) {
      favs.has(d.fav) ? favs.delete(d.fav) : favs.add(d.fav);
      store.set(KEY.fav, [...favs]);
      const on = favs.has(d.fav);
      $$(`[data-fav="${d.fav}"]`).forEach(b => { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      toast(on ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích');
      renderTabs();
      return;
    }
    if (d.slide) { e.preventDefault(); slider.next(+d.slide); return; }
    if (d.scroll) { const r = $(`[data-rail="${d.scroll}"]`); r.scrollBy({ left: r.clientWidth * .9 * +d.dir }); return; }
    if (d.key) { const i = $('[data-search] input'); i.value = d.key; searchResults(d.key); i.focus(); return; }
    if (d.searchAll != null) { closeSearch(false); setFilter('all'); $('#shop').scrollIntoView(); return; }
    if (d.copy) {
      coupon = d.copy; saveCart(); renderVouchers();
      navigator.clipboard?.writeText(d.copy).catch(() => {});
      toast(`Đã lưu mã ${d.copy}`);
      return;
    }
    if (d.copyOrder != null) {
      const txt = $('[data-order-text]').value;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('Đã sao chép đơn hàng')).catch(() => toast('Không sao chép được, hãy dùng nút gửi tin nhắn'));
      return;
    }
    if (d.qty !== undefined) {
      const l = cart[+d.qty]; if (!l) return;
      l.qty = Math.min(99, l.qty + +d.d);
      if (l.qty <= 0) cart.splice(+d.qty, 1);
      saveCart(); return;
    }
    if (d.remove !== undefined) { cart.splice(+d.remove, 1); saveCart(); return; }
    if (d.opt) { $$('[data-opt]', t.parentElement).forEach(o => { o.classList.toggle('is-active', o === t); o.setAttribute('aria-checked', o === t); }); return; }
    if (d.thumb) { $('[data-pd-main]').src = d.thumb; $$('[data-thumb]').forEach(b => b.classList.toggle('is-active', b === t)); return; }
    if (d.pdq) { const q = $('[data-pd-qty]'); q.textContent = Math.max(1, Math.min(99, +q.textContent + +d.pdq)); return; }
    if (d.pdAdd) {
      const opt = $('[data-opts] .is-active');
      addToCart(d.pdAdd, +$('[data-pd-qty]').textContent, opt ? opt.dataset.opt : '', t);
      closeModal(); openSheet(drawer); return;
    }
    if (d.action) {
      e.preventDefault();
      ({
        'open-cart': () => openSheet(drawer),
        'open-menu': () => openSheet(menu),
        'close-all': () => closeSheets(),
        'close-modal': closeModal,
        'open-search': openSearch,
        'close-search': () => closeSearch(),
        'toggle-mega': () => toggleMega(),
        'to-top': () => scrollTo({ top: 0, behavior: 'smooth' }),
        checkout
      })[d.action]?.();
      return;
    }
    // Liên kết nội bộ (#...) trong menu/ngăn kéo: đóng lớp phủ rồi cuộn tới
    if (t.matches('a[href^="#"]')) {
      const href = t.getAttribute('href');
      closeSheets(false); closeMega(); closeSearch(false);
      if (href === '#top') { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); }
    }
  });

  scrim.addEventListener('click', () => closeSheets());
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  panel.addEventListener('click', e => { if (e.target === panel || e.target.classList.contains('wrap')) closeSearch(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (modal.classList.contains('is-open')) closeModal();
      else if (!panel.hidden) closeSearch();
      else if (!mega.hidden) { closeMega(); megaBtn.focus(); }
      else closeSheets();
    }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });

  let qT;
  $('[data-search] input').addEventListener('input', e => { clearTimeout(qT); qT = setTimeout(() => searchResults(e.target.value), 120); });

  document.addEventListener('submit', e => {
    const f = e.target;
    if (f.matches('[data-search]')) {
      e.preventDefault();
      searchResults(f.q.value);
      $('.result', panel)?.focus();
    } else if (f.matches('[data-coupon-form]')) {
      e.preventDefault();
      const code = f.code.value.trim().toUpperCase();
      const msg = $('[data-coupon-msg]');
      if (!code) return;
      if (!VOUCHERS.find(v => v.code === code)) {
        coupon = null; saveCart(); renderVouchers();
        msg.className = 'coupon-msg err'; msg.textContent = 'Mã giảm giá không đúng';
        return;
      }
      coupon = code; saveCart(); renderVouchers();
    } else if (f.matches('[data-checkout-form]')) {
      e.preventDefault(); placeOrder(f);
    }
  });

  $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; renderShop(); });

  const hdr = $('[data-hdr]'), topBtn = $('.float--top');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      hdr.classList.toggle('scrolled', scrollY > 8);
      topBtn.classList.toggle('show', scrollY > 700);
      checkReveal();
      ticking = false;
    });
  }, { passive: true });
})();
