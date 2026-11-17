import gsap from 'gsap';
import { prefersReducedMotion } from './utils';

export function runWipe(onMid?: () => void): Promise<void> {
  const wipe = document.getElementById('page-wipe');
  const panel = wipe?.querySelector('.page-wipe__panel') as HTMLElement | null;
  const lines = wipe?.querySelectorAll('.page-wipe__lines span');

  if (!wipe || !panel || prefersReducedMotion()) {
    onMid?.();
    return Promise.resolve();
  }

  wipe.classList.add('is-active');
  gsap.set(panel, { xPercent: -105 });
  gsap.set(lines, { x: 0, opacity: 0.7 });

  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        wipe.classList.remove('is-active');
        resolve();
      },
    });

    tl.to(panel, { xPercent: 0, duration: 0.38, ease: 'power3.in' })
      .to(
        lines,
        {
          x: () => -window.innerWidth * 0.9,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
        },
        '-=0.15',
      )
      .add(() => onMid?.())
      .to(panel, { xPercent: 105, duration: 0.42, ease: 'power3.out' });
  });
}

function samePath(a: string, b: string): boolean {
  const norm = (p: string) => p.replace(/\/+$/, '') || '/';
  return norm(a) === norm(b);
}

export function initPageTransitions(): void {
  document.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
    if (!target) return;
    if (target.hasAttribute('data-nav-section')) return;

    const href = target.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (target.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey) return;

    const url = new URL(target.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    // Same-page anchors: never wipe / never remount content
    if (url.hash && samePath(url.pathname, window.location.pathname)) {
      const id = url.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        event.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', url.hash);
      }
      return;
    }

    event.preventDefault();
    runWipe(() => {
      window.location.href = target.href;
    });
  });
}
