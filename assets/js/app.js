(() => {
  'use strict';

  /* ================= Dữ liệu =================
     Nội dung cửa hàng nằm ở data/store.js và được sửa qua trang admin.html.
     Mở index.html?preview=1 để xem bản nháp đang sửa trong trang quản trị. */
  const PREVIEW = new URLSearchParams(location.search).has('preview');
  const readDraft = () => { try { return JSON.parse(localStorage.getItem('jaju-admin-draft')); } catch { return null; } };
  const STORE = (PREVIEW && readDraft()) || window.JAJU_STORE;
  if (!STORE) { document.body.insertAdjacentHTML('afterbegin', '<p style="padding:20px">Không tải được dữ liệu cửa hàng.</p>'); return; }

  const S = STORE.settings;
  const FREESHIP = +S.freeship || 0;
  const SHIPPING = +S.shippingFee || 0;
  const PRODUCTS = STORE.products.filter(p => !p.hidden);
  PRODUCTS.forEach((p, i) => { p.order = i; });
  const CATS = Object.fromEntries(STORE.categories.map(c => [c.id, c]));
  const GROUPS = STORE.groups;
  const VOUCHERS = STORE.vouchers;

  /* ================= Tiện ích ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + (+n).toFixed(2);
  const byId = id => PRODUCTS.find(p => p.id === id);
  const isSale = p => +p.compare > +p.price;
  const offPct = p => isSale(p) ? Math.round((1 - p.price / p.compare) * 100) : 0;
  const catName = id => CATS[id]?.name || '';
  const groupOf = p => CATS[p.cat]?.group;
  const inFilter = (p, f) => f === 'all' || p.cat === f || groupOf(p) === f || (f === 'sale' && isSale(p));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tone = c => 'tone-' + (c || 'lavender');
  const ext = href => /^https?:/.test(href || '') ? ' target="_blank" rel="noopener"' : '';
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua */ } }
  };
  const ICON = {
    cart: '<svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1.3"/><circle cx="17" cy="20.5" r="1.3"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg>',
    shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>',
    truck: '<svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.6L4 9"/><path d="M4 4v5h5"/></svg>',
    gift: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8S10 3 7.5 4.5 9 8 12 8Zm0 0s2-5 4.5-3.5S15 8 12 8Z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" style="width:30px;height:30px"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'
  };

  let cart = store.get('jaju-cart-v5', []).filter(i => byId(i.id));
  let coupon = store.get('jaju-coupon', null);
  const state = { filter: 'all', sort: 'featured', q: '' };

  /* ================= Thông tin chung ================= */
  function applySettings() {
    const t = S.theme || {};
    const root = document.documentElement.style;
    if (t.primary) { root.setProperty('--plum', t.primary); root.setProperty('--plum-700', shade(t.primary, -.22)); root.setProperty('--plum-50', mix(t.primary, .92)); }
    if (t.accent) { root.setProperty('--pink', t.accent); root.setProperty('--pink-50', mix(t.accent, .93)); }
    if (t.bg) root.setProperty('--bg', t.bg);
    $('meta[name="theme-color"]').content = t.primary || '#7b3f9e';

    $('[data-promo-text]').textContent = S.promoText || '';
    $$('[data-text]').forEach(el => { el.textContent = S[el.dataset.text] ?? ''; });
    const links = { tel: 'tel:' + (S.hotline || ''), email: 'mailto:' + (S.email || ''), facebook: S.facebook || '#' };
    $$('[data-link]').forEach(el => { el.href = links[el.dataset.link]; });
    $('[data-hot-keys]').innerHTML = (S.hotKeys || []).map(k => `<button type="button" data-key="${esc(k)}">${esc(k)}</button>`).join('');
    $('[data-pay-cards]').innerHTML = payCard('Zelle') + payCard('Venmo');
    $('[data-year]').textContent = new Date().getFullYear();
    if (PREVIEW) $('[data-preview-bar]').hidden = false;
  }

  function payCard(type) {
    return type === 'Zelle'
      ? `<div class="pay-card"><span class="pay-logo zelle">Zelle</span><div>${esc(S.zelleName)}<br><b>${esc(S.zellePhone)}</b></div></div>`
      : `<div class="pay-card"><span class="pay-logo venmo">venmo</span><div><b>${esc(S.venmo)}</b></div></div>`;
  }

  // Pha màu nhạt / đậm từ màu chủ đạo
  function hexToRgb(h) { const m = h.replace('#', '').match(/.{2}/g); return m ? m.map(x => parseInt(x, 16)) : [123, 63, 158]; }
  function rgbToHex(r) { return '#' + r.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
  function mix(h, w) { return rgbToHex(hexToRgb(h).map(v => v + (255 - v) * w)); }
  function shade(h, k) { return rgbToHex(hexToRgb(h).map(v => v * (1 + k))); }

  /* ================= Thẻ sản phẩm ================= */
  function card(p) {
    const off = offPct(p);
    const demo = /minh họa/i.test(p.brand || '');
    return `
      <div class="pcard">
        <div class="pcard__img" data-view="${p.id}">
          ${p.tag ? `<span class="pcard__tag">${esc(p.tag)}</span>` : ''}
          ${off ? `<span class="pcard__off">-${off}%</span>` : ''}
          <img src="${esc(p.img)}" alt="${esc(p.name)}" loading="lazy">
        </div>
        <div class="pcard__body">
          <span class="pcard__brand ${demo ? 'demo' : ''}">${esc(p.brand || catName(p.cat))}</span>
          <h3 class="pcard__name" data-view="${p.id}">${esc(p.name)}</h3>
          <div class="pcard__price"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s>` : ''}</div>
          <button class="pcard__add" data-add="${p.id}">${ICON.cart} Thêm vào giỏ</button>
        </div>
      </div>`;
  }

  /* ================= Các khu vực ================= */
  function renderHero() {
    $('[data-side-menu]').innerHTML =
      `<a href="#flash" class="hot"><img src="${esc(STORE.categories[0]?.img || '')}" alt="">Deal hot hôm nay${ICON.chev}</a>` +
      STORE.categories.map(c => `<a href="#shop" data-filter="${c.id}"><img src="${esc(c.img)}" alt="">${esc(c.name)}${ICON.chev}</a>`).join('');

    $('[data-slides]').innerHTML = STORE.slides.map((s, i) => `
      <a class="slide ${tone(s.color)} ${i ? '' : 'is-active'}" href="${esc(s.link || '#shop')}"${ext(s.link)}>
        ${s.photo ? `<img class="slide__bg" src="${esc(s.photo)}" alt="">` : ''}
        <div class="slide__copy">
          ${s.eyebrow ? `<span class="slide__eyebrow">${esc(s.eyebrow)}</span>` : ''}
          ${i ? '<h2>' : '<h1>'}${esc(s.title)}${s.subtitle ? `<span>${esc(s.subtitle)}</span>` : ''}${i ? '</h2>' : '</h1>'}
          ${s.text ? `<p>${esc(s.text)}</p>` : ''}
          ${s.deal ? `<span class="slide__deal">${esc(s.deal)}</span>` : ''}
        </div>
        ${!s.photo && s.images?.length ? `<div class="slide__art">${s.images.slice(0, 3).map((im, k) => `<img class="a${k + 1}" src="${esc(im)}" alt="">`).join('')}</div>` : ''}
      </a>`).join('');

    $('[data-mini]').innerHTML = (STORE.miniBanners || []).slice(0, 3).map(b => `
      <a class="mini-banner ${tone(b.color)}" href="${esc(b.link || '#')}"${ext(b.link)}>
        <div><b>${esc(b.title)}</b><span>${esc(b.text)}</span></div>
        ${b.img ? `<img src="${esc(b.img)}" alt="" class="${/emblem/.test(b.img) ? 'round' : ''}">` : ICON.truck}
      </a>`).join('');
  }

  function renderMenus() {
    $('[data-menu-list]').innerHTML =
      STORE.categories.map(c => `<a class="menu-link" href="#shop" data-filter="${c.id}"><img src="${esc(c.img)}" alt="">${esc(c.name)}</a>`).join('') +
      `<a class="menu-link" href="#flash">Flash sale</a><a class="menu-link" href="#vouchers">Mã giảm giá</a><a class="menu-link" href="#blog">Cẩm nang</a><a class="menu-link" href="#contact">Liên hệ</a>`;
    const bgs = ['#fff1e6', '#f1ece6', '#fdeceb', '#f3eaf7', '#e9f3e6', '#fdeef4', '#eef0fb', '#fff4e0', '#e8f0ef'];
    $('[data-quick-cats]').innerHTML = STORE.categories.map((c, i) => `
      <a class="qc" href="#shop" data-filter="${c.id}">
        <span class="qc__img" style="background:${bgs[i % bgs.length]}"><img src="${esc(c.img)}" alt="" loading="lazy"></span>
        ${esc(c.name)}
      </a>`).join('') + `
      <a class="qc" href="#shop" data-filter="sale"><span class="qc__img" style="background:#ffe8ec;color:#e0234e">${ICON.tag}</span>Đang giảm giá</a>`;
    const n = STORE.categories.length + 1;
    $('[data-quick-cats]').style.setProperty('--n', Math.min(n, 10));
  }

  function renderVouchers() {
    $('#vouchers').hidden = !VOUCHERS.length;
    $('[data-vouchers]').innerHTML = VOUCHERS.map(v => `
      <div class="voucher">
        <div class="voucher__left"><div><b>${esc(v.big)}</b>${esc(v.small)}</div></div>
        <div class="voucher__body">
          <b>${esc(v.title)}</b>
          <span>${esc(v.note)}</span>
          <div class="voucher__foot">
            <span class="voucher__code">${esc(v.code)}</span>
            <button class="copy-btn" data-copy="${esc(v.code)}">Lưu mã</button>
          </div>
        </div>
      </div>`).join('');
  }

  function renderFlash() {
    const list = PRODUCTS.filter(p => p.flash && isSale(p)).sort((a, b) => offPct(b) - offPct(a));
    $('#flash').hidden = !list.length;
    $('[data-carousel="flash"]').innerHTML = list.map(card).join('');
  }

  function renderPromos() {
    $('[data-promos]').innerHTML = (STORE.promos || []).map(p => `
      <a href="${esc(p.link || '#')}" class="promo ${tone(p.color)}"${ext(p.link)}>
        <div><small>${esc(p.label)}</small><b>${esc(p.title)}</b></div>
        ${p.img ? `<img src="${esc(p.img)}" alt="">` : ''}
      </a>`).join('');
  }

  function renderGroups() {
    const spot = STORE.spotlight && byId(STORE.spotlight.productId);
    $('[data-groups]').innerHTML = GROUPS.map((g, gi) => {
      const items = PRODUCTS.filter(p => groupOf(p) === g.id);
      if (!items.length) return '';
      const cats = STORE.categories.filter(c => c.group === g.id);
      const block = `
      <section class="container cat-block" id="group-${g.id}">
        <div class="cat-block__head">
          <h2 class="sec-title">${esc(g.name)}</h2>
          <div class="chips" data-chips="${g.id}">
            <button class="chip is-active" data-gchip="${g.id}" data-group="${g.id}">Tất cả</button>
            ${cats.map(c => `<button class="chip" data-gchip="${c.id}" data-group="${g.id}">${esc(c.name)}</button>`).join('')}
          </div>
        </div>
        <div class="cat-block__body">
          <a class="tall-banner ${tone(g.color)}" href="#shop" data-filter="${g.id}">
            <span class="tall-banner__tag">${esc(g.bannerTag)}</span>
            <b>${esc(g.bannerTitle)}</b>
            <span class="tall-banner__cta">Xem tất cả</span>
            ${(g.bannerImages || []).slice(0, 2).map(im => `<img src="${esc(im)}" alt="">`).join('')}
          </a>
          <div class="grid grid--4" data-grid="${g.id}">${items.slice(0, 8).map(card).join('')}</div>
        </div>
        <div class="center"><a class="btn-outline" href="#shop" data-filter="${g.id}">Xem tất cả ${esc(g.name.toLowerCase())}</a></div>
      </section>`;
      return block + (gi === 0 && spot ? spotlightHtml(spot) : '');
    }).join('');
  }

  function spotlightHtml(p) {
    const sp = STORE.spotlight;
    const thumbs = (p.gallery || []).filter(g => g !== sp.image).slice(0, 4);
    return `
      <section class="container cat-block">
        <div class="spotlight">
          <div class="spotlight__img"><img src="${esc(sp.image || p.img)}" alt="${esc(p.name)}" loading="lazy"></div>
          <div class="spotlight__info">
            <span class="pcard__brand">${esc(p.brand)} · ${esc(sp.label || 'Sản phẩm nổi bật')}</span>
            <h3>${esc(p.name)}</h3>
            <p>${esc(p.desc)}</p>
            ${thumbs.length ? `<div class="spotlight__thumbs">${thumbs.map(g => `<img src="${esc(g)}" alt="" loading="lazy">`).join('')}</div>` : ''}
            <div class="spotlight__price"><b>${money(p.price)}</b>${isSale(p) ? `<s>${money(p.compare)}</s>` : ''}</div>
            <div class="spotlight__actions">
              <button class="btn" data-add="${p.id}">${ICON.cart} Thêm vào giỏ</button>
              <button class="btn btn--ghost" data-view="${p.id}">Xem chi tiết</button>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderPosts() {
    $('#blog').hidden = !(STORE.posts || []).length;
    $('[data-posts]').innerHTML = (STORE.posts || []).map(p => `
      <a class="post" href="${esc(p.link || '#blog')}"${ext(p.link)}>
        <div class="post__img"><img src="${esc(p.img)}" alt="" loading="lazy"></div>
        <div class="post__body"><span class="post__tag">${esc(p.tag)}</span><h3>${esc(p.title)}</h3><time>${esc(p.date)}</time></div>
      </a>`).join('');
  }

  function renderTabs() {
    const items = [['all', 'Tất cả'], ['sale', 'Đang giảm giá'], ...STORE.categories.map(c => [c.id, c.name])];
    $('[data-tabs]').innerHTML = items.map(([k, n]) =>
      `<button class="tab ${state.filter === k ? 'is-active' : ''}" data-filter="${k}">${esc(n)}</button>`).join('');
  }

  function renderShop() {
    const q = state.q.trim().toLowerCase();
    const sorters = {
      featured: (a, b) => a.order - b.order,
      discount: (a, b) => offPct(b) - offPct(a),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price
    };
    const list = PRODUCTS
      .filter(p => inFilter(p, state.filter))
      .filter(p => !q || `${p.name} ${p.brand} ${catName(p.cat)}`.toLowerCase().includes(q))
      .sort(sorters[state.sort]);
    $('[data-grid="shop"]').innerHTML = list.map(card).join('');
    const empty = $('[data-empty]');
    empty.hidden = list.length > 0;
    empty.innerHTML = `Chưa có sản phẩm phù hợp. Gọi <a href="tel:${esc(S.hotline)}">${esc(S.hotlineDisplay)}</a> hoặc xem <a href="${esc(S.facebook)}" target="_blank" rel="noopener">live trên Facebook</a> nha.`;
    const g = GROUPS.find(x => x.id === state.filter);
    $('[data-shop-title]').textContent = q ? `Kết quả cho "${state.q.trim()}"`
      : state.filter === 'all' ? 'Gợi ý cho bạn'
      : state.filter === 'sale' ? 'Đang giảm giá'
      : g ? g.name : catName(state.filter) || 'Sản phẩm';
    renderTabs();
  }

  function setFilter(f) {
    state.filter = f; state.q = '';
    $('[data-search] input').value = '';
    renderShop();
  }

  /* ================= Giỏ hàng ================= */
  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

  function pricing() {
    const sub = subtotal();
    let ship = sub >= FREESHIP || !cart.length ? 0 : SHIPPING;
    let discount = 0, couponOk = false;
    const v = coupon && VOUCHERS.find(x => x.code === coupon);
    if (v && sub >= +v.min) {
      couponOk = true;
      if (v.type === 'ship') ship = 0;
      if (v.type === 'amount') discount = Math.min(+v.value, sub);
      if (v.type === 'percent') discount = Math.round(sub * v.value) / 100;
    }
    return { sub, ship, discount, total: Math.max(0, sub - discount + ship), v, couponOk };
  }

  function addToCart(id, qty = 1, opt = '') {
    const line = cart.find(i => i.id === id && i.opt === opt);
    if (line) line.qty += qty; else cart.push({ id, qty, opt });
    saveCart();
    $$('[data-cart-count]').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    toast('Đã thêm vào giỏ hàng');
  }

  function saveCart() { store.set('jaju-cart-v5', cart); store.set('jaju-coupon', coupon); renderCart(); }

  function totalsHtml(pr) {
    return `
      <div><span>Tạm tính</span><span>${money(pr.sub)}</span></div>
      ${pr.discount ? `<div class="disc"><span>Mã ${esc(pr.v.code)}</span><span>-${money(pr.discount)}</span></div>` : ''}
      <div><span>Phí vận chuyển</span><span>${pr.ship ? money(pr.ship) : 'Miễn phí'}</span></div>
      <div class="grand"><span>Tổng cộng</span><b>${money(pr.total)}</b></div>`;
  }

  function renderCart() {
    const pr = pricing();
    $$('[data-cart-count]').forEach(b => { b.textContent = count(); b.classList.toggle('is-zero', !count()); });
    $('[data-cart-total]').textContent = money(pr.sub);
    $('[data-cart-count-text]').textContent = count() ? `(${count()})` : '';
    const left = FREESHIP - pr.sub;
    $('[data-ship-note]').innerHTML = left > 0
      ? `Mua thêm <b>${money(left)}</b> để được miễn phí vận chuyển`
      : 'Đơn hàng của bạn được <b>miễn phí vận chuyển</b>';
    $('[data-ship-bar]').style.width = Math.min(100, FREESHIP ? pr.sub / FREESHIP * 100 : 100) + '%';
    $('[data-totals]').innerHTML = totalsHtml(pr);
    $('[data-action="checkout"]').disabled = !cart.length;

    const msg = $('[data-coupon-msg]');
    if (pr.v) {
      msg.className = 'coupon-msg ' + (pr.couponOk ? 'ok' : 'err');
      msg.textContent = pr.couponOk ? `Đã áp dụng mã ${pr.v.code}` : `Mã ${pr.v.code}: ${String(pr.v.note).toLowerCase()}`;
      $('[data-coupon-form] input').value = pr.v.code;
    }

    $('[data-cart-items]').innerHTML = !cart.length
      ? `<div class="cart-empty">${ICON.cart}<p>Giỏ hàng đang trống</p></div>`
      : cart.map((i, idx) => {
        const p = byId(i.id);
        return `<div class="line">
          <img src="${esc(p.img)}" alt="">
          <div>
            <h4>${esc(p.name)}</h4>
            <small>${esc(i.opt || p.brand)}</small>
            <div class="line__row">
              <div><span class="qty"><button data-qty="${idx}" data-d="-1" aria-label="Giảm">-</button><span>${i.qty}</span><button data-qty="${idx}" data-d="1" aria-label="Tăng">+</button></span><button class="rm" data-remove="${idx}">Xóa</button></div>
              <b>${money(p.price * i.qty)}</b>
            </div>
          </div>
        </div>`;
      }).join('');
  }

  /* ================= Popup, sheet ================= */
  const overlay = $('[data-overlay]'), drawer = $('[data-drawer]'), menu = $('[data-menu]'), modal = $('[data-modal]'), modalContent = $('[data-modal-content]');
  const lock = on => { document.body.style.overflow = on ? 'hidden' : ''; };
  function openSheet(el) { closeSheets(); el.classList.add('is-open'); el.setAttribute('aria-hidden', 'false'); overlay.classList.add('is-open'); lock(true); }
  function closeSheets() { [drawer, menu].forEach(el => { el.classList.remove('is-open'); el.setAttribute('aria-hidden', 'true'); }); overlay.classList.remove('is-open'); lock(false); }
  function openModal(html) { closeSheets(); modalContent.innerHTML = html; modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); $('.modal__box').scrollTop = 0; lock(true); }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); lock(false); }

  function viewProduct(id) {
    const p = byId(id);
    const gallery = p.gallery?.length ? p.gallery : [p.img];
    const off = offPct(p);
    openModal(`
      <div class="pd">
        <div>
          <div class="pd__main"><img src="${esc(gallery[0])}" alt="${esc(p.name)}" data-pd-main></div>
          ${gallery.length > 1 ? `<div class="pd__thumbs">${gallery.map((g, i) => `<button class="${i ? '' : 'is-active'}" data-thumb="${esc(g)}"><img src="${esc(g)}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div class="pd__info">
          <span class="pcard__brand">${esc(p.brand)} · ${esc(catName(p.cat))}</span>
          <h3>${esc(p.name)}</h3>
          <div class="pd__price"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s><em>-${off}%</em>` : ''}</div>
          <p>${esc(p.desc)}</p>
          ${p.opts?.length ? `<span class="opt-label">Phân loại</span><div class="opts" data-opts>${p.opts.map((o, i) => `<button class="opt ${i ? '' : 'is-active'}" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
          <div class="pd__buy">
            <div class="qty"><button data-pdq="-1" aria-label="Giảm">-</button><span data-pd-qty>1</span><button data-pdq="1" aria-label="Tăng">+</button></div>
            <button class="btn" data-pd-add="${p.id}">${ICON.cart} Thêm vào giỏ</button>
          </div>
          <div class="pd__perks">
            <span>${ICON.shield}Hàng chính hãng</span>
            <span>${ICON.truck}Freeship đơn từ ${money(FREESHIP)}</span>
            <span>${ICON.back}Đổi trả 7 ngày</span>
            <span>${ICON.gift}Gói quà miễn phí</span>
          </div>
        </div>
      </div>`);
  }

  function checkout() {
    if (!cart.length) return;
    const pr = pricing();
    openModal(`
      <div class="checkout">
        <h3>Thông tin đặt hàng</h3>
        <form class="checkout__grid" data-checkout-form>
          <div>
            <div class="field"><label for="c-name">Họ tên *</label><input id="c-name" name="name" required autocomplete="name"></div>
            <div class="field"><label for="c-phone">Số điện thoại *</label><input id="c-phone" name="phone" type="tel" required autocomplete="tel"></div>
            <div class="field"><label for="c-addr">Địa chỉ nhận hàng *</label><textarea id="c-addr" name="address" rows="2" required autocomplete="street-address"></textarea></div>
            <div class="field"><label>Phương thức thanh toán</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Zelle" checked><span class="pay-logo zelle">Zelle</span>${esc(S.zelleName)} · ${esc(S.zellePhone)}</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Venmo"><span class="pay-logo venmo">venmo</span>${esc(S.venmo)}</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Pickup">Nhận hàng và trả tiền tại Houston</label>
            </div>
            <div class="field"><label for="c-note">Ghi chú</label><textarea id="c-note" name="note" rows="2" placeholder="Giờ nhận hàng, gói quà..."></textarea></div>
          </div>
          <div class="summary">
            <h4>Đơn hàng (${count()} sản phẩm)</h4>
            ${cart.map(i => { const p = byId(i.id); return `<div class="sum-line"><img src="${esc(p.img)}" alt=""><span>${esc(p.name)}${i.opt ? ` (${esc(i.opt)})` : ''} x${i.qty}</span><b>${money(p.price * i.qty)}</b></div>`; }).join('')}
            <div class="totals">${totalsHtml(pr)}</div>
            <button class="btn btn--block" type="submit">Đặt hàng</button>
          </div>
        </form>
      </div>`);
  }

  function placeOrder(form) {
    const d = Object.fromEntries(new FormData(form));
    const { total } = pricing();
    const code = 'JJ' + Date.now().toString().slice(-6);
    // Bản demo: đơn chưa được gửi đi. Bản chính thức sẽ gửi về email hoặc Google Sheet của shop.
    cart = []; coupon = null; saveCart();
    $('[data-coupon-form] input').value = ''; $('[data-coupon-msg]').textContent = '';
    const pay = d.pay === 'Zelle' ? payCard('Zelle') : d.pay === 'Venmo' ? payCard('Venmo') : '';
    openModal(`
      <div class="success">
        <div class="success__icon">${ICON.check}</div>
        <h3>Đặt hàng thành công</h3>
        <p>Cảm ơn ${esc(d.name)}. Mã đơn <b>${code}</b>, tổng tiền <b>${money(total)}</b>.</p>
        ${pay ? `<p>Vui lòng chuyển khoản và ghi mã đơn <b>${code}</b> trong nội dung:</p>${pay}` : '<p>Shop sẽ gọi để hẹn giờ nhận hàng tại Houston.</p>'}
        <button class="btn" data-action="close-modal">Tiếp tục mua sắm</button>
      </div>`);
  }

  let toastT;
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-show'), 1800);
  }

  /* ================= Slider, đếm ngược ================= */
  function initSlider() {
    const slides = $$('.slide'), dots = $('[data-dots]');
    let i = 0, timer;
    if (!slides.length) return { next() {} };
    dots.innerHTML = slides.map((_, k) => `<button aria-label="Banner ${k + 1}" class="${k ? '' : 'is-active'}"></button>`).join('');
    const go = n => {
      slides[i].classList.remove('is-active'); dots.children[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active'); dots.children[i].classList.add('is-active');
      $('[data-slider]').className = 'slider ' + [...slides[i].classList].find(c => c.startsWith('tone-'));
      play();
    };
    const play = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); };
    [...dots.children].forEach((b, k) => b.addEventListener('click', () => go(k)));
    go(0);
    return { next: d => go(i + d) };
  }

  function initCountdown() {
    const el = $('[data-countdown]');
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date(), end = new Date(now); end.setHours(24, 0, 0, 0);
      const s = Math.max(0, Math.floor((end - now) / 1000));
      $('[data-h]', el).textContent = pad(Math.floor(s / 3600));
      $('[data-m]', el).textContent = pad(Math.floor(s / 60) % 60);
      $('[data-s]', el).textContent = pad(s % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* ================= Khởi chạy ================= */
  applySettings();
  renderHero();
  renderMenus();
  renderVouchers();
  renderFlash();
  renderPromos();
  renderGroups();
  renderPosts();
  renderShop();
  renderCart();
  const slider = initSlider();
  initCountdown();

  /* ================= Sự kiện ================= */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-filter],[data-add],[data-view],[data-action],[data-qty],[data-remove],[data-opt],[data-pdq],[data-pd-add],[data-thumb],[data-slide],[data-copy],[data-gchip],[data-key],[data-scroll]');
    if (!t) return;
    const d = t.dataset;

    if (d.filter) { setFilter(d.filter); closeSheets(); return; }
    if (d.gchip) {
      $$(`[data-chips="${d.group}"] .chip`).forEach(c => c.classList.toggle('is-active', c === t));
      $(`[data-grid="${d.group}"]`).innerHTML = PRODUCTS.filter(p => inFilter(p, d.gchip)).slice(0, 8).map(card).join('');
      return;
    }
    if (d.add) { addToCart(d.add); return; }
    if (d.view) { viewProduct(d.view); return; }
    if (d.slide) { slider.next(+d.slide); e.preventDefault(); return; }
    if (d.scroll) { const c = $(`[data-carousel="${d.scroll}"]`); c.scrollBy({ left: c.clientWidth * +d.dir, behavior: 'smooth' }); return; }
    if (d.key) { $('[data-search] input').value = d.key; $('[data-search]').requestSubmit(); return; }
    if (d.copy) {
      coupon = d.copy; saveCart();
      navigator.clipboard?.writeText(d.copy).catch(() => {});
      $$('[data-copy]').forEach(b => { b.classList.toggle('done', b === t); b.textContent = b === t ? 'Đã lưu' : 'Lưu mã'; });
      toast(`Đã lưu mã ${d.copy}, mã sẽ tự áp dụng trong giỏ hàng`);
      return;
    }
    if (d.qty !== undefined) {
      const l = cart[+d.qty]; l.qty += +d.d;
      if (l.qty <= 0) cart.splice(+d.qty, 1);
      saveCart(); return;
    }
    if (d.remove !== undefined) { cart.splice(+d.remove, 1); saveCart(); return; }
    if (d.opt) { $$('[data-opt]', t.parentElement).forEach(o => o.classList.toggle('is-active', o === t)); return; }
    if (d.thumb) { $('[data-pd-main]').src = d.thumb; $$('[data-thumb]').forEach(b => b.classList.toggle('is-active', b === t)); return; }
    if (d.pdq) { const q = $('[data-pd-qty]'); q.textContent = Math.max(1, +q.textContent + +d.pdq); return; }
    if (d.pdAdd) {
      const opt = $('[data-opts] .is-active');
      addToCart(d.pdAdd, +$('[data-pd-qty]').textContent, opt ? opt.dataset.opt : '');
      closeModal(); openSheet(drawer); return;
    }
    ({
      'open-cart': () => openSheet(drawer),
      'open-menu': () => openSheet(menu),
      'close-all': closeSheets,
      'close-modal': closeModal,
      'scroll-shop': () => $('#shop').scrollIntoView(),
      'to-top': () => scrollTo({ top: 0, behavior: 'smooth' }),
      checkout
    })[d.action]?.();
  });

  overlay.addEventListener('click', closeSheets);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeSheets(); } });

  document.addEventListener('submit', e => {
    const f = e.target;
    if (f.matches('[data-search]')) {
      e.preventDefault();
      state.q = f.q.value; state.filter = 'all';
      renderShop(); $('#shop').scrollIntoView();
    } else if (f.matches('[data-coupon-form]')) {
      e.preventDefault();
      const code = f.code.value.trim().toUpperCase();
      if (!VOUCHERS.find(v => v.code === code)) {
        const m = $('[data-coupon-msg]'); m.className = 'coupon-msg err'; m.textContent = 'Mã giảm giá không đúng';
        return;
      }
      coupon = code; saveCart();
    } else if (f.matches('[data-checkout-form]')) {
      e.preventDefault(); placeOrder(f);
    }
  });

  $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; renderShop(); });
  const topBtn = $('.fa--top');
  addEventListener('scroll', () => topBtn.classList.toggle('show', scrollY > 600), { passive: true });
})();
