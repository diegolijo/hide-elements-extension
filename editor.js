(function () {
  const dn = globalThis.__dn;
  let editorRoot = null;

  const TABS = ['Styles', 'Box', 'Position', 'Space', 'Display', 'Border', 'Color'];
  const POSITIONS = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
  const SIDES = ['top', 'right', 'bottom', 'left'];
  const BORDER_STYLES = ['none', 'solid', 'dashed', 'dotted', 'double'];
  const DISPLAYS = ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'];
  const COLORS = [
    ['color', 'color'],
    ['background-color', 'background-color'],
    ['border-color', 'border-color']
  ];

  function h(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value == null || value === false) {
        return;
      }
      if (key === 'class') {
        node.className = value;
      } else if (key === 'text') {
        node.textContent = value;
      } else {
        node.setAttribute(key, value);
      }
    });
    (children || []).forEach((child) => {
      if (child) {
        node.append(child);
      }
    });
    return node;
  }

  function current(element, prop) {
    const style = getComputedStyle(element);
    if (prop === 'margin' || prop === 'padding') {
      return ['top', 'right', 'bottom', 'left'].map((side) => style.getPropertyValue(prop + '-' + side).trim()).join(' ');
    }
    let value = style.getPropertyValue(prop).trim();
    if (prop === 'align-items' && (value === 'normal' || value === 'stretch')) {
      value = value === 'normal' ? 'stretch' : value;
    }
    if (prop === 'align-items' && value === 'start') value = 'flex-start';
    if (prop === 'justify-content' && (value === 'normal' || value === 'start')) value = 'flex-start';
    if (prop === 'flex-direction' && (value === 'normal' || value === '')) value = 'row';
    if (prop === 'flex-wrap' && (value === 'normal' || value === '')) value = 'nowrap';
    return value;
  }

  function isFlexDisplay(element) {
    const display = current(element, 'display');
    return display === 'flex' || display === 'inline-flex';
  }

  function formatPx(element, prop) {
    const inline = element.style.getPropertyValue(prop).trim();
    if (inline) {
      return inline;
    }
    const computed = getComputedStyle(element).getPropertyValue(prop).trim();
    if (!computed || computed === 'auto' || computed === 'normal') {
      return computed || 'auto';
    }
    const value = parseFloat(computed);
    if (Number.isNaN(value)) {
      return computed;
    }
    return Math.round(value) + 'px';
  }

  function readBase(element, prop) {
    const inline = element.style.getPropertyValue(prop).trim();
    if (inline === 'auto') {
      return null;
    }
    if (inline && inline !== 'unset') {
      const inlineValue = parseFloat(inline);
      if (!Number.isNaN(inlineValue)) {
        return inlineValue;
      }
    }
    const computed = getComputedStyle(element).getPropertyValue(prop).trim();
    if (computed === 'auto') {
      return null;
    }
    const value = parseFloat(computed);
    if (!Number.isNaN(value)) {
      return value;
    }
    return 0;
  }

  const SLIDE_CURVE = 2;

  function slideMax(value) {
    const size = Math.max(240, Math.abs(value || 0));
    return Math.ceil(size / 20) * 20;
  }

  function valueToSlide(value, max, signed) {
    const limit = signed ? Math.max(-max, Math.min(max, value)) : Math.max(0, Math.min(max, value));
    const ratio = Math.pow(Math.abs(limit) / max, 1 / SLIDE_CURVE);
    if (!signed) {
      return String(Math.round(ratio * 1000));
    }
    const signedRatio = (limit < 0 ? -ratio : ratio);
    return String(Math.round((signedRatio + 1) / 2 * 1000));
  }

  function slideToValue(position, max, signed) {
    if (!signed) {
      return Math.round(Math.pow(position / 1000, SLIDE_CURVE) * max);
    }
    const unit = position / 1000 * 2 - 1;
    const sign = unit < 0 ? -1 : 1;
    return Math.round(sign * Math.pow(Math.abs(unit), SLIDE_CURVE) * max);
  }

  function sliderRow(element, label, prop, signed, withAuto) {
    const numeric = readBase(element, prop);
    const auto = numeric == null;
    const max = slideMax(auto ? 0 : numeric);
    const row = h('div', { class: 'row slide-row' });
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '1000';
    input.step = '1';
    input.dataset.slide = prop;
    input.dataset.max = String(max);
    input.dataset.signed = signed ? '1' : '0';
    input.value = auto ? (signed ? '500' : '0') : valueToSlide(numeric, max, signed);
    const value = h('span', { class: 'val', 'data-val': prop, text: auto ? 'auto' : Math.round(numeric) + 'px' });
    row.append(
      h('span', { class: 'name', title: label, text: label }),
      input,
      value
    );
    if (withAuto) {
      row.append(h('button', { type: 'button', 'data-auto': prop, text: 'auto' }));
    }
    return row;
  }

  function stepProp(element, prop, delta) {
    const base = readBase(element, prop);
    const next = Math.round((base == null ? 0 : base) + delta);
    element.style.setProperty(prop, next + 'px');
  }

  function stepper(element, label, prop, withAuto) {
    const children = [
      h('span', { class: 'name', title: label, text: label }),
      h('button', { type: 'button', 'data-step': prop, 'data-d': '-10', text: '-10' }),
      h('button', { type: 'button', 'data-step': prop, 'data-d': '-1', text: '-1' }),
      h('span', { class: 'val', text: formatPx(element, prop) }),
      h('button', { type: 'button', 'data-step': prop, 'data-d': '1', text: '+1' }),
      h('button', { type: 'button', 'data-step': prop, 'data-d': '10', text: '+10' })
    ];
    if (withAuto) {
      children.push(h('button', { type: 'button', 'data-auto': prop, text: 'auto' }));
    }
    return h('div', { class: 'row' }, children);
  }

  function keywords(element, prop, values) {
    const valueNow = current(element, prop);
    return h('div', { class: 'group' }, values.map((value) => {
      return h('button', {
        type: 'button',
        class: value === valueNow ? 'is-on' : '',
        'data-set': prop,
        'data-value': value,
        text: value
      });
    }));
  }

  function spaceTab(element) {
    return h('div', { class: 'stack' }, [
      h('span', { class: 'cap', text: 'margin' }),
      ...SIDES.map((side) => sliderRow(element, 'margin-' + side, 'margin-' + side, true, false)),
      h('span', { class: 'cap', text: 'padding' }),
      ...SIDES.map((side) => sliderRow(element, 'padding-' + side, 'padding-' + side, false, false))
    ]);
  }

  const turnedOff = new WeakMap();

  function offState(element) {
    let saved = turnedOff.get(element);
    if (!saved) {
      saved = new Map();
      turnedOff.set(element, saved);
    }
    return saved;
  }

  function toggleOff(element, prop) {
    const saved = offState(element);
    if (saved.has(prop)) {
      const previous = saved.get(prop);
      saved.delete(prop);
      element.style.removeProperty(prop);
      if (previous.inline) {
        element.style.setProperty(prop, previous.inline, previous.priority || '');
      }
      if (prop === 'background-color' && element === dn.state.selected) {
        dn.paint(element, dn.SELECTED);
      }
      return;
    }
    saved.set(prop, {
      inline: element.style.getPropertyValue(prop),
      priority: element.style.getPropertyPriority(prop),
      shown: current(element, prop) || '—'
    });
    element.style.setProperty(prop, 'unset', 'important');
  }

  function estilosTab(element) {
    const saved = offState(element);
    const props = [
      ['display', 'display'],
      ['position', 'position'],
      ['width', 'width'],
      ['height', 'height'],
      ['margin', 'margin'],
      ['padding', 'padding'],
      ['border-width', 'border-width'],
      ['border-style', 'border-style'],
      ['border-radius', 'border-radius'],
      ['color', 'color'],
      ['background', 'background-color'],
      ['border-color', 'border-color'],
      ['opacity', 'opacity']
    ];
    if (isFlexDisplay(element) || ['flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'gap'].some((prop) => saved.has(prop))) {
      props.push(
        ['flex-direction', 'flex-direction'],
        ['flex-wrap', 'flex-wrap'],
        ['justify-content', 'justify-content'],
        ['align-items', 'align-items'],
        ['gap', 'gap']
      );
    }
    const line = h('div', { class: 'chips' }, props.map(([label, prop]) => {
      const off = saved.has(prop);
      return h('button', {
        type: 'button',
        class: off ? 'style-chip is-off' : 'style-chip',
        'data-off': prop,
        text: label + ': ' + (off ? saved.get(prop).shown : (current(element, prop) || '—'))
      });
    }));
    return h('div', { class: 'stack' }, [line]);
  }

  function childElements(element) {
    return [...element.children].filter((child) => child.id !== dn.HOST_ID);
  }

  function treeButton(element) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = element.tagName.toLowerCase();
    button.title = dn.describe(element);
    if (element === dn.state.selected) {
      button.classList.add('is-on');
    } else if (element.contains(dn.state.selected)) {
      button.classList.add('is-path');
    }
    if (dn.state.treeAnchor && dn.state.treeAnchor.element === element) {
      button.dataset.anchor = '1';
    }
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const wrap = button.closest('.tree-wrap');
      if (wrap) {
        const box = wrap.getBoundingClientRect();
        const rect = button.getBoundingClientRect();
        dn.state.treeAnchor = {
          element,
          top: rect.top - box.top,
          left: rect.left - box.left
        };
      }
      dn.select(element);
    });
    return button;
  }

  function countBadge(count, title) {
    if (count <= 0) {
      return null;
    }
    const badge = document.createElement('span');
    badge.className = 'tree-badge';
    badge.textContent = String(count);
    badge.title = title;
    return badge;
  }

  function siblingBadge(count) {
    if (count <= 1) {
      return null;
    }
    return countBadge(count, count + ' siblings');
  }

  function siblingTotal(element) {
    if (!element.parentElement) {
      return 1;
    }
    return childElements(element.parentElement).length;
  }

  function treeLine(element, depth, mode) {
    const branch = document.createElement('div');
    branch.className = 'tree-branch';
    branch.style.paddingLeft = (depth * 10) + 'px';
    const row = document.createElement('div');
    row.className = 'tree-line';
    row.append(treeButton(element));
    const kids = childElements(element);
    const badge = mode === 'child'
      ? countBadge(kids.length, kids.length + ' children')
      : siblingBadge(siblingTotal(element));
    if (badge) {
      row.append(badge);
    }
    branch.append(row);
    return branch;
  }

  function domTree() {
    const wrap = document.createElement('div');
    wrap.className = 'tree-wrap';
    const selected = dn.state.selected;
    if (!(selected instanceof Element)) {
      return wrap;
    }
    const chain = [];
    let node = selected;
    while (node instanceof Element) {
      chain.push(node);
      if (node === document.documentElement) {
        break;
      }
      node = node.parentElement;
    }
    chain.reverse();
    chain.forEach((current, depth) => {
      wrap.append(treeLine(current, depth, 'path'));
    });
    childElements(selected).forEach((kid) => {
      wrap.append(treeLine(kid, chain.length, 'child'));
    });
    return wrap;
  }

  function positionTab(element) {
    const position = current(element, 'position');
    const blocks = [keywords(element, 'position', POSITIONS)];
    if (position === 'absolute' || position === 'fixed' || position === 'sticky') {
      blocks.push(h('div', { class: 'stack' }, SIDES.map((prop) => {
        return sliderRow(element, prop, prop, true, true);
      })));
    }
    return h('div', { class: 'stack' }, blocks);
  }

  function flexTab(element) {
    if (!isFlexDisplay(element)) {
      return null;
    }
    return h('div', { class: 'stack' }, [
      h('span', { class: 'cap', text: 'flex-direction' }),
      keywords(element, 'flex-direction', ['row', 'column', 'row-reverse', 'column-reverse']),
      h('span', { class: 'cap', text: 'flex-wrap' }),
      keywords(element, 'flex-wrap', ['nowrap', 'wrap']),
      h('span', { class: 'cap', text: 'justify-content' }),
      keywords(element, 'justify-content', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']),
      h('span', { class: 'cap', text: 'align-items' }),
      keywords(element, 'align-items', ['flex-start', 'center', 'flex-end', 'stretch']),
      sliderRow(element, 'gap', 'gap', false, false)
    ]);
  }

  function parseColor(value) {
    const text = String(value || '').trim();
    const channel = (part) => Math.max(0, Math.min(255, Math.round(Number(part)))).toString(16).padStart(2, '0');
    const hex8 = text.match(/^#([0-9a-fA-F]{8})$/);
    if (hex8) {
      return {
        hex: '#' + hex8[1].slice(0, 6).toLowerCase(),
        alpha: parseInt(hex8[1].slice(6), 16) / 255
      };
    }
    const hex6 = text.match(/^#([0-9a-fA-F]{6})$/);
    if (hex6) {
      return { hex: '#' + hex6[1].toLowerCase(), alpha: 1 };
    }
    const hex3 = text.match(/^#([0-9a-fA-F]{3})$/);
    if (hex3) {
      return {
        hex: '#' + hex3[1].split('').map((char) => char + char).join('').toLowerCase(),
        alpha: 1
      };
    }
    const match = text.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/i);
    if (!match) {
      return { hex: '#000000', alpha: 1 };
    }
    let alpha = 1;
    if (match[4] != null) {
      alpha = String(match[4]).endsWith('%') ? Number(match[4].replace('%', '')) / 100 : Number(match[4]);
    }
    return {
      hex: '#' + channel(match[1]) + channel(match[2]) + channel(match[3]),
      alpha: Math.max(0, Math.min(1, alpha))
    };
  }

  function toRgba(hex, alpha) {
    const value = String(hex || '#000000').replace('#', '');
    const ratio = Math.max(0, Math.min(1, Number(alpha)));
    const r = parseInt(value.slice(0, 2), 16) || 0;
    const g = parseInt(value.slice(2, 4), 16) || 0;
    const b = parseInt(value.slice(4, 6), 16) || 0;
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + ratio.toFixed(2) + ')';
  }

  function readPaint(element, prop) {
    if (prop === 'background-color') {
      if (element.dataset.dnUserBg === '1' && element.dataset.dnUserBgValue) {
        return parseColor(element.dataset.dnUserBgValue);
      }
      if (element.dataset.dnComputedBg) {
        return parseColor(element.dataset.dnComputedBg);
      }
    }
    const raw = prop === 'border-color'
      ? getComputedStyle(element).borderTopColor
      : getComputedStyle(element).getPropertyValue(prop);
    return parseColor(raw);
  }

  function syncPaint(element, prop, row) {
    const colorInput = row.querySelector('[data-color]');
    const alphaInput = row.querySelector('[data-alpha]');
    const hex = colorInput ? colorInput.value : '#000000';
    const alpha = alphaInput ? Number(alphaInput.value) / 100 : 1;
    applyColor(element, prop, toRgba(hex, alpha));
    const label = row.querySelector('.val');
    if (label) {
      label.textContent = Math.max(0, Math.min(1, alpha)).toFixed(2);
    }
  }

  function colorRow(element, label, prop) {
    const canDrop = typeof EyeDropper === 'function';
    const paint = readPaint(element, prop);
    const input = h('input', { type: 'color', 'data-color': prop, value: paint.hex, title: label });
    const alpha = document.createElement('input');
    alpha.type = 'range';
    alpha.min = '0';
    alpha.max = '100';
    alpha.step = '1';
    alpha.dataset.alpha = prop;
    alpha.title = 'alpha';
    alpha.value = String(Math.round(paint.alpha * 100));
    const drop = h('button', {
      type: 'button',
      class: 'icon',
      'data-drop': prop,
      title: canDrop ? 'Eyedropper' : 'Eyedropper is not available'
    });
    drop.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M19.3 4.7a3 3 0 0 0-4.2 0l-1.1 1.1-1.4-1.4-1.4 1.4 1.4 1.4L4 15.8V20h4.2l8.6-8.6 1.4 1.4 1.4-1.4-1.4-1.4 1.1-1.1a3 3 0 0 0 0-4.2z"></path></svg>';
    drop.disabled = !canDrop;
    const row = h('div', { class: 'row slide-row' });
    row.append(
      h('span', { class: 'name', title: label, text: label }),
      input,
      alpha,
      h('span', { class: 'val', text: paint.alpha.toFixed(2) }),
      drop
    );
    return row;
  }

  function applyColor(element, prop, value) {
    if (!element) {
      return;
    }
    if (prop === 'background-color') {
      element.dataset.dnUserBg = '1';
      element.dataset.dnUserBgValue = value;
      if (element === dn.state.selected || element === dn.state.hovered) {
        const color = element === dn.state.selected ? dn.SELECTED : dn.HOVER;
        dn.paint(element, color);
      } else {
        element.style.removeProperty('background-color');
        element.style.setProperty('background-color', value);
      }
      return;
    }
    if (prop === 'border-color' && getComputedStyle(element).borderTopWidth === '0px') {
      element.style.borderStyle = 'solid';
      element.style.borderWidth = '1px';
    }
    element.style.setProperty(prop, value);
  }

  function opacityRow(element) {
    const parsed = parseFloat(getComputedStyle(element).opacity);
    const ratio = Number.isNaN(parsed) ? 1 : Math.max(0, Math.min(1, parsed));
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.step = '1';
    input.dataset.opacity = 'opacity';
    input.value = String(Math.round(ratio * 100));
    const row = h('div', { class: 'row slide-row' });
    row.append(
      h('span', { class: 'name', title: 'opacity', text: 'opacity' }),
      input,
      h('span', { class: 'val', text: ratio.toFixed(2) })
    );
    return row;
  }

  function colorTab(element) {
    return h('div', { class: 'stack' }, [
      opacityRow(element),
      ...COLORS.map(([label, prop]) => colorRow(element, label, prop))
    ]);
  }

  function borderTab(element) {
    return h('div', { class: 'stack' }, [
      sliderRow(element, 'border-width', 'border-width', false, false),
      keywords(element, 'border-style', BORDER_STYLES),
      colorRow(element, 'border-color', 'border-color'),
      h('span', { class: 'cap', text: 'border-radius' }),
      sliderRow(element, 'border-radius', 'border-radius', false, false),
      sliderRow(element, 'border-top-left-radius', 'border-top-left-radius', false, false),
      sliderRow(element, 'border-top-right-radius', 'border-top-right-radius', false, false),
      sliderRow(element, 'border-bottom-right-radius', 'border-bottom-right-radius', false, false),
      sliderRow(element, 'border-bottom-left-radius', 'border-bottom-left-radius', false, false)
    ]);
  }

  function tabBody(element) {
    const tab = dn.state.editorTab;
    if (tab === 'Styles' || tab === 'Estilos' || tab === 'Clases') {
      return estilosTab(element);
    }
    if (tab === 'Box' || tab === 'Caja') {
      return h('div', { class: 'stack' }, [
        stepper(element, 'width', 'width', false),
        stepper(element, 'height', 'height', false)
      ]);
    }
    if (tab === 'Position' || tab === 'Posición') {
      return positionTab(element);
    }
    if (tab === 'Space' || tab === 'Espacio' || tab === 'Margen' || tab === 'Relleno') {
      return spaceTab(element);
    }
    if (tab === 'Display') {
      return h('div', { class: 'stack' }, [
        keywords(element, 'display', DISPLAYS),
        flexTab(element)
      ]);
    }
    if (tab === 'Border') {
      return borderTab(element);
    }
    return colorTab(element);
  }

  function build(element) {
    const tabs = h('div', { class: 'tabs' }, TABS.map((name) => {
      return h('button', {
        type: 'button',
        class: name === dn.state.editorTab ? 'tab is-on' : 'tab',
        'data-tab': name,
        text: name
      });
    }));
    return h('div', {}, [
      tabs,
      h('div', { class: 'tab-body' }, [tabBody(element)])
    ]);
  }

  async function pickColor(element, prop) {
    if (typeof EyeDropper !== 'function' || !element) {
      return;
    }
    try {
      const result = await new EyeDropper().open();
      const currentPaint = readPaint(element, prop);
      applyColor(element, prop, toRgba(result.sRGBHex, currentPaint.alpha));
      if (editorRoot && dn.state.selected) {
        dn.renderEditor(editorRoot, dn.state.selected);
      }
    } catch (error) {
      void error;
    }
  }

  function onEditorClick(event) {
    const element = dn.state.selected;
    if (!element || !element.isConnected) {
      return;
    }
    const stepBtn = event.target.closest('[data-step]');
    if (stepBtn) {
      const prop = stepBtn.getAttribute('data-step');
      stepProp(element, prop, Number(stepBtn.getAttribute('data-d')));
      const val = stepBtn.parentElement.querySelector('.val');
      if (val) {
        val.textContent = formatPx(element, prop);
      }
      return;
    }
    const setBtn = event.target.closest('[data-set]');
    if (setBtn) {
      const prop = setBtn.getAttribute('data-set');
      const value = setBtn.getAttribute('data-value');
      element.style.setProperty(prop, value);
      if (prop === 'border-style' && value !== 'none' && value !== 'hidden') {
        const width = parseFloat(getComputedStyle(element).borderTopWidth);
        if (!width) {
          element.style.borderWidth = '1px';
        }
      }
      dn.renderEditor(editorRoot, element);
      return;
    }
    const autoBtn = event.target.closest('[data-auto]');
    if (autoBtn) {
      element.style.setProperty(autoBtn.getAttribute('data-auto'), 'auto');
      dn.renderEditor(editorRoot, element);
      return;
    }
    const offBtn = event.target.closest('[data-off]');
    if (offBtn) {
      toggleOff(element, offBtn.getAttribute('data-off'));
      dn.renderEditor(editorRoot, element);
      return;
    }
    const tabBtn = event.target.closest('[data-tab]');
    if (tabBtn) {
      dn.state.editorTab = tabBtn.getAttribute('data-tab');
      dn.renderEditor(editorRoot, element);
      return;
    }
    const dropBtn = event.target.closest('[data-drop]');
    if (dropBtn) {
      pickColor(element, dropBtn.getAttribute('data-drop'));
    }
  }

  function onEditorInput(event) {
    const element = dn.state.selected;
    const opacity = event.target.closest('[data-opacity]');
    if (opacity && element) {
      const ratio = Number(opacity.value) / 100;
      element.style.opacity = ratio.toFixed(2);
      const label = opacity.parentElement.querySelector('.val');
      if (label) {
        label.textContent = ratio.toFixed(2);
      }
      return;
    }
    const slide = event.target.closest('[data-slide]');
    if (slide && element) {
      const max = Number(slide.dataset.max);
      const signed = slide.dataset.signed === '1';
      const value = slideToValue(Number(slide.value), max, signed);
      if (slide.dataset.slide === 'border-width' && value > 0) {
        const borderStyle = getComputedStyle(element).borderTopStyle;
        if (borderStyle === 'none' || borderStyle === 'hidden') {
          element.style.borderStyle = 'solid';
        }
      }
      element.style.setProperty(slide.dataset.slide, value + 'px');
      const label = slide.parentElement.querySelector('.val');
      if (label) {
        label.textContent = value + 'px';
      }
      return;
    }
    const alpha = event.target.closest('[data-alpha]');
    if (alpha && element) {
      syncPaint(element, alpha.dataset.alpha, alpha.parentElement);
      return;
    }
    const input = event.target.closest('[data-color]');
    if (!input || !element) {
      return;
    }
    syncPaint(element, input.getAttribute('data-color'), input.parentElement);
  }

  dn.renderEditor = function (container, element) {
    editorRoot = container;
    if (container.dataset.bound !== '1') {
      container.dataset.bound = '1';
      container.addEventListener('click', onEditorClick);
      container.addEventListener('input', onEditorInput);
    }
    container.replaceChildren(build(element));
  };

  dn.renderTree = function (container) {
    const previous = container.querySelector('.tree-wrap');
    const top = previous ? previous.scrollTop : 0;
    const left = previous ? previous.scrollLeft : 0;
    const wrap = domTree();
    container.replaceChildren(wrap);
    if (dn.state.scrollTree) {
      dn.state.scrollTree = false;
      dn.state.treeAnchor = null;
      const selected = wrap.querySelector('button.is-on');
      if (!selected) {
        return;
      }
      const box = wrap.getBoundingClientRect();
      const button = selected.getBoundingClientRect();
      const contentTop = button.top - box.top + wrap.scrollTop;
      const contentLeft = button.left - box.left + wrap.scrollLeft;
      wrap.scrollTop = Math.max(0, contentTop - (wrap.clientHeight - button.height) / 2);
      wrap.scrollLeft = Math.max(0, contentLeft - (wrap.clientWidth - button.width) / 2);
      return;
    }
    if (dn.state.treeAnchor) {
      return;
    }
    wrap.scrollTop = top;
    wrap.scrollLeft = left;
  };
})();
