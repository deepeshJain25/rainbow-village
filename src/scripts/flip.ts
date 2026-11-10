// Photos on the line turn over to show what's written on the back. A click anywhere on a card turns it, except
// on a link. The side facing away is inert, so keyboards and screen readers only meet the side you can see.
for (const card of document.querySelectorAll<HTMLElement>('[data-flip]')) {
  const front = card.querySelector<HTMLElement>('.rv-flip__front')!;
  const back = card.querySelector<HTMLElement>('.rv-flip__back')!;

  card.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) return;
    const flipped = card.classList.toggle('is-flipped');
    front.inert = flipped;
    back.inert = !flipped;
    // a keyboard press follows the card round, so focus stays on the side facing out
    if (event.detail === 0) (flipped ? back.querySelector<HTMLElement>('button') : front)?.focus();
  });
}
