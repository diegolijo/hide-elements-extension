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
  let editorBtn = null;
  let removeBtn = null;

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
    button:hover { background: #3e3e3e; }
    button:disabled { opacity: .35; cursor: default; }
    button.is-on { background: #ff8c00; color: #1a1a1a; border-color: #ff8c00; }
    button.style-chip.is-off { color: #9a9a9a; text-decoration: line-through; }
    button.icon { display: inline-flex; align-items: center; justify-content: center; padding: 4px 6px; }
    button.icon svg { display: block; }
    .nav { padding: 8px; }
    .nav button { flex: 1; }
    .editor { overflow: auto; max-height: 42vh; border-top: 1px solid #333; }
    .editor[hidden] { display: none !important; }
    .tabs { display: flex; flex-wrap: wrap; gap: 4px; padding: 8px 8px 0; }
    .tabs button { flex: 1 1 auto; }
    .tab-body, .stack { display: flex; flex-direction: column; gap: 8px; }
    .tab-body { padding: 8px; }
    .row, .group, .chips { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
    .name { width: 72px; flex: 0 0 auto; color: #ccc; }
    .val { min-width: 52px; text-align: center; color: #ddd; }
    .slide-row { flex-wrap: nowrap; }
    input[type="range"] { flex: 1; min-width: 0; accent-color: #ff8c00; }
    .cap { color: #9a9a9a; }
    .chip.is-off { opacity: .45; text-decoration: line-through; }
    .empty { color: #9a9a9a; margin: 0; }
    .audit-row { display: flex; justify-content: space-between; gap: 8px; }
    .audit-row span:last-child { color: #ffb15a; }
    .tree-wrap { padding: 0 8px 8px; }
    .tree, .tree ul { list-style: none; margin: 0; padding: 0; }
    .tree ul { margin-left: 10px; padding-left: 10px; border-left: 1px solid #444; }
    .tree button { width: 100%; justify-content: flex-start; margin: 2px 0; }
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
    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.dataset.act = 'C';
    copyBtn.title = 'Copiar elemento';
    copyBtn.textContent = 'C';
    removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.dataset.act = 'B';
    removeBtn.title = 'Borrar elemento';
    removeBtn.textContent = 'B';
    editorBtn = document.createElement('button');
    editorBtn.type = 'button';
    editorBtn.dataset.act = 'E';
    editorBtn.title = 'Editor';
    editorBtn.textContent = 'E';
    const printBtn = iconButton(
      'icon',
      'Copiar el DOM y mostrarlo en la consola',
      'print',
      'M6 9V3h12v6h2a2 2 0 0 1 2 2v5h-4v5H6v-5H2v-5a2 2 0 0 1 2-2h2zm2-4v4h8V5H8zm0 10v4h8v-4H8z'
    );
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.dataset.act = 'close';
    closeBtn.title = 'Cerrar panel';
    closeBtn.textContent = '×';
    head.append(labelEl, copyBtn, removeBtn, editorBtn, printBtn, closeBtn);

    const nav = document.createElement('div');
    nav.className = 'nav';
    upBtn = navButton('up', 'Padre', '↑');
    downBtn = navButton('down', 'Primer hijo', '↓');
    prevBtn = navButton('prev', 'Hermano anterior', '←');
    nextBtn = navButton('next', 'Hermano siguiente', '→');
    nav.append(upBtn, downBtn, prevBtn, nextBtn);

    editorEl = document.createElement('div');
    editorEl.className = 'editor';
    editorEl.hidden = false;

    textareaEl = document.createElement('textarea');
    textareaEl.readOnly = true;
    textareaEl.spellcheck = false;
    textareaEl.setAttribute('aria-label', 'Elemento sin hijos');

    panel.append(head, nav, editorEl, textareaEl);
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
    downBtn.disabled = !dn.firstChildEl(element);
    removeBtn.disabled = !dn.canRemove(element);
    const hasSiblings = !!dn.sibling(element, 1);
    prevBtn.disabled = !hasSiblings;
    nextBtn.disabled = !hasSiblings;
    editorBtn.classList.toggle('is-on', dn.state.editorOpen);
    editorEl.hidden = !dn.state.editorOpen;
    if (dn.state.editorOpen && typeof dn.renderEditor === 'function') {
      dn.renderEditor(editorEl, element);
    }
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
    if (button.dataset.act === 'E') {
      dn.state.editorOpen = !dn.state.editorOpen;
      refresh();
      return;
    }
    if (!element) {
      return;
    }
    if (button.dataset.act === 'C') {
      const html = dn.shallowHtml(element);
      textareaEl.value = html;
      dn.state.shallow = html;
      dn.copyText(html);
      return;
    }
    if (button.dataset.act === 'B') {
      dn.removeSelected();
    }
  }

  function onNavClick(event) {
    const button = event.target.closest('button');
    const element = selectedElement();
    if (!button || !element || button.disabled) {
      return;
    }
    let next = null;
    if (button.dataset.nav === 'up') {
      next = dn.parentOf(element);
    } else if (button.dataset.nav === 'down') {
      next = dn.firstChildEl(element);
    } else if (button.dataset.nav === 'prev') {
      next = dn.sibling(element, -1);
    } else if (button.dataset.nav === 'next') {
      next = dn.sibling(element, 1);
    }
    if (next) {
      dn.select(next);
      if (button.dataset.nav === 'prev' || button.dataset.nav === 'next') {
        centerElement(next);
      }
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
