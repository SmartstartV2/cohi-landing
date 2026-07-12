type SceneId = 1 | 2 | 3 | 4 | 5 | 6;

interface Scene {
  id: SceneId;
  caption: string;
  duration: number;
}

const CAPTIONS = [
  'Coheus connects the signals behind your mortgage business.',
  'See what changed.',
  'Know what needs attention first.',
  'Understand why it matters.',
  'Move from insight to action.',
  'Today’s Executive Focus',
] as const;

/** ~11.5s loop; longer hold on the executive focus close */
const SCENES: Scene[] = [
  { id: 1, caption: CAPTIONS[0], duration: 1700 },
  { id: 2, caption: CAPTIONS[1], duration: 1600 },
  { id: 3, caption: CAPTIONS[2], duration: 1700 },
  { id: 4, caption: CAPTIONS[3], duration: 1900 },
  { id: 5, caption: CAPTIONS[4], duration: 1800 },
  { id: 6, caption: CAPTIONS[5], duration: 2800 },
];

const KPI_IDLE: Record<string, { value: string; fill: string; warning?: boolean }> = {
  pipeline: { value: 'Stable', fill: '40%' },
  fallout: { value: 'Clear', fill: '28%' },
  cost: { value: 'Steady', fill: '42%' },
  margin: { value: 'Stable', fill: '36%' },
};

const KPI_ACTIVE: Record<string, { value: string; fill: string; warning?: boolean }> = {
  pipeline: { value: 'Watch', fill: '58%' },
  fallout: { value: 'Elevated', fill: '78%', warning: true },
  cost: { value: 'Rising', fill: '70%', warning: true },
  margin: { value: 'Pressure', fill: '62%', warning: true },
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function applyKpiState(root: HTMLElement, active: boolean) {
  const map = active ? KPI_ACTIVE : KPI_IDLE;
  const note = root.querySelector('[data-sim-pulse-note]');
  if (note) note.textContent = active ? 'Changes detected' : 'Monitoring';

  Object.entries(map).forEach(([key, state]) => {
    const card = root.querySelector<HTMLElement>(`[data-sim-kpi="${key}"]`);
    if (!card) return;
    const value = card.querySelector('[data-sim-kpi-value]');
    const fill = card.querySelector<HTMLElement>('[data-sim-kpi-fill]');
    if (value) {
      value.textContent = state.value;
      value.className = state.warning
        ? 'mt-1 text-sm font-semibold tracking-tight text-warning sm:text-[15px]'
        : 'mt-1 text-sm font-semibold tracking-tight text-ink sm:text-[15px]';
    }
    if (fill) {
      fill.style.width = state.fill;
      fill.className = state.warning
        ? 'sim-kpi-fill h-full rounded-full bg-warning/70'
        : 'sim-kpi-fill h-full rounded-full bg-accent/70';
    }
  });
}

function applyHeroBadge(root: HTMLElement, elevated: boolean) {
  const badge = root.querySelector('[data-sim-hero-badge]');
  if (!badge) return;
  if (elevated) {
    badge.textContent = 'High priority';
    badge.className =
      'sim-hero-badge rounded-md bg-[#f8efe2] px-2 py-0.5 text-[10px] font-semibold text-warning';
    return;
  }
  badge.textContent = 'Watch';
  badge.className =
    'sim-hero-badge rounded-md bg-canvas px-2 py-0.5 text-[10px] font-semibold text-ink-subtle';
}

function applySceneState(root: HTMLElement, scene: SceneId) {
  applyKpiState(root, scene >= 2);
  applyHeroBadge(root, scene >= 3);
}

function setScene(root: HTMLElement, caption: HTMLElement | null, scene: SceneId, text: string) {
  root.dataset.scene = String(scene);
  if (caption) {
    caption.style.opacity = '0';
    window.setTimeout(() => {
      caption.textContent = text;
      caption.style.opacity = '1';
    }, 160);
  }
  applySceneState(root, scene);
}

export function initProductSimulation() {
  const root = document.querySelector<HTMLElement>('[data-sim]');
  if (!root) return;

  const caption = root.querySelector<HTMLElement>('[data-sim-caption]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    setScene(root, caption, 6, CAPTIONS[5]);
    return;
  }

  let paused = true;
  let started = false;

  const runLoop = async () => {
    if (started) return;
    started = true;

    while (true) {
      if (paused) {
        await wait(400);
        continue;
      }

      for (const scene of SCENES) {
        if (paused) break;
        setScene(root, caption, scene.id, scene.caption);
        await wait(scene.duration);
      }
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      paused = !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2);
    },
    { threshold: [0, 0.2, 0.4] },
  );

  observer.observe(root);
  void runLoop();
}
