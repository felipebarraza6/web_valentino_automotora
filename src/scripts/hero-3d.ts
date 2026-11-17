import { prefersReducedMotion, isWeakMobile } from './utils';

export async function initHero3D(canvas: HTMLCanvasElement): Promise<void> {
  if (prefersReducedMotion() || isWeakMobile()) {
    canvas.style.display = 'none';
    return;
  }

  const THREE = await import('three');
  const { Scene, PerspectiveCamera, WebGLRenderer, Group, Mesh, MeshStandardMaterial, AmbientLight, DirectionalLight, Color, BoxGeometry, CylinderGeometry } =
    THREE;

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.55, 4.2);

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);

  const ambient = new AmbientLight(0xffffff, 0.55);
  const key = new DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 5);
  const rim = new DirectionalLight(0xc41010, 0.55);
  rim.position.set(-3, 1, -2);
  scene.add(ambient, key, rim);

  const chrome = new MeshStandardMaterial({
    color: new Color('#c8c8c8'),
    metalness: 0.95,
    roughness: 0.28,
  });
  const dark = new MeshStandardMaterial({
    color: new Color('#1a1a1a'),
    metalness: 0.7,
    roughness: 0.4,
  });
  const glass = new MeshStandardMaterial({
    color: new Color('#6a7a88'),
    metalness: 0.2,
    roughness: 0.15,
    transparent: true,
    opacity: 0.65,
  });

  const car = new Group();

  // Body
  const body = new Mesh(new BoxGeometry(2.4, 0.45, 1.05), chrome);
  body.position.y = 0.35;
  car.add(body);

  // Cabin
  const cabin = new Mesh(new BoxGeometry(1.15, 0.42, 0.95), glass);
  cabin.position.set(-0.15, 0.72, 0);
  car.add(cabin);

  // Hood slope suggestion
  const hood = new Mesh(new BoxGeometry(0.7, 0.12, 0.95), chrome);
  hood.position.set(0.75, 0.52, 0);
  hood.rotation.z = -0.18;
  car.add(hood);

  // Trunk
  const trunk = new Mesh(new BoxGeometry(0.55, 0.18, 0.95), chrome);
  trunk.position.set(-0.95, 0.52, 0);
  car.add(trunk);

  // Wheels
  const wheelGeo = new CylinderGeometry(0.28, 0.28, 0.18, 18);
  const wheelPositions: Array<[number, number, number]> = [
    [0.75, 0.28, 0.55],
    [0.75, 0.28, -0.55],
    [-0.75, 0.28, 0.55],
    [-0.75, 0.28, -0.55],
  ];
  wheelPositions.forEach(([x, y, z]) => {
    const wheel = new Mesh(wheelGeo, dark);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, y, z);
    car.add(wheel);
  });

  car.rotation.y = -0.55;
  scene.add(car);

  let targetX = 0;
  let targetY = 0;
  let raf = 0;

  const resize = () => {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || window.innerWidth;
    const h = parent?.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetX = nx * 0.25;
    targetY = ny * 0.12;
  };

  const tick = () => {
    car.rotation.y += (-0.55 + targetX - car.rotation.y) * 0.06;
    car.rotation.x += (targetY - car.rotation.x) * 0.06;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  tick();

  // Cleanup hook for SPA-less static pages on unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    renderer.dispose();
  });
}
