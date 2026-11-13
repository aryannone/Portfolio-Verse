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
    // "Copy" beside the email address.
    const copy = (event.target as HTMLElement).closest ? ((event.target as HTMLElement).closest(".tp-copy") as HTMLElement | null) : null;
    if (copy) {
      const text = copy.getAttribute("data-copy") || "";
      const done = () => {
        copy.textContent = "Copied";
        win.setTimeout(() => (copy.textContent = "Copy"), 1800);
      };
      if (win.navigator.clipboard) win.navigator.clipboard.writeText(text).then(done, () => (copy.textContent = text));
      else copy.textContent = text;
      return;
    }
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

  // The portrait card leans towards the pointer while it is over the Contact section.
  const tiltArea = root.querySelector(".tp-ct") as HTMLElement | null;
  const tiltCard = root.querySelector(".tp-ct-card") as HTMLElement | null;
  const onTilt = (event: PointerEvent) => {
    if (!tiltCard) return;
    const box = tiltCard.getBoundingClientRect();
    const dx = (event.clientX - (box.left + box.width / 2)) / Math.max(1, box.width);
    const dy = (event.clientY - (box.top + box.height / 2)) / Math.max(1, box.height);
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    tiltCard.style.setProperty("--tp-ry", (clamp(dx) * 12).toFixed(1) + "deg");
    tiltCard.style.setProperty("--tp-rx", (clamp(dy) * -10).toFixed(1) + "deg");
  };
  const offTilt = () => {
    if (!tiltCard) return;
    tiltCard.style.removeProperty("--tp-rx");
    tiltCard.style.removeProperty("--tp-ry");
  };
  if (tiltArea && tiltCard && !still) {
    tiltArea.addEventListener("pointermove", onTilt);
    tiltArea.addEventListener("pointerleave", offTilt);
  }

  // The contact form. It goes through the visitor's own email app, or, when the owner chose it,
  // straight to the owner's inbox through the FormSubmit service, falling back to the email app.
  function onSubmit(event: Event) {
    const form = (event.target as HTMLElement).closest ? ((event.target as HTMLElement).closest(".tp-form") as HTMLFormElement | null) : null;
    if (!form) return;
    event.preventDefault();
    const status = form.querySelector(".tp-form-status") as HTMLElement;
    const button = form.querySelector(".tp-send") as HTMLButtonElement;
    const read = (field: string) => ((form.elements.namedItem(field) as HTMLInputElement | null)?.value || "").trim();
    const to = form.getAttribute("data-to") || "";
    const name = read("name");
    const from = read("email");
    const message = read("message");
    if (root.hasAttribute("data-demo")) {
      status.textContent = "On a real portfolio, this sends the message.";
      return;
    }
    const subject = "Message from " + name + " via your portfolio";
    const viaEmailApp = () => {
      win.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message + "\n\n" + name + "\n" + from);
      status.textContent = "Your email app should open with the message ready. Press send there.";
    };
    if (form.getAttribute("data-send") !== "direct" || !win.fetch) return viaEmailApp();
    status.textContent = "Sending\u2026";
    button.disabled = true;
    win
      .fetch("https://formsubmit.co/ajax/" + encodeURIComponent(to), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name, email: from, message: message, _subject: subject }),
      })
      .then((response) => {
        if (!response.ok) throw new Error("Not sent");
        status.textContent = "Message sent. Thank you.";
        form.reset();
      })
      .catch(viaEmailApp)
      .then(() => {
        button.disabled = false;
      });
  }

  root.addEventListener("submit", onSubmit);
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
    if (tiltArea) {
      tiltArea.removeEventListener("pointermove", onTilt);
      tiltArea.removeEventListener("pointerleave", offTilt);
    }
    offTilt();
    root.removeEventListener("click", onClick);
    root.removeEventListener("submit", onSubmit);
    root.removeEventListener("keydown", onRootKey);
    doc.removeEventListener("keydown", onDocKey);
    if (observer) observer.disconnect();
    root.classList.remove("tp-anim");
    revealed.forEach((el) => el.classList.remove("tp-reveal", "is-in", "is-done"));
    panelRoot.remove();
  };
}
