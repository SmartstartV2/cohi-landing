import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type PanelId = 'split' | 'late' | 'urgency' | 'meetings';

const PANEL_ORDER: PanelId[] = ['split', 'late', 'urgency', 'meetings'];

const STAGE_LABELS: Record<PanelId, string> = {
  split: 'Everything looks important',
  late: 'The review is already behind',
  urgency: 'Nothing says Critical first',
  meetings: 'Debate, not a decision',
};

const FOOTER_COPY: Record<PanelId, string> = {
  split: 'Without a ranked signal, leadership stays reactive',
  late: 'By the time it reaches the room, the window has narrowed',
  urgency: 'Visible risk without Immediate Action Required keeps climbing',
  meetings: 'More discussion does not create a clearer morning signal',
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initProblemSimulation() {
  const root = document.querySelector<HTMLElement>('[data-problem]');
  if (!root) return;

  const stage = root.querySelector<HTMLElement>('[data-problem-stage]');
  const tabs = gsap.utils.toArray<HTMLButtonElement>('[data-problem-tab]', root);
  const panels = gsap.utils.toArray<HTMLElement>('[data-problem-panel]', root);
  const stageLabel = root.querySelector<HTMLElement>('[data-problem-stage-label]');
  const footer = root.querySelector<HTMLElement>('[data-problem-footer]');
  const liveDot = root.querySelector<HTMLElement>('.problem-live-dot');
  const liveText = root.querySelector<HTMLElement>('[data-problem-live-text]');

  if (!stage || !tabs.length || !panels.length) return;

  let activeId: PanelId = 'split';
  let activeTl: gsap.core.Timeline | null = null;
  let hasAutoPlayed = false;

  const panelMap = Object.fromEntries(
    panels.map((panel) => [panel.dataset.problemPanel as PanelId, panel]),
  ) as Record<PanelId, HTMLElement>;

  function setLive(playing: boolean) {
    if (liveDot) liveDot.dataset.playing = playing ? 'true' : 'false';
    if (liveText) liveText.textContent = playing ? 'Live' : 'Ready';
  }

  function setActiveTab(id: PanelId) {
    tabs.forEach((tab) => {
      const selected = tab.dataset.problemTab === id;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.dataset.problemPanel !== id;
    });

    if (stageLabel) stageLabel.textContent = STAGE_LABELS[id];
    if (footer) footer.textContent = FOOTER_COPY[id];
    activeId = id;
  }

  function killActive() {
    if (activeTl) {
      activeTl.kill();
      activeTl = null;
    }
    gsap.killTweensOf(stage.querySelectorAll('*'));
  }

  function resetPanel(id: PanelId) {
    const panel = panelMap[id];
    if (!panel) return;

    if (id === 'split') {
      gsap.set(panel.querySelectorAll('[data-scene-signal]'), { opacity: 0, y: 10 });
      gsap.set(panel.querySelector('[data-scene-owner-tag]'), { opacity: 0 });
      gsap.set(panel.querySelector('[data-scene-priority]'), { opacity: 0, y: 8 });
      gsap.set(panel.querySelector('[data-scene-priority-note]'), { opacity: 0 });
    }

    if (id === 'late') {
      gsap.set(panel.querySelectorAll('[data-scene-timeline-step]'), { opacity: 0, x: -10 });
      gsap.set(panel.querySelector('[data-scene-late-result]'), { opacity: 0, y: 10 });
    }

    if (id === 'urgency') {
      gsap.set(panel.querySelectorAll('[data-scene-urgency-card]'), {
        opacity: 0,
        y: 12,
        scale: 0.98,
      });
      gsap.set(panel.querySelector('[data-scene-urgency-note]'), { opacity: 0, y: 8 });
    }

    if (id === 'meetings') {
      gsap.set(panel.querySelectorAll('[data-scene-debate]'), { opacity: 0, y: 10 });
      gsap.set(panel.querySelector('[data-scene-decision]'), { opacity: 0, y: 10 });
    }
  }

  function showFinal(id: PanelId) {
    const panel = panelMap[id];
    if (!panel) return;
    gsap.set(
      panel.querySelectorAll(
        '[data-scene-signal], [data-scene-owner-tag], [data-scene-priority], [data-scene-priority-note], [data-scene-timeline-step], [data-scene-late-result], [data-scene-urgency-card], [data-scene-urgency-note], [data-scene-debate], [data-scene-decision]',
      ),
      {
        clearProps: 'all',
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      },
    );
    setLive(false);
  }

  function playSplit(): gsap.core.Timeline {
    const panel = panelMap.split;
    const signals = panel.querySelectorAll('[data-scene-signal]');
    const ownerTag = panel.querySelector('[data-scene-owner-tag]');
    const priority = panel.querySelector('[data-scene-priority]');
    const note = panel.querySelector('[data-scene-priority-note]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    tl.to(ownerTag, { opacity: 1, duration: 0.25 }, 0)
      .to(signals, { opacity: 1, y: 0, duration: 0.35, stagger: 0.1 }, 0.1)
      .to(priority, { opacity: 1, y: 0, duration: 0.4 }, 0.55)
      .to(note, { opacity: 1, duration: 0.3 }, 0.85);

    tl.to(
      signals,
      {
        opacity: 0.72,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        stagger: 0.05,
      },
      1.0,
    );

    return tl;
  }

  function playLate(): gsap.core.Timeline {
    const panel = panelMap.late;
    const steps = panel.querySelectorAll('[data-scene-timeline-step]');
    const result = panel.querySelector('[data-scene-late-result]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    tl.to(steps, { opacity: 1, x: 0, duration: 0.35, stagger: 0.14 }, 0).to(
      result,
      { opacity: 1, y: 0, duration: 0.45 },
      0.7,
    );

    const monday = steps[steps.length - 1];
    if (monday) {
      tl.to(
        monday,
        {
          borderColor: 'var(--color-line-strong)',
          backgroundColor: 'var(--color-canvas)',
          duration: 0.35,
        },
        0.85,
      );
    }

    return tl;
  }

  function playUrgency(): gsap.core.Timeline {
    const panel = panelMap.urgency;
    const cards = panel.querySelectorAll('[data-scene-urgency-card]');
    const note = panel.querySelector('[data-scene-urgency-note]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    tl.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.12 }, 0).to(
      note,
      { opacity: 1, y: 0, duration: 0.4 },
      0.55,
    );

    // Equal emphasis — nothing wins Critical
    tl.to(cards[0], { borderColor: 'var(--color-line-strong)', duration: 0.25 }, 0.85)
      .to(cards[1], { borderColor: 'var(--color-line-strong)', duration: 0.25 }, 1.0)
      .to(cards[2], { borderColor: 'var(--color-line-strong)', duration: 0.25 }, 1.15);

    return tl;
  }

  function playMeetings(): gsap.core.Timeline {
    const panel = panelMap.meetings;
    const debates = panel.querySelectorAll('[data-scene-debate]');
    const decision = panel.querySelector('[data-scene-decision]');

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => setLive(false),
    });

    tl.to(debates, { opacity: 1, y: 0, duration: 0.35, stagger: 0.14 }, 0).to(
      decision,
      { opacity: 1, y: 0, duration: 0.45 },
      0.65,
    );

    tl.to(debates[0], { borderColor: 'var(--color-line-strong)', duration: 0.25 }, 0.9)
      .to(debates[1], { borderColor: 'var(--color-line-strong)', duration: 0.25 }, 1.05)
      .to(debates[2], { borderColor: 'var(--color-line-strong)', duration: 0.25 }, 1.2);

    return tl;
  }

  const playFns: Record<PanelId, () => gsap.core.Timeline> = {
    split: playSplit,
    late: playLate,
    urgency: playUrgency,
    meetings: playMeetings,
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
    const tab = tabs.find((t) => t.dataset.problemTab === id);
    tab?.focus();
    play(id);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.dataset.problemTab as PanelId;
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

  setActiveTab('split');
  if (reduceMotion) {
    showFinal('split');
  } else {
    resetPanel('split');
    setLive(false);
  }

  ScrollTrigger.create({
    trigger: stage,
    start: 'top 78%',
    once: true,
    onEnter: () => {
      if (hasAutoPlayed) return;
      hasAutoPlayed = true;
      play('split');
    },
  });
}
