// Paintings on a washing line sway like they're in the wind as a cursor or finger passes: moving
// right pushes them right, moving left pushes them left, and they settle on their own.
const STIFFNESS = 28;
const DAMPING = 1.6;
const PUSH = 0.9;
const REST = 0.02;
const TAP = 25;

interface Painting {
  element: HTMLElement;
  angle: number;
  speed: number;
  limit: number;
}

const canSwing = !matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canSwing) {
  const moving = new Set<Painting>();
  let frame = 0;
  let lastTime = 0;

  const step = (time: number) => {
    const elapsed = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    for (const painting of moving) {
      painting.speed += (-STIFFNESS * painting.angle - DAMPING * painting.speed) * elapsed;
      painting.angle += painting.speed * elapsed;
      if (Math.abs(painting.angle) > painting.limit) {
        painting.angle = Math.sign(painting.angle) * painting.limit;
        painting.speed = 0;
      }
      if (Math.abs(painting.angle) < REST && Math.abs(painting.speed) < REST) {
        painting.angle = 0;
        painting.speed = 0;
        moving.delete(painting);
      }
      painting.element.style.setProperty('--swing', `${painting.angle.toFixed(2)}deg`);
    }
    frame = moving.size ? requestAnimationFrame(step) : 0;
  };

  for (const line of document.querySelectorAll<HTMLElement>('.hs-line')) {
    const paintings: Painting[] = [...line.querySelectorAll<HTMLElement>('.hs-painting')].map((element) => ({
      element,
      angle: 0,
      speed: 0,
      // Tall paintings swing through a smaller angle, so their bottom edge travels about the same distance.
      limit: Math.max(4, Math.min(12, 2400 / element.offsetHeight)),
    }));
    let lastX: number | null = null;

    const push = (painting: Painting, amount: number) => {
      // A negative angle swings the bottom of the painting to the right.
      painting.speed -= amount;
      moving.add(painting);
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(step);
      }
    };

    // Paintings near the cursor or finger get the biggest push.
    const pushNear = (x: number, moved: number) => {
      for (const painting of paintings) {
        const box = painting.element.getBoundingClientRect();
        const distance = Math.abs(x - (box.left + box.width / 2));
        const nearness = Math.max(0, 1 - distance / (box.width * 1.5));
        if (nearness) push(painting, moved * PUSH * nearness);
      }
    };

    line.addEventListener('pointerleave', () => { lastX = null; });
    line.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const moved = lastX === null ? 0 : event.clientX - lastX;
      lastX = event.clientX;
      if (moved) pushNear(event.clientX, moved);
    });

    // A tap nudges the painting under the finger away from the side it was touched on.
    line.addEventListener('touchstart', (event) => {
      const touch = event.touches[0];
      lastX = touch.clientX;
      const element = (event.target as Element).closest<HTMLElement>('.hs-painting');
      const painting = paintings.find((candidate) => candidate.element === element);
      if (!painting) return;
      const box = painting.element.getBoundingClientRect();
      push(painting, touch.clientX < box.left + box.width / 2 ? TAP : -TAP);
    }, { passive: true });

    line.addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      const moved = lastX === null ? 0 : touch.clientX - lastX;
      lastX = touch.clientX;
      if (moved) pushNear(touch.clientX, moved);
    }, { passive: true });
  }
}
