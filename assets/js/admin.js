(() => {
  'use strict';

  /* =====================================================
     Trang quản trị JaJu Boutique
     - Mọi chỉnh sửa lưu nháp trong trình duyệt (localStorage).
     - "Xem trước" mở index.html?preview=1 để xem bản nháp.
     - "Xuất bản" ghi data/store.js (và ảnh mới tải lên) vào repo GitHub,
       GitHub Pages tự cập nhật website sau khoảng 1 phút.
     ===================================================== */

  const DRAFT_KEY = 'jaju-admin-draft';
  const GH_KEY = 'jaju-admin-github';
  const SESSION_KEY = 'jaju-admin-session';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clone = o => JSON.parse(JSON.stringify(o));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = n => '$' + (+n || 0).toFixed(2);
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const RESERVED = ['all', 'sale', 'shop', 'fav', 'flash', 'ginseng-x'];
  const uniqueId = (base, taken) => { let id = RESERVED.includes(base) ? base + '-1' : base, n = 2; while (taken.includes(id)) id = `${base}-${n++}`; return id; };
  const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || uid('c');
  const ls = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch { /* bỏ qua */ } }
  };

  if (!window.JAJU_STORE) { document.body.innerHTML = '<p style="padding:30px">Không tải được data/store.js</p>'; return; }
  const normalize = o => ({ settings: {}, groups: [], categories: [], products: [], vouchers: [], slides: [], miniBanners: [], promos: [], posts: [], spotlight: {}, ...o, settings: { theme: {}, ...(o.settings || {}) } });
  // So sánh không phụ thuộc thứ tự khóa, coi null và thiếu là như nhau
  const stable = o => JSON.stringify(o, (k, v) => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().filter(x => v[x] != null).map(x => [x, v[x]])) : v);
  const BASE_KEY = 'jaju-admin-base';
  let BASE = normalize(clone(window.JAJU_STORE));
  let D = normalize(ls.get(DRAFT_KEY, null) || clone(BASE));
  // 12: bản nháp được tạo từ một bản website cũ hơn bản đang chạy
  const draftBase = ls.get(BASE_KEY, null);
  const staleDraft = !!ls.get(DRAFT_KEY, null) && draftBase && draftBase !== stable(BASE);

  const ICONS = {
    overview: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
    products: '<path d="M21 8 12 3 3 8v8l9 5 9-5Z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    categories: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    banners: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    vouchers: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4Z"/><path d="M10 9h.01M14 15h.01M15 9l-6 6"/>',
    posts: '<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    settings: '<path d="M3 21h18M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>',
    theme: '<circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.3"/><circle cx="12" cy="7.5" r="1.3"/><circle cx="16" cy="10" r="1.3"/><path d="M12 21a3 3 0 0 1 0-6h2a3 3 0 0 0 3-3"/>',
    publish: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16Z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/>'
  };
  const svg = n => `<svg viewBox="0 0 24 24">${ICONS[n]}</svg>`;

  const PAGES = [
    ['overview', 'Tổng quan'],
    ['products', 'Sản phẩm'],
    ['categories', 'Danh mục'],
    ['banners', 'Banner trang chủ'],
    ['vouchers', 'Mã giảm giá'],
    ['posts', 'Bài viết'],
    ['settings', 'Thông tin cửa hàng'],
    ['theme', 'Màu sắc giao diện'],
    ['publish', 'Xuất bản']
  ];

  const TONES = [['peach', 'Cam đào'], ['mint', 'Xanh mint'], ['pink', 'Hồng'], ['lavender', 'Tím lavender'], ['sky', 'Xanh trời'], ['cream', 'Kem']];
  // primary: màu đậm (icon giỏ, dải footer) · accent: màu nhấn (nút, chip, ô tìm kiếm) · bg: nền trang
  const PRESETS = [
    { name: 'Hồng anh đào (mặc định)', primary: '#4b2a63', accent: '#e2589a', bg: '#f9ecf3' },
    { name: 'Tím lavender', primary: '#3b2a63', accent: '#8a4fc7', bg: '#f5f0fb' },
    { name: 'Hồng đào', primary: '#5a2a3a', accent: '#ee6f8a', bg: '#fff1f3' },
    { name: 'Xanh mint', primary: '#1d4d3e', accent: '#22a07a', bg: '#eef8f4' },
    { name: 'Đỏ son', primary: '#4a1c1c', accent: '#d7263d', bg: '#fdf1f1' },
    { name: 'Xanh navy', primary: '#1f2f5c', accent: '#e85d75', bg: '#f1f4fa' },
    { name: 'Cam san hô', primary: '#4a2c20', accent: '#f0743e', bg: '#fff4ee' },
    { name: 'Xanh ngọc', primary: '#0f4a55', accent: '#14a3b8', bg: '#eef9fb' }
  ];

  /* ================= Lưu nháp, trạng thái ================= */
  const isDirty = () => stable(D) !== stable(BASE);
  let saveFailed = false;
  function save(msg) {
    const ok = ls.set(DRAFT_KEY, D) && (ls.get(BASE_KEY, null) ? true : ls.set(BASE_KEY, stable(BASE)));
    saveFailed = !ok;
    if (!ok) openDialog('Bộ nhớ trình duyệt đã đầy', '<p>Thay đổi mới nhất <b>chưa được lưu</b> vì ảnh tải lên chiếm hết bộ nhớ của trình duyệt (khoảng 5MB).</p><p style="margin-top:8px">Hãy bấm <b>Xuất bản</b> ngay để đưa ảnh lên website và giải phóng bộ nhớ. Đừng tải lại trang trước khi xuất bản.</p>');
    else if (msg) toast(msg);
    renderStatus();
    renderNav();
  }
  function renderStatus() {
    const el = $('[data-status]');
    const dirty = isDirty();
    el.className = 'status' + (dirty ? ' dirty' : '');
    el.textContent = dirty ? 'Có thay đổi chưa xuất bản' : 'Đã đồng bộ với website';
  }

  /* ================= Đăng nhập ================= */
  async function sha256(text) {
    if (!window.crypto?.subtle) throw new Error('Trình duyệt chặn mã hóa trên trang không bảo mật. Hãy mở bằng https.');
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function showApp() { $('[data-login]').hidden = true; $('[data-app]').hidden = false; route(); }
  $('[data-login-form]').addEventListener('submit', async e => {
    e.preventDefault();
    let h;
    try { h = await sha256(e.target.pw.value); } catch (err) { $('[data-login-err]').textContent = err.message; return; }
    const expected = D.settings.adminHash || BASE.settings.adminHash;
    if (h === expected || h === BASE.settings.adminHash) {
      try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { /* bỏ qua */ }
      showApp();
    } else {
      $('[data-login-err]').textContent = 'Mật khẩu chưa đúng';
    }
  });

  /* ================= Điều hướng ================= */
  function renderNav() {
    const counts = { products: D.products.length, categories: D.categories.length, vouchers: D.vouchers.length, posts: (D.posts || []).length };
    const cur = currentPage();
    $('[data-nav]').innerHTML = PAGES.map(([id, name]) =>
      `<a href="#${id}" class="${cur === id ? 'is-active' : ''}">${svg(id)}${name}${counts[id] != null ? `<span class="count">${counts[id]}</span>` : ''}</a>`).join('');
  }
  const currentPage = () => { const h = location.hash.slice(1); return PAGES.some(p => p[0] === h) ? h : 'overview'; };
  function route() {
    const page = currentPage();
    $('[data-page-title]').textContent = PAGES.find(p => p[0] === page)[1];
    $('[data-side]').classList.remove('is-open');
    renderNav(); renderStatus();
    VIEWS[page]();
    scrollTo(0, 0);
  }
  addEventListener('hashchange', route);

  /* ================= Trường nhập liệu ================= */
  // f: { key, label, type, full, options, hint, placeholder }
  function field(f, v) {
    const id = 'f_' + f.key;
    if (f.type === 'select' && v != null && v !== '' && !f.options.some(([o]) => String(o) === String(v))) f = { ...f, options: [[v, `${v} (hiện tại)`], ...f.options] };
    let ctl = '';
    switch (f.type) {
      case 'textarea': ctl = `<textarea class="textarea" id="${id}" data-key="${f.key}" rows="${f.rows || 3}" placeholder="${esc(f.placeholder || '')}">${esc(v)}</textarea>`; break;
      case 'number': ctl = `<input class="input" type="number" step="0.01" min="0" id="${id}" data-key="${f.key}" data-type="number" value="${v ?? ''}" placeholder="${esc(f.placeholder || '')}">`; break;
      case 'select': ctl = `<select class="input" id="${id}" data-key="${f.key}">${f.options.map(([val, l]) => `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`; break;
      case 'toggle': ctl = `<div class="field-inline"><label class="switch"><input type="checkbox" id="${id}" data-key="${f.key}" data-type="toggle" ${v ? 'checked' : ''}><span></span></label><span class="hint">${esc(f.text || '')}</span></div>`; break;
      case 'tags': ctl = `<input class="input" id="${id}" data-key="${f.key}" data-type="tags" value="${esc((v || []).join(', '))}" placeholder="${esc(f.placeholder || 'Cách nhau bằng dấu phẩy')}">`; break;
      case 'tone': ctl = `<div class="tone-pick">${TONES.map(([t, n]) => `<label title="${n}"><input type="radio" name="${id}" data-key="${f.key}" data-type="radio" value="${t}" ${v === t ? 'checked' : ''}><span class="tone-${t}"></span></label>`).join('')}</div>`; break;
      case 'image': ctl = imageField(f.key, v); break;
      case 'gallery': ctl = galleryField(f.key, v || []); break;
      default: ctl = `<input class="input" type="${f.type === 'password' ? 'password' : 'text'}" id="${id}" data-key="${f.key}" value="${esc(v)}" placeholder="${esc(f.placeholder || '')}">`;
    }
    return `<div class="field ${f.full ? 'field--full' : ''}">${f.type === 'toggle' ? `<label>${esc(f.label)}</label>` : `<label for="${id}">${esc(f.label)}</label>`}${ctl}${f.hint ? `<small>${f.hint}</small>` : ''}</div>`;
  }
  function imageField(key, v) {
    return `<div class="img-field" data-img-field>
      <div class="img-field__preview" data-img-preview>${v ? `<img src="${esc(v)}" alt="">` : 'Chưa có ảnh'}</div>
      <div class="img-field__ctrl">
        <input class="input" data-key="${key}" data-type="image" value="${esc(v && v.startsWith('data:') ? '' : v)}" data-value="${esc(v || '')}" placeholder="Dán link ảnh hoặc bấm Tải ảnh lên">
        <div class="img-field__btns">
          <label class="btn btn--ghost btn--sm">Tải ảnh lên<input type="file" accept="image/*" hidden data-upload></label>
          ${v ? '<button type="button" class="btn btn--danger btn--sm" data-clear-img>Xóa ảnh</button>' : ''}
        </div>
      </div>
    </div>`;
  }
  function galleryField(key, arr) {
    return `<div data-gallery data-key="${key}" data-type="gallery" data-value="${esc(JSON.stringify(arr))}">
      <div class="gallery">${arr.map((g, i) => `<div class="gallery__item"><img src="${esc(g)}" alt=""><button type="button" data-gal-del="${i}" aria-label="Xóa">×</button></div>`).join('')}
        <label class="gallery__add" title="Thêm ảnh">+<input type="file" accept="image/*" multiple hidden data-gal-add></label>
      </div>
    </div>`;
  }
  function readForm(root) {
    const out = {};
    $$('[data-key]', root).forEach(el => {
      const k = el.dataset.key, t = el.dataset.type;
      if (t === 'radio') { if (el.checked) out[k] = el.value; else if (!(k in out)) out[k] = ''; return; }
      if (t === 'toggle') out[k] = el.checked;
      else if (t === 'number') out[k] = el.value === '' ? null : +el.value;
      else if (t === 'tags') out[k] = el.value.split(',').map(s => s.trim()).filter(Boolean);
      else if (t === 'image') out[k] = el.value.trim() || el.dataset.value || '';
      else if (t === 'gallery') out[k] = JSON.parse(el.dataset.value || '[]');
      else out[k] = el.value.trim();
    });
    return out;
  }

  // Ảnh tải lên: thu nhỏ còn tối đa 1200px rồi lưu tạm dạng dữ liệu, xuất bản sẽ đưa lên repo.
  function fileToDataUrl(file, max = 1200) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        const x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(img.src);
        resolve(c.toDataURL('image/jpeg', .85));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  document.addEventListener('change', async e => {
    const t = e.target;
    if (t.matches('[data-upload]')) {
      const f = t.files[0]; if (!f) return;
      const wrap = t.closest('[data-img-field]');
      let url;
      try { url = await fileToDataUrl(f); } catch { toast('Không đọc được ảnh này. Hãy chọn ảnh JPG hoặc PNG.'); t.value = ''; return; }
      const input = $('[data-type="image"]', wrap);
      input.value = ''; input.dataset.value = url;
      $('[data-img-preview]', wrap).innerHTML = `<img src="${url}" alt="">`;
    }
    if (t.matches('[data-gal-add]')) {
      const wrap = t.closest('[data-gallery]');
      const arr = JSON.parse(wrap.dataset.value || '[]');
      for (const f of t.files) { try { arr.push(await fileToDataUrl(f)); } catch { toast('Bỏ qua 1 ảnh không đọc được (chỉ nhận JPG, PNG, WEBP)'); } }
      wrap.outerHTML = galleryField(wrap.dataset.key, arr);
    }
  });
  document.addEventListener('input', e => {
    const t = e.target;
    if (t.matches('[data-type="image"]')) {
      t.dataset.value = t.value.trim();
      $('[data-img-preview]', t.closest('[data-img-field]')).innerHTML = t.value.trim() ? `<img src="${esc(t.value.trim())}" alt="">` : 'Chưa có ảnh';
    }
  });
  document.addEventListener('click', e => {
    const del = e.target.closest('[data-gal-del]');
    if (del) {
      const wrap = del.closest('[data-gallery]');
      const arr = JSON.parse(wrap.dataset.value || '[]'); arr.splice(+del.dataset.galDel, 1);
      wrap.outerHTML = galleryField(wrap.dataset.key, arr);
    }
    const clr = e.target.closest('[data-clear-img]');
    if (clr) {
      const wrap = clr.closest('[data-img-field]'), input = $('[data-type="image"]', wrap);
      input.value = ''; input.dataset.value = '';
      $('[data-img-preview]', wrap).textContent = 'Chưa có ảnh'; clr.remove();
    }
  });

  /* ================= Hộp thoại ================= */
  let dialogSave = null;
  function openDialog(title, body, onSave, saveText = 'Lưu') {
    $('[data-dialog-title]').textContent = title;
    $('[data-dialog-body]').innerHTML = body;
    $('[data-dialog-foot]').innerHTML = onSave
      ? `<button class="btn btn--ghost" data-action="close-dialog">Hủy</button><button class="btn" data-action="dialog-save">${saveText}</button>`
      : `<button class="btn" data-action="close-dialog">Đóng</button>`;
    dialogSave = onSave;
    dialogCancel = null;
    $('[data-dialog]').hidden = false;
    $('[data-dialog-body] input, [data-dialog-body] textarea')?.focus();
  }
  let dialogCancel = null;
  const closeDialog = () => { $('[data-dialog]').hidden = true; dialogSave = null; const c = dialogCancel; dialogCancel = null; c?.(); };
  function confirmBox(text, okText = 'Đồng ý') {
    return new Promise(res => {
      openDialog('Xác nhận', `<p>${text}</p>`, () => { dialogCancel = null; res(true); return true; }, okText);
      dialogCancel = () => res(false);
    });
  }

  /* ================= Trang: Tổng quan ================= */
  const VIEWS = {};
  VIEWS.overview = () => {
    const sale = D.products.filter(p => +p.compare > +p.price).length;
    const hidden = D.products.filter(p => p.hidden).length;
    const demo = D.products.filter(p => /minh họa/i.test(p.brand || '')).length;
    const stat = (icon, n, label, bg, color) => `<div class="stat"><span class="stat__icon" style="background:${bg};color:${color}">${svg(icon)}</span><div><b>${n}</b><span>${label}</span></div></div>`;
    $('[data-content]').innerHTML = `
      ${staleDraft ? '<div class="notice">Website vừa được cập nhật từ máy khác sau khi bạn bắt đầu sửa trên máy này. Nếu muốn lấy nội dung mới nhất, vào <b>Xuất bản → Bỏ thay đổi</b>.</div>' : ''}
      ${isDirty() ? '<div class="notice">Bạn có thay đổi chưa xuất bản. Bấm <b>Xem trước</b> để kiểm tra, rồi <b>Xuất bản</b> để cập nhật lên website.</div>' : ''}
      <div class="stats">
        ${stat('products', D.products.length, `sản phẩm (${hidden} đang ẩn)`, '#f5edfa', '#7b3f9e')}
        ${stat('tag', sale, 'đang giảm giá', '#ffe8ee', '#d6284d')}
        ${stat('categories', D.categories.length, 'danh mục', '#e6f6ee', '#24935b')}
        ${stat('vouchers', D.vouchers.length, 'mã giảm giá', '#fff4e0', '#c77700')}
      </div>
      ${demo ? `<div class="notice">Có <b>${demo} sản phẩm đang dùng ảnh minh họa</b> (ghi "Ảnh minh họa" ở mục thương hiệu). Hãy thay bằng ảnh và tên sản phẩm thật của shop.</div>` : ''}
      <div class="card">
        <div class="card__head"><h2>Thao tác nhanh</h2></div>
        <div class="quick">
          <a href="#products" data-action="new-product">${svg('plus')}Thêm sản phẩm mới</a>
          <a href="#banners">${svg('banners')}Đổi banner trang chủ</a>
          <a href="#vouchers">${svg('vouchers')}Tạo mã giảm giá</a>
          <a href="#settings">${svg('settings')}Sửa hotline, Zelle, Venmo</a>
          <a href="#theme">${svg('theme')}Đổi màu giao diện</a>
          <a href="#publish">${svg('publish')}Xuất bản lên website</a>
        </div>
      </div>
      <div class="card">
        <div class="card__head"><h2>Cách cập nhật website</h2></div>
        <ol class="steps">
          <li>Sửa sản phẩm, banner, giá... ở các mục bên trái. Mọi thay đổi được <b>lưu nháp tự động</b> trên máy này.</li>
          <li>Bấm <b>Xem trước</b> để xem website với nội dung mới (chỉ bạn thấy).</li>
          <li>Bấm <b>Xuất bản</b>. Khoảng 1 phút sau khách hàng sẽ thấy nội dung mới.</li>
        </ol>
      </div>`;
  };

  /* ================= Trang: Sản phẩm ================= */
  const prodState = { q: '', cat: '' };
  const catOptions = () => D.categories.map(c => [c.id, c.name]);
  const PRODUCT_FIELDS = () => [
    { key: 'name', label: 'Tên sản phẩm', full: true },
    { key: 'brand', label: 'Thương hiệu / xuất xứ', placeholder: 'VD: Hàn Quốc, Innisfree' },
    { key: 'cat', label: 'Danh mục', type: 'select', options: catOptions() },
    { key: 'price', label: 'Giá bán ($)', type: 'number' },
    { key: 'compare', label: 'Giá gốc ($)', type: 'number', hint: 'Để trống nếu không giảm giá. Giá gốc lớn hơn giá bán sẽ hiện nhãn % giảm.' },
    { key: 'tag', label: 'Nhãn nổi bật', placeholder: 'VD: Bán chạy, Mới về' },
    { key: 'opts', label: 'Phân loại (size, màu...)', type: 'tags', placeholder: 'VD: S, M, L' },
    { key: 'img', label: 'Ảnh chính', type: 'image', full: true },
    { key: 'gallery', label: 'Ảnh phụ', type: 'gallery', full: true, hint: 'Hiện trong trang chi tiết sản phẩm.' },
    { key: 'desc', label: 'Mô tả', type: 'textarea', full: true, rows: 4 },
    { key: 'flash', label: 'Flash sale', type: 'toggle', text: 'Hiện trong khu Flash Sale (cần có giá gốc)' },
    { key: 'hidden', label: 'Ẩn sản phẩm', type: 'toggle', text: 'Tạm ẩn khỏi website' }
  ];

  VIEWS.products = () => {
    const q = prodState.q.toLowerCase();
    const list = D.products.map((p, i) => ({ p, i })).filter(({ p }) =>
      (!prodState.cat || p.cat === prodState.cat) && (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)));
    const catName = id => D.categories.find(c => c.id === id)?.name || '(chưa có)';
    const filtered = !!(prodState.q || prodState.cat);
    $('[data-content]').innerHTML = `
      <div class="card">
        <div class="toolbar">
          <input class="input grow" placeholder="Tìm theo tên sản phẩm..." value="${esc(prodState.q)}" data-prod-search>
          <select class="select" data-prod-cat><option value="">Tất cả danh mục</option>${D.categories.map(c => `<option value="${c.id}" ${prodState.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
          <button class="btn" data-action="new-product">${svg('plus')}Thêm sản phẩm</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th></th><th>Sản phẩm</th><th class="hide-sm">Danh mục</th><th>Giá</th><th class="hide-sm">Flash sale</th><th>Hiện</th><th></th></tr></thead>
            <tbody>
              ${list.map(({ p, i }) => `
                <tr class="${p.hidden ? 'is-hidden' : ''}">
                  <td><img class="thumb" src="${esc(p.img)}" alt=""></td>
                  <td><div class="p-name">${esc(p.name)}</div><div class="p-sub">${esc(p.brand)}${p.tag ? ` · <span class="pill">${esc(p.tag)}</span>` : ''}</div></td>
                  <td class="hide-sm">${esc(catName(p.cat))}</td>
                  <td class="price-cell"><b>${money(p.price)}</b>${+p.compare > +p.price ? `<s>${money(p.compare)}</s>` : ''}</td>
                  <td class="hide-sm"><label class="switch"><input type="checkbox" data-toggle-flash="${i}" ${p.flash ? 'checked' : ''}><span></span></label></td>
                  <td><label class="switch"><input type="checkbox" data-toggle-show="${i}" ${p.hidden ? '' : 'checked'}><span></span></label></td>
                  <td><div class="row-actions">
                    <button class="icon-btn" title="Sửa" data-edit-product="${i}">${svg('edit')}</button>
                    <button class="icon-btn hide-sm" title="Nhân bản" data-dup-product="${i}">${svg('copy')}</button>
                    ${filtered ? '' : `<button class="icon-btn hide-sm" title="Lên" data-move="products" data-i="${i}" data-d="-1">${svg('up')}</button>
                    <button class="icon-btn hide-sm" title="Xuống" data-move="products" data-i="${i}" data-d="1">${svg('down')}</button>`}
                    <button class="icon-btn danger" title="Xóa" data-del="products" data-i="${i}">${svg('trash')}</button>
                  </div></td>
                </tr>`).join('') || '<tr><td colspan="7"><div class="empty-state">Không có sản phẩm nào</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>`;
  };
  function editProduct(i) {
    const isNew = i == null;
    const p = isNew ? { id: uid('p'), name: '', brand: '', cat: D.categories[0]?.id, price: null, compare: null, img: '', gallery: [], tag: '', opts: [], desc: '', flash: false, hidden: false } : D.products[i];
    openDialog(isNew ? 'Thêm sản phẩm' : 'Sửa sản phẩm', `<div class="form">${PRODUCT_FIELDS().map(f => field(f, p[f.key])).join('')}</div>`, () => {
      const v = readForm($('[data-dialog-body]'));
      if (!v.name) { toast('Vui lòng nhập tên sản phẩm'); return false; }
      if (v.price == null || v.price < 0) { toast('Vui lòng nhập giá bán'); return false; }
      if (!v.img) { toast('Vui lòng chọn ảnh chính'); return false; }
      const item = { ...p, ...v };
      if (isNew) D.products.unshift(item); else D.products[i] = item;
      save(isNew ? 'Đã thêm sản phẩm' : 'Đã lưu sản phẩm');
      VIEWS.products();
      return true;
    });
  }

  /* ================= Danh sách chung (danh mục, banner, mã...) ================= */
  // cfg: { key, title, desc, fields(), summary(item), make(), path?: obj getter }
  function listCard(cfg) {
    const arr = cfg.get();
    return `
      <div class="card">
        <div class="card__head">
          <div><h2>${cfg.title}</h2>${cfg.desc ? `<p>${cfg.desc}</p>` : ''}</div>
          ${cfg.max && arr.length >= cfg.max ? '' : `<button class="btn btn--sm" data-list-add="${cfg.key}">${svg('plus')}Thêm</button>`}
        </div>
        <div class="items">
          ${arr.map((it, i) => { const s = cfg.summary(it); return `
            <div class="item">
              ${s.img !== undefined ? (s.img ? `<img class="item__img ${s.contain ? 'contain' : ''}" src="${esc(s.img)}" alt="">` : `<div class="item__img"></div>`) : ''}
              ${s.tone ? `<div class="item__img tone-${esc(s.tone)}" style="width:28px;height:64px"></div>` : ''}
              <div class="item__body"><div class="item__title">${esc(s.title)}</div><div class="item__sub">${s.sub}</div></div>
              <div class="row-actions">
                <button class="icon-btn" title="Sửa" data-list-edit="${cfg.key}" data-i="${i}">${svg('edit')}</button>
                <button class="icon-btn" title="Lên" data-move="${cfg.key}" data-i="${i}" data-d="-1">${svg('up')}</button>
                <button class="icon-btn" title="Xuống" data-move="${cfg.key}" data-i="${i}" data-d="1">${svg('down')}</button>
                <button class="icon-btn danger" title="Xóa" data-del="${cfg.key}" data-i="${i}">${svg('trash')}</button>
              </div>
            </div>`; }).join('') || '<div class="empty-state">Chưa có mục nào</div>'}
        </div>
      </div>`;
  }

  const groupOptions = () => D.groups.map(g => [g.id, g.name]);
  const linkOptions = () => [['#shop', 'Tất cả sản phẩm'], ['#flash', 'Flash sale'], ['#vouchers', 'Mã giảm giá'], ...D.groups.map(g => ['#group-' + g.id, 'Khu ' + g.name]), [D.settings.facebook, 'Trang Facebook'], ['#blog', 'Cẩm nang']];
  const LISTS = {
    categories: {
      title: 'Danh mục sản phẩm', desc: 'Hiện ở menu bên trái, hàng icon và bộ lọc sản phẩm.',
      get: () => D.categories,
      fields: () => [
        { key: 'name', label: 'Tên danh mục', full: true },
        { key: 'group', label: 'Thuộc khu', type: 'select', options: groupOptions() },
        { key: 'img', label: 'Ảnh đại diện', type: 'image', full: true }
      ],
      make: () => ({ id: '', name: '', group: D.groups[0]?.id, img: '' }),
      beforeSave: (v, old) => { if (!old.id) v.id = uniqueId(slug(v.name), D.categories.map(c => c.id).concat(D.groups.map(g => g.id))); return v; },
      canDelete: it => { const n = D.products.filter(p => p.cat === it.id).length; return n ? `Danh mục này còn ${n} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.` : ''; },
      summary: it => ({ img: it.img, contain: true, title: it.name, sub: `${D.groups.find(g => g.id === it.group)?.name || ''} · ${D.products.filter(p => p.cat === it.id).length} sản phẩm` })
    },
    slides: {
      title: 'Banner lớn (slider)', desc: 'Banner chạy tự động ở đầu trang. Nên có 2 đến 5 banner.',
      get: () => D.slides,
      fields: () => [
        { key: 'eyebrow', label: 'Dòng nhỏ phía trên', placeholder: 'VD: Hàng mới về' },
        { key: 'title', label: 'Tiêu đề lớn' },
        { key: 'subtitle', label: 'Tiêu đề phụ' },
        { key: 'deal', label: 'Nút ưu đãi', placeholder: 'VD: Giảm đến 30%' },
        { key: 'text', label: 'Mô tả ngắn', full: true },
        { key: 'color', label: 'Màu nền', type: 'tone', full: true },
        { key: 'photo', label: 'Ảnh nền lớn (tùy chọn)', type: 'image', full: true, hint: 'Nếu có ảnh nền, banner dùng ảnh này thay cho 3 ảnh sản phẩm.' },
        { key: 'images', label: 'Ảnh sản phẩm (tối đa 3)', type: 'gallery', full: true },
        { key: 'link', label: 'Bấm vào banner sẽ tới', type: 'select', options: linkOptions(), full: true }
      ],
      make: () => ({ eyebrow: '', title: '', subtitle: '', text: '', deal: '', images: [], photo: '', color: 'lavender', link: '#shop' }),
      summary: it => ({ img: it.photo || it.images?.[0] || '', title: `${it.title} ${it.subtitle || ''}`, sub: `<span class="swatch tone-${esc(it.color)}"></span>${esc(it.eyebrow || '')} · ${esc(it.deal || '')}` })
    },
    miniBanners: {
      title: 'Banner nhỏ bên phải', desc: '3 banner nhỏ cạnh slider (chỉ hiện trên máy tính).', max: 3,
      get: () => D.miniBanners,
      fields: () => [
        { key: 'title', label: 'Tiêu đề' },
        { key: 'text', label: 'Nội dung' },
        { key: 'color', label: 'Màu nền', type: 'tone', full: true },
        { key: 'img', label: 'Ảnh', type: 'image', full: true, hint: 'Để trống sẽ hiện biểu tượng xe giao hàng.' },
        { key: 'link', label: 'Bấm vào sẽ tới', type: 'select', options: linkOptions(), full: true }
      ],
      make: () => ({ title: '', text: '', img: '', color: 'pink', link: '#shop' }),
      summary: it => ({ img: it.img, contain: true, title: it.title, sub: `<span class="swatch tone-${esc(it.color)}"></span>${esc(it.text)}` })
    },
    promos: {
      title: 'Hàng banner khuyến mãi', desc: '4 banner nhỏ nằm dưới Flash Sale.',
      get: () => D.promos,
      fields: () => [
        { key: 'label', label: 'Nhãn nhỏ', placeholder: 'VD: Quà biếu' },
        { key: 'title', label: 'Tiêu đề' },
        { key: 'color', label: 'Màu nền', type: 'tone', full: true },
        { key: 'img', label: 'Ảnh', type: 'image', full: true },
        { key: 'link', label: 'Bấm vào sẽ tới', type: 'select', options: linkOptions(), full: true }
      ],
      make: () => ({ label: '', title: '', img: '', color: 'peach', link: '#shop' }),
      summary: it => ({ img: it.img, contain: true, title: it.title, sub: `<span class="swatch tone-${esc(it.color)}"></span>${esc(it.label)}` })
    },
    groups: {
      title: 'Các khu sản phẩm trên trang chủ', desc: 'Mỗi khu có một banner dọc và lưới sản phẩm của các danh mục thuộc khu đó.',
      get: () => D.groups,
      fields: () => [
        { key: 'name', label: 'Tên khu', full: true },
        { key: 'bannerTag', label: 'Nhãn banner' },
        { key: 'bannerTitle', label: 'Tiêu đề banner' },
        { key: 'color', label: 'Màu banner', type: 'tone', full: true },
        { key: 'bannerImages', label: 'Ảnh trên banner (2 ảnh)', type: 'gallery', full: true }
      ],
      make: () => ({ id: '', name: '', bannerTag: '', bannerTitle: '', bannerImages: [], color: 'lavender' }),
      beforeSave: (v, old) => { if (!old.id) v.id = uniqueId(slug(v.name), D.groups.map(g => g.id).concat(D.categories.map(c => c.id))); return v; },
      canDelete: it => { const n = D.categories.filter(c => c.group === it.id).length; return n ? `Khu này còn ${n} danh mục. Hãy chuyển danh mục sang khu khác trước khi xóa.` : ''; },
      summary: it => ({ img: it.bannerImages?.[0] || '', contain: true, title: it.name, sub: `<span class="swatch tone-${esc(it.color)}"></span>${esc(it.bannerTitle)}` })
    },
    vouchers: {
      title: 'Mã giảm giá', desc: 'Khách bấm "Lưu mã" hoặc nhập mã trong giỏ hàng.',
      get: () => D.vouchers,
      fields: () => [
        { key: 'code', label: 'Mã', placeholder: 'VD: JAJU10', hint: 'Viết liền, không dấu.' },
        { key: 'type', label: 'Loại giảm', type: 'select', options: [['amount', 'Giảm số tiền ($)'], ['percent', 'Giảm theo %'], ['ship', 'Miễn phí vận chuyển']] },
        { key: 'value', label: 'Mức giảm', type: 'number', hint: 'Số tiền hoặc số %. Bỏ qua nếu là miễn phí vận chuyển.' },
        { key: 'min', label: 'Đơn tối thiểu ($)', type: 'number' },
        { key: 'title', label: 'Tiêu đề', placeholder: 'VD: Giảm $10' },
        { key: 'note', label: 'Điều kiện hiển thị', placeholder: 'VD: Đơn hàng từ $99' },
        { key: 'big', label: 'Chữ lớn trên phiếu', placeholder: 'VD: $10' },
        { key: 'small', label: 'Chữ nhỏ trên phiếu', placeholder: 'VD: GIẢM' }
      ],
      make: () => ({ code: '', type: 'amount', value: 5, min: 50, title: '', note: '', big: '', small: 'GIẢM' }),
      beforeSave: (v, old) => {
        v.code = v.code.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
        if (!v.code) { toast('Vui lòng nhập mã'); return null; }
        if (D.vouchers.some(x => x !== old && x.code === v.code)) { toast('Mã này đã tồn tại'); return null; }
        v.value = v.value || 0; v.min = v.min || 0;
        if (!v.big) v.big = v.type === 'ship' ? 'FREE' : v.type === 'percent' ? v.value + '%' : '$' + v.value;
        if (!v.small) v.small = v.type === 'ship' ? 'SHIP' : 'GIẢM';
        return v;
      },
      summary: it => ({ title: `${it.code} · ${it.title}`, sub: esc(it.note) })
    },
    posts: {
      title: 'Bài viết cẩm nang', desc: 'Hiện ở mục Cẩm nang cuối trang. Có thể dẫn link tới bài đăng Facebook.',
      get: () => D.posts,
      fields: () => [
        { key: 'title', label: 'Tiêu đề', full: true },
        { key: 'tag', label: 'Chủ đề', placeholder: 'VD: Làm đẹp' },
        { key: 'date', label: 'Ngày đăng', placeholder: 'VD: 15/10/2026' },
        { key: 'img', label: 'Ảnh', type: 'image', full: true },
        { key: 'link', label: 'Link bài viết', full: true, placeholder: 'Dán link bài Facebook hoặc để trống' }
      ],
      make: () => ({ title: '', tag: '', date: new Date().toLocaleDateString('vi-VN'), img: '', link: '' }),
      summary: it => ({ img: it.img, title: it.title, sub: `${esc(it.tag)} · ${esc(it.date)}` })
    }
  };

  function editListItem(key, i) {
    const cfg = LISTS[key], arr = cfg.get();
    const isNew = i == null;
    const old = isNew ? cfg.make() : arr[i];
    openDialog((isNew ? 'Thêm: ' : 'Sửa: ') + cfg.title.toLowerCase(), `<div class="form">${cfg.fields().map(f => field(f, old[f.key])).join('')}</div>`, () => {
      let v = { ...old, ...readForm($('[data-dialog-body]')) };
      if (v.images) v.images = v.images.slice(0, 3);
      if (cfg.beforeSave) v = cfg.beforeSave(v, old);
      if (!v) return false;
      const first = cfg.fields()[0];
      if (first && !first.type && !String(v[first.key] || '').trim()) { toast('Vui lòng nhập ' + first.label.toLowerCase()); return false; }
      if (isNew) arr.push(v); else arr[i] = v;
      save('Đã lưu');
      route();
      return true;
    });
  }

  VIEWS.categories = () => { $('[data-content]').innerHTML = listCard({ key: 'categories', ...LISTS.categories }) + listCard({ key: 'groups', ...LISTS.groups }); };
  VIEWS.vouchers = () => { $('[data-content]').innerHTML = listCard({ key: 'vouchers', ...LISTS.vouchers }); };
  VIEWS.posts = () => { $('[data-content]').innerHTML = listCard({ key: 'posts', ...LISTS.posts }); };
  VIEWS.banners = () => {
    const sp = D.spotlight || {};
    $('[data-content]').innerHTML =
      listCard({ key: 'slides', ...LISTS.slides }) +
      listCard({ key: 'miniBanners', ...LISTS.miniBanners }) +
      listCard({ key: 'promos', ...LISTS.promos }) + `
      <div class="card">
        <div class="card__head"><div><h2>Sản phẩm nổi bật</h2><p>Khối lớn giới thiệu một sản phẩm, nằm sau khu sản phẩm đầu tiên.</p></div></div>
        <form class="form" data-spotlight-form>
          ${field({ key: 'productId', label: 'Sản phẩm', type: 'select', options: [['', '(Không hiện)'], ...D.products.map(p => [p.id, p.name])], full: true }, sp.productId)}
          ${field({ key: 'label', label: 'Nhãn', placeholder: 'Sản phẩm nổi bật' }, sp.label)}
          <div></div>
          ${field({ key: 'image', label: 'Ảnh lớn', type: 'image', full: true }, sp.image)}
          <div class="field--full"><button class="btn" type="submit">Lưu sản phẩm nổi bật</button></div>
        </form>
      </div>` +
      listCard({ key: 'groups', ...LISTS.groups });
  };

  /* ================= Trang: Thông tin cửa hàng ================= */
  const SETTING_FIELDS = [
    { key: 'shopName', label: 'Tên cửa hàng' },
    { key: 'promoText', label: 'Dòng khuyến mãi trên cùng' },
    { key: 'tagline', label: 'Giới thiệu ngắn (chân trang)', type: 'textarea', full: true, rows: 2 },
    { key: 'hotlineDisplay', label: 'Hotline hiển thị', placeholder: '832-863-2592' },
    { key: 'hotline', label: 'Số gọi (có mã vùng)', placeholder: '+18328632592', hint: 'Dùng cho nút gọi trên điện thoại.' },
    { key: 'email', label: 'Email' },
    { key: 'facebook', label: 'Link Facebook' },
    { key: 'address', label: 'Địa chỉ', full: true },
    { key: 'zelleName', label: 'Zelle: tên tài khoản' },
    { key: 'zellePhone', label: 'Zelle: số điện thoại' },
    { key: 'venmo', label: 'Venmo' },
    { key: 'followers', label: 'Số người theo dõi', placeholder: '7.000' },
    { key: 'freeship', label: 'Miễn phí vận chuyển cho đơn từ ($)', type: 'number' },
    { key: 'shippingFee', label: 'Phí vận chuyển ($)', type: 'number' },
    { key: 'hotKeys', label: 'Từ khóa gợi ý dưới ô tìm kiếm', type: 'tags', full: true },
    { key: 'footerNote', label: 'Ghi chú cuối trang', type: 'textarea', full: true, rows: 2 }
  ];
  VIEWS.settings = () => {
    $('[data-content]').innerHTML = `
      <div class="card">
        <div class="card__head"><h2>Thông tin cửa hàng</h2></div>
        <form class="form" data-settings-form>
          ${SETTING_FIELDS.map(f => field(f, D.settings[f.key])).join('')}
          <div class="field--full"><button class="btn" type="submit">Lưu thông tin</button></div>
        </form>
      </div>
      <div class="card">
        <div class="card__head"><div><h2>Đổi mật khẩu quản trị</h2><p>Mật khẩu mới có hiệu lực sau khi xuất bản.</p></div></div>
        <form class="form" data-password-form>
          ${field({ key: 'pw1', label: 'Mật khẩu mới', type: 'password' }, '')}
          ${field({ key: 'pw2', label: 'Nhập lại mật khẩu mới', type: 'password' }, '')}
          <div class="field--full"><button class="btn" type="submit">Đổi mật khẩu</button></div>
        </form>
      </div>`;
  };

  /* ================= Trang: Màu sắc ================= */
  VIEWS.theme = () => {
    const t = D.settings.theme || {};
    const cur = PRESETS.find(p => p.primary === t.primary && p.accent === t.accent);
    $('[data-content]').innerHTML = `
      <div class="card">
        <div class="card__head"><div><h2>Bộ màu có sẵn</h2><p>Chọn một bộ màu, sau đó bấm Xem trước để xem trên website.</p></div></div>
        <div class="presets">
          ${PRESETS.map((p, i) => `<button class="preset ${cur === p ? 'is-active' : ''}" data-preset="${i}">
            <div class="preset__bar"><i style="background:${p.primary}"></i><i style="background:${p.accent}"></i><i style="background:${p.bg}"></i></div>
            <b>${p.name}</b></button>`).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card__head"><h2>Tự chọn màu</h2></div>
        <div class="form">
          <div class="field"><label>Màu nhấn</label><div class="color-row"><input type="color" data-color="accent" value="${t.accent || '#e2589a'}"><span class="hint">Nút bấm, ô tìm kiếm, chip danh mục</span></div></div>
          <div class="field"><label>Màu đậm</label><div class="color-row"><input type="color" data-color="primary" value="${t.primary || '#4b2a63'}"><span class="hint">Icon giỏ hàng, dải chân trang</span></div></div>
          <div class="field"><label>Màu nền trang</label><div class="color-row"><input type="color" data-color="bg" value="${t.bg || '#f9ecf3'}"><span class="hint">Nên chọn màu rất nhạt</span></div></div>
        </div>
        <div class="theme-demo" style="margin-top:16px;background:${t.bg}">
          <div class="theme-demo__strip" style="background:${t.primary};color:#fff">Xem thử màu</div>
          <div class="theme-demo__body">
            <span class="theme-demo__btn" style="background:${t.accent}">Mua ngay</span>
            <span class="theme-demo__tag" style="background:${t.primary}">Thêm vào giỏ</span>
            <b style="color:${t.accent};font-size:18px">FLASH SALE</b>
          </div>
        </div>
      </div>`;
  };

  /* ================= Trang: Xuất bản ================= */
  VIEWS.publish = () => {
    const gh = ls.get(GH_KEY, { owner: 'sucalb', repo: 'JaJuBoutique', branch: 'main', token: '' });
    $('[data-content]').innerHTML = `
      ${isDirty() ? '<div class="notice">Có thay đổi chưa xuất bản.</div>' : '<div class="notice notice--ok">Website đang hiển thị đúng nội dung mới nhất.</div>'}
      <div class="card">
        <div class="card__head"><div><h2>Xuất bản lên website</h2><p>Ghi nội dung và ảnh mới lên GitHub. Website cập nhật sau khoảng 1 phút.</p></div></div>
        <div class="toolbar">
          <button class="btn" data-action="publish">${svg('publish')}Xuất bản ngay</button>
          <button class="btn btn--ghost" data-action="preview">Xem trước</button>
        </div>
        <div class="publish-log" data-log hidden></div>
      </div>
      <div class="card">
        <div class="card__head"><div><h2>Kết nối GitHub</h2><p>Chỉ cần cài một lần trên mỗi máy. Mã truy cập chỉ lưu trong trình duyệt này.</p></div></div>
        <form class="form" data-gh-form>
          ${field({ key: 'owner', label: 'Tài khoản GitHub' }, gh.owner)}
          ${field({ key: 'repo', label: 'Tên repo' }, gh.repo)}
          ${field({ key: 'branch', label: 'Nhánh' }, gh.branch)}
          ${field({ key: 'token', label: 'Mã truy cập (token)', type: 'password', hint: 'Tạo tại GitHub: Settings → Developer settings → Fine-grained tokens, chọn repo này, quyền Contents: Read and write.' }, gh.token)}
          <div class="field--full toolbar"><button class="btn" type="submit">Lưu kết nối</button><button class="btn btn--ghost" type="button" data-action="test-gh">Kiểm tra kết nối</button></div>
        </form>
      </div>
      <div class="card">
        <div class="card__head"><div><h2>Sao lưu</h2><p>Tải toàn bộ nội dung về máy hoặc khôi phục từ file sao lưu.</p></div></div>
        <div class="toolbar">
          <button class="btn btn--ghost" data-action="export">Tải file sao lưu</button>
          <label class="btn btn--ghost">Khôi phục từ file<input type="file" accept=".json,application/json" hidden data-import></label>
          <button class="btn btn--danger" data-action="discard">Bỏ thay đổi, lấy lại bản đang chạy</button>
        </div>
      </div>`;
  };

  /* ---------- GitHub ---------- */
  function ghCfg() { const g = ls.get(GH_KEY, null); return g && g.token && g.owner && g.repo ? g : null; }
  async function gh(path, opt = {}) {
    const g = ghCfg();
    const res = await fetch(`https://api.github.com/repos/${g.owner}/${g.repo}${path}`, {
      ...opt,
      headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${g.token}`, 'Content-Type': 'application/json', ...(opt.headers || {}) },
      body: opt.body ? JSON.stringify(opt.body) : undefined
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`${res.status} ${res.status === 401 ? 'Token không hợp lệ hoặc đã hết hạn' : res.status === 403 ? 'Token không có quyền ghi vào repo này' : res.status === 404 ? 'Không tìm thấy repo hoặc nhánh, hoặc token không được cấp quyền cho repo này' : res.status === 409 ? 'Repo vừa thay đổi, hãy thử xuất bản lại' : t.slice(0, 160)}`);
    }
    return res.json();
  }
  const utf8b64 = str => { const b = new TextEncoder().encode(str); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); };

  let publishing = false;
  async function publish() {
    if (publishing) return;
    if (!ghCfg()) { location.hash = '#publish'; toast('Hãy kết nối GitHub trước khi xuất bản'); return; }
    if (staleDraft && !(await confirmBox('Bản nháp trên máy này được tạo từ phiên bản website cũ hơn bản đang chạy (có thể đã có người xuất bản từ máy khác). Xuất bản sẽ ghi đè các thay đổi đó. Tiếp tục?', 'Vẫn xuất bản'))) return;
    if (!isDirty() && !(await confirmBox('Không có thay đổi mới. Vẫn xuất bản lại?', 'Xuất bản'))) return;
    publishing = true;
    $$('[data-action="publish"]').forEach(b => { b.disabled = true; });
    if (location.hash !== '#publish') location.hash = '#publish';
    await new Promise(r => setTimeout(r, 50));
    const log = $('[data-log]'); log.hidden = false; log.textContent = '';
    const say = m => { log.textContent += m + '\n'; log.scrollTop = log.scrollHeight; };
    $$('[data-action="publish"]').forEach(b => { b.disabled = true; });
    try {
      const g = ghCfg();
      const data = clone(D);
      // Gom ảnh mới tải lên thành file riêng
      const files = [];
      const seen = new Map();
      const stamp = Date.now().toString(36);
      const walk = o => {
        for (const k in o) {
          const v = o[k];
          if (typeof v === 'string' && v.startsWith('data:image/')) {
            if (!seen.has(v)) { const path = `assets/img/uploads/${stamp}-${seen.size + 1}.jpg`; seen.set(v, path); files.push({ path, b64: v.split(',')[1] }); }
            o[k] = seen.get(v);
          } else if (v && typeof v === 'object') walk(v);
        }
      };
      walk(data);
      files.push({ path: 'data/store.js', b64: utf8b64('window.JAJU_STORE = ' + JSON.stringify(data, null, 2) + ';\n') });
      say(`Chuẩn bị ${files.length} file (${files.length - 1} ảnh mới)...`);

      const ref = await gh(`/git/ref/heads/${g.branch}`);
      const head = ref.object.sha;
      const commit = await gh(`/git/commits/${head}`);
      const tree = [];
      for (const f of files) {
        const blob = await gh('/git/blobs', { method: 'POST', body: { content: f.b64, encoding: 'base64' } });
        tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
        say('Đã tải lên ' + f.path);
      }
      const newTree = await gh('/git/trees', { method: 'POST', body: { base_tree: commit.tree.sha, tree } });
      const newCommit = await gh('/git/commits', { method: 'POST', body: { message: 'Cập nhật nội dung cửa hàng từ trang quản trị', tree: newTree.sha, parents: [head] } });
      await gh(`/git/refs/heads/${g.branch}`, { method: 'PATCH', body: { sha: newCommit.sha } });
      // Giữ những chỉnh sửa làm trong lúc đang xuất bản, chỉ thay đường dẫn ảnh đã tải lên
      const swap = o => { for (const k in o) { const v = o[k]; if (typeof v === 'string' && seen.has(v)) o[k] = seen.get(v); else if (v && typeof v === 'object') swap(v); } };
      swap(D);
      BASE = clone(data); ls.set(BASE_KEY, stable(BASE)); save();
      say('Xuất bản thành công. Website sẽ cập nhật sau khoảng 1 phút.');
      toast('Đã xuất bản');
    } catch (err) {
      say('Lỗi: ' + err.message);
      toast('Xuất bản chưa thành công');
    } finally {
      publishing = false;
      $$('[data-action="publish"]').forEach(b => { b.disabled = false; });
    }
  }

  /* ================= Sự kiện chung ================= */
  document.addEventListener('click', async e => {
    const t = e.target.closest('button, a, [data-preset]');
    if (!t) return;
    const d = t.dataset;

    if (d.action === 'close-dialog') { closeDialog(); return; }
    if (d.action === 'dialog-save') { if (dialogSave && dialogSave() !== false) closeDialog(); return; }
    if (d.action === 'toggle-side') { $('[data-side]').classList.toggle('is-open'); return; }
    if (d.action === 'logout') { try { sessionStorage.removeItem(SESSION_KEY); } catch { /* bỏ qua */ } location.reload(); return; }
    if (d.action === 'preview') { save(); if (saveFailed) return; window.open('index.html?preview=1', '_blank'); return; }
    if (d.action === 'publish') { publish(); return; }
    if (d.action === 'new-product') { e.preventDefault(); if (currentPage() !== 'products') location.hash = '#products'; setTimeout(() => editProduct(null), 30); return; }
    if (d.action === 'export') {
      const blob = new Blob([JSON.stringify(D, null, 2)], { type: 'application/json' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `jaju-sao-luu-${new Date().toISOString().slice(0, 10)}.json` });
      a.click(); URL.revokeObjectURL(a.href); return;
    }
    if (d.action === 'discard') {
      if (await confirmBox('Bỏ toàn bộ thay đổi chưa xuất bản và lấy lại nội dung đang chạy trên website?', 'Bỏ thay đổi')) { D = clone(BASE); ls.del(DRAFT_KEY); ls.del(BASE_KEY); route(); toast('Đã khôi phục bản đang chạy'); }
      return;
    }
    if (d.action === 'test-gh') {
      const v = readForm($('[data-gh-form]')); ls.set(GH_KEY, v);
      try { const r = await gh(''); toast(r.permissions?.push ? 'Kết nối thành công, có quyền ghi' : 'Kết nối được nhưng token chưa có quyền ghi'); }
      catch (err) { toast('Kết nối thất bại: ' + err.message); }
      return;
    }
    if (d.editProduct != null) { editProduct(+d.editProduct); return; }
    if (d.dupProduct != null) { const p = clone(D.products[+d.dupProduct]); p.id = uid('p'); p.name += ' (bản sao)'; D.products.splice(+d.dupProduct + 1, 0, p); save('Đã nhân bản'); VIEWS.products(); return; }
    if (d.listAdd) { editListItem(d.listAdd, null); return; }
    if (d.listEdit) { editListItem(d.listEdit, +d.i); return; }
    if (d.move) {
      const arr = d.move === 'products' ? D.products : LISTS[d.move].get();
      const i = +d.i, j = i + +d.d;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      save(); route(); return;
    }
    if (d.del) {
      const arr = d.del === 'products' ? D.products : LISTS[d.del].get();
      const it = arr[+d.i];
      const block = LISTS[d.del]?.canDelete?.(it);
      if (block) { openDialog('Chưa xóa được', `<p>${block}</p>`); return; }
      if (await confirmBox(`Xóa "${esc(it.name || it.title || it.code)}"?`, 'Xóa')) { arr.splice(+d.i, 1); save('Đã xóa'); route(); }
      return;
    }
    if (d.preset != null) {
      const p = PRESETS[+d.preset];
      D.settings.theme = { primary: p.primary, accent: p.accent, bg: p.bg };
      save('Đã chọn bộ màu ' + p.name); VIEWS.theme(); return;
    }
  });

  document.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.toggleFlash != null) { D.products[+t.dataset.toggleFlash].flash = t.checked; save(); }
    if (t.dataset.toggleShow != null) { D.products[+t.dataset.toggleShow].hidden = !t.checked; save(); t.closest('tr').classList.toggle('is-hidden', !t.checked); }
    if (t.matches('[data-prod-cat]')) { prodState.cat = t.value; VIEWS.products(); }
    if (t.matches('[data-color]')) { D.settings.theme = { ...D.settings.theme, [t.dataset.color]: t.value }; save(); VIEWS.theme(); }
    if (t.matches('[data-import]')) {
      const f = t.files[0]; if (!f) return;
      f.text().then(txt => {
        const data = JSON.parse(txt.replace(/^window\.JAJU_STORE\s*=\s*/, '').replace(/;\s*$/, ''));
        if (!data.settings || !Array.isArray(data.products)) throw new Error('File không đúng định dạng');
        D = normalize(data); save('Đã khôi phục từ file'); route();
      }).catch(err => toast('Không đọc được file: ' + err.message));
    }
  });

  let searchT;
  document.addEventListener('input', e => {
    if (e.target.matches('[data-prod-search]')) {
      clearTimeout(searchT);
      searchT = setTimeout(() => { prodState.q = e.target.value; VIEWS.products(); const s = $('[data-prod-search]'); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }, 250);
    }
  });

  document.addEventListener('submit', async e => {
    const f = e.target;
    if (f.matches('[data-settings-form]')) {
      e.preventDefault();
      Object.assign(D.settings, readForm(f));
      save('Đã lưu thông tin cửa hàng');
    } else if (f.matches('[data-spotlight-form]')) {
      e.preventDefault();
      D.spotlight = readForm(f);
      save('Đã lưu sản phẩm nổi bật');
    } else if (f.matches('[data-password-form]')) {
      e.preventDefault();
      const v = readForm(f);
      if (v.pw1.length < 6) { toast('Mật khẩu cần ít nhất 6 ký tự'); return; }
      if (v.pw1 !== v.pw2) { toast('Hai mật khẩu chưa khớp'); return; }
      D.settings.adminHash = await sha256(v.pw1);
      f.reset(); save('Đã đổi mật khẩu, hãy xuất bản để áp dụng');
    } else if (f.matches('[data-gh-form]')) {
      e.preventDefault();
      ls.set(GH_KEY, readForm(f));
      toast('Đã lưu kết nối GitHub');
    }
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('[data-dialog]').hidden) closeDialog(); });

  let toastT;
  function toast(msg) {
    const t = $('[data-toast]');
    t.textContent = msg; t.classList.add('is-show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('is-show'), 2600);
  }

  /* ================= Khởi động ================= */
  let loggedIn = false;
  try { loggedIn = sessionStorage.getItem(SESSION_KEY) === '1'; } catch { /* bỏ qua */ }
  if (loggedIn) showApp(); else { $('[data-login]').hidden = false; $('[data-login-form] input').focus(); }
})();
