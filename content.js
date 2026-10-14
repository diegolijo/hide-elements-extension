const HOVER = '#FF8C0040';
const SELECTED = '#22C55EAA';
const HOST_ID = 'dn-panel-host';

const state = {
  enabled: false,
  pageClicks: false,
  selected: null,
  hovered: null,
  editorTab: 'Styles',
  scrollTree: false
};

const dn = {
  HOST_ID,
  HOVER,
  SELECTED,
  state,
  ui: {},
  setEnabled,
  toggleEnabled,
  setPageClicks,
  select,
  clearSelection,
  paint,
  restore,
  shallowHtml,
  describe,
  parentOf,
  firstChildEl,
  sibling,
  ascend,
  descend,
  canDescend,
  moveAmong,
  canMove,
  cutSelected,
  pasteClipboard,
  removeSelected,
  canRemove,
  dumpDom,
  copyText,
  fromPanel
};

globalThis.__dn = dn;

function notifyIcon(on) {
  if (document.visibilityState === 'hidden') {
    return;
  }
  const runtime = globalThis.chrome && chrome.runtime;
  if (!runtime || typeof runtime.sendMessage !== 'function') {
    return;
  }
  try {
    runtime.sendMessage({ action: on ? 'on-icon' : 'off-icon' });
  } catch (error) {
    void error;
  }
}

function syncCursor() {
  if (document.body) {
    document.body.classList.toggle('hide-cursor', state.enabled && !state.pageClicks);
  }
}

function setPageClicks(on) {
  state.pageClicks = !!on;
  syncCursor();
  if (state.pageClicks) {
    clearHover();
  }
  if (typeof dn.ui.refresh === 'function' && state.selected) {
    dn.ui.refresh();
  }
}

function setEnabled(on, options) {
  state.enabled = !!on;
  if (!state.enabled) {
    state.pageClicks = false;
  }
  syncCursor();
  if (state.enabled) {
    notifyIcon(true);
    return;
  }
  if (!options || !options.silent) {
    notifyIcon(false);
  }
  clearHover();
  clearSelection();
  if (typeof dn.ui.dismiss === 'function') {
    dn.ui.dismiss();
  }
}

function toggleEnabled() {
  setEnabled(!state.enabled);
}

function fromPanel(event) {
  if (event.target && event.target.id === HOST_ID) {
    return true;
  }
  return event.composedPath().some((node) => node && node.id === HOST_ID);
}

function remember(element) {
  if (element.dataset.dnBgSaved === '1') {
    return;
  }
  element.dataset.dnBgSaved = '1';
  element.dataset.dnBg = element.style.getPropertyValue('background-color');
  element.dataset.dnBgPriority = element.style.getPropertyPriority('background-color');
  element.dataset.dnComputedBg = getComputedStyle(element).backgroundColor;
  element.dataset.dnOutline = element.style.getPropertyValue('outline');
  element.dataset.dnOutlinePriority = element.style.getPropertyPriority('outline');
  element.dataset.dnOutlineOffset = element.style.getPropertyValue('outline-offset');
  element.dataset.dnOutlineOffsetPriority = element.style.getPropertyPriority('outline-offset');
}

function paint(element, color) {
  if (!(element instanceof Element)) {
    return;
  }
  remember(element);
  const userColor = element.dataset.dnUserBg === '1' ? element.dataset.dnUserBgValue : '';
  if (userColor) {
    element.style.removeProperty('background-color');
    element.style.setProperty('background-color', userColor);
    element.style.setProperty('outline', '3px solid ' + color.slice(0, 7), 'important');
    element.style.setProperty('outline-offset', '-3px', 'important');
    return;
  }
  element.style.removeProperty('outline');
  element.style.removeProperty('outline-offset');
  element.style.setProperty('background-color', color, 'important');
}

function restoreInline(element, prop, value, priority) {
  if (value) {
    element.style.setProperty(prop, value, priority || '');
    return;
  }
  element.style.removeProperty(prop);
}

function restore(element) {
  if (!(element instanceof Element) || element.dataset.dnBgSaved !== '1') {
    return;
  }
  const user = element.dataset.dnUserBg === '1';
  const userValue = element.dataset.dnUserBgValue || '';
  const orig = element.dataset.dnBg || '';
  const priority = element.dataset.dnBgPriority || '';
  const outline = element.dataset.dnOutline || '';
  const outlinePriority = element.dataset.dnOutlinePriority || '';
  const outlineOffset = element.dataset.dnOutlineOffset || '';
  const outlineOffsetPriority = element.dataset.dnOutlineOffsetPriority || '';

  element.style.removeProperty('outline');
  element.style.removeProperty('outline-offset');
  if (outline) {
    element.style.setProperty('outline', outline, outlinePriority);
  }
  if (outlineOffset) {
    element.style.setProperty('outline-offset', outlineOffset, outlineOffsetPriority);
  }

  if (user && userValue) {
    element.style.removeProperty('background-color');
    element.style.setProperty('background-color', userValue);
  } else if (orig) {
    element.style.setProperty('background-color', orig, priority);
  } else {
    element.style.removeProperty('background-color');
  }

  delete element.dataset.dnBgSaved;
  delete element.dataset.dnBg;
  delete element.dataset.dnBgPriority;
  delete element.dataset.dnComputedBg;
  delete element.dataset.dnOutline;
  delete element.dataset.dnOutlinePriority;
  delete element.dataset.dnOutlineOffset;
  delete element.dataset.dnOutlineOffsetPriority;
}

function cleanPaint(element) {
  if (element.dataset.dnUserBg === '1' && element.dataset.dnUserBgValue) {
    element.style.removeProperty('background-color');
    element.style.setProperty('background-color', element.dataset.dnUserBgValue);
  } else if (element.dataset.dnBgSaved === '1') {
    restoreInline(element, 'background-color', element.dataset.dnBg || '', element.dataset.dnBgPriority || '');
  }
  restoreInline(element, 'outline', element.dataset.dnOutline || '', element.dataset.dnOutlinePriority || '');
  restoreInline(element, 'outline-offset', element.dataset.dnOutlineOffset || '', element.dataset.dnOutlineOffsetPriority || '');
  [...element.attributes].forEach((attr) => {
    if (attr.name.startsWith('data-dn-')) {
      element.removeAttribute(attr.name);
    }
  });
  if ((element.getAttribute('style') || '').trim() === '') {
    element.removeAttribute('style');
  }
}

function canRemove(element) {
  return Boolean(
    element &&
    element.parentNode &&
    element !== document.documentElement &&
    element !== document.body &&
    element !== document.head
  );
}

function clearHover() {
  const element = state.hovered;
  state.hovered = null;
  if (element && element !== state.selected) {
    restore(element);
  }
}

function clearSelection() {
  const element = state.selected;
  state.selected = null;
  if (!element) {
    return;
  }
  if (element === state.hovered && state.enabled) {
    paint(element, HOVER);
    return;
  }
  restore(element);
}

const trace = [];

function select(element, options) {
  if (!(element instanceof Element) || element.id === HOST_ID) {
    return;
  }
  if (!options || !options.trace) {
    trace.length = 0;
  }
  if (state.selected && state.selected !== element) {
    const previous = state.selected;
    state.selected = null;
    if (previous === state.hovered && state.enabled) {
      paint(previous, HOVER);
    } else {
      restore(previous);
    }
  }
  state.selected = element;
  const display = getComputedStyle(element).display;
  if (display === 'flex' || display === 'inline-flex') {
    state.editorTab = 'Display';
  }
  paint(element, SELECTED);
  if (typeof dn.ui.refresh === 'function') {
    dn.ui.refresh();
  }
}

function describe(element) {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? '#' + element.id : '';
  const classes = [...element.classList].filter((name) => name && name !== 'hide-cursor');
  const classPart = classes.length ? '.' + classes.slice(0, 3).join('.') : '';
  return tag + id + classPart;
}

function shallowHtml(element) {
  const clone = element.cloneNode(false);
  cleanPaint(clone);
  if (element === document.body) {
    clone.classList.remove('hide-cursor');
  }
  return clone.outerHTML;
}

function elementHtml(element) {
  const clone = element.cloneNode(true);
  clone.querySelector('#' + HOST_ID)?.remove();
  [clone, ...clone.querySelectorAll('*')].forEach((node) => {
    cleanPaint(node);
  });
  return clone.outerHTML;
}

function parentOf(element) {
  if (element === document.documentElement) {
    return null;
  }
  return element.parentElement;
}

function firstChildEl(element) {
  let child = element.firstElementChild;
  while (child && child.id === HOST_ID) {
    child = child.nextElementSibling;
  }
  return child;
}

function elementSiblings(element) {
  if (!element.parentElement) {
    return [];
  }
  return [...element.parentElement.children].filter((child) => child.id !== HOST_ID);
}

function ascend(element) {
  const parent = parentOf(element);
  if (!parent) {
    return;
  }
  trace.push(element);
  select(parent, { trace: true });
}

function descend(element) {
  const tip = trace[trace.length - 1];
  if (tip && tip.isConnected && tip.parentElement === element) {
    trace.pop();
    select(tip, { trace: true });
    return;
  }
  trace.length = 0;
  const child = firstChildEl(element);
  if (child) {
    select(child, { trace: true });
  }
}

function canDescend(element) {
  const tip = trace[trace.length - 1];
  if (tip && tip.isConnected && tip.parentElement === element) {
    return true;
  }
  return Boolean(firstChildEl(element));
}

function canMove(element, direction) {
  return Boolean(element && nextRealSibling(element, direction));
}

function moveAmong(element, direction) {
  if (!canMove(element, direction) || !element.parentNode) {
    return false;
  }
  if (direction < 0) {
    element.parentNode.insertBefore(element, nextRealSibling(element, -1));
    return true;
  }
  const next = nextRealSibling(element, 1);
  element.parentNode.insertBefore(element, next.nextSibling);
  return true;
}

function cutSelected() {
  const element = state.selected;
  if (!canRemove(element)) {
    return;
  }
  const html = elementHtml(element);
  state.shallow = html;
  state.clip = html;
  copyText(html);
  removeSelected();
}

function insertClipboard(text) {
  const target = state.selected;
  const html = String(text || '').trim();
  if (!target || !target.parentNode || !html) {
    return;
  }
  const template = document.createElement('template');
  template.innerHTML = html;
  const node = template.content.firstElementChild;
  if (!node) {
    return;
  }
  target.insertAdjacentElement('afterend', node);
  select(node);
}

function pasteClipboard() {
  const clipboard = navigator.clipboard;
  if (clipboard && typeof clipboard.readText === 'function') {
    clipboard.readText().then(insertClipboard).catch(() => {
      insertClipboard(state.clip || state.shallow);
    });
    return;
  }
  insertClipboard(state.clip || state.shallow);
}

function sibling(element, direction) {
  const list = elementSiblings(element);
  const index = list.indexOf(element);
  if (index < 0 || list.length < 2) {
    return null;
  }
  return list[(index + direction + list.length) % list.length];
}

function nextRealSibling(element, direction) {
  let node = direction > 0 ? element.nextElementSibling : element.previousElementSibling;
  while (node && node.id === HOST_ID) {
    node = direction > 0 ? node.nextElementSibling : node.previousElementSibling;
  }
  return node;
}

function removeSelected() {
  const element = state.selected;
  if (!canRemove(element)) {
    return;
  }
  const parent = element.parentElement;
  const list = elementSiblings(element);
  const index = list.indexOf(element);
  const rest = list.filter((node) => node !== element);
  const fallback = (index >= 0 && rest[index]) || rest[0] || parent;
  restore(element);
  state.selected = null;
  if (state.hovered === element) {
    state.hovered = null;
  }
  try {
    element.parentNode.removeChild(element);
  } catch (error) {
    console.error('removeChild:', error);
    element.style.setProperty('display', 'none', 'important');
  }
  if (fallback && fallback.isConnected && fallback !== element) {
    select(fallback);
    return;
  }
  if (typeof dn.ui.refresh === 'function') {
    dn.ui.refresh();
  }
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
  } catch (error) {
    void error;
  }
  area.remove();
}

function copyText(text) {
  const clipboard = navigator.clipboard;
  if (clipboard && typeof clipboard.writeText === 'function') {
    return clipboard.writeText(text).catch(() => {
      fallbackCopy(text);
    });
  }
  fallbackCopy(text);
  return Promise.resolve();
}

function dumpDom() {
  const clone = document.documentElement.cloneNode(true);
  clone.querySelector('#' + HOST_ID)?.remove();
  clone.querySelector('body')?.classList.remove('hide-cursor');
  [clone, ...clone.querySelectorAll('*')].forEach((node) => {
    const marked = [...node.attributes].some((attr) => attr.name.startsWith('data-dn-'));
    if (marked) {
      cleanPaint(node);
    }
  });
  const html = clone.outerHTML;
  console.log(html);
  copyText(html);
  return html;
}

function onMouseOver(event) {
  if (!state.enabled || state.pageClicks || fromPanel(event)) {
    return;
  }
  const element = event.target;
  if (!(element instanceof Element) || element.id === HOST_ID) {
    return;
  }
  if (state.hovered && state.hovered !== element) {
    if (state.hovered === state.selected) {
      paint(state.hovered, SELECTED);
    } else {
      restore(state.hovered);
    }
  }
  state.hovered = element;
  paint(element, element === state.selected ? SELECTED : HOVER);
}

function onMouseOut(event) {
  if (!state.enabled || state.pageClicks || fromPanel(event)) {
    return;
  }
  const element = event.target;
  if (element !== state.hovered) {
    return;
  }
  state.hovered = null;
  if (element === state.selected) {
    paint(element, SELECTED);
    return;
  }
  restore(element);
}

function onClick(event) {
  if (!state.enabled || state.pageClicks || fromPanel(event)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const element = event.target;
  if (!(element instanceof Element) || element.id === HOST_ID) {
    return;
  }
  select(element);
  if (typeof dn.ui.open === 'function') {
    dn.ui.open();
  }
}

document.addEventListener('mouseover', onMouseOver, true);
document.addEventListener('mouseout', onMouseOut, true);
document.addEventListener('click', onClick, true);

if (globalThis.chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle-hide-mode') {
      toggleEnabled();
      sendResponse({ status: state.enabled ? 'Hide mode enabled' : 'Hide mode disabled' });
      return;
    }
    if (request.action === 'deactivate-hide-mode') {
      if (state.enabled) {
        setEnabled(false, { silent: true });
      }
      sendResponse({ enabled: false });
      return;
    }
    if (request.action === 'sync-icon') {
      notifyIcon(state.enabled);
      sendResponse({ enabled: state.enabled });
    }
  });
}
