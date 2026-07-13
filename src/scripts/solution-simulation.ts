import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type PanelId = 'layer' | 'rank' | 'context' | 'cohi';

const PANEL_ORDER: PanelId[] = ['layer', 'rank', 'context', 'cohi'];

const STAGE_LABELS: Record<PanelId, string> = {
  layer: 'Same data. Now ranked.',
  rank: 'One morning priority',
  context: 'Explain the shift',
  cohi: 'Actionable before coffee',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSolutionSimulation() {
  const root = document.querySelector<HTMLElement>('[data-solution]');
  if (!root) return;

  const flow = root.querySelector<HTMLElement>('[data-solution-flow]');
  const tabs = gsap.utils.toArray<HTMLButtonElement>('[data-solution-tab]', root);
  const panels = gsap.utils.toArray<HTMLElement>('[data-solution-panel]', root);
  const stageLabel = root.querySelector<HTMLElement>('[data-solution-stage-label]');
  const liveDot = root.querySelector<HTMLElement>('.solution-live-dot');
  const liveText = root.querySelector<HTMLElement>('[data-solution-live-text]');

  if (!flow || !tabs.length || !panels.length) return;

  let activeId: PanelId = 'layer';
  let activeTl: gsap.core.Timeline | null = null;
  let hasAutoPlayed = false;

  const panelMap = Object.fromEntries(
    panels.map((panel) => [panel.dataset.solutionPanel as PanelId, panel]),
  ) as Record<PanelId, HTMLElement>;

  const noiseList = panelMap.layer?.querySelector<HTMLElement>('ul');
  const noiseOrderOriginal = noiseList
    ? gsap.utils.toArray<HTMLElement>('[data-scene-noise]', noiseList)
    : [];

  function restoreNoiseOrder() {
    if (!noiseList) return;
    noiseOrderOriginal.forEach((row) => noiseList.appendChild(row));
    gsap.set(noiseOrderOriginal, { clearProps: 'transform' });
  }

  function sortNoiseRows(animate: boolean) {
    if (!noiseList) return [] as HTMLElement[];

    const rows = gsap.utils.toArray<HTMLElement>('[data-scene-noise]', noiseList);
    const firstTops = new Map(rows.map((row) => [row, row.getBoundingClientRect().top]));

    const sorted = [...rows].sort(
      (a, b) => Number(a.dataset.rank) - Number(b.dataset.rank),
    );
    sorted.forEach((row) => noiseList.appendChild(row));

    if (!animate) {
      gsap.set(sorted, { clearProps: 'transform' });
      return sorted;
    }

    sorted.forEach((row) => {
      const first = firstTops.get(row) ?? row.getBoundingClientRect().top;
      const last = row.getBoundingClientRect().top;
      gsap.set(row, { y: first - last });
    });

    return sorted;
  }

  function setLive(playing: boolean) {
    if (liveDot) liveDot.dataset.playing = playing ? 'true' : 'false';
    if (liveText) liveText.textContent = playing ? 'Live' : 'Ready';
  }

  function setActiveTab(id: PanelId) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.solutionTab === id;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.solutionPanel !== id;
    });

    if (stageLabel) stageLabel.textContent = STAGE_LABELS[id];
    activeId = id;
  }

  function killActive() {
    if (activeTl) {
      activeTl.kill();
      activeTl = null;
    }
    gsap.killTweensOf(flow.querySelectorAll('*'));
  }

  function resetPanel(id: PanelId) {
    const panel = panelMap[id];
    if (!panel) return;

    if (id === 'layer') {
      restoreNoiseOrder();
      gsap.set(panel.querySelectorAll('[data-scene-noise]'), { opacity: 0, y: 10 });
      gsap.set(panel.querySelector('[data-scene-rank-hint]'), { opacity: 0 });
      gsap.set(panel.querySelectorAll('[data-badge-equal]'), { opacity: 1 });
      gsap.set(panel.querySelectorAll('[data-badge-ranked]'), { opacity: 0 });
      gsap.set(panel.querySelector('[data-scene-noise-note]'), { opacity: 0, y: 6 });
      const hint = panel.querySelector('[data-scene-rank-hint]');
      if (hint) hint.textContent = 'Ranking…';
    }

    if (id === 'rank') {
      const signals = panel.querySelectorAll<HTMLElement>('[data-scene-signal]');
      signals.forEach((signal) => {
        gsap.set(signal, {
          opacity: 0,
          y: 14,
          scale: 0.98,
          boxShadow: 'none',
        });
      });
      gsap.set(panel.querySelector('[data-scene-rank-more]'), { opacity: 0 });
    }

    if (id === 'context') {
      gsap.set(panel.querySelector('[data-scene-issue]'), { opacity: 0, y: 10 });
      gsap.set(panel.querySelectorAll('[data-scene-driver]'), { opacity: 0, x: -8 });
      gsap.set(panel.querySelector('[data-scene-why]'), { opacity: 0, y: 8 });
    }

    if (id === 'cohi') {
      gsap.set(panel.querySelector('[data-scene-brief]'), { opacity: 0, y: 12 });
      gsap.set(panel.querySelector('[data-scene-brief-header]'), { opacity: 0 });
      gsap.set(panel.querySelector('[data-scene-takeaway]'), { opacity: 0, y: 8 });
      gsap.set(panel.querySelector('[data-scene-ask]'), { opacity: 0, y: 6 });
      gsap.set(panel.querySelector('[data-scene-owned]'), { opacity: 0, y: 10, scale: 0.98 });
    }
  }

  function showFinal(id: PanelId) {
    const panel = panelMap[id];
    if (!panel) return;

    gsap.set(
      panel.querySelectorAll(
        '[data-scene-noise], [data-scene-rank-hint], [data-scene-noise-note], [data-scene-signal], [data-scene-rank-more], [data-scene-issue], [data-scene-driver], [data-scene-why], [data-scene-brief], [data-scene-brief-header], [data-scene-takeaway], [data-scene-ask], [data-scene-owned]',
      ),
      {
        clearProps: 'all',
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      },
    );

    if (id === 'layer') {
      sortNoiseRows(false);
      gsap.set(panel.querySelectorAll('[data-badge-equal]'), { opacity: 0 });
      gsap.set(panel.querySelectorAll('[data-badge-ranked]'), { opacity: 1 });
      const hint = panel.querySelector('[data-scene-rank-hint]');
      if (hint) hint.textContent = 'Ranked';
    }

    setLive(false);
  }

  function playLayer(): gsap.core.Timeline {
    const panel = panelMap.layer;
    const rows = panel.querySelectorAll('[data-scene-noise]');
    const hint = panel.querySelector<HTMLElement>('[data-scene-rank-hint]');
    const equals = panel.querySelectorAll('[data-badge-equal]');
    const ranked = panel.querySelectorAll('[data-badge-ranked]');
    const note = panel.querySelector('[data-scene-noise-note]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    if (hint) hint.textContent = 'Ranking…';

    // Hold ranked badges in scrambled order before FLIP sort (~0.75s beat to read).
    const sortAt = 2.0;

    tl.to(hint, { opacity: 1, duration: 0.25 }, 0)
      .to(rows, { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 }, 0.1)
      .to(equals, { opacity: 0, duration: 0.25, stagger: 0.06 }, 0.75)
      .to(ranked, { opacity: 1, duration: 0.3, stagger: 0.06 }, 0.9)
      .add(() => {
        sortNoiseRows(true);
      }, sortAt)
      .to(
        noiseOrderOriginal,
        {
          y: 0,
          duration: 0.65,
          stagger: 0.06,
          ease: 'power2.inOut',
        },
        sortAt,
      )
      .call(
        () => {
          if (hint) hint.textContent = 'Ranked';
        },
        undefined,
        sortAt + 0.85,
      )
      .to(note, { opacity: 1, y: 0, duration: 0.35 }, sortAt + 0.9);

    return tl;
  }

  function playRank(): gsap.core.Timeline {
    const panel = panelMap.rank;
    const signals = gsap.utils.toArray<HTMLElement>('[data-scene-signal]', panel);
    const primary = panel.querySelector<HTMLElement>('[data-scene-signal][data-primary="true"]');
    const secondary = signals.filter((s) => s !== primary);
    const more = panel.querySelector('[data-scene-rank-more]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    if (primary) {
      tl.to(primary, { opacity: 1, y: 0, scale: 1, duration: 0.45 }, 0).to(
        primary,
        {
          boxShadow: '0 2px 4px rgb(0 51 160 / 0.04), 0 12px 28px rgb(154 107 22 / 0.14)',
          y: -2,
          duration: 0.4,
        },
        0.35,
      );
    }

    if (secondary.length) {
      tl.to(secondary, { opacity: 0.72, y: 0, scale: 1, duration: 0.35, stagger: 0.1 }, 0.55);
    }

    tl.to(more, { opacity: 1, duration: 0.3 }, 0.95);

    return tl;
  }

  function playContext(): gsap.core.Timeline {
    const panel = panelMap.context;
    const issue = panel.querySelector('[data-scene-issue]');
    const drivers = panel.querySelectorAll('[data-scene-driver]');
    const why = panel.querySelector('[data-scene-why]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    tl.to(issue, { opacity: 1, y: 0, duration: 0.4 }, 0)
      .to(drivers, { opacity: 1, x: 0, duration: 0.35, stagger: 0.12 }, 0.35)
      .to(why, { opacity: 1, y: 0, duration: 0.4 }, 0.75);

    return tl;
  }

  function playCohi(): gsap.core.Timeline {
    const panel = panelMap.cohi;
    const brief = panel.querySelector('[data-scene-brief]');
    const header = panel.querySelector('[data-scene-brief-header]');
    const takeaway = panel.querySelector('[data-scene-takeaway]');
    const ask = panel.querySelector('[data-scene-ask]');
    const owned = panel.querySelector('[data-scene-owned]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    tl.to(brief, { opacity: 1, y: 0, duration: 0.4 }, 0)
      .to(header, { opacity: 1, duration: 0.3 }, 0.12)
      .to(takeaway, { opacity: 1, y: 0, duration: 0.35 }, 0.35)
      .to(ask, { opacity: 1, y: 0, duration: 0.3 }, 0.55)
      .to(owned, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0.75);

    return tl;
  }

  const playFns: Record<PanelId, () => gsap.core.Timeline> = {
    layer: playLayer,
    rank: playRank,
    context: playContext,
    cohi: playCohi,
  };

  function play(id: PanelId) {
    killActive();

    if (reduceMotion) {
      setActiveTab(id);
      showFinal(id);
      return;
    }

    resetPanel(id);
    setActiveTab(id);
    setLive(true);
    activeTl = playFns[id]();
  }

  function focusTab(id: PanelId) {
    const tab = tabs.find((t) => t.dataset.solutionTab === id);
    tab?.focus();
    play(id);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.solutionTab as PanelId;
      if (!id) return;
      play(id);
    });

    tab.addEventListener('keydown', (event) => {
      const currentIndex = PANEL_ORDER.indexOf(activeId);
      if (currentIndex < 0) return;

      let nextIndex = currentIndex;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % PANEL_ORDER.length;
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        nextIndex = (currentIndex - 1 + PANEL_ORDER.length) % PANEL_ORDER.length;
      } else if (event.key === 'Home') {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === 'End') {
        event.preventDefault();
        nextIndex = PANEL_ORDER.length - 1;
      } else {
        return;
      }

      focusTab(PANEL_ORDER[nextIndex]);
    });
  });

  setActiveTab('layer');
  if (reduceMotion) {
    showFinal('layer');
  } else {
    resetPanel('layer');
    setLive(false);
  }

  ScrollTrigger.create({
    trigger: flow,
    start: 'top 78%',
    once: true,
    onEnter: () => {
      if (hasAutoPlayed) return;
      hasAutoPlayed = true;
      play('layer');
    },
  });
}
