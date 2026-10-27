// PrintLab Pilar landing: mobile menu, scroll reveals, tagline words, current section in the nav,
// and the contact form (it opens WhatsApp with the message ready: no server, nothing is stored).
(() => {
  const WHATSAPP = '5491176186706';
  const body = document.body;
  document.documentElement.classList.remove('no-js'); // without JS, sections are simply shown

  /* Mobile menu */
  const toggle = document.querySelector('.nav-toggle');
  const cerrarMenu = () => { body.classList.remove('nav-open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Abrir menú'); };
  toggle.addEventListener('click', () => {
    const abierto = body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  document.querySelectorAll('.nav-links a').forEach((a) => a.addEventListener('click', cerrarMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });

  /* Sections rise and fade in once */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => entradas.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach((s) => io.observe(s));
  } else {
    reveals.forEach((s) => s.classList.add('visible'));
  }

  /* Tagline: each word lights up as it crosses a line near the middle of the screen */
  const tagline = document.querySelector('[data-words]');
  if (tagline) {
    const resaltar = new Set(['estudiar.', 'impresos']);
    tagline.innerHTML = tagline.innerHTML.split(/(<br>\s*)/).map((parte) => (parte.startsWith('<br')
      ? parte
      : parte.split(/\s+/).filter(Boolean).map((w) => `<span class="w${resaltar.has(w) ? ' c' : ''}">${w}</span>`).join(' '))).join('');
    const palabras = [...tagline.querySelectorAll('.w')];
    let pendiente = false;
    const pintar = () => {
      pendiente = false;
      const linea = window.innerHeight * 0.62;
      palabras.forEach((w) => { if (w.getBoundingClientRect().top < linea) w.classList.add('on'); });
    };
    const alScroll = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    const vigia = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) window.addEventListener('scroll', alScroll, { passive: true });
      else window.removeEventListener('scroll', alScroll);
      pintar();
    });
    vigia.observe(tagline);
  }

  /* Current section in the navigation */
  const enlaces = new Map([...document.querySelectorAll('.nav-links a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), a]));
  const marcar = new IntersectionObserver((entradas) => entradas.forEach((en) => {
    const a = enlaces.get(en.target.id);
    if (a && en.isIntersecting) { enlaces.forEach((x) => { x.classList.remove('activo'); x.removeAttribute('aria-current'); }); a.classList.add('activo'); a.setAttribute('aria-current', 'true'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  enlaces.forEach((_a, id) => { const s = document.getElementById(id); if (s) marcar.observe(s); });

  /* Contact form → WhatsApp */
  const form = document.getElementById('form-contacto');
  const estado = document.getElementById('form-estado');
  const validar = (campo, error) => {
    const ok = campo.value.trim().length > 0;
    campo.closest('.field').classList.toggle('invalido', !ok);
    campo.setAttribute('aria-invalid', String(!ok));
    document.getElementById(error).hidden = ok;
    return ok;
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = form.elements.nombre;
    const mensaje = form.elements.mensaje;
    const ok = [validar(nombre, 'e-nombre'), validar(mensaje, 'e-mensaje')];
    if (ok.includes(false)) { (ok[0] ? mensaje : nombre).focus(); estado.textContent = ''; return; }
    const texto = `Hola PrintLab Pilar, soy ${nombre.value.trim()}.\nConsulta: ${form.elements.tema.value}\n${mensaje.value.trim()}`;
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
    estado.textContent = 'Abrimos WhatsApp con tu mensaje listo. Solo falta tocar Enviar.';
    const ventana = window.open(url, '_blank', 'noopener');
    if (!ventana) window.location.href = url; // pop-up blocked (some phones): go straight to WhatsApp
  });
  ['nombre', 'mensaje'].forEach((n) => form.elements[n].addEventListener('input', () => {
    if (form.elements[n].closest('.field').classList.contains('invalido')) validar(form.elements[n], `e-${n}`);
  }));

  const anio = document.getElementById('anio');
  if (anio) anio.textContent = String(new Date().getFullYear());
})();
