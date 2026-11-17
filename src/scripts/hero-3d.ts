import { prefersReducedMotion, isWeakMobile } from './utils';

/**
 * Isometric Dongfeng Joyear X5–inspired SUV built from primitives.
 * Orthographic camera + layered body/glass/chrome for a stock-showcase look.
 */
export async function initHero3D(canvas: HTMLCanvasElement): Promise<void> {
  if (prefersReducedMotion() || isWeakMobile()) {
    canvas.style.display = 'none';
    return;
  }

  const THREE = await import('three');
  const {
    Scene,
    OrthographicCamera,
    WebGLRenderer,
    Group,
    Mesh,
    MeshStandardMaterial,
    AmbientLight,
    DirectionalLight,
    Color,
    BoxGeometry,
    CylinderGeometry,
    SphereGeometry,
  } = THREE;

  const scene = new Scene();

  const frustum = 2.35;
  const camera = new OrthographicCamera(-frustum, frustum, frustum, -frustum, 0.1, 40);
  // Classic isometric: ~35.264° elevation, 45° azimuth
  const isoDist = 8;
  camera.position.set(isoDist * 0.7, isoDist * 0.82, isoDist * 0.7);
  camera.lookAt(0, 0.35, 0);

  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000, 0);

  const ambient = new AmbientLight(0xffffff, 0.62);
  const key = new DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 7, 3);
  const fill = new DirectionalLight(0xc8c8c8, 0.35);
  fill.position.set(-3, 2, -2);
  const rim = new DirectionalLight(0xc41010, 0.45);
  rim.position.set(-2, 1.5, 4);
  scene.add(ambient, key, fill, rim);

  const silver = new MeshStandardMaterial({
    color: new Color('#d4d4d4'),
    metalness: 0.92,
    roughness: 0.22,
  });
  const bodyPaint = new MeshStandardMaterial({
    color: new Color('#e8e8e8'),
    metalness: 0.55,
    roughness: 0.32,
  });
  const dark = new MeshStandardMaterial({
    color: new Color('#141414'),
    metalness: 0.75,
    roughness: 0.38,
  });
  const rubber = new MeshStandardMaterial({
    color: new Color('#1c1c1c'),
    metalness: 0.15,
    roughness: 0.85,
  });
  const glass = new MeshStandardMaterial({
    color: new Color('#5a6b78'),
    metalness: 0.25,
    roughness: 0.12,
    transparent: true,
    opacity: 0.72,
  });
  const chrome = new MeshStandardMaterial({
    color: new Color('#f0f0f0'),
    metalness: 1,
    roughness: 0.12,
  });
  const redLens = new MeshStandardMaterial({
    color: new Color('#c41010'),
    metalness: 0.4,
    roughness: 0.25,
    emissive: new Color('#6e0000'),
    emissiveIntensity: 0.35,
  });
  const headLamp = new MeshStandardMaterial({
    color: new Color('#fff6d8'),
    metalness: 0.3,
    roughness: 0.2,
    emissive: new Color('#ffe9a8'),
    emissiveIntensity: 0.45,
  });

  const car = new Group();

  // Lower body / rocker — SUV proportions (taller, shorter than sedan)
  const rocker = new Mesh(new BoxGeometry(2.55, 0.28, 1.18), dark);
  rocker.position.set(0, 0.22, 0);
  car.add(rocker);

  // Main body slab
  const body = new Mesh(new BoxGeometry(2.45, 0.52, 1.12), bodyPaint);
  body.position.set(0, 0.52, 0);
  car.add(body);

  // Front bumper
  const frontBumper = new Mesh(new BoxGeometry(0.38, 0.22, 1.08), dark);
  frontBumper.position.set(1.28, 0.28, 0);
  car.add(frontBumper);

  // Rear bumper
  const rearBumper = new Mesh(new BoxGeometry(0.36, 0.2, 1.08), dark);
  rearBumper.position.set(-1.26, 0.28, 0);
  car.add(rearBumper);

  // Hood with slight slope
  const hood = new Mesh(new BoxGeometry(0.72, 0.1, 1.02), bodyPaint);
  hood.position.set(0.82, 0.8, 0);
  hood.rotation.z = -0.12;
  car.add(hood);

  // Roof / cabin — boxy Joyear-like greenhouse
  const cabin = new Mesh(new BoxGeometry(1.28, 0.48, 1.0), bodyPaint);
  cabin.position.set(-0.12, 1.02, 0);
  car.add(cabin);

  // Glass panes
  const windshield = new Mesh(new BoxGeometry(0.08, 0.38, 0.92), glass);
  windshield.position.set(0.52, 1.0, 0);
  windshield.rotation.z = -0.35;
  car.add(windshield);

  const rearGlass = new Mesh(new BoxGeometry(0.08, 0.36, 0.92), glass);
  rearGlass.position.set(-0.72, 1.0, 0);
  rearGlass.rotation.z = 0.28;
  car.add(rearGlass);

  const sideGlassL = new Mesh(new BoxGeometry(0.95, 0.32, 0.06), glass);
  sideGlassL.position.set(-0.08, 1.02, 0.48);
  car.add(sideGlassL);
  const sideGlassR = sideGlassL.clone();
  sideGlassR.position.z = -0.48;
  car.add(sideGlassR);

  // Roof rails (chrome)
  const railGeo = new BoxGeometry(1.15, 0.04, 0.05);
  const railL = new Mesh(railGeo, chrome);
  railL.position.set(-0.1, 1.28, 0.38);
  car.add(railL);
  const railR = railL.clone();
  railR.position.z = -0.38;
  car.add(railR);

  // Grille / chrome face
  const grille = new Mesh(new BoxGeometry(0.08, 0.18, 0.72), chrome);
  grille.position.set(1.42, 0.48, 0);
  car.add(grille);

  // Headlights
  const lampGeo = new BoxGeometry(0.1, 0.12, 0.22);
  const hlL = new Mesh(lampGeo, headLamp);
  hlL.position.set(1.4, 0.55, 0.42);
  car.add(hlL);
  const hlR = hlL.clone();
  hlR.position.z = -0.42;
  car.add(hlR);

  // Taillights (brand red)
  const tlGeo = new BoxGeometry(0.08, 0.14, 0.28);
  const tlL = new Mesh(tlGeo, redLens);
  tlL.position.set(-1.4, 0.58, 0.4);
  car.add(tlL);
  const tlR = tlL.clone();
  tlR.position.z = -0.4;
  car.add(tlR);

  // Side mirrors
  const mirrorGeo = new BoxGeometry(0.14, 0.08, 0.18);
  const mL = new Mesh(mirrorGeo, silver);
  mL.position.set(0.42, 0.92, 0.62);
  car.add(mL);
  const mR = mL.clone();
  mR.position.z = -0.62;
  car.add(mR);

  // Door crease / chrome trim line
  const trim = new Mesh(new BoxGeometry(1.6, 0.03, 1.14), chrome);
  trim.position.set(0.05, 0.62, 0);
  car.add(trim);

  // Wheels with rim detail
  const makeWheel = (x: number, z: number) => {
    const wheel = new Group();
    const tire = new Mesh(new CylinderGeometry(0.3, 0.3, 0.2, 20), rubber);
    tire.rotation.x = Math.PI / 2;
    wheel.add(tire);
    const rim = new Mesh(new CylinderGeometry(0.18, 0.18, 0.22, 16), chrome);
    rim.rotation.x = Math.PI / 2;
    wheel.add(rim);
    const hub = new Mesh(new SphereGeometry(0.07, 10, 10), silver);
    hub.scale.set(1, 1, 0.45);
    wheel.add(hub);
    // Simple spokes
    for (let i = 0; i < 5; i++) {
      const spoke = new Mesh(new BoxGeometry(0.04, 0.28, 0.03), silver);
      spoke.rotation.z = (i / 5) * Math.PI;
      spoke.rotation.x = Math.PI / 2;
      wheel.add(spoke);
    }
    wheel.position.set(x, 0.3, z);
    return wheel;
  };

  car.add(makeWheel(0.78, 0.58));
  car.add(makeWheel(0.78, -0.58));
  car.add(makeWheel(-0.78, 0.58));
  car.add(makeWheel(-0.78, -0.58));

  // Soft ground disc for isometric presence
  const ground = new Mesh(
    new CylinderGeometry(1.55, 1.55, 0.04, 40),
    new MeshStandardMaterial({
      color: new Color('#2a0000'),
      metalness: 0.2,
      roughness: 0.9,
      transparent: true,
      opacity: 0.45,
    }),
  );
  ground.position.y = 0.02;
  car.add(ground);

  car.position.set(0.85, -0.15, 0);
  car.scale.setScalar(0.92);
  scene.add(car);

  let targetYaw = 0;
  let targetPitch = 0;
  let raf = 0;
  const baseYaw = 0;
  const basePitch = 0;

  const resize = () => {
    const parent = canvas.parentElement;
    const w = parent?.clientWidth || window.innerWidth;
    const h = parent?.clientHeight || window.innerHeight;
    const aspect = w / h;
    camera.left = -frustum * aspect;
    camera.right = frustum * aspect;
    camera.top = frustum;
    camera.bottom = -frustum;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    targetYaw = nx * 0.18;
    targetPitch = ny * 0.08;
  };

  let t = 0;
  const tick = () => {
    t += 0.008;
    const idle = Math.sin(t) * 0.04;
    car.rotation.y += (baseYaw + targetYaw + idle - car.rotation.y) * 0.05;
    car.rotation.x += (basePitch + targetPitch - car.rotation.x) * 0.05;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onMove, { passive: true });
  tick();

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onMove);
    renderer.dispose();
  });
}
