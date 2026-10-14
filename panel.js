(function () {
  const dn = globalThis.__dn;
  let host = null;
  let labelEl = null;
  let textareaEl = null;
  let editorEl = null;
  let upBtn = null;
  let downBtn = null;
  let prevBtn = null;
  let nextBtn = null;
  let shiftPrevBtn = null;
  let shiftNextBtn = null;
  let removeBtn = null;
  let pageBtn = null;
  let treeEl = null;

  const css = `
    :host { all: initial; display: block; }
    :host([hidden]) { display: none !important; }
    * { box-sizing: border-box; }
    .panel {
      display: flex;
      flex-direction: column;
      max-height: 70vh;
      background: #1f1f1f;
      color: #f3f3f3;
      border: 1px solid #3c3c3c;
      border-radius: 12px;
      box-shadow: 0 12px 40px rgba(0,0,0,.4);
      font: 12px/1.4 system-ui, sans-serif;
      overflow: hidden;
      color-scheme: dark;
    }
    .head, .nav { display: flex; align-items: center; gap: 4px; }
    .head {
      padding: 8px;
      cursor: grab;
      background: #2a2a2a;
      user-select: none;
    }
    .label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 650;
    }
    button, input[type="color"] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #5a5a5a;
      background: #3a3a3a;
      color: #f3f3f3;
      border-radius: 6px;
      padding: 6px 8px;
      min-height: 28px;
      cursor: pointer;
      font: inherit;
      visibility: visible;
    }
    button:hover { background: #4a4a4a; }
    button:disabled { opacity: .35; cursor: default; }
    button.is-on { background: #ff8c00; color: #1a1a1a; border-color: #ff8c00; }
    button.tab { background: #16324a; border-color: #2c6288; color: #d7ebf7; }
    button.tab:hover { background: #1d4666; }
    button.tab.is-on { background: #2c6288; border-color: #8fd0ef; color: #fff; }
    button.style-chip.is-off { color: #9a9a9a; text-decoration: line-through; }
    button.icon { display: inline-flex; align-items: center; justify-content: center; padding: 4px 6px; }
    button.icon svg { display: block; }
    .nav { padding: 8px; }
    .nav button { flex: 1; min-width: 0; padding: 6px 2px; }
    .editor { overflow: auto; max-height: 42vh; border-top: 1px solid #333; }
    .editor[hidden] { display: none !important; }
    .tabs {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      gap: 4px;
      padding: 8px 8px 0;
    }
    .tabs button { flex: 0 0 auto; width: auto; min-height: 0; padding: 3px 7px; }
    .tab-body, .stack { display: flex; flex-direction: column; gap: 8px; }
    .tab-body { padding: 8px; }
    .row, .group, .chips { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .name { width: 132px; flex: 0 0 132px; color: #ccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .val { min-width: 52px; text-align: center; color: #ddd; }
    .slide-row { flex-wrap: nowrap; }
    input[type="range"] { flex: 1; min-width: 0; accent-color: #ff8c00; }
    .cap { color: #9a9a9a; }
    .chip.is-off { opacity: .45; text-decoration: line-through; }
    .empty { color: #9a9a9a; margin: 0; }
    .audit-row { display: flex; justify-content: space-between; gap: 8px; }
    .audit-row span:last-child { color: #ffb15a; }
    .tree-host { min-width: 0; }
    .tree-host.is-panning, .tree-host.is-panning * { cursor: move !important; }
    .tree-wrap { max-height: 22vh; min-width: 0; overflow: auto; overflow-anchor: none; padding: 8px; border-top: 1px solid #333; }
    .tree-branch {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex: 0 0 auto;
      gap: 2px;
    }
    .tree-row {
      display: flex;
      flex-wrap: nowrap;
      align-items: flex-start;
      gap: 4px;
      width: max-content;
      min-width: max-content;
      margin: 0;
      padding-left: 10px;
    }
    .tree-branch > button {
      flex: 0 0 auto;
      width: auto;
      margin: 0;
      padding: 4px 6px;
      justify-content: flex-start;
      white-space: nowrap;
    }
    .tree-branch > button.is-path { border-color: #8fd0ef; }
    .tree-line { display: flex; align-items: center; gap: 4px; }
    .tree-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: #2c6288;
      color: #d7ebf7;
      font-size: 10px;
      line-height: 16px;
    }
    textarea {
      margin: 0 8px 8px;
      min-height: 72px;
      resize: vertical;
      background: #111;
      color: #ddd;
      border: 1px solid #333;
      border-radius: 8px;
      font: 11px/1.4 ui-monospace, monospace;
      padding: 6px;
    }
    input[type="color"] { padding: 0; width: 36px; height: 26px; background: transparent; }
  `;

  function iconButton(className, title, action, path) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.title = title;
    button.dataset.act = action;
    button.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="' + path + '"></path></svg>';
    return button;
  }

  function ensure() {
    if (host) {
      return;
    }
    host = document.createElement('div');
    host.id = dn.HOST_ID;
    host.style.setProperty('position', 'fixed', 'important');
    host.style.setProperty('top', '16px', 'important');
    host.style.setProperty('right', '16px', 'important');
    host.style.setProperty('z-index', '2147483647', 'important');
    host.style.setProperty('width', '380px', 'important');
    host.style.setProperty('max-width', 'calc(100vw - 24px)', 'important');
    const shadow = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = css;
    const panel = document.createElement('div');
    panel.className = 'panel';

    const head = document.createElement('div');
    head.className = 'head';
    labelEl = document.createElement('span');
    labelEl.className = 'label';
    const copyBtn = iconButton(
      'icon',
      'Copy',
      'C',
      'M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'
    );
    removeBtn = iconButton(
      'icon',
      'Cut',
      'B',
      'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z'
    );
    const pasteBtn = iconButton(
      'icon',
      'Paste',
      'paste',
      'M19 2h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z'
    );
    pageBtn = iconButton(
      'icon',
      'Click the page',
      'page',
      'M4 1.5l14.5 8.2-6.4 1.2-2.4 6.6L4 1.5z'
    );
    const printBtn = iconButton(
      'icon',
      'Print DOM',
      'print',
      'M6 9V3h12v6h2a2 2 0 0 1 2 2v5h-4v5H6v-5H2v-5a2 2 0 0 1 2-2h2zm2-4v4h8V5H8zm0 10v4h8v-4H8z'
    );
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.dataset.act = 'close';
    closeBtn.title = 'Close';
    closeBtn.textContent = '×';
    head.append(labelEl, copyBtn, removeBtn, pasteBtn, pageBtn, printBtn, closeBtn);

    const nav = document.createElement('div');
    nav.className = 'nav';
    upBtn = navButton('up', 'Parent', '↑');
    downBtn = navButton('down', 'Child', '↓');
    prevBtn = navButton('prev', 'Previous sibling', '←');
    nextBtn = navButton('next', 'Next sibling', '→');
    shiftPrevBtn = navButton('shift-prev', 'Move before previous sibling', '«');
    shiftNextBtn = navButton('shift-next', 'Move after next sibling', '»');
    nav.append(upBtn, downBtn, prevBtn, nextBtn, shiftPrevBtn, shiftNextBtn);

    treeEl = document.createElement('div');
    treeEl.className = 'tree-host';
    treeEl.addEventListener('pointerdown', onTreePan);

    editorEl = document.createElement('div');
    editorEl.className = 'editor';
    editorEl.hidden = false;

    textareaEl = document.createElement('textarea');
    textareaEl.readOnly = true;
    textareaEl.spellcheck = false;
    textareaEl.setAttribute('aria-label', 'Element without children');

    panel.append(head, nav, treeEl, editorEl, textareaEl);
    shadow.append(style, panel);
    document.documentElement.appendChild(host);

    head.addEventListener('pointerdown', onDragStart);
    head.addEventListener('click', onHeadClick);
    nav.addEventListener('click', onNavClick);
  }

  function navButton(name, title, text) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.nav = name;
    button.title = title;
    button.textContent = text;
    return button;
  }

  function onTreePan(event) {
    if (event.button !== 0 || event.target.closest('button')) {
      return;
    }
    const wrap = treeEl.querySelector('.tree-wrap');
    if (!wrap) {
      return;
    }
    const originX = event.clientX;
    const originY = event.clientY;
    const startLeft = wrap.scrollLeft;
    const startTop = wrap.scrollTop;
    treeEl.classList.add('is-panning');
    treeEl.setPointerCapture(event.pointerId);
    event.preventDefault();

    function onMove(ev) {
      wrap.scrollLeft = startLeft - (ev.clientX - originX);
      wrap.scrollTop = startTop - (ev.clientY - originY);
    }

    function onUp(ev) {
      treeEl.removeEventListener('pointermove', onMove);
      treeEl.removeEventListener('pointerup', onUp);
      treeEl.removeEventListener('pointercancel', onUp);
      treeEl.classList.remove('is-panning');
      if (treeEl.hasPointerCapture(ev.pointerId)) {
        treeEl.releasePointerCapture(ev.pointerId);
      }
    }

    treeEl.addEventListener('pointermove', onMove);
    treeEl.addEventListener('pointerup', onUp);
    treeEl.addEventListener('pointercancel', onUp);
  }

  function onDragStart(event) {
    if (event.button !== 0 || event.target.closest('button')) {
      return;
    }
    const header = event.currentTarget;
    const rect = host.getBoundingClientRect();
    const originX = event.clientX;
    const originY = event.clientY;
    const startLeft = rect.left;
    const startTop = rect.top;
    host.style.setProperty('right', 'auto', 'important');
    header.setPointerCapture(event.pointerId);
    header.style.cursor = 'grabbing';

    function onMove(ev) {
      const left = startLeft + ev.clientX - originX;
      const top = startTop + ev.clientY - originY;
      host.style.setProperty('left', Math.max(8, Math.min(left, window.innerWidth - 80)) + 'px', 'important');
      host.style.setProperty('top', Math.max(8, Math.min(top, window.innerHeight - 40)) + 'px', 'important');
    }

    function onUp(ev) {
      header.removeEventListener('pointermove', onMove);
      header.removeEventListener('pointerup', onUp);
      header.removeEventListener('pointercancel', onUp);
      header.style.cursor = '';
      if (header.hasPointerCapture(ev.pointerId)) {
        header.releasePointerCapture(ev.pointerId);
      }
    }

    header.addEventListener('pointermove', onMove);
    header.addEventListener('pointerup', onUp);
    header.addEventListener('pointercancel', onUp);
  }

  function selectedElement() {
    const element = dn.state.selected;
    if (!element || !element.isConnected) {
      return null;
    }
    return element;
  }

  function refresh() {
    if (!host || host.hidden) {
      return;
    }
    const element = selectedElement();
    if (!element) {
      return;
    }
    const html = dn.shallowHtml(element);
    dn.state.shallow = html;
    labelEl.textContent = dn.describe(element);
    labelEl.title = dn.describe(element);
    textareaEl.value = html;
    upBtn.disabled = element === document.documentElement;
    downBtn.disabled = !dn.canDescend(element);
    removeBtn.disabled = !dn.canRemove(element);
    const hasSiblings = !!dn.sibling(element, 1);
    prevBtn.disabled = !hasSiblings;
    nextBtn.disabled = !hasSiblings;
    shiftPrevBtn.disabled = !dn.canMove(element, -1);
    shiftNextBtn.disabled = !dn.canMove(element, 1);
    if (typeof dn.renderTree === 'function') {
      dn.renderTree(treeEl, element);
    }
    if (typeof dn.renderEditor === 'function') {
      dn.renderEditor(editorEl, element);
    }
    if (pageBtn) {
      pageBtn.classList.toggle('is-on', !!dn.state.pageClicks);
    }
    holdTreeAnchor();
  }

  function holdTreeAnchor() {
    const anchor = dn.state.treeAnchor;
    if (!anchor || !treeEl) {
      return;
    }
    const wrap = treeEl.querySelector('.tree-wrap');
    const button = wrap && wrap.querySelector('[data-anchor="1"]');
    if (!wrap || !button) {
      dn.state.treeAnchor = null;
      return;
    }
    const place = () => {
      if (!button.isConnected) {
        return;
      }
      const box = wrap.getBoundingClientRect();
      const rect = button.getBoundingClientRect();
      wrap.scrollTop = Math.max(0, wrap.scrollTop + (rect.top - box.top) - anchor.top);
      wrap.scrollLeft = Math.max(0, wrap.scrollLeft + (rect.left - box.left) - anchor.left);
    };
    place();
    requestAnimationFrame(() => {
      if (dn.state.treeAnchor !== anchor) {
        return;
      }
      place();
      if (dn.state.treeAnchor === anchor) {
        dn.state.treeAnchor = null;
      }
    });
  }

  function onHeadClick(event) {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }
    const element = selectedElement();
    if (button.dataset.act === 'close') {
      dn.ui.close();
      return;
    }
    if (button.dataset.act === 'print') {
      dn.dumpDom();
      return;
    }
    if (button.dataset.act === 'page') {
      dn.setPageClicks(!dn.state.pageClicks);
      return;
    }
    if (!element) {
      return;
    }
    if (button.dataset.act === 'C') {
      const html = dn.shallowHtml(element);
      textareaEl.value = html;
      dn.state.shallow = html;
      dn.state.clip = html;
      dn.copyText(html);
      return;
    }
    if (button.dataset.act === 'paste') {
      dn.pasteClipboard();
      return;
    }
    if (button.dataset.act === 'B') {
      dn.cutSelected();
    }
  }

  function onNavClick(event) {
    const button = event.target.closest('button');
    const element = selectedElement();
    if (!button || !element || button.disabled) {
      return;
    }
    const nav = button.dataset.nav;
    if (nav === 'up') {
      dn.state.scrollTree = true;
      dn.ascend(element);
      if (dn.state.selected) {
        centerElement(dn.state.selected);
      }
      return;
    }
    if (nav === 'down') {
      dn.state.scrollTree = true;
      dn.descend(element);
      if (dn.state.selected) {
        centerElement(dn.state.selected);
      }
      return;
    }
    if (nav === 'shift-prev' || nav === 'shift-next') {
      if (dn.moveAmong(element, nav === 'shift-prev' ? -1 : 1)) {
        dn.state.scrollTree = true;
        refresh();
        centerElement(element);
      }
      return;
    }
    const next = nav === 'prev' ? dn.sibling(element, -1) : dn.sibling(element, 1);
    if (next) {
      dn.state.scrollTree = true;
      dn.select(next);
      centerElement(next);
    }
  }

  function centerElement(element) {
    const rect = element.getBoundingClientRect();
    const delta = rect.top - (window.innerHeight - rect.height) / 2;
    if (Math.abs(delta) < 2) {
      return;
    }
    let node = element.parentElement;
    while (node) {
      const style = getComputedStyle(node);
      const canScroll = /(auto|scroll|overlay)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1;
      if (canScroll) {
        const nextTop = Math.min(node.scrollHeight - node.clientHeight, Math.max(0, node.scrollTop + delta));
        if (nextTop !== node.scrollTop) {
          node.scrollTo({ top: nextTop, behavior: 'smooth' });
          return;
        }
      }
      node = node.parentElement;
    }
    const scrolling = document.scrollingElement || document.documentElement;
    scrolling.scrollTo({
      top: Math.max(0, scrolling.scrollTop + delta),
      behavior: 'smooth'
    });
  }

  dn.ui.open = function () {
    ensure();
    host.hidden = false;
    host.style.setProperty('display', 'block', 'important');
    refresh();
  };

  dn.ui.close = function () {
    dn.clearSelection();
    if (host) {
      host.hidden = true;
      host.style.setProperty('display', 'none', 'important');
    }
  };

  dn.ui.dismiss = function () {
    if (host) {
      host.hidden = true;
      host.style.setProperty('display', 'none', 'important');
    }
  };

  dn.ui.refresh = refresh;
})();
