// The part of a portfolio that moves: sections rising in on scroll, and the photo panel.
// It is plain DOM code with no imports, because the same function is copied (as text)
// into every downloaded portfolio. Keep it self-contained.

export type PanelItem = {
  // The name of the section the entry belongs to, shown above its title.
  section: string;
  title: string;
  sub: string;
  text: string;
  // The longer write-up, shown only in the panel.
  details: string;
  tags: string[];
  // Links for the entry: a project site, a repository, a certificate.
  links: { label: string; url: string }[];
  // How the photos are arranged in the panel: "stack", "mosaic" or "slides".
  layout: string;
  photos: (string | number)[];
};

export type RuntimeStore = {
  items: Record<string, PanelItem>;
  // Only used by downloaded files: photos are stored once here and referred to by number.
  photos?: string[];
};

export function mountPortfolio(root: HTMLElement, store: RuntimeStore, opts: { reveal?: boolean }) {
  const doc = root.ownerDocument;
  const win = doc.defaultView as Window;
  const still = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const src = (p: string | number) => (typeof p === "number" ? (store.photos || [])[p] : p);

  root.querySelectorAll("img[data-ph]").forEach((img) => {
    (img as HTMLImageElement).src = src(Number(img.getAttribute("data-ph"))) || "";
  });

  // Sections rise in as they are scrolled to.
  let observer: IntersectionObserver | null = null;
  const revealed: Element[] = [];
  if (opts.reveal && !still && "IntersectionObserver" in win) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.classList.add("is-in");
          win.setTimeout(() => target.classList.add("is-done"), 1400);
          if (observer) observer.unobserve(target);
        });
      },
      { threshold: 0.12 },
    );
    root.classList.add("tp-anim");
    root.querySelectorAll(".tp-sec > .tp-h, .tp-sec > p, .tp-sec > .tp-chips, .tp-sec > blockquote, .tp-item").forEach((node) => {
      const el = node as HTMLElement;
      const siblings = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.classList.add("tp-reveal");
      el.style.setProperty("--i", String(Math.min(siblings, 5)));
      revealed.push(el);
      if (observer) observer.observe(el);
    });
  }

  // The photo panel.
  const panelRoot = doc.createElement("div");
  panelRoot.className = "tpd";
  panelRoot.setAttribute("role", "dialog");
  panelRoot.setAttribute("aria-modal", "true");
  panelRoot.innerHTML =
    '<div class="tpd-backdrop"></div>' +
    '<aside class="tpd-panel">' +
    '<div class="tpd-grab"></div>' +
    '<div class="tpd-head"><div><div class="tpd-eyebrow"></div><div class="tpd-title"></div><div class="tpd-sub"></div></div>' +
    '<button type="button" class="tpd-close" aria-label="Close details">×</button></div>' +
    '<div class="tpd-body"><p class="tpd-text"></p><div class="tpd-details"></div><div class="tpd-links"></div><div class="tpd-tags"></div>' +
    '<div class="tpd-label"></div><div class="tpd-photos"></div>' +
    '<div class="tpd-nav"><button type="button" class="tpd-prev" aria-label="Previous photo">\u2190</button>' +
    '<span class="tpd-pos" aria-live="polite"></span>' +
    '<button type="button" class="tpd-next" aria-label="Next photo">\u2192</button></div></div>' +
    "</aside>";
  doc.body.appendChild(panelRoot);

  const panel = panelRoot.querySelector(".tpd-panel") as HTMLElement;
  const closeButton = panelRoot.querySelector(".tpd-close") as HTMLElement;
  const body = panelRoot.querySelector(".tpd-body") as HTMLElement;
  const photoBox = panelRoot.querySelector(".tpd-photos") as HTMLElement;
  const nav = panelRoot.querySelector(".tpd-nav") as HTMLElement;
  const position = panelRoot.querySelector(".tpd-pos") as HTMLElement;

  // Slideshow layout: which photo is in view, and stepping to the next one.
  function showPosition() {
    const total = photoBox.children.length;
    const current = Math.round(photoBox.scrollLeft / Math.max(1, photoBox.clientWidth)) + 1;
    position.textContent = Math.min(total, Math.max(1, current)) + " / " + total;
  }
  function step(by: number) {
    photoBox.scrollBy({ left: by * photoBox.clientWidth, behavior: still ? "auto" : "smooth" });
  }
  let opener: HTMLElement | null = null;
  let previousOverflow = "";

  function open(trigger: HTMLElement) {
    const item = store.items[trigger.getAttribute("data-item") || ""];
    if (!item) return;
    const look = win.getComputedStyle(root);
    panel.style.background = look.backgroundColor;
    panel.style.color = look.color;
    panel.style.fontFamily = look.fontFamily;
    panel.style.setProperty("--tpd-bg", look.backgroundColor);
    panel.style.setProperty("--tp-display", look.getPropertyValue("--tp-display"));

    (panelRoot.querySelector(".tpd-title") as HTMLElement).textContent = item.title;
    const sub = panelRoot.querySelector(".tpd-sub") as HTMLElement;
    sub.textContent = item.sub;
    sub.style.display = item.sub ? "" : "none";
    const text = panelRoot.querySelector(".tpd-text") as HTMLElement;
    text.textContent = item.text;
    text.style.display = item.text ? "" : "none";
    panelRoot.setAttribute("aria-label", item.title + ", details");
    const eyebrow = panelRoot.querySelector(".tpd-eyebrow") as HTMLElement;
    eyebrow.textContent = item.section;
    eyebrow.style.display = item.section ? "" : "none";
    const details = panelRoot.querySelector(".tpd-details") as HTMLElement;
    details.textContent = "";
    (item.details || "").split(/\n\s*\n/).forEach((part) => {
      if (!part.trim()) return;
      const para = doc.createElement("p");
      para.textContent = part.trim();
      details.appendChild(para);
    });
    details.style.display = details.children.length ? "" : "none";
    const links = panelRoot.querySelector(".tpd-links") as HTMLElement;
    links.textContent = "";
    (item.links || []).forEach((link) => {
      const a = doc.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const text = doc.createElement("span");
      text.textContent = link.label;
      a.appendChild(text);
      links.appendChild(a);
    });
    links.style.display = links.children.length ? "" : "none";
    const label = panelRoot.querySelector(".tpd-label") as HTMLElement;
    label.textContent = item.photos.length === 1 ? "Photo" : "Photos (" + item.photos.length + ")";
    label.style.display = item.photos.length ? "" : "none";

    const tags = panelRoot.querySelector(".tpd-tags") as HTMLElement;
    tags.textContent = "";
    (item.tags || []).forEach((tag) => {
      const chip = doc.createElement("span");
      chip.textContent = tag;
      tags.appendChild(chip);
    });
    tags.style.display = item.tags && item.tags.length ? "" : "none";

    const layout = item.layout === "mosaic" || item.layout === "slides" ? item.layout : "stack";
    const photos = photoBox;
    photos.className = "tpd-photos tpd-g-" + layout;
    photos.textContent = "";
    item.photos.forEach((photo, index) => {
      const img = doc.createElement("img");
      img.src = src(photo) || "";
      img.alt = item.title + ", photo " + (index + 1);
      img.style.setProperty("--i", String(Math.min(index, 6)));
      photos.appendChild(img);
    });

    nav.style.display = layout === "slides" && item.photos.length > 1 ? "" : "none";
    photos.scrollLeft = 0;
    showPosition();
    body.scrollTop = 0;
    opener = trigger;
    previousOverflow = doc.documentElement.style.overflow;
    doc.documentElement.style.overflow = "hidden";
    // Let the browser paint the closed state first, so the slide always plays.
    void panel.offsetWidth;
    panelRoot.classList.add("is-open");
    closeButton.focus();
  }

  function close() {
    if (!panelRoot.classList.contains("is-open")) return;
    panelRoot.classList.remove("is-open");
    doc.documentElement.style.overflow = previousOverflow;
    if (opener) opener.focus();
    opener = null;
  }

  function findItem(target: EventTarget | null) {
    const el = target as HTMLElement | null;
    if (!el || !el.closest) return null;
    if (el.closest("a")) return null;
    return el.closest(".tp-item.has-more") as HTMLElement | null;
  }

  function onClick(event: Event) {
    const item = findItem(event.target);
    if (item) open(item);
  }

  function onRootKey(event: KeyboardEvent) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const item = findItem(event.target);
    if (!item || item !== event.target) return;
    event.preventDefault();
    open(item);
  }

  function onDocKey(event: KeyboardEvent) {
    if (!panelRoot.classList.contains("is-open")) return;
    if (event.key === "Escape") close();
    if (event.key === "ArrowRight" && nav.style.display !== "none") step(1);
    if (event.key === "ArrowLeft" && nav.style.display !== "none") step(-1);
    if (event.key === "Tab") {
      // Keep the keyboard inside the panel while it is open.
      const buttons = Array.prototype.filter.call(panelRoot.querySelectorAll("button, a"), (b: HTMLElement) => b.offsetParent !== null) as HTMLElement[];
      const at = buttons.indexOf(doc.activeElement as HTMLElement);
      event.preventDefault();
      buttons[(at + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
    }
  }

  // On phones the panel can be flicked down from its top edge.
  let touchStart = -1;
  function onTouchStart(event: TouchEvent) {
    const fromHead = (event.target as HTMLElement).closest(".tpd-head, .tpd-grab");
    touchStart = fromHead || body.scrollTop <= 0 ? event.touches[0].clientY : -1;
  }
  function onTouchEnd(event: TouchEvent) {
    if (touchStart < 0) return;
    if (event.changedTouches[0].clientY - touchStart > 90 && win.innerWidth <= 720) close();
    touchStart = -1;
  }

  // The contact playground: links float as bubbles that can be dragged, thrown and tapped,
  // and a character turns its eyes to the pointer. It only runs while it is on screen.
  let stopPlay = () => {};
  const arena = root.querySelector(".tp-play") as HTMLElement | null;
  if (arena && !still && "IntersectionObserver" in win) {
    type Body = { x: number; y: number; vx: number; vy: number; r: number };
    const bodies = new WeakMap<Element, Body>();
    let frameId = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let held: { el: HTMLElement; moved: number; lastX: number; lastY: number } | null = null;
    let justDragged = false;
    arena.classList.add("tp-play-on");

    const tick = () => {
      frameId = win.requestAnimationFrame(tick);
      const width = arena.clientWidth;
      const height = arena.clientHeight;
      const list: { el: HTMLElement; b: Body }[] = [];
      arena.querySelectorAll(".tp-bub").forEach((node, i) => {
        const el = node as HTMLElement;
        let b = bodies.get(el);
        if (!b) {
          const r = el.offsetWidth / 2;
          b = {
            r,
            x: r + ((i * 137 + 40) % Math.max(1, width - 2 * r)),
            y: r + ((i * 71 + 20) % Math.max(1, height - 2 * r)),
            vx: i % 2 ? 0.9 : -0.9,
            vy: i % 3 ? 0.6 : -0.6,
          };
          bodies.set(el, b);
          el.setAttribute("draggable", "false");
        }
        list.push({ el, b });
      });
      list.forEach(({ el, b }) => {
        if (held && held.el === el) return;
        // Bubbles shy away from the pointer.
        const dx = b.x - pointerX;
        const dy = b.y - pointerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1 && dist < 130) {
          b.vx += (dx / dist) * (130 - dist) * 0.004;
          b.vy += (dy / dist) * (130 - dist) * 0.004;
        }
        b.vx *= 0.992;
        b.vy *= 0.992;
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        if (speed > 16) {
          b.vx *= 16 / speed;
          b.vy *= 16 / speed;
        } else if (speed < 0.4) {
          // Never quite still: keep a slow drift going.
          b.vx += b.vx >= 0 ? 0.02 : -0.02;
          b.vy += b.vy >= 0 ? 0.015 : -0.015;
        }
        b.x += b.vx;
        b.y += b.vy;
      });
      // Bounce off each other, then off the walls.
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i].b;
          const c = list[j].b;
          const dx = c.x - a.x;
          const dy = c.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          const overlap = a.r + c.r - dist;
          if (overlap <= 0) continue;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= (nx * overlap) / 2;
          a.y -= (ny * overlap) / 2;
          c.x += (nx * overlap) / 2;
          c.y += (ny * overlap) / 2;
          const push = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (push < 0) {
            a.vx += push * nx;
            a.vy += push * ny;
            c.vx -= push * nx;
            c.vy -= push * ny;
          }
        }
      }
      list.forEach(({ el, b }) => {
        if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.9; }
        if (b.x > width - b.r) { b.x = width - b.r; b.vx = -Math.abs(b.vx) * 0.9; }
        if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.9; }
        if (b.y > height - b.r) { b.y = height - b.r; b.vy = -Math.abs(b.vy) * 0.9; }
        el.style.transform = "translate(" + (b.x - b.r).toFixed(1) + "px," + (b.y - b.r).toFixed(1) + "px)";
      });
    };

    const place = (event: PointerEvent) => {
      const box = arena.getBoundingClientRect();
      // The page may be drawn scaled (the editor's phone preview), so convert to the arena's own pixels.
      const scale = box.width / (arena.offsetWidth || 1) || 1;
      pointerX = (event.clientX - box.left) / scale;
      pointerY = (event.clientY - box.top) / scale;
    };
    const onArenaMove = (event: PointerEvent) => {
      place(event);
      if (!held) return;
      const b = bodies.get(held.el);
      if (!b) return;
      b.vx = pointerX - held.lastX;
      b.vy = pointerY - held.lastY;
      held.moved += Math.abs(b.vx) + Math.abs(b.vy);
      held.lastX = pointerX;
      held.lastY = pointerY;
      b.x = pointerX;
      b.y = pointerY;
    };
    const onArenaDown = (event: PointerEvent) => {
      const el = (event.target as HTMLElement).closest(".tp-bub") as HTMLElement | null;
      if (!el) return;
      place(event);
      held = { el, moved: 0, lastX: pointerX, lastY: pointerY };
      el.classList.add("is-held");
      if (el.setPointerCapture) el.setPointerCapture(event.pointerId);
    };
    const onArenaUp = () => {
      if (!held) return;
      held.el.classList.remove("is-held");
      // A real drag must not also open the link; a plain tap should.
      justDragged = held.moved > 8;
      held = null;
    };
    const onArenaLeave = () => {
      pointerX = -9999;
      pointerY = -9999;
    };
    const onArenaClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (justDragged && target.closest(".tp-bub")) event.preventDefault();
      justDragged = false;
      const buddy = target.closest(".tp-buddy") as HTMLElement | null;
      if (!buddy) return;
      // Tapping the character makes it hop and scatters the bubbles.
      buddy.classList.remove("is-hop");
      void buddy.offsetWidth;
      buddy.classList.add("is-hop");
      arena.querySelectorAll(".tp-bub").forEach((node, i) => {
        const b = bodies.get(node);
        if (!b) return;
        b.vx += (i % 2 ? 1 : -1) * (5 + (i % 3) * 2);
        b.vy -= 6 + (i % 4);
      });
    };
    const onLook = (event: PointerEvent) => {
      const buddy = arena.querySelector(".tp-buddy") as HTMLElement | null;
      if (!buddy) return;
      const inside = arena.contains(event.target as Node);
      buddy.classList.toggle("is-happy", inside);
      buddy.querySelectorAll(".tp-buddy-eye").forEach((eye) => {
        const box = eye.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const reach = Math.min(6, dist / 12);
        (eye.firstElementChild as HTMLElement).style.transform = "translate(" + ((dx / dist) * reach).toFixed(1) + "px," + ((dy / dist) * reach).toFixed(1) + "px)";
      });
    };

    const watcher = new IntersectionObserver((entries) => {
      const visible = entries[0].isIntersecting;
      if (visible && !frameId) frameId = win.requestAnimationFrame(tick);
      if (!visible && frameId) {
        win.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });
    watcher.observe(arena);
    arena.addEventListener("pointermove", onArenaMove);
    arena.addEventListener("pointerdown", onArenaDown);
    arena.addEventListener("pointerup", onArenaUp);
    arena.addEventListener("pointercancel", onArenaUp);
    arena.addEventListener("pointerleave", onArenaLeave);
    arena.addEventListener("click", onArenaClick);
    doc.addEventListener("pointermove", onLook);

    stopPlay = () => {
      watcher.disconnect();
      if (frameId) win.cancelAnimationFrame(frameId);
      arena.removeEventListener("pointermove", onArenaMove);
      arena.removeEventListener("pointerdown", onArenaDown);
      arena.removeEventListener("pointerup", onArenaUp);
      arena.removeEventListener("pointercancel", onArenaUp);
      arena.removeEventListener("pointerleave", onArenaLeave);
      arena.removeEventListener("click", onArenaClick);
      doc.removeEventListener("pointermove", onLook);
      arena.classList.remove("tp-play-on");
      arena.querySelectorAll(".tp-bub").forEach((node) => ((node as HTMLElement).style.transform = ""));
    };
  }

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onRootKey);
  doc.addEventListener("keydown", onDocKey);
  closeButton.addEventListener("click", close);
  (panelRoot.querySelector(".tpd-prev") as HTMLElement).addEventListener("click", () => step(-1));
  (panelRoot.querySelector(".tpd-next") as HTMLElement).addEventListener("click", () => step(1));
  photoBox.addEventListener("scroll", showPosition, { passive: true });
  (panelRoot.querySelector(".tpd-backdrop") as HTMLElement).addEventListener("click", close);
  panel.addEventListener("touchstart", onTouchStart, { passive: true });
  panel.addEventListener("touchend", onTouchEnd);

  return function unmount() {
    close();
    stopPlay();
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onRootKey);
    doc.removeEventListener("keydown", onDocKey);
    if (observer) observer.disconnect();
    root.classList.remove("tp-anim");
    revealed.forEach((el) => el.classList.remove("tp-reveal", "is-in", "is-done"));
    panelRoot.remove();
  };
}
