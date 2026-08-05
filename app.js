let projects = [];

function assetUrl(path) {
  if (!path) return "";
  const relativePath = path.startsWith("/") ? `.${path}` : path.startsWith("./") ? path : `./${path}`;
  return encodeURI(relativePath);
}

function hydrateProject(item) {
  const cover = assetUrl(item.cover);
  const galleryImages = Array.isArray(item.gallery) ? item.gallery : [];
  return {
    ...item,
    cover,
    images: [item.cover, ...galleryImages].filter(Boolean).map((path, index) => ({
      src: assetUrl(path),
      alt: `${item.title}, photograph ${index + 1}`
    }))
  };
}

const shelf = document.querySelector("[data-shelf]");
const gallery = document.querySelector("[data-gallery]");
const activeTitle = document.querySelector("[data-active-title]");
const activeYear = document.querySelector("[data-active-year]");
const projectNumber = document.querySelector("[data-project-number]");
const projectTotal = document.querySelector("[data-project-total]");
const currentImage = document.querySelector("[data-current-image]");
const totalImages = document.querySelector("[data-total-images]");
const galleryEdges = [...document.querySelectorAll("[data-gallery-direction]")];
const projectsSection = document.querySelector(".projects-section");
const projectsTitle = document.querySelector("#projects-title");
const soundWave = document.querySelector("[data-sound-wave]");
const aboutGrid = document.querySelector(".about-grid");
const aboutSection = document.querySelector(".about-section");
const aboutCopy = document.querySelector(".about-copy");
const aboutTitle = document.querySelector("#about-title");
const hero = document.querySelector(".hero");
const heroSignature = document.querySelector(".hero-signature");
const heroImage = hero?.querySelector("img");
let activeIndex = 0;
let isBookTransitioning = false;

function playHeroIntro() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add("hero-intro-running");
    document.body.classList.remove("hero-intro-pending");
    window.setTimeout(() => document.body.classList.remove("hero-intro-running"), 2300);
  }));
}

if (heroImage?.complete) playHeroIntro();
else {
  heroImage?.addEventListener("load", playHeroIntro, { once: true });
  heroImage?.addEventListener("error", playHeroIntro, { once: true });
}

const pad = (number) => String(number).padStart(2, "0");

if (soundWave) {
  const barCount = 52;
  const bars = Array.from({ length: barCount }, (_, index) => {
    const bar = document.createElement("span");
    const centerEnvelope = Math.sin((index / (barCount - 1)) * Math.PI);
    const height = 18 + centerEnvelope * 76;
    bar.style.setProperty("--wave-height", `${height.toFixed(1)}%`);
    bar.style.setProperty("--wave-delay", `${(-index * (4.53 / (barCount - 1))).toFixed(3)}s`);
    return bar;
  });
  soundWave.replaceChildren(...bars);
}

if (soundWave && aboutGrid) {
  aboutGrid.addEventListener("pointermove", (event) => {
    const bounds = soundWave.getBoundingClientRect();
    const isInside = event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    soundWave.classList.toggle("is-reactive", isInside);
  });
  aboutGrid.addEventListener("pointerleave", () => soundWave.classList.remove("is-reactive"));
}

const featuredItems = [...document.querySelectorAll(".featured-item")];
const featuredLabel = document.querySelector(".featured-sticky-label");
const featuredSection = document.querySelector(".featured-section");
const featuredCurve = document.querySelector("[data-featured-curve]");
const featuredCurvePath = document.querySelector("[data-featured-curve-path]");

let featuredCurvePoints = [];
let featuredCurveLength = 0;
let featuredCurveGeometryFrame;
let featuredCurveScrollFrame;

function createSmoothCurve(points) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  const tension = .82;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] || points[index];
    const current = points[index];
    const next = points[index + 1];
    const following = points[index + 2] || next;
    const controlOne = {
      x: current.x + ((next.x - previous.x) / 6) * tension,
      y: current.y + ((next.y - previous.y) / 6) * tension
    };
    const controlTwo = {
      x: next.x - ((following.x - current.x) / 6) * tension,
      y: next.y - ((following.y - current.y) / 6) * tension
    };
    path += ` C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${next.x} ${next.y}`;
  }
  return path;
}

function createArtisticCurvePoints(photoPoints, sectionWidth) {
  if (photoPoints.length < 2) return photoPoints;
  const expanded = [photoPoints[0]];
  photoPoints.slice(0, -1).forEach((current, index) => {
    const next = photoPoints[index + 1];
    const verticalDistance = next.y - current.y;
    const horizontalVariation = (Math.sin((index + 1) * 2.37) + 1) / 2;
    const verticalVariation = Math.cos((index + 1) * 1.73);
    const outerRatio = .82 + horizontalVariation * .12;
    const innerRatio = .06 + horizontalVariation * .1;
    const firstEdge = index % 2 === 0 ? sectionWidth * outerRatio : sectionWidth * innerRatio;
    const oppositeEdge = index % 2 === 0 ? sectionWidth * (1 - innerRatio) : sectionWidth * (1 - outerRatio);
    const firstTurn = .25 + verticalVariation * .055;
    const secondTurn = .69 - verticalVariation * .045;
    expanded.push(
      { x: firstEdge, y: current.y + verticalDistance * firstTurn },
      { x: oppositeEdge, y: current.y + verticalDistance * secondTurn },
      next
    );
  });
  return expanded;
}

function updateFeaturedCurveProgress() {
  cancelAnimationFrame(featuredCurveScrollFrame);
  featuredCurveScrollFrame = requestAnimationFrame(() => {
    if (!featuredSection || !featuredCurvePath || featuredCurvePoints.length < 2 || !featuredCurveLength) return;
    const sectionTop = featuredSection.getBoundingClientRect().top + window.scrollY;
    const firstPosition = sectionTop + featuredCurvePoints[0].y;
    const lastPosition = sectionTop + featuredCurvePoints[featuredCurvePoints.length - 1].y;
    const drawingEdge = window.scrollY + window.innerHeight * .72;
    const progress = Math.min(1, Math.max(0, (drawingEdge - firstPosition) / Math.max(1, lastPosition - firstPosition)));
    const visibleProgress = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : progress;
    featuredCurvePath.style.strokeDashoffset = `${featuredCurveLength * (1 - visibleProgress)}`;
  });
}

function updateFeaturedCurveGeometry() {
  cancelAnimationFrame(featuredCurveGeometryFrame);
  featuredCurveGeometryFrame = requestAnimationFrame(() => {
    if (!featuredSection || !featuredCurve || !featuredCurvePath) return;
    const sectionRect = featuredSection.getBoundingClientRect();
    const photoPoints = featuredItems.map((item) => {
      const photoRect = item.querySelector("img").getBoundingClientRect();
      return {
        x: photoRect.left - sectionRect.left + photoRect.width / 2,
        y: photoRect.top - sectionRect.top + photoRect.height / 2
      };
    });
    featuredCurvePoints = createArtisticCurvePoints(photoPoints, sectionRect.width);
    featuredCurve.setAttribute("viewBox", `0 0 ${sectionRect.width} ${sectionRect.height}`);
    featuredCurvePath.setAttribute("d", createSmoothCurve(featuredCurvePoints));
    featuredCurveLength = featuredCurvePath.getTotalLength();
    featuredCurvePath.style.strokeDasharray = `${featuredCurveLength}`;
    updateFeaturedCurveProgress();
  });
}

window.addEventListener("scroll", updateFeaturedCurveProgress, { passive: true });
window.addEventListener("resize", updateFeaturedCurveGeometry);
featuredItems.forEach((item) => item.querySelector("img").addEventListener("load", updateFeaturedCurveGeometry));
updateFeaturedCurveGeometry();

let overlapFrame;
function updateFeaturedLabelOverlap() {
  cancelAnimationFrame(overlapFrame);
  overlapFrame = requestAnimationFrame(() => {
    if (!featuredLabel) return;
    const labelRect = featuredLabel.getBoundingClientRect();
    let largestIntersection = null;
    let largestArea = 0;

    featuredItems.forEach((item) => {
      const photoRect = item.querySelector("img").getBoundingClientRect();
      const left = Math.max(labelRect.left, photoRect.left);
      const top = Math.max(labelRect.top, photoRect.top);
      const right = Math.min(labelRect.right, photoRect.right);
      const bottom = Math.min(labelRect.bottom, photoRect.bottom);
      const area = Math.max(0, right - left) * Math.max(0, bottom - top);
      if (area > largestArea) {
        largestArea = area;
        largestIntersection = { left, top, right, bottom };
      }
    });

    if (!largestIntersection) {
      featuredLabel.style.setProperty("--photo-overlap", "inset(0 100% 100% 0)");
      return;
    }

    const top = largestIntersection.top - labelRect.top;
    const right = labelRect.right - largestIntersection.right;
    const bottom = labelRect.bottom - largestIntersection.bottom;
    const left = largestIntersection.left - labelRect.left;
    featuredLabel.style.setProperty("--photo-overlap", `inset(${top}px ${right}px ${bottom}px ${left}px)`);
  });
}

window.addEventListener("scroll", updateFeaturedLabelOverlap, { passive: true });
window.addEventListener("resize", updateFeaturedLabelOverlap);
featuredItems.forEach((item) => item.querySelector("img").addEventListener("load", updateFeaturedLabelOverlap));
updateFeaturedLabelOverlap();

let projectsParallaxFrame;
function updateProjectsTitleParallax() {
  cancelAnimationFrame(projectsParallaxFrame);
  projectsParallaxFrame = requestAnimationFrame(() => {
    if (!projectsSection || !projectsTitle) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      projectsTitle.style.setProperty("--projects-title-parallax", "0px");
      return;
    }
    const sectionTop = projectsSection.getBoundingClientRect().top;
    const entryDistance = Math.max(1, window.innerHeight);
    const progress = Math.min(1, Math.max(0, (entryDistance - sectionTop) / entryDistance));
    const entryOffset = (progress - 1) * entryDistance * 0.22;
    projectsTitle.style.setProperty("--projects-title-parallax", `${entryOffset}px`);
  });
}

window.addEventListener("scroll", updateProjectsTitleParallax, { passive: true });
window.addEventListener("resize", updateProjectsTitleParallax);
updateProjectsTitleParallax();

let aboutCopyParallaxFrame;
function updateAboutCopyParallax() {
  cancelAnimationFrame(aboutCopyParallaxFrame);
  aboutCopyParallaxFrame = requestAnimationFrame(() => {
    if (!aboutSection || !aboutCopy || !aboutTitle) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      aboutCopy.style.setProperty("--about-copy-parallax", "0px");
      aboutTitle.style.setProperty("--about-title-parallax", "0px");
      return;
    }
    const sectionTop = aboutSection.getBoundingClientRect().top;
    const entryDistance = Math.max(1, window.innerHeight);
    const progress = Math.min(1, Math.max(0, (entryDistance - sectionTop) / entryDistance));
    const entryOffset = (progress - 1) * entryDistance * 0.2;
    aboutCopy.style.setProperty("--about-copy-parallax", `${entryOffset}px`);
    aboutTitle.style.setProperty("--about-title-parallax", `${entryOffset}px`);
  });
}

window.addEventListener("scroll", updateAboutCopyParallax, { passive: true });
window.addEventListener("resize", updateAboutCopyParallax);
updateAboutCopyParallax();

let heroSignatureParallaxFrame;
function updateHeroSignatureParallax() {
  cancelAnimationFrame(heroSignatureParallaxFrame);
  heroSignatureParallaxFrame = requestAnimationFrame(() => {
    if (!hero || !heroSignature) return;
    const heroRect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -heroRect.top / Math.max(1, heroRect.height)));
    const offset = -progress * heroRect.height * 0.38;
    const opacity = Math.min(1, Math.max(0, (1 - progress) / 0.24));
    heroSignature.style.setProperty("--hero-signature-parallax", `${offset}px`);
    heroSignature.style.setProperty("--hero-signature-opacity", opacity.toFixed(3));
    heroSignature.style.pointerEvents = opacity > 0.05 ? "auto" : "none";
  });
}

window.addEventListener("scroll", updateHeroSignatureParallax, { passive: true });
window.addEventListener("resize", updateHeroSignatureParallax);
updateHeroSignatureParallax();

function toggleFeaturedItem(item) {
  const shouldOpen = !item.classList.contains("is-enlarged");
  featuredItems.forEach((featuredItem) => {
    const selected = featuredItem === item && shouldOpen;
    featuredItem.classList.toggle("is-enlarged", selected);
    featuredItem.setAttribute("aria-pressed", selected ? "true" : "false");
  });
  updateFeaturedLabelOverlap();
}

featuredItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleFeaturedItem(item);
  });
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleFeaturedItem(item);
    }
  });
});

document.addEventListener("click", () => {
  featuredItems.forEach((item) => {
    item.classList.remove("is-enlarged");
    item.setAttribute("aria-pressed", "false");
  });
});

function buildShelf() {
 shelf.replaceChildren();
 projects.forEach((item, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `book${index === 0 ? " is-active" : ""}`;
  button.style.setProperty("--book-color", item.color);
  button.setAttribute("role", "listitem");
  button.setAttribute("aria-label", `Open ${item.title}, ${item.year}`);
  button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
  button.innerHTML = `
    <span class="book-object">
      <span class="book-spine"><span>${item.spineTitle}</span></span>
      <span class="book-cover">
        <img src="${item.cover}" alt="" loading="${index === 0 ? "eager" : "lazy"}">
        <span class="cover-type"><strong>${item.title}</strong><small>${item.year} · ${pad(index + 1)}</small></span>
      </span>
    </span>`;
  button.addEventListener("click", () => selectProject(index, button));
  shelf.append(button);
 });
}

function selectProject(index, button) {
  if (index === activeIndex || isBookTransitioning) return;

  isBookTransitioning = true;
  const books = [...document.querySelectorAll(".book")];
  const previousBook = books[activeIndex];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const transitionDuration = reducedMotion ? 0 : 820;

  previousBook.classList.remove("is-active");
  previousBook.classList.add("is-closing");
  previousBook.setAttribute("aria-pressed", "false");
  activeIndex = index;
  button.classList.add("is-active");
  button.setAttribute("aria-pressed", "true");
  button.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
  renderGallery(projects[index]);

  window.setTimeout(() => {
    previousBook.classList.remove("is-closing");
    isBookTransitioning = false;
  }, transitionDuration);
}

function renderGallery(item) {
  activeTitle.textContent = item.spineTitle;
  activeYear.textContent = item.year;
  projectNumber.textContent = pad(activeIndex + 1);
  currentImage.textContent = "01";
  totalImages.textContent = pad(item.images.length);
  gallery.replaceChildren(...item.images.map((image, index) => {
    const figure = document.createElement("figure");
    figure.dataset.imageIndex = index;
    figure.innerHTML = `<img src="${image.src}" alt="${image.alt}" loading="${index < 2 ? "eager" : "lazy"}" draggable="false">`;
    return figure;
  }));
  gallery.scrollLeft = 0;
  gallery.querySelectorAll("img").forEach((image) => image.addEventListener("load", updateGalleryEdgeState, { once: true }));
  requestAnimationFrame(updateGalleryEdgeState);
  updateGalleryEdgeState();
}

let dragStart = 0;
let scrollStart = 0;
gallery.addEventListener("pointerdown", (event) => {
  dragStart = event.clientX;
  scrollStart = gallery.scrollLeft;
  gallery.classList.add("is-dragging");
  gallery.setPointerCapture(event.pointerId);
});
gallery.addEventListener("pointermove", (event) => {
  if (!gallery.classList.contains("is-dragging")) return;
  gallery.scrollLeft = scrollStart - (event.clientX - dragStart) * 1.25;
});
const finishDrag = () => gallery.classList.remove("is-dragging");
gallery.addEventListener("pointerup", finishDrag);
gallery.addEventListener("pointercancel", finishDrag);

let galleryAutoFrame = 0;
let galleryAutoDirection = 0;
let galleryAutoPreviousTime = 0;
let galleryEdgeHoverTimer = 0;

function updateGalleryEdgeState() {
  const maximum = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
  galleryEdges.forEach((edge) => {
    const direction = Number(edge.dataset.galleryDirection);
    const unavailable = direction < 0 ? gallery.scrollLeft <= 1 : gallery.scrollLeft >= maximum - 1;
    edge.setAttribute("aria-disabled", String(unavailable));
  });
}

function stopGalleryAutoScroll() {
  cancelAnimationFrame(galleryAutoFrame);
  galleryAutoFrame = 0;
  galleryAutoDirection = 0;
  galleryAutoPreviousTime = 0;
  gallery.classList.remove("is-auto-scrolling");
}

function endGalleryEdgeHover() {
  window.clearTimeout(galleryEdgeHoverTimer);
  galleryEdgeHoverTimer = 0;
  stopGalleryAutoScroll();
  gallery.classList.remove("is-edge-hovering");
}

function beginGalleryEdgeHover(direction) {
  endGalleryEdgeHover();
  gallery.classList.add("is-edge-hovering");
  galleryEdgeHoverTimer = window.setTimeout(() => startGalleryAutoScroll(direction), 460);
}

function runGalleryAutoScroll(time) {
  if (!galleryAutoDirection) return;
  const maximum = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
  const elapsed = galleryAutoPreviousTime ? Math.min(32, time - galleryAutoPreviousTime) : 16;
  galleryAutoPreviousTime = time;
  gallery.scrollLeft += galleryAutoDirection * elapsed * 0.14;
  updateGalleryEdgeState();
  if ((galleryAutoDirection < 0 && gallery.scrollLeft <= 1) || (galleryAutoDirection > 0 && gallery.scrollLeft >= maximum - 1)) {
    stopGalleryAutoScroll();
    return;
  }
  galleryAutoFrame = requestAnimationFrame(runGalleryAutoScroll);
}

function startGalleryAutoScroll(direction) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  stopGalleryAutoScroll();
  galleryAutoDirection = direction;
  gallery.classList.add("is-auto-scrolling");
  galleryAutoFrame = requestAnimationFrame(runGalleryAutoScroll);
}

function moveToAdjacentGalleryImage(direction) {
  const figures = [...gallery.querySelectorAll("figure")];
  if (!figures.length) return;
  const current = figures.reduce((nearest, figure, index) => {
    const distance = Math.abs(figure.offsetLeft - gallery.scrollLeft);
    return distance < nearest.distance ? { index, distance } : nearest;
  }, { index: 0, distance: Infinity }).index;
  const destination = figures[Math.min(figures.length - 1, Math.max(0, current + direction))];
  gallery.scrollTo({ left: destination.offsetLeft, behavior: "smooth" });
}

galleryEdges.forEach((edge) => {
  const direction = Number(edge.dataset.galleryDirection);
  edge.addEventListener("pointerenter", () => beginGalleryEdgeHover(direction));
  edge.addEventListener("pointerleave", endGalleryEdgeHover);
  edge.addEventListener("pointercancel", endGalleryEdgeHover);
  edge.addEventListener("pointerdown", endGalleryEdgeHover);
  edge.addEventListener("click", () => {
    endGalleryEdgeHover();
    moveToAdjacentGalleryImage(direction);
  });
});

window.addEventListener("blur", endGalleryEdgeHover);

let counterFrame;
gallery.addEventListener("scroll", () => {
  updateGalleryEdgeState();
  cancelAnimationFrame(counterFrame);
  counterFrame = requestAnimationFrame(() => {
    const figures = [...gallery.querySelectorAll("figure")];
    if (!figures.length) return;
    const target = gallery.scrollLeft + gallery.clientWidth * 0.22;
    let nearest = 0;
    let distance = Infinity;
    figures.forEach((figure, index) => {
      const nextDistance = Math.abs(figure.offsetLeft - target);
      if (nextDistance < distance) { distance = nextDistance; nearest = index; }
    });
    currentImage.textContent = pad(nearest + 1);
  });
});

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = header.classList.toggle("is-menu-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "Close" : "Menu";
});
document.querySelectorAll(".primary-nav a").forEach((link) => link.addEventListener("click", () => {
  header.classList.remove("is-menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "Menu";
}));

document.querySelector("[data-year]").textContent = new Date().getFullYear();

async function initializeProjects() {
  try {
    const response = await fetch("./content/projects.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Project data request failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error("No photography projects were found.");
    projects = data.map(hydrateProject);
    activeIndex = 0;
    projectTotal.textContent = String(projects.length);
    buildShelf();
    renderGallery(projects[0]);
  } catch (error) {
    console.error(error);
    shelf.innerHTML = '<p class="content-error">Project content could not be loaded.</p>';
  }
}

initializeProjects();
