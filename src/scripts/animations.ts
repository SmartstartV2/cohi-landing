import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (reduceMotion) {
    gsap.set('[data-hero-copy], [data-reveal]', {
      clearProps: 'all',
      opacity: 1,
      y: 0,
    });
    return;
  }

  gsap.from('[data-hero-copy]', {
    y: 16,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
  });

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
}
