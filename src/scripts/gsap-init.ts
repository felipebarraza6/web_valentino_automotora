import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './utils';

gsap.registerPlugin(ScrollTrigger);

export function initScrollReveals(): void {
  if (prefersReducedMotion()) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 40 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      },
    );
  });

  // Speed-line accent on section entries
  document.querySelectorAll<HTMLElement>('[data-speed-enter]').forEach((section) => {
    const line = document.createElement('div');
    line.setAttribute('aria-hidden', 'true');
    Object.assign(line.style, {
      position: 'absolute',
      top: '12%',
      right: '0',
      width: '35%',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(196,16,16,0.8))',
      opacity: '0',
      pointerEvents: 'none',
      zIndex: '2',
    } as CSSStyleDeclaration);
    section.style.position = section.style.position || 'relative';
    section.appendChild(line);

    gsap.fromTo(
      line,
      { x: 80, opacity: 0 },
      {
        x: -40,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      },
    );
  });
}
