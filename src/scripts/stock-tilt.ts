import { prefersReducedMotion } from './utils';

export function initStockTilt(root: ParentNode = document): void {
  if (prefersReducedMotion()) return;
  if (window.matchMedia('(hover: none)').matches) return;

  root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((card) => {
    const max = 8;
    card.style.transformStyle = 'preserve-3d';
    card.style.willChange = 'transform';

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * max * 2;
      const rotX = (0.5 - y) * max * 2;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`;
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    });
  });
}
