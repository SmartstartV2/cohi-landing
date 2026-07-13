type SceneId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface Scene {
  id: SceneId;
  caption: string;
  duration: number;
}

const CAPTIONS = [
  'Cohi connects your lender DNA to what matters today.',
  'See what changed overnight.',
  'Critical signals rise first.',
  'Understand why it matters.',
  'Immediate Action Required.',
  'Needs Attention stays visible.',
  "What's Working comes into view.",
  'Context & Trends complete the brief.',
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
  { id: 2, caption: CAPTIONS[1], duration: 2000 },
  { id: 3, caption: CAPTIONS[2], duration: 1600 },
  { id: 4, caption: CAPTIONS[3], duration: 2300 },
  { id: 5, caption: CAPTIONS[4], duration: 2100 },
  { id: 6, caption: CAPTIONS[5], duration: 1900 },
  { id: 7, caption: CAPTIONS[6], duration: 1700 },
  { id: 8, caption: CAPTIONS[7], duration: 2800 },
];

type SparkType = 'area' | 'bars';
type KpiFormat = 'percent' | 'currencyM' | 'count';

type KpiState = {
  numeric: number;
  format: KpiFormat;
  status: string;
  sparkType: SparkType;
  spark: number[];
  warning?: boolean;
  success?: boolean;
};

const SPARK_W = 56;
const SPARK_H = 22;
const COUNTER_MS = 620;

const KPI_IDLE: Record<string, KpiState> = {
  pipeline: {
    numeric: 72,
    format: 'percent',
    status: 'On track',
    sparkType: 'area',
    spark: [40, 42, 41, 43, 44, 45, 44, 46, 47, 48],
  },
  fallout: {
    numeric: 0,
    format: 'currencyM',
    status: 'Clear',
    sparkType: 'area',
    spark: [12, 14, 13, 15, 14, 16, 15, 14, 13, 12],
  },
  cost: {
    numeric: 12,
    format: 'count',
    status: 'Steady',
    sparkType: 'bars',
    spark: [18, 20, 16, 22, 19, 21, 17, 20, 18, 19, 17, 18],
  },
  margin: {
    numeric: 7,
    format: 'count',
    status: 'Top tier',
    sparkType: 'bars',
    spark: [22, 24, 20, 26, 23, 25, 21, 24, 22, 23, 21, 22],
  },
};

const KPI_ALERT: Record<string, KpiState> = {
  pipeline: {
    numeric: 64,
    format: 'percent',
    status: 'Watch',
    sparkType: 'area',
    spark: [48, 46, 44, 42, 40, 38, 36, 34, 33, 32],
    warning: true,
  },
  fallout: {
    numeric: 23,
    format: 'currencyM',
    status: 'Critical',
    sparkType: 'area',
    spark: [14, 18, 22, 28, 36, 44, 52, 58, 62, 68],
    warning: true,
  },
  cost: {
    numeric: 67,
    format: 'count',
    status: 'At risk',
    sparkType: 'bars',
    spark: [18, 22, 20, 28, 26, 34, 40, 48, 52, 58, 62, 70],
    warning: true,
  },
  margin: {
    numeric: 23,
    format: 'count',
    status: 'Bottom tier',
    sparkType: 'bars',
    spark: [20, 22, 24, 28, 32, 38, 42, 48, 52, 56, 60, 64],
    warning: true,
  },
};

const KPI_IMPROVING: Record<string, KpiState> = {
  pipeline: {
    numeric: 66,
    format: 'percent',
    status: 'Watch',
    sparkType: 'area',
    spark: [32, 34, 35, 37, 38, 40, 41, 42, 43, 44],
  },
  fallout: {
    numeric: 18,
    format: 'currencyM',
    status: 'Improving',
    sparkType: 'area',
    spark: [68, 64, 58, 52, 48, 44, 40, 38, 36, 34],
    success: true,
  },
  cost: {
    numeric: 54,
    format: 'count',
    status: 'At risk',
    sparkType: 'bars',
    spark: [70, 66, 62, 58, 54, 50, 48, 46, 44, 42, 40, 38],
    warning: true,
  },
  margin: {
    numeric: 23,
    format: 'count',
    status: 'Bottom tier',
    sparkType: 'bars',
    spark: [64, 62, 60, 58, 56, 54, 52, 50, 48, 46, 44, 42],
    warning: true,
  },
};

const KPI_RESOLVED: Record<string, KpiState> = {
  pipeline: {
    numeric: 70,
    format: 'percent',
    status: 'On track',
    sparkType: 'area',
    spark: [44, 45, 46, 47, 48, 49, 48, 50, 51, 52],
  },
  fallout: {
    numeric: 9,
    format: 'currencyM',
    status: 'Clearing',
    sparkType: 'area',
    spark: [34, 30, 26, 22, 20, 18, 16, 15, 14, 12],
    success: true,
  },
  cost: {
    numeric: 28,
    format: 'count',
    status: 'Watch',
    sparkType: 'bars',
    spark: [38, 36, 34, 32, 30, 28, 26, 24, 22, 20, 18, 16],
  },
  margin: {
    numeric: 18,
    format: 'count',
    status: 'Watch',
    sparkType: 'bars',
    spark: [42, 40, 38, 36, 34, 32, 30, 28, 26, 24, 22, 20],
  },
};

const kpiNumericMemory: Record<string, number> = {
  pipeline: KPI_IDLE.pipeline.numeric,
  fallout: KPI_IDLE.fallout.numeric,
  cost: KPI_IDLE.cost.numeric,
  margin: KPI_IDLE.margin.numeric,
};

const kpiRafMemory: Record<string, number> = {};

const WATCH_STATUS: Record<string, Partial<Record<SceneId, string>>> = {
  fallout: {
    1: 'Queued',
    2: 'Queued',
    3: 'Immediate Action',
    4: 'Immediate Action',
    5: 'Immediate Action',
    6: 'In focus',
    7: 'In focus',
    8: 'In focus',
  },
  cost: {
    1: 'Queued',
    2: 'Queued',
    3: 'Monitor Closely',
    4: 'Monitor Closely',
    5: 'Monitor Closely',
    6: 'Monitor Closely',
    7: 'Monitor Closely',
    8: 'Monitor Closely',
  },
  margin: {
    1: 'Queued',
    2: 'Queued',
    3: 'Strategic Review',
    4: 'Strategic Review',
    5: 'Strategic Review',
    6: 'Strategic Review',
    7: 'Strategic Review',
    8: 'Context & Trends',
  },
};

const SUCCESS_COPY: Partial<
  Record<SceneId, { label: string; badge: string; title: string; body: string }>
> = {
  6: {
    label: "What's Working",
    badge: 'Signal',
    title: 'Pull-through stabilizing where leadership intervened early',
    body: 'West late-close pressure easing. Keep Critical on the morning brief.',
  },
  7: {
    label: "What's Working",
    badge: 'Signal',
    title: 'Top-tier originators still carrying production',
    body: '7 Top Tier LOs remain the load-bearing signal while bottom tier is monitored.',
  },
  8: {
    label: 'Context & Trends',
    badge: 'Brief',
    title: 'Morning brief complete — Signals. Not Noise.',
    body: 'Critical, Needs Attention, What’s Working, and Context ranked before coffee.',
  },
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let sceneGeneration = 0;

function formatKpiValue(numeric: number, format: KpiFormat) {
  if (format === 'percent') return `${Math.round(numeric)}%`;
  if (format === 'currencyM') return `$${Math.round(numeric)}M`;
  return `${Math.round(numeric)}`;
}

function valueClass(state: KpiState) {
  if (state.success) {
    return 'text-sm font-semibold tracking-tight text-success sm:text-[15px]';
  }
  if (state.warning) {
    return 'text-sm font-semibold tracking-tight text-warning sm:text-[15px]';
  }
  return 'text-sm font-semibold tracking-tight text-ink sm:text-[15px]';
}

function statusClass(state: KpiState) {
  if (state.success) return 'truncate text-[10px] font-medium text-success';
  if (state.warning) return 'truncate text-[10px] font-medium text-warning';
  return 'truncate text-[10px] font-medium text-ink-subtle';
}

function areaPaths(values: number[], width: number, height: number) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 3) - 1.5;
    return { x, y };
  });
  const line = coords
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;
  return { line, area };
}

function renderSparkSvg(state: KpiState, key: string, warningTone: boolean) {
  const stroke = warningTone ? '#c4922a' : state.success ? '#00a651' : '#0033a0';
  const barFill = warningTone ? '#c4922a' : state.success ? '#5aaa7a' : '#5a7fc4';
  const gradId = `sim-kpi-${key}-${Math.round(state.numeric)}`;

  if (state.sparkType === 'bars') {
    const count = state.spark.length;
    const gap = 0.9;
    const barW = (SPARK_W - gap * (count - 1)) / count;
    const max = Math.max(...state.spark, 1);
    const bars = state.spark
      .map((value, index) => {
        const h = Math.max((value / max) * SPARK_H, 2);
        const x = index * (barW + gap);
        const y = SPARK_H - h;
        return `<rect class="sim-kpi-spark-bar" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" rx="0.4" fill="${barFill}" />`;
      })
      .join('');
    return `<svg class="sim-kpi-spark" viewBox="0 0 ${SPARK_W} ${SPARK_H}" width="${SPARK_W}" height="${SPARK_H}" aria-hidden="true">${bars}</svg>`;
  }

  const { line, area } = areaPaths(state.spark, SPARK_W, SPARK_H);
  return `<svg class="sim-kpi-spark" viewBox="0 0 ${SPARK_W} ${SPARK_H}" width="${SPARK_W}" height="${SPARK_H}" aria-hidden="true">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${stroke}" stop-opacity="0.35" />
          <stop offset="100%" stop-color="${stroke}" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="sim-kpi-spark-area" d="${area}" fill="url(#${gradId})" />
      <path class="sim-kpi-spark-line" d="${line}" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
}

function animateCounter(
  el: HTMLElement,
  key: string,
  from: number,
  to: number,
  format: KpiFormat,
  generation: number,
  reduceMotion: boolean,
) {
  const prior = kpiRafMemory[key];
  if (prior) cancelAnimationFrame(prior);

  if (reduceMotion || from === to) {
    el.textContent = formatKpiValue(to, format);
    kpiNumericMemory[key] = to;
    return;
  }

  const start = performance.now();
  const tick = (now: number) => {
    if (generation !== sceneGeneration) return;
    const t = Math.min(1, (now - start) / COUNTER_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    const current = from + (to - from) * eased;
    el.textContent = formatKpiValue(current, format);
    if (t < 1) {
      kpiRafMemory[key] = requestAnimationFrame(tick);
      return;
    }
    kpiNumericMemory[key] = to;
    el.textContent = formatKpiValue(to, format);
  };

  kpiRafMemory[key] = requestAnimationFrame(tick);
}

function kpiMapForScene(scene: SceneId): Record<string, KpiState> {
  if (scene < 2) return KPI_IDLE;
  if (scene < 6) return KPI_ALERT;
  if (scene === 6) return KPI_IMPROVING;
  return KPI_RESOLVED;
}

function applyKpiState(
  root: HTMLElement,
  scene: SceneId,
  generation: number,
  reduceMotion = false,
) {
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

      const valueEl = card.querySelector<HTMLElement>('[data-sim-kpi-value]');
      const statusEl = card.querySelector<HTMLElement>('[data-sim-kpi-status]');
      const sparkWrap = card.querySelector<HTMLElement>('[data-sim-kpi-spark]');

      if (valueEl) {
        valueEl.className = valueClass(state);
        valueEl.classList.remove('sim-kpi-value-tick');
        void valueEl.offsetWidth;
        valueEl.classList.add('sim-kpi-value-tick');
        const from = kpiNumericMemory[key] ?? state.numeric;
        animateCounter(valueEl, key, from, state.numeric, state.format, generation, reduceMotion);
      }

      if (statusEl) {
        statusEl.textContent = state.status;
        statusEl.className = statusClass(state);
      }

      if (sparkWrap) {
        sparkWrap.innerHTML = renderSparkSvg(state, key, Boolean(state.warning));
      }
    }, index * 100);
  });
}

function applyWatchStatuses(root: HTMLElement, scene: SceneId, generation: number) {
  const badge = root.querySelector('[data-sim-queue-badge]');
  if (badge) {
    if (scene >= 6) badge.textContent = 'Insights ranked';
    else if (scene >= 3) badge.textContent = 'Critical first';
    else badge.textContent = 'By urgency';
  }

  (['fallout', 'cost', 'margin'] as const).forEach((id, index) => {
    const byScene = WATCH_STATUS[id];
    if (!byScene) return;
    window.setTimeout(() => {
      if (generation !== sceneGeneration) return;
      const item = root.querySelector<HTMLElement>(`[data-sim-watch="${id}"]`);
      if (!item) return;
      const status = item.querySelector('[data-sim-watch-status]');
      const label = byScene[scene] ?? 'Queued';
      if (status) {
        status.textContent = label;
        const focus = label === 'Immediate Action' || label === 'In focus';
        status.className = focus
          ? 'sim-watch-status text-[10px] font-medium text-warning'
          : label === 'Monitor Closely'
            ? 'sim-watch-status text-[10px] font-medium text-navy'
            : 'sim-watch-status text-[10px] font-medium text-ink-subtle';
      }
    }, index * 120);
  });
}

function applySuccessCopy(root: HTMLElement, scene: SceneId) {
  const copy = SUCCESS_COPY[scene];
  if (!copy) return;
  const label = root.querySelector('[data-sim-success-label]');
  const badge = root.querySelector('[data-sim-success-badge]');
  const title = root.querySelector('[data-sim-success-title]');
  const body = root.querySelector('[data-sim-success-body]');
  if (label) label.textContent = copy.label;
  if (badge) badge.textContent = copy.badge;
  if (title) title.textContent = copy.title;
  if (body) body.textContent = copy.body;
}

function applySceneState(root: HTMLElement, scene: SceneId, reduceMotion = false) {
  const generation = ++sceneGeneration;
  applyKpiState(root, scene, generation, reduceMotion);
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
  const generation = applySceneState(root, scene, reduceMotion);
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
