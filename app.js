const base = "./assets/photos/projects";

const projects = [
  project("Shanghai Street", "2024", "shanghai_street_2024", "shanghai_street_2024_cover.JPG", ["IMG_4095.jpg", "IMG_8732.jpg"], "#87947a"),
  project("Shanghai Street", "2025", "shanghai_street_2025", "shanghai_street_2025_cover.JPG", ["DSC00784.JPG", "DSC01373.JPG"], "#a65c4e"),
  project("Kyushu", "2025", "kyushu_2025", "kyushu_2025_cover.JPG", ["DSC02265.jpg", "DSC02259.jpg", "DSC02012.JPG", "DSC01907.JPG", "DSC02177.JPG", "DSC02000.JPG", "DSC02149.JPG", "DSC02033.jpg", "DSC02182.JPG", "DSC02197.jpg", "DSC02140.JPG", "DSC01955.JPG", "DSC02040.jpg", "DSC02256.jpg", "DSC02123.JPG", "DSC01984.JPG"], "#72899a"),
  project("Shanghai Hongkou", "2025", "shanghai_hongkou_2025", "shanghai_hongkou_2025_cover.JPG", ["DSC03153.JPG", "DSC03140.JPG", "DSC03125.JPG", "DSC03079.JPG", "DSC03108.JPG", "DSC03058.JPG", "DSC03107.JPG", "DSC03049.jpg"], "#c3a982"),
  project("Shanghai Marathon", "2025", "shanghai_marathon_2025", "shanghai_marathon_2025.JPG", ["DSC03390.JPG", "DSC03383.JPG", "DSC03311.JPG", "DSC03303.JPG"], "#806d79"),
  project("Bali Ayana", "2026", "bali_ayana_2026", "bali_ayana_2026_cover.JPG", ["DSC04173.JPG", "DSC03970.JPG", "DSC04120.JPG", "DSC04068.JPG", "DSC03985.JPG", "DSC03823.JPG"], "#b58a45"),
  project("Bali Ubud", "2026", "bali_ubud_2026", "bali_ubud_2026_cover.JPG", ["DSC04299.JPG", "DSC04298.JPG", "DSC04328.JPG", "DSC04321.JPG", "DSC04308.JPG", "DSC04322.JPG", "DSC04232.JPG", "DSC04222.JPG", "DSC04223.JPG"], "#73785d"),
  project("Shanghai Short Movie", "2026", "shanghai_short_movie_2026", "shanghai_short_movie_2026_cover.PNG", ["6月5日 (1)(10).PNG", "6月5日 (1)(4).PNG", "6月5日 (1)(3).PNG", "6月5日 (1)(2).PNG", "IMG_4387.JPG", "6月5日 (1)(1).PNG", "6月5日 (1)(7).PNG", "6月5日 (1)(6).PNG"], "#626c70"),
  project("Kyoto", "2026", "kyoto_2026", "kyoto_2026_cover.JPG", ["DSC06175.JPG", "DSC06239.JPG", "DSC06198.JPG", "DSC06238.JPG", "DSC06288.JPG", "DSC06317.JPG", "DSC06128.JPG", "DSC06301.JPG", "DSC06249.JPG", "DSC06258.JPG", "DSC06272.JPG", "DSC06255.JPG", "DSC06123.JPG", "DSC06278.JPG", "DSC06253.JPG", "DSC06247.JPG", "DSC06130.JPG", "DSC06291.JPG", "DSC06142.JPG", "DSC06144.JPG", "DSC06232.jpg"], "#b87862"),
  project("Tokyo Gallery", "2026", "tokyo_gallery_2026", "tokyo_gallery_2026_cover.JPG", ["DSC06459.JPG", "DSC06466.JPG", "DSC06443.JPG", "DSC06430.JPG", "DSC06437.JPG"], "#aeb7b4"),
  project("Tokyo", "2026", "tokyo_2026", "tokyo_2026_cover.JPG", ["DSC06499.JPG", "DSC06519.JPG", "DSC06485.JPG", "DSC06495.JPG", "DSC06480.JPG"], "#9b8775"),
  project("Shanghai MAP", "2026", "shanghai_map_2026", "shanghai_map_2026_cover.jpg", ["DSC06855.JPG", "DSC06896.JPG", "DSC06843.JPG", "DSC06895.JPG", "DSC06853.JPG", "DSC06890.JPG", "DSC06839.JPG"], "#6f7d76")
];

const spineTitles = [
  "Shanghai_street",
  "Shanghai_street",
  "Kyushu",
  "Shanghai_Hongkou",
  "Shanghai_marathon",
  "Bali_Ayana",
  "Bali_Ubud",
  "Shanghai_short_movie",
  "Kyoto",
  "Tokyo_gallery",
  "Tokyo",
  "Shanghai_MAP"
];

function project(title, year, folder, cover, gallery, color) {
  const root = `${base}/${folder}`;
  return {
    title, year, color,
    cover: encodeURI(`${root}/${cover}`),
    images: [cover, ...gallery].map((file, index) => ({
      src: encodeURI(`${root}/${index === 0 ? "" : "gallery/"}${file}`),
      alt: `${title}, photograph ${index + 1}`
    }))
  };
}

const shelf = document.querySelector("[data-shelf]");
const gallery = document.querySelector("[data-gallery]");
const activeTitle = document.querySelector("[data-active-title]");
const activeYear = document.querySelector("[data-active-year]");
const projectNumber = document.querySelector("[data-project-number]");
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
let activeIndex = 0;
let isBookTransitioning = false;

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
      <span class="book-spine"><span>${spineTitles[index]}</span></span>
      <span class="book-cover">
        <img src="${item.cover}" alt="" loading="${index === 0 ? "eager" : "lazy"}">
        <span class="cover-type"><strong>${item.title}</strong><small>${item.year} · ${pad(index + 1)}</small></span>
      </span>
    </span>`;
  button.addEventListener("click", () => selectProject(index, button));
  shelf.append(button);
});

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
  activeTitle.textContent = spineTitles[activeIndex];
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
  edge.addEventListener("pointerenter", () => startGalleryAutoScroll(direction));
  edge.addEventListener("pointerleave", stopGalleryAutoScroll);
  edge.addEventListener("pointercancel", stopGalleryAutoScroll);
  edge.addEventListener("click", () => {
    stopGalleryAutoScroll();
    moveToAdjacentGalleryImage(direction);
  });
});

window.addEventListener("blur", stopGalleryAutoScroll);

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
renderGallery(projects[0]);
