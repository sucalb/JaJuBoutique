(() => {
  'use strict';

  const IMG = 'assets/img/products/';

  const CATS = {
    'hong-sam': { name: 'Hồng sâm', img: IMG + 'hong-sam-lat.jpg' },
    'hac-sam':  { name: 'Hắc sâm', img: IMG + 'hac-sam-cu.jpg' },
    'nuoc-sam': { name: 'Nước & thạch sâm', img: IMG + 'nuoc-sam-nui.jpg' },
    beauty:     { name: 'Làm đẹp', img: IMG + 'matcha-mist.jpg', cover: true },
    fashion:    { name: 'Thời trang', img: 'assets/img/emblem.jpg', cover: true },
    sale:       { name: 'Sale', img: IMG + 'cao-hac-sam.jpg' }
  };

  // Giá, tên sản phẩm đang là số liệu mẫu, thay bằng thông tin thật của shop.
  const PRODUCTS = [
    { id: 'hc1', cat: 'hac-sam', name: 'Kẹo hắc sâm không đường Hàn Quốc', price: 15, compare: 19, img: 'keo-hac-sam.jpg',
      opts: ['Gói 200g', 'Gói 500g'], desc: 'Kẹo hắc sâm không đường, vị ngọt nhẹ, ngậm mỗi ngày. Người lớn tuổi hoặc đang ăn kiêng đường dùng được.' },
    { id: 'hs1', cat: 'hong-sam', name: 'Hồng sâm lát tẩm mật ong (hũ)', price: 42, compare: 52, img: 'hong-sam-lat.jpg',
      desc: 'Hồng sâm Hàn Quốc thái lát, tẩm mật ong. Ăn trực tiếp hoặc pha nước nóng uống như trà.' },
    { id: 'ns2', cat: 'nuoc-sam', name: 'Thạch hồng sâm 6 năm tuổi Daily Jelly Stick', price: 35, compare: null, img: 'thach-hong-sam.jpg',
      desc: 'Thạch hồng sâm dạng que, xé ra ăn liền, bỏ túi mang đi làm, đi học tiện.' },
    { id: 'hc2', cat: 'hac-sam', name: 'Hắc sâm củ tẩm mật ong (hũ)', price: 48, compare: null, img: 'hac-sam-cu.jpg',
      desc: 'Hắc sâm nguyên củ hấp sấy nhiều lần rồi tẩm mật ong, ăn mềm, vị đậm.' },
    { id: 'ns1', cat: 'nuoc-sam', name: 'Nước sâm núi Hàn Quốc, hộp 30 ống', price: 65, compare: 79, img: 'nuoc-sam-nui.jpg',
      desc: 'Hộp 30 ống nước sâm núi, hộp giấy cứng, mua về biếu luôn được.' },
    { id: 'hc3', cat: 'hac-sam', name: 'Hộp quà cao hắc sâm', price: 89, compare: 110, img: 'cao-hac-sam.jpg',
      desc: 'Hộp quà gồm cao hắc sâm và củ sâm, hộp đẹp, hợp làm quà biếu.' },
    { id: 'bt1', cat: 'beauty', name: 'Xịt khoáng trà xanh Innisfree Green Tea Matcha Mist', price: 18, compare: 22, img: 'matcha-mist.jpg',
      gallery: ['matcha-mist.jpg', 'matcha-mist-2.jpg', 'matcha-mist-3.jpg', 'matcha-mist-4.jpg'],
      desc: 'Xịt khoáng chiết xuất trà xanh và matcha Jeju. Xịt khi da khô hoặc sau khi trang điểm.' },
    { id: 'hs2', cat: 'hong-sam', name: 'Kẹo dẻo hồng sâm Hàn Quốc (gói)', price: 16, compare: null, img: 'hong-sam-deo.jpg',
      desc: 'Kẹo dẻo hồng sâm gói lớn, cả nhà ăn chung.' },
    { id: 'hc4', cat: 'hac-sam', name: 'Hắc sâm tẩm mật ong dạng gói', price: 28, compare: 34, img: 'hac-sam-goi.jpg',
      desc: 'Hắc sâm tẩm mật ong đóng gói nhỏ, dễ mang theo.' },
    { id: 'cb1', cat: 'hac-sam', name: 'Combo 3 gói kẹo hắc sâm không đường', price: 39, compare: 57, img: 'keo-hac-sam.jpg',
      desc: 'Mua 3 gói rẻ hơn mua lẻ. Dùng dần hoặc chia cho người thân.' },
    { id: 'cb2', cat: 'hong-sam', name: 'Combo 2 hũ hồng sâm lát tẩm mật ong', price: 78, compare: 104, img: 'hong-sam-lat.jpg',
      desc: '2 hũ hồng sâm lát, một hũ dùng, một hũ biếu.' },
    { id: 'cb3', cat: 'nuoc-sam', name: 'Combo 2 hộp thạch hồng sâm Daily Jelly Stick', price: 66, compare: 70, img: 'thach-hong-sam.jpg',
      desc: '2 hộp thạch hồng sâm dạng que.' }
  ];
  PRODUCTS.forEach((p, i) => { p.order = i; p.src = IMG + p.img; });

  const FREESHIP = 100;
  const SHIPPING = 8;
  const FB = 'https://www.facebook.com/huongthuyxom8binhnghia';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => '$' + n.toFixed(2);
  const byId = id => PRODUCTS.find(p => p.id === id);
  const isSale = p => !!p.compare;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* bỏ qua */ } }
  };

  let cart = store.get('jaju-cart-v3', []).filter(i => byId(i.id));
  const state = { filter: 'all', sort: 'featured', q: '' };

  /* ---------- Sản phẩm ---------- */
  function card(p) {
    const off = isSale(p) ? Math.round((1 - p.price / p.compare) * 100) : 0;
    return `
      <div class="card">
        <a class="card__img" data-view="${p.id}">
          ${off ? `<span class="sale-tag">-${off}%</span>` : ''}
          <img src="${p.src}" alt="${esc(p.name)}" loading="lazy">
        </a>
        <div class="card__body">
          <h3 class="card__name" data-view="${p.id}">${esc(p.name)}</h3>
          <div class="price"><b>${money(p.price)}</b>${off ? `<s>${money(p.compare)}</s>` : ''}</div>
          <button class="btn" data-add="${p.id}">Thêm vào giỏ</button>
        </div>
      </div>`;
  }

  function renderSale() {
    $('[data-sale-grid]').innerHTML = PRODUCTS.filter(isSale).slice(0, 4).map(card).join('');
  }

  function renderCats() {
    $('[data-cats]').innerHTML = Object.entries(CATS).map(([k, c]) => `
      <a class="cat" href="#shop" data-filter="${k}">
        <span class="cat__img ${c.cover ? 'cat__img--cover' : ''}"><img src="${c.img}" alt="" loading="lazy"></span>
        <span>${c.name}</span>
      </a>`).join('');
  }

  function renderTabs() {
    const items = [['all', 'Tất cả'], ...Object.entries(CATS).map(([k, c]) => [k, c.name])];
    $('[data-chips]').innerHTML = items.map(([k, n]) =>
      `<button class="tab ${state.filter === k ? 'is-active' : ''}" data-filter="${k}">${n}</button>`).join('');
    $$('.nav a[data-filter]').forEach(a => a.classList.toggle('is-active', a.dataset.filter === state.filter));
  }

  function renderShop() {
    const q = state.q.trim().toLowerCase();
    const sorters = {
      featured: (a, b) => a.order - b.order,
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name, 'vi')
    };
    const list = PRODUCTS
      .filter(p => state.filter === 'all' || (state.filter === 'sale' ? isSale(p) : p.cat === state.filter))
      .filter(p => !q || (p.name + ' ' + CATS[p.cat].name).toLowerCase().includes(q))
      .sort(sorters[state.sort]);

    $('[data-shop-grid]').innerHTML = list.map(card).join('');
    const empty = $('[data-empty]');
    empty.hidden = list.length > 0;
    empty.innerHTML = state.filter === 'fashion' && !q
      ? `Quần áo shop bán qua live trên Facebook. Cả nhà <a href="${FB}" target="_blank" rel="noopener">vào page JaJu Boutique</a> để xem hàng nha.`
      : 'Không tìm thấy sản phẩm. Thử từ khóa khác hoặc gọi <a href="tel:+18328632592">832-863-2592</a> để hỏi Vân.';
    $('[data-shop-title]').textContent = q
      ? `Tìm kiếm: ${state.q.trim()}`
      : state.filter === 'all' ? 'Tất cả sản phẩm' : CATS[state.filter].name;
    renderTabs();
  }

  function setFilter(f) {
    state.filter = f;
    state.q = '';
    $('[data-search] input').value = '';
    renderShop();
  }

  /* ---------- Giỏ hàng ---------- */
  const count = () => cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = () => cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0);

  function addToCart(id, qty = 1, opt = '') {
    const line = cart.find(i => i.id === id && i.opt === opt);
    if (line) line.qty += qty; else cart.push({ id, qty, opt });
    saveCart();
    toast('Đã thêm vào giỏ hàng');
  }

  function saveCart() { store.set('jaju-cart-v3', cart); renderCart(); }

  function renderCart() {
    const sub = subtotal();
    $('[data-cart-count]').textContent = count();
    $('[data-cart-subtotal]').textContent = money(sub);
    $('[data-action="checkout"]').disabled = !cart.length;
    $('[data-ship-note]').textContent = sub >= FREESHIP
      ? 'Đơn hàng được miễn phí vận chuyển.'
      : `Mua thêm ${money(FREESHIP - sub)} để được miễn phí vận chuyển.`;

    $('[data-cart-items]').innerHTML = !cart.length
      ? '<p class="cart-empty">Chưa có sản phẩm nào trong giỏ.</p>'
      : cart.map((i, idx) => {
        const p = byId(i.id);
        return `<div class="line">
          <img src="${p.src}" alt="">
          <div>
            <h4>${esc(p.name)}</h4>
            <small>${i.opt ? esc(i.opt) + ' / ' : ''}${money(p.price)}</small>
            <div class="qty"><button data-qty="${idx}" data-d="-1" aria-label="Giảm">-</button><span>${i.qty}</span><button data-qty="${idx}" data-d="1" aria-label="Tăng">+</button></div>
          </div>
          <div class="line__right"><b>${money(p.price * i.qty)}</b><button class="link-btn" data-remove="${idx}">Xóa</button></div>
        </div>`;
      }).join('');
  }

  /* ---------- Drawer, popup ---------- */
  const overlay = $('[data-overlay]'), drawer = $('[data-drawer]'), modal = $('[data-modal]'), modalContent = $('[data-modal-content]');
  const lock = on => { document.body.style.overflow = on ? 'hidden' : ''; };
  function openCart() { drawer.classList.add('is-open'); overlay.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lock(true); }
  function closeCart() { drawer.classList.remove('is-open'); overlay.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); lock(false); }
  function openModal(html) { modalContent.innerHTML = html; modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); $('.modal__box').scrollTop = 0; lock(true); }
  function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); lock(false); }

  function viewProduct(id) {
    const p = byId(id);
    const gallery = (p.gallery || [p.img]).map(f => IMG + f);
    openModal(`
      <div class="pd">
        <div>
          <div class="pd__main"><img src="${gallery[0]}" alt="${esc(p.name)}" data-pd-main></div>
          ${gallery.length > 1 ? `<div class="pd__thumbs">${gallery.map((g, i) =>
            `<button class="${i ? '' : 'is-active'}" data-thumb="${g}"><img src="${g}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div class="pd__info">
          <h3>${esc(p.name)}</h3>
          <div class="price"><b>${money(p.price)}</b>${isSale(p) ? `<s>${money(p.compare)}</s>` : ''}</div>
          <hr>
          <p>${esc(p.desc)}</p>
          ${p.opts ? `<span class="opt-label">Loại:</span><div class="opts" data-opts>${p.opts.map((o, i) =>
            `<button class="opt ${i ? '' : 'is-active'}" data-opt="${esc(o)}">${esc(o)}</button>`).join('')}</div>` : ''}
          <div class="pd__buy">
            <div class="qty"><button data-pdq="-1" aria-label="Giảm">-</button><span data-pd-qty>1</span><button data-pdq="1" aria-label="Tăng">+</button></div>
            <button class="btn" data-pd-add="${p.id}">Thêm vào giỏ</button>
          </div>
          <p class="pd__note">Miễn phí vận chuyển cho đơn từ ${money(FREESHIP)}. Thanh toán qua Zelle hoặc Venmo.<br>Cần tư vấn gọi Vân: <a href="tel:+18328632592">832-863-2592</a></p>
        </div>
      </div>`);
  }

  function checkout() {
    if (!cart.length) return;
    closeCart();
    const sub = subtotal(), ship = sub >= FREESHIP ? 0 : SHIPPING;
    openModal(`
      <div class="checkout">
        <h3>Thông tin đặt hàng</h3>
        <p class="small">Điền thông tin bên dưới, Vân sẽ gọi hoặc nhắn tin xác nhận đơn.</p>
        <form class="checkout__grid" data-checkout-form>
          <div>
            <div class="field"><label for="c-name">Họ tên *</label><input id="c-name" name="name" required autocomplete="name"></div>
            <div class="field"><label for="c-phone">Số điện thoại *</label><input id="c-phone" name="phone" type="tel" required autocomplete="tel"></div>
            <div class="field"><label for="c-addr">Địa chỉ nhận hàng *</label><textarea id="c-addr" name="address" rows="2" required autocomplete="street-address"></textarea></div>
            <div class="field"><label>Thanh toán</label>
              <label class="radio"><input type="radio" name="pay" value="Zelle" checked> Zelle (JaJu Boutique, 832-419-9799)</label>
              <label class="radio"><input type="radio" name="pay" value="Venmo"> Venmo (Van-Than-1)</label>
              <label class="radio"><input type="radio" name="pay" value="Pickup"> Lấy hàng và trả tiền tại Houston</label>
            </div>
            <div class="field"><label for="c-note">Ghi chú</label><textarea id="c-note" name="note" rows="2"></textarea></div>
          </div>
          <div class="summary">
            <h4>Đơn hàng</h4>
            ${cart.map(i => { const p = byId(i.id); return `<div class="sum-line"><span>${esc(p.name)}${i.opt ? ` (${esc(i.opt)})` : ''} x ${i.qty}</span><span>${money(p.price * i.qty)}</span></div>`; }).join('')}
            <hr>
            <div class="row"><span>Tạm tính</span><span>${money(sub)}</span></div>
            <div class="row"><span>Phí ship</span><span>${ship ? money(ship) : 'Miễn phí'}</span></div>
            <hr>
            <div class="row total"><span>Tổng cộng</span><b>${money(sub + ship)}</b></div>
            <button class="btn btn--block" type="submit">Gửi đơn hàng</button>
          </div>
        </form>
      </div>`);
  }

  function placeOrder(form) {
    const d = Object.fromEntries(new FormData(form));
    const sub = subtotal(), total = sub + (sub >= FREESHIP ? 0 : SHIPPING);
    const code = 'JJ' + Date.now().toString().slice(-6);
    // Bản demo: đơn chưa được gửi đi. Bản chính thức sẽ gửi về email hoặc Google Sheet của shop.
    cart = []; saveCart();
    const pay = d.pay === 'Zelle'
      ? '<b>Zelle:</b> JaJu Boutique<br>832-419-9799'
      : d.pay === 'Venmo' ? '<b>Venmo:</b> Van-Than-1' : '';
    openModal(`
      <div class="success">
        <h3>Cảm ơn ${esc(d.name)} đã đặt hàng</h3>
        <p>Mã đơn: <b>${code}</b>. Tổng tiền: <b>${money(total)}</b></p>
        ${pay ? `<p>Chuyển khoản theo thông tin dưới đây, nội dung ghi mã đơn <b>${code}</b>:</p><div class="pay-info">${pay}</div>`
              : '<p>Vân sẽ gọi cho bạn để hẹn giờ lấy hàng ở Houston.</p>'}
        <p class="small">Cần hỗ trợ gọi <a href="tel:+18328632592">832-863-2592</a></p>
        <button class="btn" data-action="close-modal">Tiếp tục mua sắm</button>
      </div>`);
  }

  let toastT;
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-show'), 1800);
  }

  /* ---------- Slider ---------- */
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

  /* ---------- Sự kiện ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-filter],[data-add],[data-view],[data-action],[data-qty],[data-remove],[data-opt],[data-pdq],[data-pd-add],[data-thumb],[data-slide]');
    if (!t) return;
    const d = t.dataset;

    if (d.filter) { setFilter(d.filter); $('[data-nav]').classList.remove('is-open'); return; }
    if (d.add) { addToCart(d.add); return; }
    if (d.view) { viewProduct(d.view); return; }
    if (d.slide) { slider.next(+d.slide); return; }
    if (d.qty !== undefined) {
      const l = cart[+d.qty]; l.qty += +d.d;
      if (l.qty <= 0) cart.splice(+d.qty, 1);
      saveCart(); return;
    }
    if (d.remove !== undefined) { cart.splice(+d.remove, 1); saveCart(); return; }
    if (d.opt) { $$('[data-opt]', t.parentElement).forEach(o => o.classList.toggle('is-active', o === t)); return; }
    if (d.thumb) {
      $('[data-pd-main]').src = d.thumb;
      $$('[data-thumb]').forEach(b => b.classList.toggle('is-active', b === t)); return;
    }
    if (d.pdq) { const q = $('[data-pd-qty]'); q.textContent = Math.max(1, +q.textContent + +d.pdq); return; }
    if (d.pdAdd) {
      const opt = $('[data-opts] .is-active');
      addToCart(d.pdAdd, +$('[data-pd-qty]').textContent, opt ? opt.dataset.opt : '');
      closeModal(); openCart(); return;
    }
    ({
      'open-cart': openCart,
      'close-cart': closeCart,
      checkout,
      'close-modal': closeModal,
      'toggle-menu': () => $('[data-nav]').classList.toggle('is-open')
    })[d.action]?.();
  });

  overlay.addEventListener('click', closeCart);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeCart(); } });

  document.addEventListener('submit', e => {
    if (e.target.matches('[data-search]')) {
      e.preventDefault();
      state.q = e.target.q.value; state.filter = 'all';
      renderShop(); $('#shop').scrollIntoView();
    } else if (e.target.matches('[data-checkout-form]')) {
      e.preventDefault(); placeOrder(e.target);
    }
  });

  $('[data-sort]').addEventListener('change', e => { state.sort = e.target.value; renderShop(); });
  $('[data-year]').textContent = new Date().getFullYear();

  renderSale();
  renderCats();
  renderShop();
  renderCart();
})();
