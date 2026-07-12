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

/**
 * Scene budgets vs animation settle times (delay + duration):
 * 1 sources: chip flight ~1.8s + stagger 0.45s ≈ 2.25s
 * 2 KPIs: fill delay 0.35s + 0.75s ≈ 1.1s
 * 3 watch sort: delay 0.3s + 0.5s ≈ 0.8s
 * 4 Cohi brief: delay 0.15–0.2s + 0.45–0.55s ≈ 0.7s
 * 5 floats: prompts delay 0.38s + 0.5s ≈ 0.9s
 * 6 success/check: ≈ 0.8s
 * 7 secondary resolve: ≈ 0.8s
 * 8 final hold / last checks: ≈ 0.95s
 */
const SCENES: Scene[] = [
  { id: 1, caption: CAPTIONS[0], duration: 2500 },
  { id: 2, caption: CAPTIONS[1], duration: 1700 },
  { id: 3, caption: CAPTIONS[2], duration: 1600 },
  { id: 4, caption: CAPTIONS[3], duration: 2300 },
  { id: 5, caption: CAPTIONS[4], duration: 2100 },
  { id: 6, caption: CAPTIONS[5], duration: 1900 },
  { id: 7, caption: CAPTIONS[6], duration: 1700 },
  { id: 8, caption: CAPTIONS[7], duration: 2800 },
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

const SUCCESS_COPY: Partial<Record<SceneId, { title: string; body: string }>> = {
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

  Object.entries(map).forEach(([key, state], index) => {
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

  (['fallout', 'cost', 'margin'] as const).forEach((id, index) => {
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
  return generation;
}

async function typeCaption(
  caption: HTMLElement,
  text: string,
  generation: number,
  reduceMotion: boolean,
) {
  const textEl = caption.querySelector<HTMLElement>('[data-sim-caption-text]') ?? caption;

  if (reduceMotion) {
    textEl.textContent = text;
    caption.classList.remove('is-typing');
    return;
  }

  caption.classList.add('is-typing');
  textEl.textContent = '';

  // Calm executive pace — shorter lines feel snappier
  const msPerChar = text.length > 42 ? 22 : 28;

  for (let i = 0; i < text.length; i++) {
    if (generation !== sceneGeneration) return;
    textEl.textContent = text.slice(0, i + 1);
    await wait(msPerChar);
  }

  if (generation !== sceneGeneration) return;
  // Brief caret hold, then hide
  await wait(280);
  if (generation === sceneGeneration) {
    caption.classList.remove('is-typing');
  }
}

function setScene(
  root: HTMLElement,
  caption: HTMLElement | null,
  scene: SceneId,
  text: string,
  reduceMotion = false,
) {
  root.dataset.scene = String(scene);
  const generation = applySceneState(root, scene);
  if (caption) {
    void typeCaption(caption, text, generation, reduceMotion);
  }
}

function syncPlayButton(root: HTMLElement, playing: boolean) {
  const btn = root.querySelector<HTMLButtonElement>('[data-sim-play]');
  if (!btn) return;
  btn.setAttribute('aria-pressed', String(playing));
  btn.setAttribute('aria-label', playing ? 'Pause simulation' : 'Play simulation');
  const playIcon = btn.querySelector('[data-sim-icon-play]');
  const pauseIcon = btn.querySelector('[data-sim-icon-pause]');
  playIcon?.classList.toggle('hidden', playing);
  pauseIcon?.classList.toggle('hidden', !playing);
}

export function initProductSimulation() {
  const root = document.querySelector<HTMLElement>('[data-sim]');
  if (!root) return;

  const caption = root.querySelector<HTMLElement>('[data-sim-caption]');
  const playBtn = root.querySelector<HTMLButtonElement>('[data-sim-play]');
  const replayBtn = root.querySelector<HTMLButtonElement>('[data-sim-replay]');
  const dots = root.querySelectorAll<HTMLButtonElement>('[data-sim-dot]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    setScene(root, caption, 8, CAPTIONS[7], true);
    syncPlayButton(root, false);
    playBtn?.setAttribute('disabled', 'true');
    replayBtn?.setAttribute('disabled', 'true');
    return;
  }

  let userPaused = false;
  let offscreen = true;
  let hoverPaused = false;
  let jumpTo: SceneId | null = null;
  let restartLoop = false;
  let started = false;

  const isEffectivelyPaused = () => userPaused || offscreen || hoverPaused;
  const isUserFacingPlaying = () => !userPaused && !offscreen;

  const updatePlayUi = () => syncPlayButton(root, isUserFacingPlaying());

  const goToScene = (scene: SceneId) => {
    const entry = SCENES.find((s) => s.id === scene) ?? SCENES[0];
    setScene(root, caption, entry.id, entry.caption);
  };

  const runLoop = async () => {
    if (started) return;
    started = true;

    while (true) {
      if (isEffectivelyPaused()) {
        await wait(250);
        continue;
      }

      if (restartLoop) {
        restartLoop = false;
        jumpTo = null;
      }

      const startIndex = jumpTo ? SCENES.findIndex((s) => s.id === jumpTo) : 0;
      jumpTo = null;

      for (let i = Math.max(0, startIndex); i < SCENES.length; i++) {
        if (isEffectivelyPaused() || restartLoop || jumpTo) break;
        const scene = SCENES[i];
        goToScene(scene.id);

        const end = performance.now() + scene.duration;
        while (performance.now() < end) {
          if (isEffectivelyPaused() || restartLoop || jumpTo) break;
          await wait(100);
        }
        if (isEffectivelyPaused() || restartLoop || jumpTo) break;
      }
    }
  };

  playBtn?.addEventListener('click', () => {
    userPaused = !userPaused;
    if (!userPaused) offscreen = false;
    updatePlayUi();
  });

  replayBtn?.addEventListener('click', () => {
    userPaused = false;
    offscreen = false;
    restartLoop = true;
    jumpTo = 1;
    goToScene(1);
    updatePlayUi();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const id = Number(dot.dataset.simDot) as SceneId;
      if (!id || id < 1 || id > 8) return;
      userPaused = false;
      offscreen = false;
      jumpTo = id;
      goToScene(id);
      updatePlayUi();
    });
  });

  root.addEventListener('mouseenter', () => {
    hoverPaused = true;
  });
  root.addEventListener('mouseleave', () => {
    hoverPaused = false;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      offscreen = !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2);
      updatePlayUi();
    },
    { threshold: [0, 0.2, 0.4] },
  );

  observer.observe(root);
  updatePlayUi();
  void runLoop();
}
