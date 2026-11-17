/** Chilean RUT helpers and simulated credit pre-approval form. */

export function cleanRut(value: string): string {
  return value.replace(/[^0-9kK]/g, '').toUpperCase();
}

export function formatRut(value: string): string {
  const cleaned = cleanRut(value);
  if (cleaned.length <= 1) return cleaned;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

/** Modulo-11 check for Chilean RUT (body + DV). */
export function isValidRut(value: string): boolean {
  const cleaned = cleanRut(value);
  if (cleaned.length < 2 || cleaned.length > 9) return false;
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  if (!/^[\dK]$/.test(dv)) return false;

  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i -= 1) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const mod = 11 - (sum % 11);
  const expected = mod === 11 ? '0' : mod === 10 ? 'K' : String(mod);
  return dv === expected;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function setFieldError(field: HTMLElement, message: string | null) {
  const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
  const error = field.querySelector<HTMLElement>('[data-field-error]');
  if (!control || !error) return;

  if (message) {
    control.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    error.hidden = false;
    field.classList.add('is-invalid');
  } else {
    control.removeAttribute('aria-invalid');
    error.textContent = '';
    error.hidden = true;
    field.classList.remove('is-invalid');
  }
}

function validateField(field: HTMLElement): boolean {
  const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
  if (!control) return true;

  const name = control.name;
  const value = control.value.trim();

  if (!value) {
    setFieldError(field, 'Este campo es obligatorio.');
    return false;
  }

  if (name === 'rut' && !isValidRut(value)) {
    setFieldError(field, 'Ingresa un RUT válido (ej. 12.345.678-5).');
    return false;
  }

  if (name === 'email' && !isValidEmail(value)) {
    setFieldError(field, 'Ingresa un correo electrónico válido.');
    return false;
  }

  if (name === 'nacimiento') {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      setFieldError(field, 'Ingresa una fecha válida.');
      return false;
    }
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age -= 1;
    if (age < 18) {
      setFieldError(field, 'Debes ser mayor de 18 años.');
      return false;
    }
    if (age > 100) {
      setFieldError(field, 'Revisa la fecha de nacimiento.');
      return false;
    }
  }

  setFieldError(field, null);
  return true;
}

export function initCreditForm(root: HTMLElement = document): void {
  const form = root.querySelector<HTMLFormElement>('[data-credit-form]');
  if (!form || form.dataset.bound === '1') return;
  form.dataset.bound = '1';

  const panel = form.closest<HTMLElement>('[data-credit-panel]');
  const success = panel?.querySelector<HTMLElement>('[data-credit-success]');
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-credit-submit]');
  const fields = [...form.querySelectorAll<HTMLElement>('[data-field]')];
  const rutInput = form.querySelector<HTMLInputElement>('input[name="rut"]');

  rutInput?.addEventListener('input', () => {
    const start = rutInput.selectionStart;
    const before = rutInput.value;
    rutInput.value = formatRut(rutInput.value);
    if (start != null && document.activeElement === rutInput) {
      const delta = rutInput.value.length - before.length;
      const next = Math.max(0, start + delta);
      rutInput.setSelectionRange(next, next);
    }
  });

  fields.forEach((field) => {
    const control = field.querySelector<HTMLInputElement | HTMLSelectElement>('input, select');
    control?.addEventListener('blur', () => validateField(field));
    control?.addEventListener('input', () => {
      if (field.classList.contains('is-invalid')) validateField(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    let ok = true;
    let firstInvalid: HTMLElement | null = null;

    fields.forEach((field) => {
      const valid = validateField(field);
      if (!valid) {
        ok = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!ok) {
      firstInvalid?.querySelector<HTMLElement>('input, select')?.focus();
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.dataset.loading = '1';
      submitBtn.textContent = 'Evaluando…';
    }

    await new Promise((resolve) => setTimeout(resolve, 900));

    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.focus();
    }
  });
}
