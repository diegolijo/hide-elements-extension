(function () {
  const dn = globalThis.__dn;
  let editorRoot = null;

  const TABS = ['Estilos', 'Caja', 'Posición', 'Espacio', 'Display', 'Color'];
  const POSITIONS = ['static', 'relative', 'absolute', 'fixed', 'sticky'];
  const OFFSETS = [
    ['Superior', 'top'],
    ['Derecha', 'right'],
    ['Inferior', 'bottom'],
    ['Izquierda', 'left']
  ];
  const SIDES = [
    ['Superior', 'top'],
    ['Derecha', 'right'],
    ['Inferior', 'bottom'],
    ['Izquierda', 'left']
  ];
  const DISPLAYS = ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'none'];
  const COLORS = [
    ['Texto', 'color'],
    ['Fondo', 'background-color'],
    ['Borde', 'border-color']
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
      h('span', { class: 'name', text: label }),
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
      h('span', { class: 'name', text: label }),
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
      h('span', { class: 'cap', text: 'Margen' }),
      ...SIDES.map(([label, side]) => sliderRow(element, label, 'margin-' + side, true, false)),
      h('span', { class: 'cap', text: 'Relleno' }),
      ...SIDES.map(([label, side]) => sliderRow(element, label, 'padding-' + side, false, false))
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
        dn.paint(element, dn.ORANGE);
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
      ['color', 'color'],
      ['background', 'background-color']
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
    return h('div', { class: 'stack' }, [line, domTree(element)]);
  }

  function appendTree(list, element, depth, budget) {
    if (!element || element.id === dn.HOST_ID || budget.count >= 60) {
      return;
    }
    budget.count += 1;
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = dn.describe(element);
    if (element === dn.state.selected) {
      button.classList.add('is-on');
    }
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      dn.select(element);
    });
    item.append(button);
    const children = [...element.children].filter((child) => child.id !== dn.HOST_ID);
    if (children.length && depth < 6) {
      const nested = document.createElement('ul');
      children.forEach((child) => appendTree(nested, child, depth + 1, budget));
      item.append(nested);
    } else if (children.length) {
      item.append(h('span', { class: 'cap', text: '…' }));
    }
    list.append(item);
  }

  function domTree(element) {
    const list = document.createElement('ul');
    list.className = 'tree';
    appendTree(list, element, 0, { count: 0 });
    return h('div', { class: 'tree-wrap' }, [
      h('div', { class: 'cap', text: 'Árbol' }),
      list
    ]);
  }

  function positionTab(element) {
    const position = current(element, 'position');
    const blocks = [keywords(element, 'position', POSITIONS)];
    if (position === 'absolute' || position === 'fixed' || position === 'sticky') {
      blocks.push(h('div', { class: 'stack' }, OFFSETS.map(([label, prop]) => {
        return sliderRow(element, label, prop, true, true);
      })));
    }
    return h('div', { class: 'stack' }, blocks);
  }

  function flexTab(element) {
    if (!isFlexDisplay(element)) {
      return null;
    }
    return h('div', { class: 'stack' }, [
      h('span', { class: 'cap', text: 'Dirección' }),
      keywords(element, 'flex-direction', ['row', 'column', 'row-reverse', 'column-reverse']),
      h('span', { class: 'cap', text: 'Ajuste' }),
      keywords(element, 'flex-wrap', ['nowrap', 'wrap']),
      h('span', { class: 'cap', text: 'justify-content' }),
      keywords(element, 'justify-content', ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']),
      h('span', { class: 'cap', text: 'align-items' }),
      keywords(element, 'align-items', ['flex-start', 'center', 'flex-end', 'stretch']),
      sliderRow(element, 'Gap', 'gap', false, false)
    ]);
  }

  function toHex(value) {
    if (!value) {
      return '#000000';
    }
    const hex = String(value).trim();
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      return hex.toLowerCase();
    }
    if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
      return '#' + hex.slice(1).split('').map((char) => char + char).join('').toLowerCase();
    }
    if (/^#[0-9a-fA-F]{8}$/.test(hex)) {
      return hex.slice(0, 7).toLowerCase();
    }
    const match = hex.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (!match) {
      return '#000000';
    }
    const channel = (part) => Math.max(0, Math.min(255, Math.round(Number(part)))).toString(16).padStart(2, '0');
    return '#' + channel(match[1]) + channel(match[2]) + channel(match[3]);
  }

  function readColor(element, prop) {
    if (prop === 'background-color') {
      if (element.dataset.dnUserBg === '1' && element.dataset.dnUserBgValue) {
        return toHex(element.dataset.dnUserBgValue);
      }
      if (element.dataset.dnComputedBg) {
        return toHex(element.dataset.dnComputedBg);
      }
    }
    if (prop === 'border-color') {
      return toHex(getComputedStyle(element).borderTopColor);
    }
    return toHex(getComputedStyle(element).getPropertyValue(prop));
  }

  function applyColor(element, prop, value) {
    if (!element) {
      return;
    }
    if (prop === 'background-color') {
      element.dataset.dnUserBg = '1';
      element.dataset.dnUserBgValue = value;
      if (element === dn.state.selected || element === dn.state.hovered) {
        const color = element === dn.state.selected ? dn.ORANGE : dn.RED;
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

  function colorTab(element) {
    const canDrop = typeof EyeDropper === 'function';
    return h('div', { class: 'stack' }, COLORS.map(([label, prop]) => {
      const input = h('input', { type: 'color', 'data-color': prop, value: readColor(element, prop), title: label });
      const drop = h('button', {
        type: 'button',
        class: 'icon',
        'data-drop': prop,
        title: canDrop ? 'Cuentagotas' : 'El cuentagotas no está disponible'
      });
      drop.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M19.3 4.7a3 3 0 0 0-4.2 0l-1.1 1.1-1.4-1.4-1.4 1.4 1.4 1.4L4 15.8V20h4.2l8.6-8.6 1.4 1.4 1.4-1.4-1.4-1.4 1.1-1.1a3 3 0 0 0 0-4.2z"></path></svg>';
      drop.disabled = !canDrop;
      return h('div', { class: 'row' }, [
        h('span', { class: 'name', text: label }),
        input,
        drop
      ]);
    }));
  }

  function tabBody(element) {
    const tab = dn.state.editorTab;
    if (tab === 'Estilos' || tab === 'Clases') {
      return estilosTab(element);
    }
    if (tab === 'Caja') {
      return h('div', { class: 'stack' }, [
        stepper(element, 'Ancho', 'width', false),
        stepper(element, 'Alto', 'height', false)
      ]);
    }
    if (tab === 'Posición') {
      return positionTab(element);
    }
    if (tab === 'Espacio' || tab === 'Margen' || tab === 'Relleno') {
      return spaceTab(element);
    }
    if (tab === 'Display') {
      return h('div', { class: 'stack' }, [
        keywords(element, 'display', DISPLAYS),
        flexTab(element)
      ]);
    }
    return colorTab(element);
  }

  function build(element) {
    const tabs = h('div', { class: 'tabs' }, TABS.map((name) => {
      return h('button', {
        type: 'button',
        class: name === dn.state.editorTab ? 'is-on' : '',
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
      applyColor(element, prop, result.sRGBHex);
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
      element.style.setProperty(setBtn.getAttribute('data-set'), setBtn.getAttribute('data-value'));
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
    const slide = event.target.closest('[data-slide]');
    if (slide && element) {
      const max = Number(slide.dataset.max);
      const signed = slide.dataset.signed === '1';
      const value = slideToValue(Number(slide.value), max, signed);
      element.style.setProperty(slide.dataset.slide, value + 'px');
      const label = slide.parentElement.querySelector('.val');
      if (label) {
        label.textContent = value + 'px';
      }
      return;
    }
    const input = event.target.closest('[data-color]');
    if (!input || !element) {
      return;
    }
    applyColor(element, input.getAttribute('data-color'), input.value);
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
})();
