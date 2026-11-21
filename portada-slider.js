const hero = document.querySelector('main .hero');

if (hero && !document.querySelector('.portada-slider')) {
  const slider = document.createElement('section');
  slider.className = 'portada-slider';
  slider.setAttribute('aria-label', 'Portada y promoción');
  slider.innerHTML = `
    <div class="portada-slider__viewport">
      <div class="portada-slider__track">
        <div class="portada-slide portada-slide--inicio is-current"></div>
        <div class="portada-slide portada-slide--promo" aria-hidden="true" inert>
          <img class="portada-promo__imagen" width="2048" height="733"
               alt="Promo Miércoles. Refresco de litro y medio gratis."
               decoding="async">
          <div class="portada-promo__pedidos"></div>
        </div>
      </div>
      <div class="portada-slider__controles">
        <button type="button" class="portada-slider__punto" aria-label="Ver portada"
                aria-current="true"></button>
        <button type="button" class="portada-slider__punto" aria-label="Ver Promo Miércoles"
                disabled></button>
        <button type="button" class="portada-slider__pausa">Pausar</button>
      </div>
    </div>
  `;

  const iconoWhatsApp = new URL('./assets/whatsapp-oficial.svg', import.meta.url).href;

  const pedidos = slider.querySelector('.portada-promo__pedidos');
  for (const [sucursal, telefono] of [
    ['Plan de Ayala', '527821296044'],
    ['La Petro', '527821867572'],
  ]) {
    const mensaje = `¡Hola! Quiero pedir un paquete calientito en El Remolquito del Asadero, sucursal ${sucursal}. ¿Me comparten las opciones disponibles, por favor?`;
    const boton = document.createElement('a');
    boton.className = 'portada-promo__pedido';
    boton.href = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    boton.target = '_blank';
    boton.rel = 'noopener noreferrer';
    boton.innerHTML = `
      <img class="portada-promo__icono" src="${iconoWhatsApp}" alt=""
           width="24" height="24">
      <span>
        <strong>¡PÍDE TU PAQUETE CALIENTITO!</strong>
        <small></small>
      </span>
    `;
    boton.querySelector('small').textContent = `Remolquito ${sucursal.toUpperCase()}`;
    pedidos.append(boton);
  }

  const imagenPromo = slider.querySelector('.portada-promo__imagen');
  const track = slider.querySelector('.portada-slider__track');
  const diapositivas = [...track.children];
  const puntos = slider.querySelectorAll('.portada-slider__punto');
  const pausa = slider.querySelector('.portada-slider__pausa');
  const movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)');
  const vistaMovil = window.matchMedia('(max-width: 740px)');

  let actual = 0;
  let promoLista = false;
  let pausado = movimientoReducido.matches;
  let cursorDentro = false;
  let temporizador;
  let saliente;
  let animaciones = [];

  hero.before(slider);
  diapositivas[0].append(hero);

  function programar() {
    clearTimeout(temporizador);
    if (!promoLista || pausado || cursorDentro || document.hidden ||
        track.contains(document.activeElement)) return;

    temporizador = setTimeout(() => {
      mostrar((actual + 1) % diapositivas.length);
    }, 5000);
  }

  function mostrar(indice) {
    if (indice === actual || (indice === 1 && !promoLista)) {
      programar();
      return;
    }

    for (const animacion of animaciones) animacion.cancel();
    saliente?.classList.remove('is-leaving');
    saliente = null;
    animaciones = [];

    const anterior = diapositivas[actual];
    const siguiente = diapositivas[indice];
    actual = indice;
    diapositivas.forEach((diapositiva, i) => {
      const visible = i === actual;
      diapositiva.classList.toggle('is-current', visible);
      diapositiva.inert = !visible;
      diapositiva.setAttribute('aria-hidden', String(!visible));
      if (visible) puntos[i].setAttribute('aria-current', 'true');
      else puntos[i].removeAttribute('aria-current');
    });

    if (!vistaMovil.matches && !movimientoReducido.matches && typeof anterior.animate === 'function') {
      saliente = anterior;
      anterior.classList.add('is-leaving');
      const tiempos = { duration: 480, easing: 'ease-in-out' };
      const salida = anterior.animate(
        [{ transform: 'translateX(0)' }, { transform: 'translateX(100%)' }],
        tiempos,
      );
      const entrada = siguiente.animate(
        [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
        tiempos,
      );
      animaciones = [salida, entrada];

      salida.addEventListener('finish', () => {
        if (animaciones[0] !== salida) return;
        anterior.classList.remove('is-leaving');
        saliente = null;
      }, { once: true });
    }

    programar();
  }

  function actualizarPausa() {
    pausa.textContent = pausado ? 'Reproducir' : 'Pausar';
    programar();
  }

  puntos.forEach((punto, indice) => {
    punto.addEventListener('click', () => mostrar(indice));
  });

  pausa.addEventListener('click', () => {
    pausado = !pausado;
    actualizarPausa();
  });

  slider.addEventListener('pointerenter', (evento) => {
    if (evento.pointerType !== 'mouse') return;
    cursorDentro = true;
    programar();
  });
  slider.addEventListener('pointerleave', (evento) => {
    if (evento.pointerType !== 'mouse') return;
    cursorDentro = false;
    programar();
  });

  track.addEventListener('focusin', programar);
  track.addEventListener('focusout', () => setTimeout(programar, 0));
  movimientoReducido.addEventListener('change', (evento) => {
    pausado = evento.matches;
    actualizarPausa();
  });
  document.addEventListener('visibilitychange', programar);

  imagenPromo.addEventListener('load', () => {
    promoLista = true;
    puntos[1].disabled = false;
    programar();
  }, { once: true });
  imagenPromo.src = new URL('./assets/promo-portada.webp', import.meta.url).href;

  actualizarPausa();
}
