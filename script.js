// ===== Datos editables =====
const CONFIG = {
  email: "Inversioneshermanoscarranzasas@gmail.com",
  contacts: {
    edwin: { nombre: "Edwin Yair Carranza González", wa: "573115789824" },
    cristian: { nombre: "Cristian Felipe Carranza González", wa: "573012005969" }
  },
  // Mensaje que aparece escrito en WhatsApp (la persona puede editarlo antes de enviarlo)
  waMessage: "Hola, Hermanos Carranza. Estoy interesada en conocer más sobre sus servicios y las oportunidades que ofrecen. ¿Podrían brindarme más información, por favor? Muchas gracias.",
  // Imágenes del carrusel. Escribe la ruta exacta, ej. ["img/carrusel/carrusel.jpg"].
  // Con una sola imagen se muestra como banner fijo; con varias, como carrusel automático.
  // Si queda vacío, se busca una imagen llamada "carrusel" (ver bannerNames/bannerFolders).
  banner: [],
  bannerNames: ["carrusel", "Carrusel", "CARRUSEL", "banner", "Banner", "carrusel1", "carrusel-1"],
  bannerFolders: ["img/carrusel/", "img/"],
  bannerInterval: 6000,
  // Foto de los dos hermanos: se busca en img/galeria con estos nombres. Si no existe, la sección no se muestra.
  groupPhoto: ["hermanos", "Hermanos", "hermanos-carranza", "edwin-y-cristian", "equipo", "foto", "grupo"],
  // Redes sociales oficiales. Completa la URL cuando esté confirmada; si está vacía, no se muestra.
  social: { facebook: "", instagram: "" }
};
const $ = (s, r = document) => r.querySelector(s);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EXTS = ["jpg", "jpeg", "png", "webp", "JPG", "PNG"];

$("#year").textContent = new Date().getFullYear();

// Prueba rutas en orden hasta que una carga; evita mostrar imágenes rotas.
function loadFirst(paths, onLoad, onFail) {
  (function next(i) {
    if (i >= paths.length) { if (onFail) onFail(); return; }
    const img = new Image();
    img.onload = () => onLoad(img, paths[i]);
    img.onerror = () => next(i + 1);
    img.src = paths[i];
  })(0);
}

// Carrusel superior. Solo muestra imágenes que existen; con una sola es un banner fijo.
(function () {
  const car = $("#carousel"), track = $("#slides");
  const configured = [].concat(CONFIG.banner || []).filter(Boolean);
  const candidates = configured.length
    ? configured
    : CONFIG.bannerFolders.flatMap(f => CONFIG.bannerNames.flatMap(n => EXTS.map(e => `${f}${n}.${e}`)));

  const test = src => new Promise(res => { const i = new Image(); i.onload = () => res(src); i.onerror = () => res(null); i.src = src; });
  // Con rutas configuradas se cargan todas; en búsqueda automática se prueba una por una y se usa solo la primera que exista.
  const search = configured.length
    ? Promise.all(candidates.map(test)).then(f => f.filter(Boolean))
    : new Promise(res => loadFirst(candidates, (_, p) => res([p]), () => res([])));
  search.then(srcs => {
    if (!srcs.length) { $("#bannerFallback").hidden = false; return; }

    track.innerHTML = srcs.map((s, i) =>
      `<div class="slide" role="group" aria-roledescription="diapositiva" aria-label="${i + 1} de ${srcs.length}"><img src="${s}" alt="Inversiones Hermanos Carranza S.A.S., red multiservicios"${i ? ' loading="lazy"' : ' fetchpriority="high"'}></div>`
    ).join("");
    car.classList.add("loaded");
    if (srcs.length < 2) return;

    const prev = $("#carPrev"), next = $("#carNext"), dots = $("#dots");
    let cur = 0, timer;
    dots.innerHTML = srcs.map((_, i) => `<button type="button" aria-label="Ir a la imagen ${i + 1}"></button>`).join("");
    [prev, next, dots].forEach(e => e.hidden = false);
    const go = n => {
      cur = (n + srcs.length) % srcs.length;
      track.style.transform = `translateX(-${cur * 100}%)`;
      [...dots.children].forEach((d, i) => d.setAttribute("aria-current", i === cur));
    };
    const play = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => go(cur + 1), CONFIG.bannerInterval); };
    prev.onclick = () => { go(cur - 1); play(); };
    next.onclick = () => { go(cur + 1); play(); };
    dots.onclick = e => { const i = [...dots.children].indexOf(e.target.closest("button")); if (i > -1) { go(i); play(); } };
    car.addEventListener("mouseenter", () => clearInterval(timer));
    car.addEventListener("mouseleave", play);
    car.addEventListener("focusin", () => clearInterval(timer));
    // Deslizar con el dedo en tabletas y celulares
    let x0 = null;
    car.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; clearInterval(timer); }, { passive: true });
    car.addEventListener("touchend", e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      play();
    });
    go(0); play();
  });
})();

// Barra de progreso de lectura
(function () {
  const bar = $("#progress");
  const upd = () => { const h = document.documentElement; bar.style.width = (h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1) * 100) + "%"; };
  addEventListener("scroll", upd, { passive: true }); upd();
})();

// Resalta en el menú la sección visible
(function () {
  if (!("IntersectionObserver" in window)) return;
  const links = [...document.querySelectorAll("#menu a[href^='#']:not(.btn)")];
  const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    links.forEach(a => a.removeAttribute("aria-current"));
    const a = map.get(en.target.id); if (a) a.setAttribute("aria-current", "true");
  }), { rootMargin: "-45% 0px -50% 0px" });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
})();

// Foto de los hermanos (la sección solo aparece si la imagen existe)
(function () {
  const fig = $("#groupPhoto"), sec = $("#equipo");
  const paths = CONFIG.groupPhoto.flatMap(n => EXTS.map(e => `img/galeria/${n}.${e}`));
  loadFirst(paths, (img, src) => {
    img.alt = "Edwin Yair y Cristian Felipe Carranza González, de Inversiones Hermanos Carranza S.A.S.";
    img.loading = "lazy";
    fig.appendChild(img);
    sec.hidden = false;
  });
})();

// Redes sociales: WhatsApp (abre el selector) siempre; Facebook e Instagram solo con URL configurada
(function () {
  const link = (n, icon, url) =>
    `<li><a href="${url}" target="_blank" rel="noopener"><svg class="ic sm" aria-hidden="true"><use href="#${icon}"/></svg>${n}</a></li>`;
  const html = [
    CONFIG.social.facebook && link("Facebook", "facebook", CONFIG.social.facebook),
    CONFIG.social.instagram && link("Instagram", "instagram", CONFIG.social.instagram),
    `<li><button type="button" data-wa aria-haspopup="dialog"><svg class="ic sm" aria-hidden="true"><use href="#wa"/></svg>WhatsApp</button></li>`
  ].filter(Boolean).join("");
  ["#social", "#footSocial"].forEach(id => { const ul = $(id); if (ul) ul.innerHTML = html; });
})();

// Logo: si la ruta img/logo.png no existe, prueba img/logo/logo.png
document.querySelectorAll(".brand img, .footer img").forEach(img => {
  const retry = () => { if (!img.dataset.retry) { img.dataset.retry = "1"; img.src = "img/logo/logo.png"; } };
  img.addEventListener("error", retry);
  if (img.complete && img.naturalWidth === 0) retry(); // el error pudo ocurrir antes de cargar el script
});

// Menú móvil
const toggle = $("#menuToggle"), menu = $("#menu");
const closeMenu = () => { menu.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-label", "Abrir menú"); };
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open); toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
});
menu.addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });
document.addEventListener("click", e => { if (menu.classList.contains("open") && !e.target.closest("#menu, #menuToggle")) closeMenu(); });
matchMedia("(min-width: 961px)").addEventListener("change", e => { if (e.matches) closeMenu(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeMenu(); if (!panel.hidden) setPanel(false); } });

// WhatsApp: selector de contacto. Enlaces oficiales https://wa.me/NUMERO?text=MENSAJE;
// la persona revisa/edita el texto en WhatsApp y lo envía ella misma.
const panel = $("#waPanel"), backdrop = $("#waBackdrop");
const waUrl = key => `https://wa.me/${CONFIG.contacts[key].wa}?text=${encodeURIComponent(CONFIG.waMessage)}`;
let waOpener = null;

// Botones "WhatsApp" de cada tarjeta de contacto: abren directo la conversación de esa persona
document.querySelectorAll("[data-wa-direct]").forEach(a => { a.href = waUrl(a.dataset.waDirect); });
panel.querySelectorAll("[data-contact]").forEach(a => { a.href = waUrl(a.dataset.contact); });

function setPanel(open, opener) {
  if (open) {
    waOpener = opener;
    panel.querySelectorAll("[data-contact]").forEach(a => { a.href = waUrl(a.dataset.contact); });
  }
  panel.hidden = backdrop.hidden = !open;
  document.documentElement.classList.toggle("lock", open); // bloquea el scroll del fondo
  if (open) panel.querySelector("[data-contact]").focus();
  else if (waOpener) { waOpener.focus(); waOpener = null; }
}
document.addEventListener("click", e => {
  const trigger = e.target.closest("[data-wa]");
  if (trigger) { setPanel(panel.hidden, trigger); return; }
  if (panel.hidden) return;
  if (e.target.closest("[data-contact]")) { // la conversación se abre en otra pestaña; se cierra el selector
    panel.hidden = backdrop.hidden = true; waOpener = null; document.documentElement.classList.remove("lock");
  } else if (e.target.closest("#waClose") || e.target === backdrop) setPanel(false);
});
// Mantiene el foco dentro del selector mientras está abierto
panel.addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const f = [...panel.querySelectorAll("a[href], button")];
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// Formulario con validación (solo si existe #form en la página).
// Sin backend: prepara un correo (mailto) y no simula el envío.
const form = $("#form");
if (form) {
  const status = $("#status"), send = $("#send");
  const setErr = (id, msg) => {
    const f = $("#" + id), e = $("#e-" + id);
    if (e) e.textContent = msg || "";
    if (f) f.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  };
  form.addEventListener("submit", e => {
    e.preventDefault();
    const v = id => $("#" + id).value.trim();
    const phone = v("telefono").replace(/[\s()+-]/g, "");
    const ok = [
      setErr("nombre", v("nombre").length < 3 ? "Escribe tu nombre completo." : ""),
      setErr("telefono", !/^\d{7,12}$/.test(phone) ? "Escribe un teléfono válido (solo números)." : ""),
      setErr("correo", v("correo") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("correo")) ? "El correo no tiene un formato válido." : ""),
      setErr("mensaje", v("mensaje").length < 10 ? "Cuéntanos un poco más (mínimo 10 caracteres)." : ""),
      setErr("consent", !$("#consent").checked ? "Debes autorizar el tratamiento de datos para continuar." : "")
    ].every(Boolean);
    if (!ok) { status.className = "status err"; status.textContent = "Revisa los campos marcados."; form.querySelector("[aria-invalid=true]")?.focus(); return; }
    send.disabled = true; send.textContent = "Preparando…"; status.className = "status"; status.textContent = "";
    const body = `Nombre: ${v("nombre")}\nTeléfono: ${v("telefono")}\nCorreo: ${v("correo") || "No indicado"}\n\n${v("mensaje")}`;
    setTimeout(() => {
      location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent("Solicitud de información - sitio web")}&body=${encodeURIComponent(body)}`;
      send.disabled = false; send.textContent = "Enviar solicitud";
      status.className = "status ok";
      status.textContent = "Se abrió tu aplicación de correo con el mensaje listo. Tu solicitud se envía cuando lo envíes desde allí; este sitio no almacena tus datos.";
    }, 500);
  });
  form.addEventListener("input", e => { if (e.target.id && $("#e-" + e.target.id)) setErr(e.target.id, ""); });
}

// Aparición suave
const targets = document.querySelectorAll(".section .wrap, .cta .wrap");
if ("IntersectionObserver" in window && !reduced) {
  targets.forEach(t => { t.classList.add("reveal"); t.querySelectorAll(".cards li").forEach((li, i) => li.style.setProperty("--i", i % 5)); });
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: .05 });
  targets.forEach(t => io.observe(t));
}
