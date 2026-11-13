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
  // What came of it, shown as a highlight.
  result?: string;
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

// A photo whose shape is very different from its frame (a phone screenshot in a wide card) is shown whole,
// with a blurred copy of itself filling the space around it. Photos close to the frame's shape fill it.
// Used by the editor's pages on each photo's load, and by downloaded pages through mountPortfolio.
export function fitPhoto(img: HTMLImageElement) {
  const frame = img.parentElement as HTMLElement | null;
  if (!frame || !img.naturalWidth || !img.naturalHeight) return;
  const frameRatio = frame.clientWidth / Math.max(1, frame.clientHeight);
  if (!frameRatio || !frame.clientHeight) return;
  const off = img.naturalWidth / img.naturalHeight / frameRatio;
  const fit = off < 0.72 || off > 1.45;
  frame.classList.toggle("tp-fit", fit);
  if (fit) frame.style.setProperty("--tp-photo", 'url("' + (img.currentSrc || img.src) + '")');
  else frame.style.removeProperty("--tp-photo");
}

export function mountPortfolio(root: HTMLElement, store: RuntimeStore, opts: { reveal?: boolean }) {
  const doc = root.ownerDocument;
  const win = doc.defaultView as Window;
  const still = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const src = (p: string | number) => (typeof p === "number" ? (store.photos || [])[p] : p);

  root.querySelectorAll("img[data-ph]").forEach((img) => {
    (img as HTMLImageElement).src = src(Number(img.getAttribute("data-ph"))) || "";
  });
  // Each framed photo fills its frame or fits inside it, depending on its shape.
  root.querySelectorAll(".tp-shot img, .tp-ch-media img").forEach((node) => {
    const img = node as HTMLImageElement;
    if (img.complete) fitPhoto(img);
    else img.addEventListener("load", () => fitPhoto(img), { once: true });
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
    root.querySelectorAll(".tp-sec > .tp-h, .tp-sec > p, .tp-sec > .tp-chips, .tp-sec > blockquote, .tp-item, .tp-ch-body").forEach((node) => {
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
    '<div class="tpd-body"><p class="tpd-text"></p><div class="tpd-details"></div><div class="tpd-result"></div><div class="tpd-links"></div><div class="tpd-tags"></div>' +
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
    panel.style.setProperty("--tp-accent", look.getPropertyValue("--tp-accent"));

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
    const result = panelRoot.querySelector(".tpd-result") as HTMLElement;
    result.textContent = item.result || "";
    result.style.display = item.result ? "" : "none";
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

  // ---------- navigation bar, back-to-top button and reading progress ----------
  // The page may scroll inside a box (the editor's preview) or as a whole (a published page).
  const scrollerOf = (el: HTMLElement): HTMLElement | null => {
    for (let p = el.parentElement; p && p !== doc.body; p = p.parentElement) {
      const overflow = win.getComputedStyle(p).overflowY;
      if ((overflow === "auto" || overflow === "scroll") && p.scrollHeight > p.clientHeight) return p;
    }
    return null;
  };
  const scroller = scrollerOf(root);
  const scrollTarget: HTMLElement | Window = scroller || win;
  // Looked up on every frame, because the editor can add or remove the bar and sections at any time.
  const all = (selector: string) => Array.prototype.slice.call(root.querySelectorAll(selector)) as HTMLElement[];
  let scrollFrame = 0;
  let active = "";

  function onScroll() {
    if (scrollFrame) return;
    scrollFrame = win.requestAnimationFrame(() => {
      scrollFrame = 0;
      const box = root.getBoundingClientRect();
      const viewTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const viewHeight = scroller ? scroller.clientHeight : win.innerHeight;
      const read = Math.max(0, Math.min(1, (viewTop - box.top) / Math.max(1, box.height - viewHeight)));
      all(".tp-progress").forEach((bar) => (bar.style.transform = "scaleX(" + read.toFixed(4) + ")"));
      if (living) drift(viewTop, viewHeight);
      // The back-to-top button appears once the header has scrolled away.
      const hero = root.querySelector(".tp-hero") as HTMLElement | null;
      const navLinks = all(".tp-nav-links a");
      const past = hero ? hero.getBoundingClientRect().bottom < viewTop + 40 : read > 0.1;
      root.classList.toggle("tp-scrolled", past);
      // The section being read is the last one whose top has passed a third of the way down.
      if (!navLinks.length) return;
      const line = viewTop + viewHeight * 0.33;
      let current = "";
      navLinks.forEach((link) => {
        const target = root.querySelector(link.getAttribute("href") || "") as HTMLElement | null;
        if (target && target.getBoundingClientRect().top <= line) current = link.getAttribute("href") || "";
      });
      // At the very bottom the last section is the one being read, even if it is short.
      if (read > 0.995) current = navLinks[navLinks.length - 1].getAttribute("href") || current;
      if (current === active && navLinks.every((link) => link.classList.contains("is-on") === (link.getAttribute("href") === current))) return;
      active = current;
      navLinks.forEach((link) => {
        const on = link.getAttribute("href") === current;
        link.classList.toggle("is-on", on);
        if (on) {
          link.setAttribute("aria-current", "true");
          // Keep the active link in view inside the bar on small screens, without moving the page.
          const strip = link.parentElement as HTMLElement;
          const left = link.offsetLeft - strip.clientWidth / 2 + link.offsetWidth / 2;
          strip.scrollTo({ left: left, behavior: still ? "auto" : "smooth" });
        } else link.removeAttribute("aria-current");
      });
    });
  }

  // Links in the bar and the back-to-top button scroll smoothly, and do not change the address.
  function onJump(event: Event) {
    const link = (event.target as HTMLElement).closest ? ((event.target as HTMLElement).closest(".tp-nav a, .tp-totop") as HTMLAnchorElement | null) : null;
    if (!link) return;
    const target = root.querySelector(link.getAttribute("href") || "") as HTMLElement | null;
    if (!target) return;
    event.preventDefault();
    if (link.classList.contains("tp-totop") || link.classList.contains("tp-nav-name")) {
      // The top of the portfolio inside the editor's preview box, or simply the top of a published page.
      const top = scroller ? scroller.scrollTop + root.getBoundingClientRect().top - scroller.getBoundingClientRect().top : 0;
      (scroller || win).scrollTo({ top: Math.max(0, top), behavior: still ? "auto" : "smooth" });
    } else {
      target.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
    }
    // Move keyboard focus along, so the next Tab continues from the section that was jumped to.
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  // ---------- living motion ----------
  // On full pages (not while typing in the editor): photos drift as the page scrolls, and the
  // Timeline's line draws itself. Pointer effects need a mouse or trackpad.
  const living = Boolean(opts.reveal) && !still;
  const finePointer = !still && win.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function drift(viewTop: number, viewHeight: number) {
    all(".tp-shot img, .tp-ch-media img").forEach((img) => {
      const frame = (img.parentElement as HTMLElement).getBoundingClientRect();
      if (frame.bottom < viewTop - 50 || frame.top > viewTop + viewHeight + 50) return;
      const t = (frame.top + frame.height / 2 - (viewTop + viewHeight / 2)) / viewHeight;
      const shift = Math.max(-1, Math.min(1, t)) * frame.height * -0.06;
      img.style.setProperty("--par", shift.toFixed(1) + "px");
    });
    all(".tp-rows").forEach((rows) => {
      const box = rows.getBoundingClientRect();
      const drawn = Math.max(0, Math.min(1, (viewTop + viewHeight * 0.7 - box.top) / Math.max(1, box.height)));
      rows.style.setProperty("--tl", drawn.toFixed(3));
    });
  }
  if (living) root.classList.add("tp-live-motion");

  let tilted: HTMLElement | null = null;
  let pulled: HTMLElement | null = null;
  function onPoint(event: PointerEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest) return;
    // Cards lean towards the pointer.
    const card = target.closest(".tp-card, .tp-ch-media, .tp-bento .tp-sec, .tp-bento .tp-hero") as HTMLElement | null;
    if (tilted && tilted !== card) {
      tilted.style.removeProperty("--tx");
      tilted.style.removeProperty("--ty");
    }
    tilted = card;
    if (card) {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      const strength = card.matches(".tp-bento .tp-sec, .tp-bento .tp-hero") ? 3 : 7;
      card.style.setProperty("--tx", (x * strength).toFixed(2) + "deg");
      card.style.setProperty("--ty", (y * -strength).toFixed(2) + "deg");
    }
    // Main buttons lean towards the cursor.
    const button = target.closest(".tp-links .tp-cta, .tp-links .tp-cv, .tp-send, .tp-ch-more") as HTMLElement | null;
    if (pulled && pulled !== button) {
      pulled.style.removeProperty("--mgx");
      pulled.style.removeProperty("--mgy");
    }
    pulled = button;
    if (button) {
      const box = button.getBoundingClientRect();
      button.style.setProperty("--mgx", ((event.clientX - box.left - box.width / 2) * 0.25).toFixed(1) + "px");
      button.style.setProperty("--mgy", ((event.clientY - box.top - box.height / 2) * 0.35).toFixed(1) + "px");
    }
    // A soft glow follows the cursor (shown by templates that use it).
    const area = root.getBoundingClientRect();
    root.style.setProperty("--mx", (event.clientX - area.left).toFixed(0) + "px");
    root.style.setProperty("--my", (event.clientY - area.top).toFixed(0) + "px");
  }
  function offPoint() {
    [tilted, pulled].forEach((el) => el && ["--tx", "--ty", "--mgx", "--mgy"].forEach((v) => el.style.removeProperty(v)));
    tilted = null;
    pulled = null;
    root.style.removeProperty("--mx");
    root.style.removeProperty("--my");
  }
  if (finePointer) {
    root.classList.add("tp-pointer");
    root.addEventListener("pointermove", onPoint);
    root.addEventListener("pointerleave", offPoint);
  }

  scrollTarget.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("resize", onScroll);
  root.addEventListener("click", onJump);
  onScroll();

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
      root.dispatchEvent(new CustomEvent("tp-sent"));
      return;
    }
    const subject = "Message from " + name + " via your portfolio";
    const viaEmailApp = () => {
      win.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message + "\n\n" + name + "\n" + from);
      status.textContent = "Your email app should open with the message ready. Press send there.";
      root.dispatchEvent(new CustomEvent("tp-sent"));
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
        root.dispatchEvent(new CustomEvent("tp-sent"));
        form.reset();
      })
      .catch(viaEmailApp)
      .then(() => {
        button.disabled = false;
      });
  }

  // ---------- the contact character ----------
  // Its head and eyes turn towards the pointer, it watches visitors type, names links it is shown,
  // and cheers when the email is copied or a message is sent. Without a mouse it glances around by itself.
  const char = root.querySelector(".tp-ct-char") as HTMLElement | null;
  let stopChar = () => {};
  if (char && !still) {
    const bubble = char.querySelector(".tp-bot-say") as HTMLElement;
    const hello = char.getAttribute("data-hello") || "";
    let lastPointer = 0;
    let typing = false;
    let sayTimer = 0;
    const moodTimers: Record<string, number> = {};
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    const gaze = (x: number, y: number) => {
      char.style.setProperty("--hx", clamp(x).toFixed(3));
      char.style.setProperty("--hy", clamp(y).toFixed(3));
    };
    const lookAt = (x: number, y: number) => {
      const head = (char.querySelector(".b-head") as HTMLElement).getBoundingClientRect();
      gaze((x - (head.left + head.width / 2)) / 320, (y - (head.top + head.height / 2)) / 320);
    };
    const lookAtEl = (el: Element) => {
      const box = el.getBoundingClientRect();
      lookAt(box.left + box.width / 2, box.top + box.height / 2);
    };
    const say = (text: string, ms = 2600) => {
      bubble.textContent = text;
      char.classList.add("is-talk");
      win.clearTimeout(sayTimer);
      sayTimer = win.setTimeout(() => {
        bubble.textContent = hello;
        char.classList.remove("is-talk");
      }, ms);
    };
    const mood = (name: string, ms: number) => {
      char.classList.remove(name);
      void char.offsetWidth;
      char.classList.add(name);
      win.clearTimeout(moodTimers[name]);
      moodTimers[name] = win.setTimeout(() => char.classList.remove(name), ms);
    };
    const hellos = ["Hello there!", "Nice to see you.", "Write me something!", "Wheee!"];
    let helloAt = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      lastPointer = Date.now();
      if (!typing) lookAt(event.clientX, event.clientY);
    };
    const onOver = (event: Event) => {
      const target = event.target as HTMLElement;
      if (!target.closest) return;
      const link = target.closest(".tp-ct-link") as HTMLElement | null;
      if (link) {
        say("Opens " + ((link.querySelector("span") as HTMLElement).textContent || "this link"), 1800);
        mood("is-wave", 1600);
      } else if (target.closest(".tp-copy")) say("Copy my email?", 1600);
      else if (target.closest(".tp-send") && !typing) say("Ready when you are!", 1600);
    };
    const onFocus = (event: Event) => {
      const field = (event.target as HTMLElement).closest ? ((event.target as HTMLElement).closest(".tp-form input, .tp-form textarea") as HTMLElement | null) : null;
      if (!field) return;
      typing = true;
      char.classList.add("is-type");
      lookAtEl(field);
      const name = field.getAttribute("name");
      say(name === "name" ? "Nice to meet you!" : name === "email" ? "I'll keep it safe." : "I'm all ears…", 2400);
    };
    const onBlur = (event: FocusEvent) => {
      const next = event.relatedTarget as HTMLElement | null;
      if (next && next.closest && next.closest(".tp-form")) return;
      typing = false;
      char.classList.remove("is-type");
    };
    const onKey = (event: Event) => {
      const field = event.target as HTMLElement;
      if (!field.closest || !field.closest(".tp-form")) return;
      lookAtEl(field);
      mood("is-key", 220);
    };
    const onCharClick = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest && target.closest(".tp-ct-char")) {
        mood("is-spin", 900);
        say(hellos[helloAt++ % hellos.length], 1800);
      } else if (target.closest && target.closest(".tp-copy")) {
        mood("is-happy", 1600);
        say("Copied!", 1600);
      }
    };
    const onSent = () => {
      typing = false;
      char.classList.remove("is-type");
      gaze(0, -0.2);
      mood("is-happy", 2200);
      say("Sent! Talk soon.", 3000);
    };
    // Without a mouse, or when the mouse is still, it glances around now and then.
    const idle = win.setInterval(() => {
      if (typing || Date.now() - lastPointer < 4000) return;
      gaze(Math.random() * 1.4 - 0.7, Math.random() * 0.8 - 0.5);
    }, 2600);

    doc.addEventListener("pointermove", onMove);
    root.addEventListener("pointerover", onOver);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    root.addEventListener("input", onKey);
    root.addEventListener("click", onCharClick);
    root.addEventListener("tp-sent", onSent);
    char.classList.add("is-alive");

    stopChar = () => {
      win.clearInterval(idle);
      win.clearTimeout(sayTimer);
      Object.keys(moodTimers).forEach((k) => win.clearTimeout(moodTimers[k]));
      doc.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerover", onOver);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
      root.removeEventListener("input", onKey);
      root.removeEventListener("click", onCharClick);
      root.removeEventListener("tp-sent", onSent);
      char.classList.remove("is-alive", "is-talk", "is-type", "is-key", "is-wave", "is-happy", "is-spin");
      char.style.removeProperty("--hx");
      char.style.removeProperty("--hy");
      bubble.textContent = hello;
    };
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
    scrollTarget.removeEventListener("scroll", onScroll);
    win.removeEventListener("resize", onScroll);
    root.removeEventListener("click", onJump);
    if (scrollFrame) win.cancelAnimationFrame(scrollFrame);
    root.classList.remove("tp-scrolled", "tp-live-motion", "tp-pointer");
    root.removeEventListener("pointermove", onPoint);
    root.removeEventListener("pointerleave", offPoint);
    offPoint();
    all(".tp-shot img, .tp-ch-media img").forEach((img) => img.style.removeProperty("--par"));
    all(".tp-rows").forEach((rows) => rows.style.removeProperty("--tl"));
    if (tiltArea) {
      tiltArea.removeEventListener("pointermove", onTilt);
      tiltArea.removeEventListener("pointerleave", offTilt);
    }
    offTilt();
    root.removeEventListener("click", onClick);
    root.removeEventListener("submit", onSubmit);
    stopChar();
    root.removeEventListener("keydown", onRootKey);
    doc.removeEventListener("keydown", onDocKey);
    if (observer) observer.disconnect();
    root.classList.remove("tp-anim");
    revealed.forEach((el) => el.classList.remove("tp-reveal", "is-in", "is-done"));
    panelRoot.remove();
  };
}
