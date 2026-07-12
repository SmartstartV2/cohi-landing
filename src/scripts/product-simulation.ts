type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

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
  'Clear the highest-priority issue.',
  'Work the list by severity.',
  'Outcome tracked — leadership can move on.',
] as const;

/** ~14s loop including resolution chapter and hold */
const SCENES: Scene[] = [
  { id: 1, caption: CAPTIONS[0], duration: 1600 },
  { id: 2, caption: CAPTIONS[1], duration: 1500 },
  { id: 3, caption: CAPTIONS[2], duration: 1600 },
  { id: 4, caption: CAPTIONS[3], duration: 1700 },
  { id: 5, caption: CAPTIONS[4], duration: 1700 },
  { id: 6, caption: CAPTIONS[5], duration: 1700 },
  { id: 7, caption: CAPTIONS[6], duration: 1600 },
  { id: 8, caption: CAPTIONS[7], duration: 2400 },
];

type KpiState = { value: string; fill: string; warning?: boolean; success?: boolean };

const KPI_IDLE: Record<string, KpiState> = {
  pipeline: { value: 'Stable', fill: '40%' },
  fallout: { value: 'Clear', fill: '28%' },
  cost: { value: 'Steady', fill: '42%' },
  margin: { value: 'Stable', fill: '36%' },
};

const KPI_ALERT: Record<string, KpiState> = {
  pipeline: { value: 'Watch', fill: '58%' },
  fallout: { value: 'Elevated', fill: '78%', warning: true },
  cost: { value: 'Rising', fill: '70%', warning: true },
  margin: { value: 'Pressure', fill: '62%', warning: true },
};

const KPI_IMPROVING: Record<string, KpiState> = {
  pipeline: { value: 'Watch', fill: '55%' },
  fallout: { value: 'Improving', fill: '45%', success: true },
  cost: { value: 'Rising', fill: '68%', warning: true },
  margin: { value: 'Pressure', fill: '60%', warning: true },
};

const KPI_RESOLVED: Record<string, KpiState> = {
  pipeline: { value: 'Stable', fill: '48%' },
  fallout: { value: 'Clear', fill: '32%', success: true },
  cost: { value: 'Watch', fill: '55%' },
  margin: { value: 'Watch', fill: '50%' },
};

const WATCH_STATUS: Record<string, Partial<Record<SceneId, string>>> = {
  fallout: {
    1: 'Open',
    2: 'Open',
    3: 'Priority',
    4: 'Priority',
    5: 'In review',
    6: 'Cleared',
    7: 'Cleared',
    8: 'Cleared',
  },
  cost: {
    1: 'Open',
    2: 'Open',
    3: 'Open',
    4: 'Open',
    5: 'Open',
    6: 'Open',
    7: 'Acknowledged',
    8: 'Acknowledged',
  },
  margin: {
    1: 'Open',
    2: 'Open',
    3: 'Open',
    4: 'Open',
    5: 'Open',
    6: 'Open',
    7: 'Watching',
    8: 'Watching',
  },
};

const SUCCESS_COPY: Partial<
  Record<SceneId, { title: string; body: string }>
> = {
  6: {
    title: 'West Region fallout under control — forecast risk reduced',
    body: 'Action completed by Regional Operations Lead. Pull-through stabilizing.',
  },
  7: {
    title: 'High-priority cleared · secondary item acknowledged',
    body: 'Cost per loan remains on the leadership watch list with an owner informed.',
  },
  8: {
    title: 'Today’s focus complete — outcomes are tracking',
    body: 'Leadership resolved what mattered first without another dashboard hunt.',
  },
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let sceneGeneration = 0;

function kpiClass(state: KpiState) {
  if (state.success) {
    return 'mt-1 text-sm font-semibold tracking-tight text-success sm:text-[15px]';
  }
  if (state.warning) {
    return 'mt-1 text-sm font-semibold tracking-tight text-warning sm:text-[15px]';
  }
  return 'mt-1 text-sm font-semibold tracking-tight text-ink sm:text-[15px]';
}

function fillClass(state: KpiState) {
  if (state.success) return 'sim-kpi-fill h-full rounded-full bg-success/70';
  if (state.warning) return 'sim-kpi-fill h-full rounded-full bg-warning/70';
  return 'sim-kpi-fill h-full rounded-full bg-accent/70';
}

function kpiMapForScene(scene: SceneId): Record<string, KpiState> {
  if (scene < 2) return KPI_IDLE;
  if (scene < 6) return KPI_ALERT;
  if (scene === 6) return KPI_IMPROVING;
  return KPI_RESOLVED;
}

function applyKpiState(root: HTMLElement, scene: SceneId, generation: number) {
  const map = kpiMapForScene(scene);
  const note = root.querySelector('[data-sim-pulse-note]');
  if (note) {
    if (scene < 2) note.textContent = 'Monitoring';
    else if (scene < 6) note.textContent = 'Changes detected';
    else if (scene === 6) note.textContent = 'Improving';
    else note.textContent = 'Stabilizing';
  }

  const entries = Object.entries(map);
  entries.forEach(([key, state], index) => {
    window.setTimeout(() => {
      if (generation !== sceneGeneration) return;
      const card = root.querySelector<HTMLElement>(`[data-sim-kpi="${key}"]`);
      if (!card) return;
      const value = card.querySelector('[data-sim-kpi-value]');
      const fill = card.querySelector<HTMLElement>('[data-sim-kpi-fill]');
      if (value) {
        value.textContent = state.value;
        value.className = kpiClass(state);
      }
      if (fill) {
        fill.style.width = state.fill;
        fill.className = fillClass(state);
      }
    }, index * 100);
  });
}

function applyWatchStatuses(root: HTMLElement, scene: SceneId, generation: number) {
  const badge = root.querySelector('[data-sim-queue-badge]');
  if (badge) {
    if (scene >= 6) badge.textContent = 'Resolving';
    else if (scene >= 3) badge.textContent = 'Sorted · High first';
    else badge.textContent = 'By severity';
  }

  const order = ['fallout', 'cost', 'margin'] as const;
  order.forEach((id, index) => {
    const byScene = WATCH_STATUS[id];
    if (!byScene) return;
    window.setTimeout(() => {
      if (generation !== sceneGeneration) return;
      const item = root.querySelector<HTMLElement>(`[data-sim-watch="${id}"]`);
      if (!item) return;
      const status = item.querySelector('[data-sim-watch-status]');
      const label = byScene[scene] ?? 'Open';
      if (status) {
        status.textContent = label;
        const cleared = label === 'Cleared' || label === 'Acknowledged';
        status.className = cleared
          ? 'sim-watch-status text-[10px] font-medium text-success'
          : label === 'Priority' || label === 'In review'
            ? 'sim-watch-status text-[10px] font-medium text-warning'
            : 'sim-watch-status text-[10px] font-medium text-ink-subtle';
      }
    }, index * 120);
  });
}

function applySuccessCopy(root: HTMLElement, scene: SceneId) {
  const copy = SUCCESS_COPY[scene];
  if (!copy) return;
  const title = root.querySelector('[data-sim-success-title]');
  const body = root.querySelector('[data-sim-success-body]');
  if (title) title.textContent = copy.title;
  if (body) body.textContent = copy.body;
}

function applySceneState(root: HTMLElement, scene: SceneId) {
  const generation = ++sceneGeneration;
  applyKpiState(root, scene, generation);
  applyWatchStatuses(root, scene, generation);
  applySuccessCopy(root, scene);
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
    setScene(root, caption, 8, CAPTIONS[7]);
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
