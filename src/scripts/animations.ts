import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (reduceMotion) {
    gsap.set('[data-hero-item], [data-reveal]', {
      clearProps: 'all',
      opacity: 1,
      y: 0,
    });
    initOutcomesLoop();
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

  initOutcomesLoop();
}

function initOutcomesLoop() {
  const loop = document.querySelector<HTMLElement>('[data-outcomes-loop]');
  if (!loop) return;

  const steps = gsap.utils.toArray<HTMLElement>('[data-outcomes-step]', loop);
  const progress = loop.querySelector<HTMLElement>('[data-outcomes-progress]');

  if (reduceMotion) {
    gsap.set(steps, { clearProps: 'all', opacity: 1, y: 0 });
    if (progress) {
      const desktop = window.matchMedia('(min-width: 1024px)').matches;
      gsap.set(progress, desktop ? { scaleX: 1, scaleY: 1 } : { scaleY: 1 });
    }
    return;
  }

  const desktop = window.matchMedia('(min-width: 1024px)').matches;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: loop,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });

  tl.from(steps, {
    y: 16,
    opacity: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: 'power2.out',
    clearProps: 'transform',
  });

  if (progress) {
    if (desktop) {
      tl.fromTo(
        progress,
        { scaleX: 0, scaleY: 1 },
        { scaleX: 1, scaleY: 1, duration: 0.75, ease: 'power2.inOut' },
        0.12,
      );
    } else {
      tl.fromTo(
        progress,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.75, ease: 'power2.inOut' },
        0.12,
      );
    }
  }
}
