import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const problemPriorities = [
  'Pipeline health?',
  'Fallout risk?',
  'Cost per loan?',
  'Margin pressure?',
  '—',
];

function initProblemStage() {
  const stage = document.querySelector<HTMLElement>('[data-problem-stage]');
  if (!stage) return;

  if (reduceMotion) {
    gsap.set(
      '[data-problem-chip], [data-problem-fragment], [data-problem-pain], [data-problem-scan], [data-problem-focus]',
      { clearProps: 'all', opacity: 1, x: 0, y: 0 },
    );
    return;
  }

  const chips = gsap.utils.toArray<HTMLElement>('[data-problem-chip]', stage);
  const fragments = gsap.utils.toArray<HTMLElement>('[data-problem-fragment]', stage);
  const pains = gsap.utils.toArray<HTMLElement>('[data-problem-pain]', stage);
  const focus = stage.querySelector<HTMLElement>('[data-problem-focus]');
  const scan = stage.querySelector<HTMLElement>('[data-problem-scan]');
  const priority = stage.querySelector<HTMLElement>('[data-problem-priority]');

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top 78%',
      toggleActions: 'play none none none',
    },
  });

  tl.from(chips, {
    y: 10,
    opacity: 0,
    duration: 0.45,
    stagger: 0.05,
    ease: 'power2.out',
    clearProps: 'transform',
  })
    .from(
      fragments,
      {
        opacity: 0,
        duration: 0.5,
        stagger: 0.07,
        ease: 'power2.out',
      },
      '-=0.2',
    )
    .from(
      focus,
      {
        y: 12,
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      '-=0.2',
    )
    .from(
      pains,
      {
        y: 12,
        opacity: 0,
        duration: 0.45,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      '-=0.15',
    );

  if (scan) {
    gsap.set(scan, { xPercent: -120, opacity: 0.85 });
    gsap.to(scan, {
      xPercent: 320,
      duration: 2.4,
      ease: 'none',
      repeat: -1,
      repeatDelay: 0.6,
      scrollTrigger: {
        trigger: stage,
        start: 'top 78%',
        toggleActions: 'play pause resume pause',
      },
    });
  }

  if (priority) {
    let index = 0;
    const cycle = () => {
      index = (index + 1) % problemPriorities.length;
      gsap.to(priority, {
        opacity: 0,
        duration: 0.18,
        onComplete: () => {
          priority.textContent = problemPriorities[index];
          gsap.to(priority, { opacity: 1, duration: 0.22 });
        },
      });
    };

    ScrollTrigger.create({
      trigger: stage,
      start: 'top 78%',
      once: true,
      onEnter: () => {
        gsap.delayedCall(1.2, () => {
          cycle();
          gsap.delayedCall(1.6, cycle).repeat(-1);
        });
      },
    });
  }
}

export function initAnimations() {
  if (reduceMotion) {
    gsap.set('[data-hero-item], [data-hero-peek], [data-reveal]', {
      clearProps: 'all',
      opacity: 1,
      y: 0,
    });
    initProblemStage();
    return;
  }

  const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]');
  if (heroItems.length) {
    gsap.from(heroItems, {
      y: 14,
      opacity: 0,
      duration: 0.6,
      stagger: 0.09,
      ease: 'power2.out',
      clearProps: 'transform',
    });
  }

  const peek = document.querySelector<HTMLElement>('[data-hero-peek]');
  if (peek) {
    gsap.from(peek, {
      y: 22,
      opacity: 0,
      duration: 0.75,
      delay: 0.35,
      ease: 'power2.out',
      clearProps: 'transform',
    });
  }

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 18,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });
  });

  initProblemStage();
}
