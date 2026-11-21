const branches = [
  {
    name: 'Plan de Ayala',
    place: 'Tihuatlán, Ver.',
    phone: '527821296044',
    map: 'https://maps.app.goo.gl/QBFGbWzGAFtHdWq58',
  },
  {
    name: 'La Petro',
    place: 'Poza Rica, Ver.',
    phone: '527821867572',
    map: 'https://maps.app.goo.gl/aV8PNCkQbCAgSAui6',
  },
];

const hours = 'Miércoles a domingo · 9:00 a. m. a 5:00 p. m.';
const included = 'Incluye arroz o frijoles, tortillas, limones y salsa.';
const ribs = 'Natural, enchilada o BBQ.';
const steak = 'Peso en crudo. Asada al momento.';

const groups = [
  ['paquetes', 'Paquetes', included, [
    ['Mixto', 290, [
      '1/2 pollo',
      '1/4 de salchichón',
      '1/4 de chorizo',
      '1/4 de costilla',
    ]],
    ['Chistorra', 300, [
      '1/2 pollo',
      '1/4 de salchichón',
      '1/4 de chistorra',
      '1/4 de costilla',
    ]],
    ['Jumbo', 420, [
      '1/2 pollo',
      '1/2 de salchichón',
      '1/2 de chorizo',
      '1/2 de costilla',
    ]],
    ['Argentino', 300, [
      '1/2 pollo',
      '1/4 de salchichón',
      '1/4 de chorizo argentino',
      '1/4 de costilla',
    ]],
    ['Especial', 400, [
      '1/2 kg de arrachera (peso en crudo)',
      '1/4 de salchichón',
      '1/4 de chorizo',
      '1/4 de costilla',
      '1 chile asado',
    ]],
    ['Pollón', null, [
      '1/2 pollo',
      'Salchichón',
      '1 chile',
    ]],
  ]],
  ['carnes', 'Carnes y asados', included, [
    ['½ pollo', 100, null, { picor: true }],
    ['Pollo entero', 200, null, { picor: true }],
    ['¼ kg de costilla', 100, ribs],
    ['½ kg de costilla', 160, ribs],
    ['1 kg de costilla', 320, ribs],
    ['½ kg de arrachera', 250, steak],
    ['1 kg de arrachera', 450, steak],
    ['¼ kg de chorizo', 65],
    ['¼ kg de chorizo argentino', 75],
    ['¼ kg de chistorra', 75],
    ['¼ kg de salchichón', 45],
  ]],
  ['extras', 'Complementos y extras', '¡Dale más sabor a tu pedido!', [
    ['Frijoles extra', 15],
    ['Arroz extra', 15],
  ]],
];

const cart = new Map();
const productCards = new Map();
const $ = (id) => document.getElementById(id);
const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});
const wa = (phone) => 'https://wa.me/' + phone;

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function button(label, action) {
  const node = element('button', label);
  node.type = 'button';
  node.addEventListener('click', action);
  return node;
}

function link(label, url) {
  const node = element('a', label);
  node.href = url;
  node.target = '_blank';
  node.rel = 'noopener';
  return node;
}

let feedbackTimer;

for (const [id, name, description, products] of groups) {
  const section = element('section');
  section.id = id;

  const grid = element('div', '', 'grid');
  const isPackage = id === 'paquetes';

  for (const [product, price, details, { picor = false } = {}] of products) {
    const itemName = isPackage ? 'Paquete ' + product : product;
    const offersPicor = isPackage || picor;
    const card = element(isPackage ? 'details' : 'article', '', 'card');
    const title = element('h3', itemName);
    const productId = id + ':' + product;
    const cartCount = element('span', '0 en tu pedido', 'pedido-cantidad');
    productCards.set(productId, { card, cartCount });

    if (isPackage) {
      const summary = element('summary');
      summary.append(title, cartCount);

      const ingredients = element('ul', '', 'package-ingredients');
      for (const ingredient of details) {
        ingredients.append(element('li', ingredient));
      }

      card.append(summary, ingredients);
    } else {
      card.append(title, cartCount);
      if (details) card.append(element('p', details));
    }

    const options = [];
    if (details === ribs) {
      options.push(['Sabor de la costilla', ['Natural', 'Enchilada', 'BBQ']]);
    }
    if (id !== 'extras') {
      options.push(['Complemento', ['Frijoles', 'Arroz']]);
    }
    if (offersPicor) {
      options.push(['Picor', ['Natural', 'Enchilado', 'BBQ']]);
    }

    const controls = options.map(([label, values]) => {
      const control = element('select');
      control.setAttribute('aria-label', label + ' para ' + itemName);
      for (const value of values) {
        control.add(new Option(value, value));
      }
      return control;
    });

    const add = button('Agregar', () => {
      const choice = controls.map((control) => control.value).join(' · ');
      const name = choice ? itemName + ' (' + choice + ')' : itemName;

      change({ name, price, productId }, 1);

      $('count').animate(
        [{ opacity: 0.35 }, { opacity: 1 }],
        { duration: 280 },
      );

      clearTimeout(feedbackTimer);
      $('status').textContent = name + ' agregado al pedido.';
      feedbackTimer = setTimeout(() => {
        $('status').textContent = '';
      }, 1800);
    });

    add.setAttribute('aria-label', 'Agregar ' + itemName);

    const priceText = price === null ? 'Precio por confirmar' : money.format(price);
    card.append(element('strong', priceText, 'price'));

    if (isPackage) {
      const [complement] = controls;
      const label = element(
        'label',
        'Elige tu complemento ideal:',
        'package-complement-label',
      );

      complement.id = 'complemento-paquete-' + grid.children.length;
      complement.style.width = 'fit-content';
      complement.style.maxWidth = 'calc(100% - 2.5rem)';
      complement.style.paddingInline = '0.85rem 1.75rem';
      complement.style.marginTop = '0';

      label.htmlFor = complement.id;
      label.style.display = 'block';
      label.style.margin = '1rem 1.25rem 0.25rem';
      label.style.fontWeight = '700';

      card.append(label);
    }

    if (offersPicor) {
      const choice = controls.at(-1);
      choice.id = 'picor-' + id + '-' + grid.children.length;
      const label = element('label', 'Elige el picor', isPackage ? 'package-complement-label' : '');
      label.htmlFor = choice.id;
      card.append(...controls.slice(0, -1), label, choice);
    } else {
      card.append(...controls);
    }
    card.append(add);
    grid.append(card);
  }

  section.append(
    element('h2', name),
    element('p', description, 'section-note'),
    grid,
  );
  $('menu').append(section);
}

const branchMapPoints = {
  'Plan de Ayala': '20.5529999,-97.4689535',
  'La Petro': '20.5129442,-97.426471',
};

branches.forEach((branch, index) => {
  $('branch').add(new Option(branch.name, String(index)));

  const card = element('article', '', 'card branch-card');
  const layout = element('div', '', 'branch-layout');
  const info = element('div', '', 'branch-info');

  const title = element('h3', '', 'branch-title');
  const pin = element('span', '📍');
  pin.setAttribute('aria-hidden', 'true');
  title.append(pin, document.createTextNode(branch.name));

  const reference = link('¡VEN A CONOCERNOS!', branch.map);
reference.className = 'branch-reference';
reference.setAttribute(
  'aria-label',
  `¡Ven a conocernos! Ver punto de referencia de ${branch.name} en Google Maps`,
);

const schedule = element('p', '', 'branch-hours');
schedule.append(
  'Horario: Miércoles a domingo',
  element('br'),
  '9:00 a. m. a 5:00 p. m.',
);

info.append(
  title,
  element('p', branch.place, 'branch-city'),
  schedule,
  reference,
);

  const preview = element('div', '', 'branch-map');
  const map = element('iframe');
  const point = encodeURIComponent(branchMapPoints[branch.name]);
  map.src = `https://maps.google.com/maps?q=${point}&z=16&output=embed`;
  map.title = `Mapa del punto de referencia de ${branch.name}`;
  map.loading = 'lazy';
  preview.append(map);

  const order = link('¡HAZ TU PEDIDO POR WHATSAPP!', wa(branch.phone));
  order.className = 'branch-whatsapp';
  order.insertAdjacentHTML('afterbegin', `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5a9.3 9.3 0 0 0-8 14l-1.3 4.8 4.9-1.3A9.3 9.3 0 1 0 12 2.5Z"
        fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path fill="currentColor"
        d="M8.5 7.1c-.4 0-.7.2-1 .5-.5.5-.7 1.1-.7 1.8 0 2.5 3.1 5.8 5.8 7 .9.4 1.7.5 2.3.4.7-.1 1.7-.8 1.9-1.4.2-.6.2-1 .1-1.1-.1-.2-.3-.3-.6-.4l-1.8-.9c-.3-.1-.5-.2-.7.1l-.8 1c-.2.2-.3.2-.6.1-1.4-.6-2.5-1.6-3.2-2.9-.2-.3-.2-.4 0-.6l.6-.7c.1-.2.2-.4.1-.6L9.1 7.6c-.1-.4-.3-.5-.6-.5Z"/>
    </svg>
  `);

  layout.append(info, preview);
  card.append(layout, order);
  $('branches').append(card);
});

function change(item, difference) {
  const quantity = (cart.get(item.name)?.quantity ?? 0) + difference;
  if (quantity > 0) {
    cart.set(item.name, { ...item, quantity });
  } else {
    cart.delete(item.name);
  }
  renderItems(item.name, difference);
}

function renderItems(focusName, direction) {
  let count = 0;
  let nextFocus;
  const items = $('items');
  const quantities = new Map();
  items.replaceChildren();

  for (const item of cart.values()) {
    count += item.quantity;
    const previous = quantities.get(item.productId) ?? 0;
    quantities.set(item.productId, previous + item.quantity);

    const line = element('div', '', 'line');
    const quantity = element('div', '', 'qty');
    const minus = button('−', () => change(item, -1));
    const plus = button('+', () => change(item, 1));

    minus.setAttribute('aria-label', 'Quitar una unidad de ' + item.name);
    plus.setAttribute('aria-label', 'Agregar una unidad de ' + item.name);
    quantity.append(minus, element('span', String(item.quantity)), plus);
    line.append(element('span', item.name), quantity);
    items.append(line);

    if (item.name === focusName) {
      nextFocus = direction < 0 ? minus : plus;
    }
  }

  if (!count) {
    items.append(element('p', 'Tu pedido está vacío.', 'muted'));
  }

  for (const [productId, { card, cartCount }] of productCards) {
    const quantity = quantities.get(productId) ?? 0;
    cartCount.textContent = quantity + ' en tu pedido';
    card.classList.toggle('en-pedido', quantity > 0);
  }

  $('count').textContent = String(count);
  if ($('cart').open && focusName) {
    (nextFocus ?? $('branch')).focus();
  }
  renderTicket();
}

function buildTicket(branch, items, notes) {
  const knownTotal = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );
  const pending = items.some((item) => item.price === null);

  const lines = items.map(({ quantity, name, price }) => {
    const amount = price === null
      ? 'Precio por confirmar'
      : money.format(price * quantity);
    return quantity + ' × ' + name + ' — ' + amount;
  });

  const totalLine = pending
    ? 'Subtotal de artículos con precio: ' + money.format(knownTotal) + ' MXN. Total por confirmar.'
    : 'Total estimado: ' + money.format(knownTotal) + ' MXN';

  const summary = [
    'Hola, quiero hacer este pedido en El Remolquito del Asadero:',
    'Sucursal: ' + (branch?.name ?? 'Por seleccionar'),
    '',
    ...lines,
    '',
    totalLine,
  ];

  if (notes) {
    summary.push('Indicaciones: ' + notes);
  }

  return summary.join('\n');
}

function ticketUrl(branch, items, notes) {
  const message = buildTicket(branch, items, notes);
  return wa(branch.phone) + '?text=' + encodeURIComponent(message);
}

const checkoutLinks = [];
document.querySelectorAll('#enviar-orden [data-sucursal]').forEach((control) => {
  const index = branches.findIndex((branch) => branch.name === control.dataset.sucursal);
  if (index === -1) return;

  const anchor = control.matches('a') ? control : link('', '#menu');
  if (anchor !== control) {
    anchor.className = control.className;
    anchor.dataset.sucursal = control.dataset.sucursal;
    anchor.append(...control.childNodes);
    control.replaceWith(anchor);
  }
  anchor.target = '_blank';
  anchor.rel = 'noopener';

  anchor.addEventListener('click', (event) => {
    if (cart.size > 0) return;

    event.preventDefault();
    $('branch').value = String(index);
    renderTicket();

    const dialog = $('cart');
    if (!dialog.open) dialog.showModal();
  });

  checkoutLinks.push({ anchor, branch: branches[index] });
});

function renderTicket() {
  const branchIndex = $('branch').value;
  const branch = branchIndex === '' ? null : branches[Number(branchIndex)];
  const items = [...cart.values()];
  const notes = $('notes').value.trim();

  $('ticket').hidden = items.length === 0;
  $('ticket').textContent = buildTicket(branch, items, notes);

  const send = $('send');
  send.hidden = !branch || items.length === 0;
  $('send-note').hidden = send.hidden;

  if (send.hidden) {
    send.removeAttribute('href');
  } else {
    send.href = ticketUrl(branch, items, notes);
  }

  for (const { anchor, branch: checkoutBranch } of checkoutLinks) {
    anchor.href = items.length > 0 ? ticketUrl(checkoutBranch, items, notes) : '#menu';
  }
}

document.querySelector('.order').addEventListener('click', () => $('cart').showModal());
$('branch').addEventListener('change', renderTicket);
$('notes').addEventListener('input', renderTicket);
renderItems();
