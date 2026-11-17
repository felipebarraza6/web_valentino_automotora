# Valentino Dolusan Automotriz

Prototipo público estático (Astro) para la automotora **Valentino Dolusan**: stock demo, ficha por vehículo, motion (GSAP) y asistente IA simulado en el navegador.

## Desarrollo local

```bash
cd /home/felipe-barraza/projects/web_automotora
npm install
npm run dev
```

Abre la URL que indique Astro (por defecto `http://localhost:4321/web_valentino_automotora/`).

## Build

```bash
npm run build
npm run preview
```

La salida queda en `dist/`.

## GitHub Pages

- Repo: `web_valentino_automotora`
- Base configurada: `/web_valentino_automotora`
- Workflow: `.github/workflows/deploy.yml` (build + deploy de `dist`)

Si Pages no quedó habilitado automáticamente:

1. Settings → Pages → Source: **GitHub Actions**
2. Vuelve a disparar el workflow o haz push a `main`/`master`

URL esperada: `https://felipebarraza6.github.io/web_valentino_automotora/`

## Notas

- El chat es **simulación local** (keywords + inventario JSON), sin API de LLM.
- WhatsApp del sitio es un enlace demo (`wa.me`), sin API Business.
- Fotos convertidas a WebP en `public/images/cars/` (HEIC/JPG de origen).
