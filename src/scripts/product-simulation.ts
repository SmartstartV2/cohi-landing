type SceneId = 1 | 2 | 3 | 4 | 5;

interface Scene {
  id: SceneId;
  caption: string;
  duration: number;
}

const CAPTIONS = [
  'Coheus connects signals across your mortgage business.',
  'See what changed.',
  'Understand why it matters.',
  'Know where to focus.',
] as const;

const SCENES: Scene[] = [
  { id: 1, caption: CAPTIONS[0], duration: 3200 },
  { id: 2, caption: CAPTIONS[1], duration: 3400 },
  { id: 3, caption: CAPTIONS[2], duration: 3600 },
  { id: 4, caption: CAPTIONS[3], duration: 3600 },
  { id: 5, caption: CAPTIONS[3], duration: 1400 },
];

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function applyMetricState(root: HTMLElement, scene: SceneId) {
  const set = (selector: string, text: string) => {
    const el = root.querySelector(selector);
    if (el) el.textContent = text;
  };

  const meter = root.querySelector<HTMLElement>('[data-sim-cost-meter]');
  const badgePipeline = root.querySelector<HTMLElement>('[data-sim-pipeline-badge]');
  const badgeFallout = root.querySelector<HTMLElement>('[data-sim-fallout-badge]');
  const west = root.querySelector<HTMLElement>('[data-sim-west]');

  if (scene < 2) {
    set('[data-sim-pipeline-value]', 'Stable');
    set('[data-sim-cost-value]', 'Steady');
    set('[data-sim-cost-label]', 'Steady');
    set('[data-sim-fallout-value]', 'Stable');
    set('[data-sim-units]', '→');
    set('[data-sim-units-label]', 'Steady');
    set('[data-sim-pull]', '→');
    set('[data-sim-pull-label]', 'Steady');
    set('[data-sim-cycle]', '→');
    set('[data-sim-cycle-label]', 'Steady');
    set(
      '[data-sim-ai-brief]',
      'Monitoring connected lender signals across production, pipeline, and operations.',
    );
    if (meter) meter.style.width = '48%';
    if (badgePipeline) {
      badgePipeline.textContent = 'On track';
      badgePipeline.className =
        'rounded-md bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent';
    }
    if (badgeFallout) {
      badgeFallout.textContent = 'Clear';
      badgeFallout.className =
        'rounded-md bg-accent-soft px-2 py-1 text-[11px] font-semibold text-accent';
    }
    if (west) {
      west.textContent = 'Stable';
      west.className = 'font-medium text-ink';
    }
    return;
  }

  set('[data-sim-pipeline-value]', 'Softening');
  set('[data-sim-cost-value]', 'Rising');
  set('[data-sim-cost-label]', 'Elevated');
  set('[data-sim-fallout-value]', 'Attention');
  set('[data-sim-units]', '↑');
  set('[data-sim-units-label]', 'Improving');
  set('[data-sim-pull]', '↓');
  set('[data-sim-pull-label]', 'Declining');
  set('[data-sim-cycle]', '↓');
  set('[data-sim-cycle-label]', 'Slower');
  if (meter) meter.style.width = '72%';
  if (badgePipeline) {
    badgePipeline.textContent = 'Watch';
    badgePipeline.className =
      'rounded-md bg-[#f8efe2] px-2 py-1 text-[11px] font-semibold text-warning';
  }
  if (badgeFallout) {
    badgeFallout.textContent = 'Early signal';
    badgeFallout.className =
      'rounded-md bg-[#f8efe2] px-2 py-1 text-[11px] font-semibold text-warning';
  }
  if (west) {
    west.textContent = 'Rising';
    west.className = 'font-medium text-warning';
  }

  if (scene >= 3) {
    set(
      '[data-sim-ai-brief]',
      'West Region fallout is rising. Processing delays and weaker pull-through are the primary drivers.',
    );
  }
}

function setScene(root: HTMLElement, caption: HTMLElement | null, scene: SceneId, text: string) {
  root.dataset.scene = String(scene);
  if (caption) {
    caption.style.opacity = '0';
    window.setTimeout(() => {
      caption.textContent = text;
      caption.style.opacity = '1';
    }, 180);
  }
  applyMetricState(root, scene);
}

export function initProductSimulation() {
  const root = document.querySelector<HTMLElement>('[data-sim]');
  if (!root) return;

  const caption = root.querySelector<HTMLElement>('[data-sim-caption]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    setScene(root, caption, 4, CAPTIONS[3]);
    applyMetricState(root, 4);
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
      paused = !entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25);
    },
    { threshold: [0, 0.25, 0.5] },
  );

  observer.observe(root);
  void runLoop();
}
