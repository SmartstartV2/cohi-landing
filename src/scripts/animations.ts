import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initAnimations() {
  if (reduceMotion) {
    gsap.set(
      '[data-hero-item], [data-hero-word], [data-reveal], [data-security-row], .security-icon',
      {
        clearProps: 'all',
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'none',
      },
    );
    initOutcomesLoop();
    return;
  }

  const heroItems = gsap.utils.toArray<HTMLElement>('[data-hero-item]');
  const heroWords = gsap.utils.toArray<HTMLElement>('[data-hero-word]');
  const signal = document.querySelector<HTMLElement>('[data-hero-signal]');
  const notNoise = document.querySelector<HTMLElement>('[data-hero-not-noise]');

  if (heroItems.length || heroWords.length) {
    const tl = gsap.timeline();
    const [logo, ...rest] = heroItems;

    if (signal) {
      gsap.set(signal, { opacity: 0, y: 16 });
    }
    if (notNoise) {
      gsap.set(notNoise, { opacity: 0, y: 16, filter: 'blur(8px)' });
    }

    if (logo) {
      tl.from(logo, {
        y: 14,
        opacity: 0,
        duration: 0.55,
        ease: 'power2.out',
        clearProps: 'transform',
      });
    }

    if (signal) {
      tl.to(
        signal,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'transform',
        },
        logo ? '-=0.15' : 0,
      );
    }

    if (notNoise) {
      tl.to(
        notNoise,
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          clearProps: 'transform',
        },
        '-=0.35',
      ).to(
        notNoise,
        {
          filter: 'blur(0px)',
          duration: 0.7,
          ease: 'power2.out',
        },
        '-=0.25',
      );
    }

    if (rest.length) {
      tl.from(
        rest,
        {
          y: 14,
          opacity: 0,
          duration: 0.55,
          stagger: 0.09,
          ease: 'power2.out',
          clearProps: 'transform',
        },
        '-=0.35',
      );
    }

    initHeroHover(signal, notNoise);
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
  initSecurityPanel();
}

function initHeroHover(
  signal: HTMLElement | null,
  notNoise: HTMLElement | null,
) {
  if (!signal && !notNoise) return;

  const INK = '#0a1628';
  const GLOW_A = '0 0 6px rgba(0, 51, 160, 0.12), 0 0 14px rgba(0, 51, 160, 0.06)';
  const GLOW_B = '0 0 10px rgba(0, 51, 160, 0.22), 0 0 22px rgba(0, 51, 160, 0.1)';
  const GLOW_OFF = '0 0 0 rgba(0, 51, 160, 0), 0 0 0 rgba(0, 51, 160, 0)';
  let glowTween: gsap.core.Tween | null = null;
  let gradientTween: gsap.core.Tween | null = null;

  const blurNoise = (blur: boolean) => {
    if (!notNoise) return;
    gsap.to(notNoise, {
      filter: blur ? 'blur(6px)' : 'blur(0px)',
      duration: blur ? 0.35 : 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  };

  const startGlowLoop = () => {
    if (!signal) return;
    glowTween?.kill();
    gradientTween?.kill();

    signal.classList.add('is-gradient');
    gsap.set(signal, {
      textShadow: GLOW_A,
      backgroundPosition: '0% 50%',
    });

    glowTween = gsap.to(signal, {
      textShadow: GLOW_B,
      duration: 1.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });

    gradientTween = gsap.to(signal, {
      backgroundPosition: '100% 50%',
      duration: 2.4,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  };

  const stopGlowLoop = () => {
    if (!signal) return;
    glowTween?.kill();
    gradientTween?.kill();
    glowTween = null;
    gradientTween = null;

    signal.classList.remove('is-gradient');
    gsap.to(signal, {
      textShadow: GLOW_OFF,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete: () => {
        gsap.set(signal, {
          clearProps: 'backgroundPosition,-webkit-text-fill-color',
          color: INK,
        });
      },
    });
  };

  if (signal) {
    signal.style.cursor = 'default';
    signal.addEventListener('pointerenter', () => {
      startGlowLoop();
      blurNoise(true);
    });
    signal.addEventListener('pointerleave', () => {
      stopGlowLoop();
      blurNoise(false);
    });
  }

  if (notNoise) {
    notNoise.style.cursor = 'default';
    notNoise.addEventListener('pointerenter', () => blurNoise(true));
    notNoise.addEventListener('pointerleave', () => blurNoise(false));
  }
}

function initOutcomesLoop() {
  const loop = document.querySelector<HTMLElement>('[data-outcomes-loop]');
  if (!loop) return;

  const steps = gsap.utils.toArray<HTMLElement>('[data-outcomes-step]', loop);

  if (reduceMotion) {
    gsap.set(steps, { clearProps: 'all', opacity: 1, y: 0 });
    return;
  }

  gsap.from(steps, {
    y: 16,
    opacity: 0,
    duration: 0.5,
    stagger: 0.12,
    ease: 'power2.out',
    clearProps: 'transform',
    scrollTrigger: {
      trigger: loop,
      start: 'top 80%',
      toggleActions: 'play none none none',
    },
  });
}

function initSecurityPanel() {
  const panel = document.querySelector<HTMLElement>('[data-security-panel]');
  if (!panel) return;

  const hero = panel.querySelector<HTMLElement>('[data-security-hero]');
  const pillars = gsap.utils.toArray<HTMLElement>(
    '[data-security-row]:not([data-security-hero])',
    panel,
  );
  const icons = gsap.utils.toArray<HTMLElement>('.security-icon', panel);

  if (reduceMotion) {
    gsap.set([hero, ...pillars, ...icons].filter(Boolean), {
      clearProps: 'all',
      opacity: 1,
      y: 0,
      scale: 1,
    });
    return;
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: panel,
      start: 'top 82%',
      toggleActions: 'play none none none',
    },
  });

  if (hero) {
    tl.from(hero, {
      y: 20,
      opacity: 0,
      duration: 0.55,
      ease: 'power2.out',
      clearProps: 'transform',
    });
  }

  if (pillars.length) {
    tl.from(
      pillars,
      {
        y: 16,
        opacity: 0,
        duration: 0.45,
        stagger: 0.1,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      hero ? 0.2 : 0,
    );
  }

  if (icons.length) {
    tl.from(
      icons,
      {
        y: 8,
        opacity: 0,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      0.15,
    );
  }
}
