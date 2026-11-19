// Sends a [data-form] form to Web3Forms, which emails it to the centre, and shows the result in the form's
// [data-form-status] line. Without JavaScript the form still posts to Web3Forms and lands on its thank-you page.
// Each [data-tour-day] button shows and sends the next date that falls on its weekday, counting from tomorrow.

// the first date after today that falls on the given weekday (0 is Sunday)
const nextWeekday = (weekday: number) => {
  const date = new Date();
  date.setDate(date.getDate() + (((weekday - date.getDay() + 6) % 7) + 1));
  return date;
};

for (const form of document.querySelectorAll<HTMLFormElement>('form[data-form]')) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  // dated, then put in date order, so the sooner tour always comes first
  const tourDays = [...form.querySelectorAll<HTMLElement>('[data-tour-day]')].map((choice) => {
    const date = nextWeekday(Number(choice.dataset.tourDay));
    const label = choice.querySelector('[data-tour-date]');
    const input = choice.querySelector('input');
    if (label) label.textContent = date.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' });
    if (input) input.value = date.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return { choice, date };
  });
  tourDays.sort((a, b) => a.date.getTime() - b.date.getTime()).forEach(({ choice }) => choice.parentElement?.append(choice));

  // phone and email: neither is required alone, but at least one is; the browser flags the first if both are empty
  const contacts = [...form.querySelectorAll<HTMLInputElement>('[data-contact]')];
  const checkContacts = () => {
    const given = contacts.some((input) => input.value.trim() !== '');
    contacts.forEach((input, index) => input.setCustomValidity(given || index > 0 ? '' : 'Please give a phone number or an email so we can contact you.'));
  };
  if (contacts.length) {
    checkContacts();
    for (const input of contacts) input.addEventListener('input', checkContacts);
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
      checkContacts();
      say(form.dataset.success ?? 'Thanks, we got your message.');
    } catch {
      say("Sorry, that didn't send. Please try again, or call or email us instead.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}
