# Valentino Dolusan Automotriz — Diseño aprobado

**Fecha:** 2026-11-17  
**Estado:** Aprobado para implementación  
**Producto:** Prototipo público estático de automotora de autos usados (Chile)

## Objetivo

Sitio vitrina profesional para **Valentino Dolusan Automotriz** con stock demo, asistente IA simulado y despliegue en GitHub Pages. Sin e-commerce, login, backend ni WhatsApp real.

## Stack

| Capa | Elección |
|------|----------|
| Framework | Astro (sitio estático) |
| Hosting | GitHub Pages (`/web_valentino_automotora/`) |
| Motion | GSAP + ScrollTrigger |
| 3D hero | Three.js (lazy-load; respeta `prefers-reduced-motion`; se desactiva en móviles débiles) |
| Estilo | Glassmorphism; cromo/plata + rojo profundo + negro (logo) |
| Chat IA | Simulación local (keywords / intent) sobre inventario JSON |

## Identidad visual

- **Marca dominante** en el hero (logo Valentino Dolusan).
- Paleta: negro `#000`, cromo `#E8E8E8`–`#808080`, rojo `#8B0000`–`#B30000`.
- Tipografías expresivas (sin Inter/Roboto/Arial/system por defecto).
- Hero full-bleed con atmósfera fotográfica real; sin cards, badges ni overlays en el media.
- Cards solo para ítems interactivos de stock.
- Evitar temas púrpura, cream+terracotta y look “periódico”.

## Estructura de páginas

### `/` — Landing (orden fijo)

1. **Hero** — logo dominante, un headline, una línea de apoyo, CTAs: “Ver stock” / “Hablar con el asistente”. Plano visual edge-to-edge.
2. **Stock destacado** — glass cards con fotos reales convertidas.
3. **Por qué Valentino** — 3 beneficios (copy placeholder profesional).
4. **Asistente IA** — presentación del agente + chips rápidos.
5. **Contacto** — dirección/teléfono/horarios ficticios + botón WhatsApp falso.
6. **Footer**

### `/auto/[slug]` — Ficha de cada auto demo

### Global

- Widget flotante de chat glass en todas las páginas.

## Asistente IA (solo simulación)

- Respuestas locales sobre stock y FAQ (horarios, ubicación, financiamiento, garantía).
- Indicador de escritura, chips de sugerencia, enlaces a fichas.
- Sin API keys ni LLM real.

## Motion / impacto

1. Wipe/slide “automóvil” + speed lines en transiciones de sección/página.
2. Revelados ScrollTrigger (GSAP).
3. Brillo de borde cromado en hover de glass.
4. Silueta 3D en hero con rotación sutil al mouse.
5. Tilt 3D sutil en cards de stock.
6. Apertura del chat con el mismo wipe.

## Assets

- Logo oficial en `public/images/brand/`.
- Fotos de autos desde carpeta local; HEIC→WebP, comprimidas en `public/images/cars/`.
- Metadatos demo inventados (marca, modelo, año, km, precio CLP, transmisión) acordes a las fotos.

## Deploy

- Repo GitHub: `web_valentino_automotora`
- Base Astro para project pages: `/web_valentino_automotora/`
- Workflow Actions: build → publish `dist` a Pages
- Copy del sitio: español chileno, tono profesional

## Fuera de alcance

- Carrito, pagos, CMS, autenticación, WhatsApp Business API, LLM en producción.
