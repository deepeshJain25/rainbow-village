// The hero's rainbow turns the seasons: summer, autumn, winter, spring and round again. Each turn spins the rainbow
// once on its centre and carries the weather a quarter of the way round the bigger wheel. CSS does the moving from
// --spin and --turn; clicks during a turn are ignored, so the two wheels never get out of step.
const SEASONS = ['summer', 'autumn', 'winter', 'spring'];
const NAMES: Record<string, string> = { summer: 'Summer', autumn: 'Autumn', winter: 'Winter', spring: 'Spring' };
const TURN = 1400;

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

for (const hero of document.querySelectorAll<HTMLElement>('[data-season]')) {
  const pieces = [...hero.querySelectorAll<HTMLElement>('[data-piece]')];
  const said = hero.querySelector<HTMLElement>('[data-season-said]');
  let turns = 0;
  let busy = false;

  const next = () => {
    if (busy) return;
    busy = true;
    turns += 1;
    const season = SEASONS[turns % SEASONS.length];
    hero.dataset.season = season;
    hero.style.setProperty('--turn', String(turns));
    for (const piece of pieces) piece.classList.toggle('is-current', piece.dataset.piece === season);
    if (said) said.textContent = NAMES[season];
    window.setTimeout(() => { busy = false; }, calm() ? 0 : TURN);
  };

  hero.querySelector('[data-season-next]')?.addEventListener('click', next);
  hero.querySelector('.rv-season__wheel')?.addEventListener('click', (event) => {
    if ((event.target as Element).closest('.is-current')) next();
  });
}
