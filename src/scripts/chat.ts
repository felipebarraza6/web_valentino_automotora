import gsap from 'gsap';
import inventory from '../data/inventory.json';
import { prefersReducedMotion, withBase } from './utils';
import { runWipe } from './page-transitions';

type Msg = { role: 'bot' | 'user'; text: string; html?: string };

const base = import.meta.env.BASE_URL;

const SUGGESTIONS = [
  '¿Qué autos tienen disponibles?',
  '¿Cuáles son los horarios?',
  '¿Dónde están ubicados?',
  '¿Ofrecen financiamiento?',
  '¿Hay garantía?',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function findCars(query: string) {
  const q = normalize(query);
  return inventory.cars.filter((car) => {
    const hay = normalize(`${car.marca} ${car.modelo} ${car.color} ${car.transmision} ${car.anio}`);
    return hay.split(' ').some((token) => token.length > 2 && q.includes(token)) || q.includes(normalize(car.marca));
  });
}

function replyFor(input: string): Msg {
  const q = normalize(input);
  const { company, cars } = inventory;

  if (/(hola|buenas|hey|saludos)/.test(q)) {
    return {
      role: 'bot',
      text: `Hola, soy el asistente de ${company.name}. Puedo ayudarte con la flota, horarios, ubicación, financiamiento y garantía.`,
    };
  }

  if (/(horario|hora|abren|cierran|atencion)/.test(q)) {
    return { role: 'bot', text: `Atendemos: ${company.hours}.` };
  }

  if (/(ubic|direccion|donde|mapa|llegar)/.test(q)) {
    return { role: 'bot', text: `Estamos en ${company.address}. Teléfono: ${company.phone}.` };
  }

  if (/(financi|credito|cuota|pie)/.test(q)) {
    return { role: 'bot', text: company.financing };
  }

  if (/(garant|mecanica|falla)/.test(q)) {
    return { role: 'bot', text: company.warranty };
  }

  if (/(whatsapp|contacto|llamar|telefono)/.test(q)) {
    return {
      role: 'bot',
      text: `Puedes escribirnos al ${company.phone} o usar el botón de WhatsApp en la sección de contacto (demo).`,
    };
  }

  if (/(precio|vale|cuesta|barato|economico|clp|plata|valor)/.test(q)) {
    return {
      role: 'bot',
      text: 'Los valores no se publican en el sitio. Contáctanos por WhatsApp o teléfono y te cotizamos según la unidad.',
    };
  }

  const matched = findCars(input);
  if (matched.length || /(auto|flota|stock|disponible|tienen|catalogo|suv|van|hatch)/.test(q)) {
    const list = (matched.length ? matched : cars).slice(0, 4);
    const links = list
      .map(
        (c) =>
          `• <a href="${withBase(`/auto/${c.slug}/`, base)}">${c.marca} ${c.modelo} ${c.anio}</a> — ${c.km.toLocaleString('es-CL')} km · ${c.transmision}`,
      )
      .join('<br>');
    return {
      role: 'bot',
      html: `Esto es lo que encontré en la flota:<br>${links}<br><br>¿Quieres detalles de alguno?`,
      text: '',
    };
  }

  return {
    role: 'bot',
    text: 'Puedo ayudarte con la flota disponible, horarios, ubicación, financiamiento o garantía. Prueba una de las sugerencias.',
  };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

export function initChatWidget(): void {
  const root = document.getElementById('chat-widget');
  if (!root || root.dataset.chatReady === '1') return;
  root.dataset.chatReady = '1';

  const launcher = root.querySelector<HTMLButtonElement>('[data-chat-open]')!;
  const panel = root.querySelector<HTMLElement>('[data-chat-panel]')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-chat-close]')!;
  const form = root.querySelector<HTMLFormElement>('[data-chat-form]')!;
  const input = root.querySelector<HTMLInputElement>('[data-chat-input]')!;
  const log = root.querySelector<HTMLElement>('[data-chat-log]')!;
  const chips = root.querySelector<HTMLElement>('[data-chat-chips]')!;

  let open = false;
  let animating = false;

  const append = (msg: Msg) => {
    const bubble = el('div', `chat-bubble chat-bubble--${msg.role}`);
    if (msg.html) bubble.innerHTML = msg.html;
    else bubble.textContent = msg.text;
    log.appendChild(bubble);
    log.scrollTop = log.scrollHeight;
  };

  const showTyping = async () => {
    const typing = el('div', 'chat-bubble chat-bubble--bot chat-typing');
    typing.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(typing);
    log.scrollTop = log.scrollHeight;
    await new Promise((r) => setTimeout(r, 650 + Math.random() * 500));
    typing.remove();
  };

  const respond = async (text: string) => {
    append({ role: 'user', text });
    await showTyping();
    append(replyFor(text));
  };

  SUGGESTIONS.forEach((label) => {
    const chip = el('button', 'chat-chip');
    chip.type = 'button';
    chip.textContent = label;
    chip.addEventListener('click', () => {
      if (!open) openPanel();
      respond(label);
    });
    chips.appendChild(chip);
  });

  const setOpenUi = (isOpen: boolean) => {
    open = isOpen;
    panel.classList.toggle('is-open', isOpen);
    panel.hidden = !isOpen;
    launcher.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  const openPanel = () => {
    if (open || animating) return;
    animating = true;
    setOpenUi(true);
    if (!prefersReducedMotion()) {
      gsap.fromTo(
        panel,
        { xPercent: 110, opacity: 0.4 },
        {
          xPercent: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'power3.out',
          onComplete: () => {
            animating = false;
          },
        },
      );
    } else {
      animating = false;
    }
    if (log.childElementCount === 0) {
      append({
        role: 'bot',
        text: `Hola, soy el asistente virtual de ${inventory.company.name}. Pregúntame por la flota o por información de la automotora.`,
      });
    }
    input.focus();
  };

  const closePanel = () => {
    if (!open || animating) return;
    animating = true;
    open = false;
    launcher.setAttribute('aria-expanded', 'false');

    const finishClose = () => {
      panel.classList.remove('is-open');
      panel.hidden = true;
      gsap.set(panel, { clearProps: 'transform,opacity' });
      animating = false;
    };

    if (prefersReducedMotion()) {
      finishClose();
      return;
    }

    gsap.to(panel, {
      xPercent: 110,
      opacity: 0.3,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: finishClose,
    });
  };

  launcher.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    open ? closePanel() : openPanel();
  });

  closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePanel();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    input.value = '';
    respond(value);
  });

  // Open from CTAs
  document.querySelectorAll('[data-open-chat]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      runWipe(() => openPanel());
    });
  });

  // Intercept in-chat links for wipe
  log.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest('a') as HTMLAnchorElement | null;
    if (!a) return;
    e.preventDefault();
    runWipe(() => {
      window.location.href = a.href;
    });
  });
}
