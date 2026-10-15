(() => {
  'use strict';

  const IMG = 'assets/img/products/';
  const FB = 'https://www.facebook.com/huongthuyxom8binhnghia';
  const FREESHIP = 100;
  const SHIPPING = 8;

  /* ================= Dữ liệu =================
     Giá, tên sản phẩm và mã giảm giá là số liệu mẫu, thay bằng thông tin thật của shop. */
  const CATS = {
    'hong-sam': { name: 'Hồng sâm', img: IMG + 'hong-sam-lat.jpg', bg: '#fff1e6', group: 'ginseng' },
    'hac-sam':  { name: 'Hắc sâm', img: IMG + 'hac-sam-cu.jpg', bg: '#f1ece6', group: 'ginseng' },
    'nuoc-sam': { name: 'Nước & thạch sâm', img: IMG + 'nuoc-sam-nui.jpg', bg: '#fdeceb', group: 'ginseng' },
    combo:      { name: 'Combo quà biếu', img: IMG + 'cao-hac-sam.jpg', bg: '#f3eaf7', group: 'ginseng' },
    beauty:     { name: 'Mỹ phẩm', img: IMG + 'matcha-mist.jpg', bg: '#e9f3e6', cover: true },
    japan:      { name: 'Hàng Nhật', img: IMG + 'matcha-mist-3.jpg', bg: '#fdeef4', cover: true, soon: true },
    fashion:    { name: 'Thời trang', img: 'assets/img/emblem.jpg', bg: '#e8f0ef', cover: true, soon: true }
  };

  const PRODUCTS = [
    { id: 'hc1', cat: 'hac-sam', brand: 'Hàn Quốc', name: 'Kẹo hắc sâm không đường Hàn Quốc', price: 15, compare: 19, img: 'keo-hac-sam.jpg', tag: 'Bán chạy',
      opts: ['Gói 200g', 'Gói 500g'], desc: 'Kẹo hắc sâm không đường, vị ngọt nhẹ, ngậm mỗi ngày. Người lớn tuổi hoặc đang ăn kiêng đường dùng được.' },
    { id: 'hs1', cat: 'hong-sam', brand: 'Hàn Quốc', name: 'Hồng sâm lát tẩm mật ong (hũ)', price: 42, compare: 52, img: 'hong-sam-lat.jpg',
      desc: 'Hồng sâm Hàn Quốc thái lát, tẩm mật ong. Ăn trực tiếp hoặc pha nước nóng uống như trà.' },
    { id: 'ns2', cat: 'nuoc-sam', brand: 'Hàn Quốc', name: 'Thạch hồng sâm 6 năm tuổi Daily Jelly Stick', price: 35, compare: null, img: 'thach-hong-sam.jpg', tag: 'Mới về',
      desc: 'Thạch hồng sâm dạng que, xé ra ăn liền, bỏ túi mang đi làm, đi học tiện.' },
    { id: 'hc2', cat: 'hac-sam', brand: 'Hàn Quốc', name: 'Hắc sâm củ tẩm mật ong (hũ)', price: 48, compare: null, img: 'hac-sam-cu.jpg',
      desc: 'Hắc sâm nguyên củ hấp sấy nhiều lần rồi tẩm mật ong, ăn mềm, vị đậm.' },
    { id: 'ns1', cat: 'nuoc-sam', brand: 'Hàn Quốc', name: 'Nước sâm núi Hàn Quốc, hộp 30 ống', price: 65, compare: 79, img: 'nuoc-sam-nui.jpg',
      desc: 'Hộp 30 ống nước sâm núi, hộp giấy cứng, mua về biếu luôn được.' },
    { id: 'hc3', cat: 'combo', brand: 'Hàn Quốc', name: 'Hộp quà cao hắc sâm', price: 89, compare: 110, img: 'cao-hac-sam.jpg', tag: 'Quà biếu',
      desc: 'Hộp quà gồm cao hắc sâm và củ sâm, hộp đẹp, hợp làm quà biếu.' },
    { id: 'bt1', cat: 'beauty', brand: 'Innisfree', name: 'Xịt khoáng trà xanh Innisfree Green Tea Matcha Mist', price: 18, compare: 22, img: 'matcha-mist.jpg',
      gallery: ['matcha-mist.jpg', 'matcha-mist-2.jpg', 'matcha-mist-3.jpg', 'matcha-mist-4.jpg'],
      desc: 'Xịt khoáng chiết xuất trà xanh và matcha Jeju. Cấp ẩm tức thì, làm dịu da, xịt được cả khi đã trang điểm.' },
    { id: 'hs2', cat: 'hong-sam', brand: 'Hàn Quốc', name: 'Kẹo dẻo hồng sâm Hàn Quốc (gói)', price: 16, compare: null, img: 'hong-sam-deo.jpg',
      desc: 'Kẹo dẻo hồng sâm gói lớn, cả nhà ăn chung.' },
    { id: 'hc4', cat: 'hac-sam', brand: 'Hàn Quốc', name: 'Hắc sâm tẩm mật ong dạng gói', price: 28, compare: 34, img: 'hac-sam-goi.jpg',
      desc: 'Hắc sâm tẩm mật ong đóng gói nhỏ, dễ mang theo.' },
    { id: 'cb1', cat: 'combo', brand: 'Combo', name: 'Combo 3 gói kẹo hắc sâm không đường', price: 39, compare: 57, img: 'keo-hac-sam.jpg', tag: 'Tiết kiệm',
      desc: 'Mua 3 gói rẻ hơn mua lẻ. Dùng dần hoặc chia cho người thân.' },
    { id: 'cb2', cat: 'combo', brand: 'Combo', name: 'Combo 2 hũ hồng sâm lát tẩm mật ong', price: 78, compare: 104, img: 'hong-sam-lat.jpg',
      desc: '2 hũ hồng sâm lát, một hũ dùng, một hũ biếu.' },
    { id: 'cb3', cat: 'combo', brand: 'Combo', name: 'Combo 2 hộp thạch hồng sâm Daily Jelly Stick', price: 66, compare: 70, img: 'thach-hong-sam.jpg',
      desc: '2 hộp thạch hồng sâm dạng que.' }
  ];
  PRODUCTS.forEach((p, i) => { p.order = i; p.src = IMG + p.img; });

  const VOUCHERS = [
    { code: 'FREESHIP', big: 'FREE', small: 'SHIP', title: 'Miễn phí vận chuyển', note: 'Đơn hàng từ $100', type: 'ship', min: 100 },
    { code: 'JAJU5', big: '$5', small: 'GIẢM', title: 'Giảm $5', note: 'Đơn hàng từ $50', type: 'amount', value: 5, min: 50 },
    { code: 'JAJU10', big: '$10', small: 'GIẢM', title: 'Giảm $10', note: 'Đơn hàng từ $99', type: 'amount', value: 10, min: 99 },
    { code: 'SAM15', big: '15%', small: 'GIẢM', title: 'Giảm 15% sâm Hàn', note: 'Đơn sâm từ $120', type: 'percent', value: 15, min: 120 }
  ];

  const HOT_KEYS = ['Hồng sâm', 'Kẹo hắc sâm', 'Nước sâm', 'Xịt khoáng', 'Quà biếu'];

  /* ================= Tiện ích ================= */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + n.toFixed(2);
  const byId = id => PRODUCTS.find(p => p.id === id);
  const isSale = p => !!p.compare;
  const offPct = p => isSale(p) ? Math.round((1 - p.price / p.compare) * 100) : 0;
  const inGroup = (p, g) => g === 'all' || p.cat === g || CATS[p.cat].group === g || (g === 'sale' && isSale(p));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
    gift: '<svg viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M12 8S10 3 7.5 4.5 9 8 12 8Zm0 0s2-5 4.5-3.5S15 8 12 8Z"/></svg>'
  };

  let cart = store.get('jaju-cart-v4', []).filter(i => byId(i.id));
  let coupon = store.get('jaju-coupon', null);
  const state = { filter: 'all', sort: 'featured', q: '' };

  /* ================= Thẻ sản phẩm ================= */
  function card(p) {
    const off = offPct(p);
    return `
      <div class="pcard">
        <div class="pcard__img" data-view="${p.id}">
          ${p.tag ? `<span class="pcard__tag">${p.tag}</span>` : ''}
          ${off ? `<span class="pcard__off">-${off}%</span>` : ''}
          <img src="${p.src}" alt="${esc(p.name)}" loading="lazy">
        </div>
        <div class="pcard__body">
          <span class="pcard__brand">${esc(p.brand)}</span>
          <h3 class="pcard__name" data-view="${p.id}">${esc(p.name)}</h3>
          <div class="pcard__price"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s>` : ''}</div>
          <button class="pcard__add" data-add="${p.id}">${ICON.cart} Thêm vào giỏ</button>
        </div>
      </div>`;
  }

  /* ================= Các khu vực ================= */
  function renderMenus() {
    const items = Object.entries(CATS);
    $('[data-side-menu]').innerHTML =
      `<a href="#flash" class="hot"><img src="${IMG}cao-hac-sam.jpg" alt="">Deal hot hôm nay${ICON.chev}</a>` +
      items.map(([k, c]) => `<a href="#shop" data-filter="${k}"><img src="${c.img}" alt="">${c.name}${ICON.chev}</a>`).join('') +
      `<a href="#blog"><img src="${IMG}gia-dinh.jpg" alt="">Cẩm nang${ICON.chev}</a>`;
    $('[data-menu-list]').innerHTML =
      items.map(([k, c]) => `<a class="menu-link" href="#shop" data-filter="${k}"><img src="${c.img}" alt="">${c.name}</a>`).join('') +
      `<a class="menu-link" href="#flash">Flash sale</a><a class="menu-link" href="#vouchers">Mã giảm giá</a><a class="menu-link" href="#blog">Cẩm nang</a><a class="menu-link" href="#contact">Liên hệ</a>`;
    $('[data-quick-cats]').innerHTML = items.map(([k, c]) => `
      <a class="qc" href="#shop" data-filter="${k}">
        <span class="qc__img ${c.cover ? 'cover' : ''}" style="background:${c.bg}"><img src="${c.img}" alt="" loading="lazy"></span>
        ${c.name}
      </a>`).join('') + `
      <a class="qc" href="#shop" data-filter="sale">
        <span class="qc__img" style="background:#ffe8ec;color:#e0234e"><svg viewBox="0 0 24 24" style="width:30px;height:30px"><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg></span>
        Đang giảm giá
      </a>`;
    $('[data-hot-keys]').innerHTML = HOT_KEYS.map(k => `<button type="button" data-key="${esc(k)}">${k}</button>`).join('');
  }

  function renderVouchers() {
    $('[data-vouchers]').innerHTML = VOUCHERS.map(v => `
      <div class="voucher">
        <div class="voucher__left"><div><b>${v.big}</b>${v.small}</div></div>
        <div class="voucher__body">
          <b>${v.title}</b>
          <span>${v.note}</span>
          <div class="voucher__foot">
            <span class="voucher__code">${v.code}</span>
            <button class="copy-btn" data-copy="${v.code}">Lưu mã</button>
          </div>
        </div>
      </div>`).join('');
  }

  function renderFlash() {
    $('[data-carousel="flash"]').innerHTML = PRODUCTS.filter(isSale).sort((a, b) => offPct(b) - offPct(a)).map(card).join('');
  }

  function renderGinseng(filter = 'ginseng') {
    $('[data-chips="ginseng"]').innerHTML = [['ginseng', 'Tất cả'], ['hong-sam', 'Hồng sâm'], ['hac-sam', 'Hắc sâm'], ['nuoc-sam', 'Nước & thạch'], ['combo', 'Combo']]
      .map(([k, n]) => `<button class="chip ${k === filter ? 'is-active' : ''}" data-gchip="${k}">${n}</button>`).join('');
    $('[data-grid="ginseng"]').innerHTML = PRODUCTS.filter(p => inGroup(p, filter)).slice(0, 8).map(card).join('');
  }

  function renderSpotlight() {
    const p = byId('bt1');
    $('[data-spotlight]').innerHTML = `
      <div class="spotlight__img"><img src="${IMG}matcha-lifestyle.jpg" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="spotlight__info">
        <span class="pcard__brand">${p.brand} · Sản phẩm nổi bật</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.desc)}</p>
        <div class="spotlight__thumbs">${p.gallery.slice(1).map(g => `<img src="${IMG + g}" alt="" loading="lazy">`).join('')}</div>
        <div class="spotlight__price"><b>${money(p.price)}</b><s>${money(p.compare)}</s></div>
        <div class="spotlight__actions">
          <button class="btn" data-add="${p.id}">${ICON.cart} Thêm vào giỏ</button>
          <button class="btn btn--ghost" data-view="${p.id}">Xem chi tiết</button>
        </div>
      </div>`;
  }

  function renderTabs() {
    const items = [['all', 'Tất cả'], ['sale', 'Đang giảm giá'], ...Object.entries(CATS).map(([k, c]) => [k, c.name])];
    $('[data-tabs]').innerHTML = items.map(([k, n]) =>
      `<button class="tab ${state.filter === k ? 'is-active' : ''}" data-filter="${k}">${n}</button>`).join('');
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
      .filter(p => inGroup(p, state.filter))
      .filter(p => !q || `${p.name} ${p.brand} ${CATS[p.cat].name}`.toLowerCase().includes(q))
      .sort(sorters[state.sort]);
    $('[data-grid="shop"]').innerHTML = list.map(card).join('');

    const empty = $('[data-empty]');
    empty.hidden = list.length > 0;
    const soon = CATS[state.filter]?.soon;
    empty.innerHTML = soon && !q
      ? `Mặt hàng ${CATS[state.filter].name.toLowerCase()} đang được cập nhật lên website. Trong lúc chờ, cả nhà xem hàng qua <a href="${FB}" target="_blank" rel="noopener">live trên Facebook</a> hoặc gọi <a href="tel:+18328632592">832-863-2592</a> nha.`
      : `Không tìm thấy sản phẩm phù hợp. Gọi <a href="tel:+18328632592">832-863-2592</a> để Vân tìm giúp.`;
    $('[data-shop-title]').textContent = q
      ? `Kết quả cho "${state.q.trim()}"`
      : state.filter === 'all' ? 'Gợi ý cho bạn' : state.filter === 'sale' ? 'Đang giảm giá' : state.filter === 'ginseng' ? 'Sâm Hàn Quốc' : (CATS[state.filter]?.name || 'Sản phẩm');
    renderTabs();
  }

  function setFilter(f) {
    state.filter = f;
    state.q = '';
    $('[data-search] input').value = '';
    renderShop();
  }

  /* ================= Giỏ hàng ================= */
  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);
  const ginsengTotal = () => cart.reduce((s, i) => { const p = byId(i.id); return s + (CATS[p.cat].group === 'ginseng' ? p.price * i.qty : 0); }, 0);

  function pricing() {
    const sub = subtotal();
    let ship = sub >= FREESHIP || !cart.length ? 0 : SHIPPING;
    let discount = 0, couponOk = false;
    const v = coupon && VOUCHERS.find(x => x.code === coupon);
    if (v) {
      const base = v.type === 'percent' ? ginsengTotal() : sub;
      if (base >= v.min) {
        couponOk = true;
        if (v.type === 'ship') ship = 0;
        if (v.type === 'amount') discount = v.value;
        if (v.type === 'percent') discount = Math.round(base * v.value) / 100;
      }
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

  function saveCart() { store.set('jaju-cart-v4', cart); store.set('jaju-coupon', coupon); renderCart(); }

  function totalsHtml(pr) {
    return `
      <div><span>Tạm tính</span><span>${money(pr.sub)}</span></div>
      ${pr.discount ? `<div class="disc"><span>Mã ${pr.v.code}</span><span>-${money(pr.discount)}</span></div>` : ''}
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
    $('[data-ship-bar]').style.width = Math.min(100, pr.sub / FREESHIP * 100) + '%';
    $('[data-totals]').innerHTML = totalsHtml(pr);
    $('[data-action="checkout"]').disabled = !cart.length;

    const msg = $('[data-coupon-msg]');
    if (pr.v) {
      msg.className = 'coupon-msg ' + (pr.couponOk ? 'ok' : 'err');
      msg.textContent = pr.couponOk ? `Đã áp dụng mã ${pr.v.code}` : `Mã ${pr.v.code}: ${pr.v.note.toLowerCase()}`;
      $('[data-coupon-form] input').value = pr.v.code;
    }

    $('[data-cart-items]').innerHTML = !cart.length
      ? `<div class="cart-empty">${ICON.cart}<p>Giỏ hàng đang trống</p></div>`
      : cart.map((i, idx) => {
        const p = byId(i.id);
        return `<div class="line">
          <img src="${p.src}" alt="">
          <div>
            <h4>${esc(p.name)}</h4>
            <small>${i.opt ? esc(i.opt) : esc(p.brand)}</small>
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
    const gallery = (p.gallery || [p.img]).map(f => IMG + f);
    const off = offPct(p);
    openModal(`
      <div class="pd">
        <div>
          <div class="pd__main"><img src="${gallery[0]}" alt="${esc(p.name)}" data-pd-main></div>
          ${gallery.length > 1 ? `<div class="pd__thumbs">${gallery.map((g, i) => `<button class="${i ? '' : 'is-active'}" data-thumb="${g}"><img src="${g}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div class="pd__info">
          <span class="pcard__brand">${esc(p.brand)} · ${CATS[p.cat].name}</span>
          <h3>${esc(p.name)}</h3>
          <div class="pd__price"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s><em>-${off}%</em>` : ''}</div>
          <p>${esc(p.desc)}</p>
          ${p.opts ? `<span class="opt-label">Phân loại</span><div class="opts" data-opts>${p.opts.map((o, i) => `<button class="opt ${i ? '' : 'is-active'}" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
          <div class="pd__buy">
            <div class="qty"><button data-pdq="-1" aria-label="Giảm">-</button><span data-pd-qty>1</span><button data-pdq="1" aria-label="Tăng">+</button></div>
            <button class="btn" data-pd-add="${p.id}">${ICON.cart} Thêm vào giỏ</button>
          </div>
          <div class="pd__perks">
            <span>${ICON.shield}Hàng chính hãng</span>
            <span>${ICON.truck}Freeship đơn từ $100</span>
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
              <label class="pay-opt"><input type="radio" name="pay" value="Zelle" checked><span class="pay-logo zelle">Zelle</span>JaJu Boutique · 832-419-9799</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Venmo"><span class="pay-logo venmo">venmo</span>@Van-Than-1</label>
              <label class="pay-opt"><input type="radio" name="pay" value="Pickup">Nhận hàng và trả tiền tại Houston</label>
            </div>
            <div class="field"><label for="c-note">Ghi chú</label><textarea id="c-note" name="note" rows="2" placeholder="Giờ nhận hàng, gói quà..."></textarea></div>
          </div>
          <div class="summary">
            <h4>Đơn hàng (${count()} sản phẩm)</h4>
            ${cart.map(i => { const p = byId(i.id); return `<div class="sum-line"><img src="${p.src}" alt=""><span>${esc(p.name)}${i.opt ? ` (${esc(i.opt)})` : ''} x${i.qty}</span><b>${money(p.price * i.qty)}</b></div>`; }).join('')}
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
    const pay = d.pay === 'Zelle'
      ? '<div class="pay-card"><span class="pay-logo zelle">Zelle</span><div>JaJu Boutique<br><b>832-419-9799</b></div></div>'
      : d.pay === 'Venmo' ? '<div class="pay-card"><span class="pay-logo venmo">venmo</span><div><b>@Van-Than-1</b></div></div>' : '';
    openModal(`
      <div class="success">
        <div class="success__icon">${ICON.check}</div>
        <h3>Đặt hàng thành công</h3>
        <p>Cảm ơn ${esc(d.name)}. Mã đơn <b>${code}</b>, tổng tiền <b>${money(total)}</b>.</p>
        ${pay ? `<p>Vui lòng chuyển khoản và ghi mã đơn <b>${code}</b> trong nội dung:</p>${pay}` : '<p>Vân sẽ gọi để hẹn giờ nhận hàng tại Houston.</p>'}
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
  const slider = (() => {
    const slides = $$('.slide'), dots = $('[data-dots]');
    let i = 0, timer;
    dots.innerHTML = slides.map((_, k) => `<button aria-label="Banner ${k + 1}" class="${k ? '' : 'is-active'}"></button>`).join('');
    const go = n => {
      slides[i].classList.remove('is-active'); dots.children[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active'); dots.children[i].classList.add('is-active');
      play();
    };
    const play = () => { clearInterval(timer); timer = setInterval(() => go(i + 1), 5000); };
    [...dots.children].forEach((b, k) => b.addEventListener('click', () => go(k)));
    play();
    return { next: d => go(i + d) };
  })();

  (function countdown() {
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
  })();

  /* ================= Sự kiện ================= */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-filter],[data-add],[data-view],[data-action],[data-qty],[data-remove],[data-opt],[data-pdq],[data-pd-add],[data-thumb],[data-slide],[data-copy],[data-gchip],[data-key],[data-scroll]');
    if (!t) return;
    const d = t.dataset;

    if (d.filter) { setFilter(d.filter); closeSheets(); return; }
    if (d.gchip) { renderGinseng(d.gchip); return; }
    if (d.add) { addToCart(d.add); return; }
    if (d.view) { viewProduct(d.view); return; }
    if (d.slide) { slider.next(+d.slide); return; }
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
  $('[data-year]').textContent = new Date().getFullYear();

  renderMenus();
  renderVouchers();
  renderFlash();
  renderGinseng();
  renderSpotlight();
  renderShop();
  renderCart();
})();
