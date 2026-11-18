// Sends a [data-form] form to Web3Forms, which emails it to the centre, and shows the result in the form's
// [data-form-status] line. Without JavaScript the form still posts to Web3Forms and lands on its thank-you page.
// The tour date only accepts a Tuesday or Thursday from today on.
const TOUR_DAYS = [2, 4];

const localToday = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-form]')) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const date = form.querySelector<HTMLInputElement>('[data-tour-day] input');

  if (date) {
    date.min = localToday();
    date.addEventListener('input', () => {
      const day = date.value ? new Date(`${date.value}T12:00`).getDay() : null;
      date.setCustomValidity(day === null || TOUR_DAYS.includes(day) ? '' : 'Please choose a Tuesday or Thursday.');
    });
  }

  const say = (text: string, failed = false) => {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('rv-form-error', failed);
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (!data.access_key) {
      say("Sorry, this form isn't switched on yet. Please call or email us instead.", true);
      return;
    }
    data.subject = `${form.dataset.subject ?? 'Website enquiry'}: ${data.name}`;
    data.from_name = 'Rainbow Village website';
    data.botcheck = form.querySelector<HTMLInputElement>('[name="botcheck"]')?.checked ? 'true' : '';

    if (button) button.disabled = true;
    say('Sending…');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error(result.message ?? response.statusText);
      form.reset();
      say(form.dataset.success ?? 'Thanks, we got your message.');
    } catch {
      say("Sorry, that didn't send. Please try again, or call or email us instead.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}
