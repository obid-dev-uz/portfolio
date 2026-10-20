import * as THREE from "three";

// ─── Timeline (1 birlik = 1 ekran balandligi scroll) ────────────────────────
const WALK_END = 2.2; // odam yaqinlashib bo'ladi
const OPEN_END = 2.7; // noutbuk ochiladi
const INTRO_END = 3.2; // chapga 45° burilib bo'ladi
const SEGMENT = 1.4; // har bir to'xtash + burilish uzunligi
const HOLD_FRAC = 0.45; // segmentning qancha qismi to'xtab turish
const TURN = THREE.MathUtils.degToRad(45);
const START_Z = -26;

const PROJECTS = [
  { title: "Stark HUD Dashboard", desc: "Real-time telemetriya paneli, WebSocket va canvas grafiklar.", tags: ["Vue", "TS", "WebGL"] },
  { title: "Arc Commerce", desc: "Headless e-commerce: tezkor checkout va CMS integratsiya.", tags: ["Nuxt", "Stripe"] },
  { title: "J.A.R.V.I.S. Bot", desc: "LLM asosidagi yordamchi, ovozli buyruqlar bilan.", tags: ["Python", "AI"] },
  { title: "Mark Tauri App", desc: "Desktop ilova: offline sinxronizatsiya, Rust backend.", tags: ["Tauri", "Rust"] },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const range = (x, a, b) => clamp01((x - a) / (b - a));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const smooth = (t) => t * t * (3 - 2 * t);
const sideOf = (k) => (k % 2 === 0 ? -1 : 1); // -1 = chap, 1 = o'ng

// ─── Renderer / scene / camera ──────────────────────────────────────────────
const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const BG = 0x0a0a0b;
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 9, 40);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
const camTarget = new THREE.Vector3();

// Kamera: umumiy plan (odam uzoqdan kelayotganda) → yaqin plan (boshdan belgacha)
const CAM = {
  wide: { y: 1.45, targetY: 1.15, dist: 4.6, distPortrait: 7.5 },
  close: { y: 1.52, targetY: 1.38, targetYPortrait: 1.24, dist: 2.05 },
};

// ─── Lights ─────────────────────────────────────────────────────────────────
scene.add(new THREE.HemisphereLight(0x8a8f99, 0x0a0a0b, 0.35));

const key = new THREE.DirectionalLight(0xfff1dc, 1.6);
key.position.set(-3, 5, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -4;
key.shadow.camera.right = 4;
key.shadow.camera.top = 4;
key.shadow.camera.bottom = -2;
key.shadow.bias = -0.0005;
scene.add(key);

// Oltin kontur nurlar — odam bilan birga yuradi (lekin u bilan burilmaydi)
const follow = new THREE.Group();
scene.add(follow);
for (const [x, i] of [[2.2, 40], [-2.4, 26]]) {
  const rim = new THREE.SpotLight(0xd4a22f, i, 9, Math.PI / 7, 0.6, 1.5);
  rim.position.set(x, 3.2, -2.6);
  rim.target.position.set(0, 1.2, 0);
  follow.add(rim, rim.target);
}

// ─── Floor ──────────────────────────────────────────────────────────────────
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.9, metalness: 0.05 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(80, 80, 0xd4a22f, 0x2a2a2e);
grid.material.transparent = true;
grid.material.opacity = 0.18;
grid.position.y = 0.002;
scene.add(grid);

// Odam turadigan joy — oltin halqa
const ring = new THREE.Mesh(
  new THREE.RingGeometry(0.55, 0.57, 64),
  new THREE.MeshBasicMaterial({ color: 0xd4a22f, transparent: true, opacity: 0 }),
);
ring.rotation.x = -Math.PI / 2;
ring.position.y = 0.004;
scene.add(ring);

// ─── Character (primitivlardan yig'ilgan manekin) ───────────────────────────
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.55, metalness: 0.35 });
const jointMat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: 0.4, metalness: 0.6 });
const accentMat = new THREE.MeshStandardMaterial({
  color: 0xd4a22f, emissive: 0xd4a22f, emissiveIntensity: 1.4, roughness: 0.3,
});

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

// Ikki nuqta orasiga kapsula (qo'llar uchun)
function limb(a, b, r, mat = bodyMat) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const m = mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 12), mat);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

const person = new THREE.Group(); // pozitsiya + burilish
const body = new THREE.Group(); // tebranish (bob)
person.add(body);
scene.add(person);

// Torso
const torso = mesh(new THREE.CapsuleGeometry(0.16, 0.34, 8, 16), bodyMat);
torso.scale.set(1.3, 1, 0.75);
torso.position.y = 1.27;
body.add(torso);
const pelvis = mesh(new THREE.CapsuleGeometry(0.13, 0.08, 6, 12), bodyMat);
pelvis.scale.set(1.25, 1, 0.8);
pelvis.position.y = 0.95;
body.add(pelvis);
// Ko'krakdagi "arc reactor"
const reactor = mesh(new THREE.CircleGeometry(0.035, 24), accentMat);
reactor.position.set(0, 1.36, 0.125);
body.add(reactor);

// Bosh
const headPivot = new THREE.Group();
headPivot.position.y = 1.58;
body.add(headPivot);
headPivot.add(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.08, 0), 0.045, jointMat));
const head = mesh(new THREE.SphereGeometry(0.11, 24, 16), bodyMat);
head.scale.set(0.92, 1.1, 1);
head.position.y = 0.18;
headPivot.add(head);
const visor = mesh(new THREE.CapsuleGeometry(0.02, 0.1, 4, 8), accentMat);
visor.rotation.z = Math.PI / 2;
visor.position.set(0, 0.2, 0.098);
headPivot.add(visor);

// Qo'llar — 2 bo'g'inli IK: qo'l (hand) noutbuk bilan birga ko'tarilganda tirsak o'zi moslashadi
const HOLD_LOW = { y: 1.07, z: 0.36 }; // yurayotganda
const HOLD_HIGH = { y: 1.24, z: 0.4 }; // yetib kelgandan keyin — ko'krak balandligida
const UP = new THREE.Vector3(0, 1, 0);

function placeLimb(m, a, b) {
  const dir = new THREE.Vector3().subVectors(b, a);
  m.position.copy(a).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
}

const arms = [-1, 1].map((s) => {
  const shoulder = new THREE.Vector3(0.23 * s, 1.45, 0);
  const elbow0 = new THREE.Vector3(0.27 * s, 1.15, 0.08);
  const hand0 = new THREE.Vector3(0.19 * s, 1.05, 0.3);
  const L1 = shoulder.distanceTo(elbow0);
  const L2 = elbow0.distanceTo(hand0);
  body.add(mesh(new THREE.SphereGeometry(0.06, 16, 12), jointMat).translateX(shoulder.x).translateY(shoulder.y));
  const upper = mesh(new THREE.CapsuleGeometry(0.05, L1 - 0.1, 6, 12), bodyMat);
  const fore = mesh(new THREE.CapsuleGeometry(0.045, L2 - 0.09, 6, 12), bodyMat);
  const palm = mesh(new THREE.SphereGeometry(0.045, 12, 10), jointMat);
  body.add(upper, fore, palm);
  // Tirsak tashqariga va pastga-orqaga qarasin
  const pole = new THREE.Vector3(s, -1, -0.4).normalize();
  return { s, shoulder, L1, L2, upper, fore, palm, pole, handOffsetY: hand0.y - HOLD_LOW.y, handOffsetZ: hand0.z - HOLD_LOW.z };
});

function poseArms(holdY, holdZ) {
  const hand = new THREE.Vector3();
  const d = new THREE.Vector3();
  const perp = new THREE.Vector3();
  for (const a of arms) {
    hand.set(0.19 * a.s, holdY + a.handOffsetY, holdZ + a.handOffsetZ);
    d.subVectors(hand, a.shoulder);
    const dist = Math.min(d.length(), a.L1 + a.L2 - 1e-4);
    d.normalize();
    const along = (a.L1 * a.L1 - a.L2 * a.L2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, a.L1 * a.L1 - along * along));
    perp.copy(a.pole).addScaledVector(d, -a.pole.dot(d)).normalize();
    const elbow = a.shoulder.clone().addScaledVector(d, along).addScaledVector(perp, h);
    const handReal = a.shoulder.clone().addScaledVector(d, dist);
    placeLimb(a.upper, a.shoulder, elbow);
    placeLimb(a.fore, elbow, handReal);
    a.palm.position.copy(handReal);
  }
}

// Oyoqlar — son (hip) va tizza (knee) pivotlari
const legs = [-1, 1].map((s) => {
  const hip = new THREE.Group();
  hip.position.set(0.1 * s, 0.9, 0);
  body.add(hip);
  hip.add(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.44, 0), 0.07));
  const knee = new THREE.Group();
  knee.position.y = -0.44;
  hip.add(knee);
  knee.add(mesh(new THREE.SphereGeometry(0.06, 12, 10), jointMat));
  knee.add(limb(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -0.4, 0), 0.055));
  const foot = mesh(new THREE.BoxGeometry(0.1, 0.06, 0.24), jointMat);
  foot.position.set(0, -0.43, 0.05);
  knee.add(foot);
  return { hip, knee };
});

// Noutbuk
const laptop = new THREE.Group();
laptop.position.set(0, HOLD_LOW.y, HOLD_LOW.z);
body.add(laptop);
const laptopMat = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, roughness: 0.3, metalness: 0.85 });
const base = mesh(new THREE.BoxGeometry(0.38, 0.018, 0.26), laptopMat);
laptop.add(base);
const keys = new THREE.Mesh(
  new THREE.PlaneGeometry(0.33, 0.12),
  new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.9 }),
);
keys.rotation.x = -Math.PI / 2;
keys.position.set(0, 0.0095, -0.03);
laptop.add(keys);

// Qopqoq ilgagi tanadan uzoqroq chetda; yopiq holatda qopqoq tanaga qarab yotadi
const lidPivot = new THREE.Group();
lidPivot.position.set(0, 0.009, 0.13);
laptop.add(lidPivot);
const lid = mesh(new THREE.BoxGeometry(0.38, 0.012, 0.26), laptopMat);
lid.position.set(0, 0.006, -0.13);
lidPivot.add(lid);
const screenMat = new THREE.MeshStandardMaterial({
  color: 0x0b1520, emissive: 0x6fb8ff, emissiveIntensity: 0, roughness: 0.2,
});
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.23), screenMat);
screen.rotation.x = Math.PI / 2; // qopqoqning ichki (pastki) yuzasi
screen.position.set(0, -0.0005, -0.13);
lidPivot.add(screen);
const logo = mesh(new THREE.CircleGeometry(0.022, 24), accentMat);
logo.rotation.x = -Math.PI / 2; // qopqoqning tashqi yuzasi
logo.position.set(0, 0.0125, -0.13);
lidPivot.add(logo);

const screenLight = new THREE.PointLight(0x8fc8ff, 0, 2.2, 1.6);
screenLight.position.set(0, 0.18, 0);
laptop.add(screenLight);

// ─── Virtual (cheksiz) scroll ───────────────────────────────────────────────
let target = 0;
let current = 0;
const vh = () => window.innerHeight;
const addScroll = (px) => {
  target = Math.max(0, target + px);
};

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? vh() : 1;
    addScroll(e.deltaY * unit);
  },
  { passive: false },
);

let touchY = null;
window.addEventListener("touchstart", (e) => (touchY = e.touches[0].clientY), { passive: true });
window.addEventListener(
  "touchmove",
  (e) => {
    if (touchY === null) return;
    e.preventDefault();
    const y = e.touches[0].clientY;
    addScroll((touchY - y) * 1.6);
    touchY = y;
  },
  { passive: false },
);
window.addEventListener("touchend", () => (touchY = null));

window.addEventListener("keydown", (e) => {
  const step = { ArrowDown: 120, ArrowUp: -120, PageDown: vh(), PageUp: -vh(), " ": vh() * 0.8 }[e.key];
  if (step !== undefined) {
    e.preventDefault();
    addScroll(step);
  }
  if (e.key === "Home") target = 0;
});

// ─── Pose — scroll pozitsiyasining sof funksiyasi (orqaga scroll ham ishlaydi) ─
function poseAt(s) {
  // 1) Yurish
  const walkT = ease(range(s, 0, WALK_END));
  const z = THREE.MathUtils.lerp(START_Z, 0, walkT);
  const walked = z - START_Z;
  const walkAmp = 1 - smooth(range(walkT, 0.85, 1)); // oxirida to'xtaydi
  const phase = walked * 2.4;

  // 2) Noutbuk ochish
  const open = ease(range(s, WALK_END, OPEN_END));
  // Yetib kelgach noutbuk ko'krak balandligiga ko'tariladi (ochilish bilan birga)
  const raise = ease(range(s, WALK_END - 0.25, OPEN_END));

  // 3) Burilishlar
  let angle;
  let stepT = 0; // joyida qadam tashlash (burilish paytida)
  let stop = -1; // hozir qaysi to'xtashda turibdi (karta uchun)
  let stopVis = 0;

  if (s < INTRO_END) {
    const t = ease(range(s, OPEN_END, INTRO_END));
    angle = sideOf(0) * TURN * t;
    stepT = range(s, OPEN_END, INTRO_END);
    stop = 0;
    stopVis = range(s, INTRO_END - 0.15, INTRO_END);
  } else {
    const u = (s - INTRO_END) / SEGMENT;
    const k = Math.floor(u);
    const f = u - k;
    if (f < HOLD_FRAC) {
      angle = sideOf(k) * TURN;
      stop = k;
      stopVis = Math.min(range(f, 0, 0.08), 1 - range(f, HOLD_FRAC - 0.08, HOLD_FRAC));
      if (k === 0) stopVis = 1 - range(f, HOLD_FRAC - 0.08, HOLD_FRAC);
    } else {
      const t = range(f, HOLD_FRAC, 1);
      angle = THREE.MathUtils.lerp(sideOf(k) * TURN, sideOf(k + 1) * TURN, ease(t));
      stepT = t;
    }
  }

  // Odam yetib kelayotganda kamera unga yaqinlashadi
  const zoom = ease(range(s, WALK_END * 0.55, WALK_END + 0.25));

  return { z, walkAmp, phase, open, raise, angle, stepT, stop, stopVis, zoom };
}

function applyPose(p) {
  person.position.z = p.z;
  person.rotation.y = p.angle;
  follow.position.z = p.z;

  // Yurish sikli
  const inPlace = Math.sin(p.stepT * Math.PI) * 0.5; // burilishda kichik qadamlar
  const phase = p.phase + p.stepT * Math.PI * 4;
  const amp = Math.max(p.walkAmp, inPlace);
  legs.forEach(({ hip, knee }, i) => {
    const ph = phase + i * Math.PI;
    hip.rotation.x = Math.sin(ph) * 0.5 * amp;
    knee.rotation.x = Math.max(0, Math.sin(ph + Math.PI / 2)) * 0.75 * amp;
  });
  body.position.y = -Math.abs(Math.sin(phase)) * 0.035 * amp;
  body.rotation.z = Math.sin(phase) * 0.025 * amp;

  // Bosh kameraga biroz qaraydi
  headPivot.rotation.y = -p.angle * 0.4;

  // Noutbuk
  const holdY = THREE.MathUtils.lerp(HOLD_LOW.y, HOLD_HIGH.y, p.raise);
  const holdZ = THREE.MathUtils.lerp(HOLD_LOW.z, HOLD_HIGH.z, p.raise);
  laptop.position.set(0, holdY, holdZ);
  poseArms(holdY, holdZ);
  lidPivot.rotation.x = p.open * 1.95;
  screenMat.emissiveIntensity = p.open * 1.6;
  screenLight.intensity = p.open * 1.2;

  ring.material.opacity = p.open * 0.6;
}

// ─── HUD ────────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const intro = $("intro");
const card = $("card");
const readout = $("readout");
const bar = $("bar");
const seg = $("seg");
let shownStop = -1;

function updateHud(s, p) {
  const introOp = 1 - range(s, 0, 0.35);
  intro.style.opacity = introOp;
  intro.style.transform = `translateY(${(1 - introOp) * 14}px)`;

  if (s < INTRO_END) {
    readout.textContent = `INTRO · ${String(Math.round((s / INTRO_END) * 100)).padStart(3, "0")}%`;
    bar.style.transform = `scaleX(${s / INTRO_END})`;
  } else {
    const u = (s - INTRO_END) / SEGMENT;
    const deg = Math.round(THREE.MathUtils.radToDeg(p.angle));
    readout.textContent = `${deg < 0 ? "L" : "R"} ${String(Math.abs(deg)).padStart(2, "0")}°`;
    bar.style.transform = `scaleX(${u - Math.floor(u)})`;
  }
  seg.textContent = `SEG ${String(Math.max(0, p.stop)).padStart(3, "0")}`;

  // Karta odam qaragan tomonda chiqadi
  if (p.stop >= 0 && p.stop !== shownStop) {
    shownStop = p.stop;
    const proj = PROJECTS[p.stop % PROJECTS.length];
    $("card-label").textContent = `Loyiha ${String(p.stop + 1).padStart(2, "0")}`;
    $("card-title").textContent = proj.title;
    $("card-desc").textContent = proj.desc;
    $("card-tags").innerHTML = proj.tags.map((t) => `<span>${t}</span>`).join("");
    card.classList.toggle("left", sideOf(p.stop) < 0);
    card.classList.toggle("right", sideOf(p.stop) > 0);
  }
  const vis = p.stop >= 0 ? p.stopVis : 0;
  card.style.opacity = vis;
  card.style.translate = `0 ${(1 - vis) * 16}px`;
}

// ─── Resize ─────────────────────────────────────────────────────────────────
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// ─── Loop ───────────────────────────────────────────────────────────────────
const mouse = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});
const lerp = THREE.MathUtils.lerp;

function frame() {
  current += (target - current) * 0.08;
  if (Math.abs(target - current) < 0.01) current = target;
  const s = current / vh();

  const p = poseAt(s);
  applyPose(p);
  updateHud(s, p);

  // Tik (portrait) ekranda kamera uzoqroq turadi, odam sig'ishi uchun
  const portrait = camera.aspect < 1;
  const { wide, close } = CAM;
  // Tik ekranda kadr kengligi ~1.3 m bo'lib qolishi uchun masofa aspect'ga bog'liq
  const closeDist = portrait ? Math.max(close.dist, 2.0 / camera.aspect) : close.dist;
  const dist = lerp(portrait ? wide.distPortrait : wide.dist, closeDist, p.zoom);
  const camY = lerp(wide.y, close.y, p.zoom);
  const closeTY = portrait ? close.targetYPortrait : close.targetY; // tik ekranda odam karta ustida tursin
  camTarget.set(0, lerp(wide.targetY, closeTY, p.zoom), 0);

  // Sichqoncha bilan yengil parallaks (yaqin planda kamroq)
  const par = lerp(1, 0.4, p.zoom);
  camera.position.set(mouse.x * 0.25 * par, camY - mouse.y * 0.12 * par, dist);
  camera.lookAt(camTarget);

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Debug uchun: konsoldan `__scrollTo(5)` — 5 ekran pastga
window.__scrollTo = (screens) => (target = screens * vh());
