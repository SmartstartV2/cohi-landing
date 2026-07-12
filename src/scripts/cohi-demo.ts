type MetricSpark = {
  type: 'bars' | 'area';
  values: number[];
};

type Metric = {
  label: string;
  value: string;
  delta: string;
  spark: MetricSpark;
};

type Demo = {
  question: string;
  summary: string;
  metrics: Metric[];
  bullets: string[];
};

const demos: Record<string, Demo> = {
  cost: {
    question: 'Why did cost per loan increase this month?',
    summary: 'Cost per loan rose 8% MoM, led by origination cycle time and rework.',
    metrics: [
      {
        label: 'Cost / loan',
        value: '$412',
        delta: '+8%',
        spark: {
          type: 'area',
          values: [34, 30, 26, 28, 22, 24, 20, 32, 40, 36, 44, 52, 48, 58, 62],
        },
      },
      {
        label: 'Cycle time',
        value: '4.2d',
        delta: '+0.7d',
        spark: {
          type: 'area',
          values: [28, 30, 27, 32, 29, 35, 33, 38, 36, 42, 40, 46, 44, 50, 54],
        },
      },
      {
        label: 'Rework',
        value: '18%',
        delta: '+3pts',
        spark: {
          type: 'area',
          values: [22, 24, 20, 26, 30, 28, 34, 32, 38, 36, 42, 40, 46, 48, 52],
        },
      },
    ],
    bullets: [
      'Branches 07 and 14 driving cycle-time delay',
      'Condition rework up 22% month over month',
      'West pull-through soft spots amplifying unit cost',
    ],
  },
  fallout: {
    question: 'Which branches are showing early signs of fallout risk?',
    summary: 'West Region branches 12 and 18 are elevating first — ahead of peer average.',
    metrics: [
      {
        label: 'Branch 12',
        value: '14%',
        delta: 'Elevated',
        spark: {
          type: 'bars',
          values: [28, 36, 22, 48, 18, 72, 40, 34, 52, 30, 58, 26, 20, 44, 32, 38, 24, 46, 30, 42],
        },
      },
      {
        label: 'Branch 18',
        value: '11%',
        delta: 'Watch',
        spark: {
          type: 'bars',
          values: [24, 30, 20, 42, 26, 55, 34, 28, 46, 22, 50, 32, 18, 38, 28, 36, 24, 40, 30, 34],
        },
      },
      {
        label: 'Peer avg',
        value: '6%',
        delta: 'Baseline',
        spark: {
          type: 'bars',
          values: [18, 22, 16, 28, 14, 32, 20, 24, 26, 18, 30, 16, 12, 22, 18, 24, 14, 26, 20, 22],
        },
      },
    ],
    bullets: [
      'Delayed borrower conditions adding 1.8 days',
      'Processor capacity lagging lock volume',
      'Condition turnaround slipping week over week',
    ],
  },
  focus: {
    question: 'Where should leadership focus today?',
    summary: 'Prioritize West fallout first, then origination cost and pricing margin.',
    metrics: [
      {
        label: 'P1 focus',
        value: 'Fallout',
        delta: 'West',
        spark: {
          type: 'bars',
          values: [30, 38, 24, 50, 20, 68, 42, 36, 54, 28, 60, 32, 22, 46, 34, 40, 26, 48, 32, 44],
        },
      },
      {
        label: 'P2 watch',
        value: 'CPL',
        delta: '+8%',
        spark: {
          type: 'area',
          values: [32, 28, 24, 26, 22, 30, 36, 34, 42, 40, 48, 46, 54, 52, 60],
        },
      },
      {
        label: 'P3 watch',
        value: 'Margin',
        delta: 'Leakage',
        spark: {
          type: 'area',
          values: [58, 54, 50, 52, 46, 44, 48, 40, 38, 42, 36, 34, 38, 30, 28],
        },
      },
    ],
    bullets: [
      'Assign owner to West Region fallout drivers today',
      'Review cycle-time outliers in branches 07 and 14',
      'Check pricing desk margin leakage before week close',
    ],
  },
};

const demoOrder = ['cost', 'fallout', 'focus'] as const;

const QUESTION_MS = 40;
const SUMMARY_MS = 14;
const THINK_MS = 700;
const EVIDENCE_STEP_MS = 90;
const METRICS_REVEAL_MS = 520;
const BULLETS_REVEAL_MS = 380;
const HOLD_MS = 4200;
const CLEAR_MS = 260;

const SPARK_W = 56;
const SPARK_H = 28;

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timer = window.setTimeout(() => resolve(), ms);
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

async function typeText(
  el: HTMLElement,
  text: string,
  msPerChar: number,
  signal: AbortSignal,
) {
  el.textContent = '';
  for (let i = 0; i < text.length; i++) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    el.textContent = text.slice(0, i + 1);
    await sleep(msPerChar, signal);
  }
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
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

function renderSparkSvg(spark: MetricSpark, id: string) {
  if (spark.type === 'bars') {
    const count = spark.values.length;
    const gap = 0.9;
    const barW = (SPARK_W - gap * (count - 1)) / count;
    const max = Math.max(...spark.values, 1);

    const bars = spark.values
      .map((value, index) => {
        const h = Math.max((value / max) * SPARK_H, 2);
        const x = index * (barW + gap);
        const y = SPARK_H - h;
        return `<rect class="cohi-kpi-bar" x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${h.toFixed(2)}" rx="0.4" fill="#5aa8b4" style="transition-delay: ${index * 18}ms" />`;
      })
      .join('');

    return `<svg class="cohi-kpi-spark" viewBox="0 0 ${SPARK_W} ${SPARK_H}" width="${SPARK_W}" height="${SPARK_H}" aria-hidden="true">${bars}</svg>`;
  }

  const { line, area } = areaPaths(spark.values, SPARK_W, SPARK_H);
  const gradId = `cohi-area-${id}`;

  return `
    <svg class="cohi-kpi-spark" viewBox="0 0 ${SPARK_W} ${SPARK_H}" width="${SPARK_W}" height="${SPARK_H}" aria-hidden="true">
      <defs>
        <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1a7a88" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#1a7a88" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path class="cohi-kpi-area" d="${area}" fill="url(#${gradId})" />
      <path class="cohi-kpi-area-line" d="${line}" fill="none" stroke="#0f5f6b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`;
}

function renderMetricCard(metric: Metric, index: number) {
  return `
    <div class="cohi-metric flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-2 shadow-card" style="transition-delay: ${index * 90}ms">
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-medium text-ink-subtle">${metric.label}</p>
        <p class="mt-0.5 text-sm font-semibold text-ink">${metric.value}</p>
        <p class="mt-0.5 text-[10px] font-medium text-warning">${metric.delta}</p>
      </div>
      <div class="cohi-kpi-spark-wrap shrink-0" aria-hidden="true">
        ${renderSparkSvg(metric.spark, `${index}`)}
      </div>
    </div>`;
}

export function initCohiDemo() {
  const root = document.querySelector<HTMLElement>('[data-cohi-demo]');
  if (!root) return;

  const questionTextEl = root.querySelector<HTMLElement>('[data-cohi-question-text]');
  const answerEl = root.querySelector<HTMLElement>('[data-cohi-answer]');
  const metricsEl = root.querySelector<HTMLElement>('[data-cohi-metrics]');
  const bulletsEl = root.querySelector<HTMLElement>('[data-cohi-bullets]');
  const bodyEl = root.querySelector<HTMLElement>('[data-cohi-body]');
  const thinkingEl = root.querySelector<HTMLElement>('[data-cohi-thinking]');
  const statusLabelEl = root.querySelector<HTMLElement>('[data-cohi-status-label]');
  const chips = root.querySelectorAll<HTMLButtonElement>('[data-cohi-chip]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (
    !questionTextEl ||
    !answerEl ||
    !metricsEl ||
    !bulletsEl ||
    !bodyEl ||
    !thinkingEl ||
    !statusLabelEl
  ) {
    return;
  }

  let activeId: string = demoOrder[0];
  let runToken = 0;
  let abortController: AbortController | null = null;
  let loopActive = false;

  const setChipState = (id: string) => {
    chips.forEach((chip) => {
      chip.setAttribute('aria-pressed', String(chip.dataset.cohiChip === id));
    });
    root.dataset.active = id;
  };

  const setTyping = (on: boolean) => {
    root.dataset.typing = on ? 'true' : 'false';
  };

  const setThinking = (on: boolean) => {
    root.dataset.thinking = on ? 'true' : 'false';
    thinkingEl.hidden = !on;
    thinkingEl.setAttribute('aria-hidden', on ? 'false' : 'true');
    bodyEl.classList.toggle('invisible', on);
    statusLabelEl.textContent = on ? 'Cohi is analyzing' : 'Cohi answers';
  };

  const setEvidence = (state: 'pending' | 'metrics' | 'bullets' | 'shown') => {
    root.dataset.evidence = state;
  };

  const renderMetrics = (metrics: Metric[]) => {
    metricsEl.innerHTML = metrics.map((metric, index) => renderMetricCard(metric, index)).join('');
  };

  const renderBullets = (bullets: string[]) => {
    bulletsEl.innerHTML = bullets
      .map(
        (bullet, index) => `
        <li class="cohi-bullet flex gap-2 text-xs leading-snug text-ink-muted sm:text-[13px]" style="transition-delay: ${index * 90}ms">
          <span class="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden="true"></span>
          <span>${bullet}</span>
        </li>`,
      )
      .join('');
  };

  const renderEvidence = (demo: Demo, visible: boolean) => {
    renderMetrics(demo.metrics);
    renderBullets(demo.bullets);
    setEvidence(visible ? 'shown' : 'pending');
  };

  const clearAnswer = () => {
    answerEl.textContent = '';
    metricsEl.innerHTML = '';
    bulletsEl.innerHTML = '';
    setEvidence('pending');
  };

  const showStatic = (id: string) => {
    const demo = demos[id];
    if (!demo) return;
    activeId = id;
    setChipState(id);
    setTyping(false);
    setThinking(false);
    questionTextEl.textContent = demo.question;
    answerEl.textContent = demo.summary;
    renderEvidence(demo, true);
  };

  const revealEvidence = async (_demo: Demo, signal: AbortSignal) => {
    setEvidence('pending');
    void metricsEl.offsetWidth;

    setEvidence('metrics');
    await sleep(METRICS_REVEAL_MS, signal);

    setEvidence('bullets');
    await sleep(BULLETS_REVEAL_MS, signal);
    setEvidence('shown');
    await sleep(EVIDENCE_STEP_MS, signal);
  };

  const playOnce = async (id: string, signal: AbortSignal) => {
    const demo = demos[id];
    if (!demo) return;

    activeId = id;
    setChipState(id);
    setTyping(false);
    setThinking(false);
    questionTextEl.textContent = '';
    clearAnswer();
    renderEvidence(demo, false);
    answerEl.textContent = '';

    await sleep(CLEAR_MS, signal);

    setTyping(true);
    await typeText(questionTextEl, demo.question, QUESTION_MS, signal);
    setTyping(false);

    setThinking(true);
    await sleep(THINK_MS, signal);
    setThinking(false);

    await typeText(answerEl, demo.summary, SUMMARY_MS, signal);
    await revealEvidence(demo, signal);
    await sleep(HOLD_MS, signal);
  };

  const stopLoop = () => {
    abortController?.abort();
    abortController = null;
    loopActive = false;
    runToken += 1;
  };

  const startLoop = (startId?: string) => {
    if (reduceMotion) {
      showStatic(startId ?? activeId);
      return;
    }

    stopLoop();
    const token = runToken;
    const controller = new AbortController();
    abortController = controller;
    loopActive = true;

    if (startId) activeId = startId;

    const run = async () => {
      let index = demoOrder.indexOf(activeId as (typeof demoOrder)[number]);
      if (index < 0) index = 0;

      while (loopActive && token === runToken && !controller.signal.aborted) {
        const id = demoOrder[index % demoOrder.length];
        try {
          await playOnce(id, controller.signal);
          index = (index + 1) % demoOrder.length;
        } catch (error) {
          if (isAbortError(error)) return;
          throw error;
        }
      }
    };

    void run();
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const id = chip.dataset.cohiChip;
      if (!id || !demos[id]) return;

      if (reduceMotion) {
        showStatic(id);
        return;
      }

      startLoop(id);
    });
  });

  if (reduceMotion) {
    showStatic(activeId);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const nowInView = Boolean(entry?.isIntersecting);

      if (nowInView) {
        if (!loopActive) startLoop(activeId);
        return;
      }

      if (loopActive) {
        stopLoop();
        showStatic(activeId);
      }
    },
    { threshold: 0.35 },
  );

  observer.observe(root);
  questionTextEl.textContent = '';
  clearAnswer();
  setTyping(false);
  setThinking(false);
}
