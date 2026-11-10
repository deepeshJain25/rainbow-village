// A box of toy blocks tipped out on the floor. Visitors press a block, drag it and let go, and it lands, stacks or
// topples. Matter.js works out where each block is; the blocks stay ordinary HTML, moved each frame to match.
import Matter from 'matter-js';

const { Bodies, Body, Composite, Constraint, Engine, Sleeping, Vector } = Matter;

const STEP = 1000 / 60;
// thick walls, so a block thrown hard still can't pass through one in a single step
const WALL = 400;
const MAX_SPEED = 28;
const SETTLE_STEPS = 400;

interface Block {
  element: HTMLElement;
  body: Matter.Body;
  // where the body's centre of mass sits inside the element, from its top left corner
  origin: Matter.Vector;
  room: boolean;
}

interface Drag {
  block: Block;
  spring: Matter.Constraint;
  pointer: number;
}

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const between = (low: number, high: number) => low + Math.random() * (high - low);

for (const game of document.querySelectorAll<HTMLElement>('[data-blocks]')) {
  const area = game.querySelector<HTMLElement>('.rv-blocks__area')!;
  const engine = Engine.create({ enableSleeping: true, positionIterations: 10, velocityIterations: 8 });
  let blocks: Block[] = [];
  let width = 0;
  let floor = 0;
  let drag: Drag | null = null;
  let frame = 0;
  let last = 0;
  let spare = 0;
  let visible = false;
  let started = false;
  let layer = 1;

  game.classList.add('is-live');

  const render = () => {
    for (const { element, body, origin } of blocks) {
      element.style.transform = `translate(${body.position.x - origin.x}px, ${body.position.y - origin.y}px) rotate(${body.angle}rad)`;
    }
  };

  const tick = (time: number) => {
    spare += Math.min(time - last, 100);
    last = time;
    while (spare >= STEP) {
      Engine.update(engine, STEP);
      spare -= STEP;
    }
    for (const { body } of blocks) {
      if (body.speed > MAX_SPEED) Body.setVelocity(body, Vector.mult(Vector.normalise(body.velocity), MAX_SPEED));
    }
    render();
    const resting = !drag && blocks.every(({ body }) => body.isSleeping);
    frame = visible && !resting ? requestAnimationFrame(tick) : 0;
  };

  const run = () => {
    if (frame || !visible) return;
    last = performance.now();
    spare = 0;
    frame = requestAnimationFrame(tick);
  };

  const settle = () => {
    for (let step = 0; step < SETTLE_STEPS; step++) Engine.update(engine, STEP);
    render();
  };

  const place = (block: Block, x: number, y: number, angle: number) => {
    Body.setPosition(block.body, { x, y });
    Body.setAngle(block.body, angle);
    Body.setVelocity(block.body, { x: 0, y: 0 });
    Body.setAngularVelocity(block.body, 0);
    Sleeping.set(block.body, false);
  };

  const size = ({ body }: Block) => ({ w: body.bounds.max.x - body.bounds.min.x, h: body.bounds.max.y - body.bounds.min.y });

  // drop every block from above in a random order, so they land in a jumbled pile. On a narrow screen a room block
  // nearly fills the width and would wedge between the walls, so the room blocks fall first and flat, as the base.
  const tipOut = () => {
    const narrow = blocks.some((block) => block.room && size(block).w > width * 0.6);
    const order = [...blocks].sort(() => Math.random() - 0.5);
    if (narrow) order.sort((a, b) => Number(b.room) - Number(a.room));
    let y = 0;
    for (const block of order) {
      Body.setAngle(block.body, 0);
      const { w, h } = size(block);
      y -= h + 40;
      const tilt = narrow && block.room ? 0 : 0.5;
      place(block, between(w / 2, width - w / 2), y, between(-tilt, tilt));
    }
    if (calm()) settle();
    run();
  };

  // stand the room blocks upright side by side on the floor, in rows if they don't fit, and drop the toys on top
  const tidy = () => {
    let x = 0;
    let base = floor;
    let tallest = 0;
    for (const block of blocks.filter(({ room }) => room)) {
      Body.setAngle(block.body, 0);
      const { w, h } = size(block);
      if (x && x + w > width) {
        x = 0;
        base -= tallest + 4;
        tallest = 0;
      }
      place(block, x + w / 2 + 4, base - h / 2, 0);
      x += w + 16;
      tallest = Math.max(tallest, h);
    }
    let y = base - tallest - 200;
    for (const block of blocks.filter(({ room }) => !room)) {
      Body.setAngle(block.body, 0);
      const { w, h } = size(block);
      y -= h + 20;
      place(block, between(w / 2, width - w / 2), y, between(-0.3, 0.3));
    }
    if (calm()) settle();
    run();
  };

  const build = () => {
    Composite.clear(engine.world, false);
    width = area.clientWidth;
    floor = area.clientHeight - parseFloat(getComputedStyle(game).getPropertyValue('--floor'));
    const tall = 20000;
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, floor + WALL / 2, width + WALL * 2, WALL, { isStatic: true, friction: 1 }),
      // slippery side walls, so a block that does get wedged slides down rather than sticking
      Bodies.rectangle(-WALL / 2, floor - tall / 2, WALL, tall, { isStatic: true, friction: 0, frictionStatic: 0 }),
      Bodies.rectangle(width + WALL / 2, floor - tall / 2, WALL, tall, { isStatic: true, friction: 0, frictionStatic: 0 }),
    ]);
    blocks = [...area.querySelectorAll<HTMLElement>('[data-block]')]
      .filter((element) => element.offsetParent)
      .map((element) => {
        const w = element.offsetWidth;
        const h = element.offsetHeight;
        const room = element.hasAttribute('data-room');
        // room blocks are heavy and grippy, so they make a steady base to build on
        const options = {
          friction: room ? 0.9 : 0.6,
          frictionStatic: room ? 1 : 0.8,
          restitution: room ? 0.05 : 0.2,
          density: room ? 0.003 : 0.0015,
        };
        let body: Matter.Body;
        let origin = { x: w / 2, y: h / 2 };
        if (element.dataset.block === 'ball') {
          body = Bodies.circle(0, 0, w / 2, options);
        } else if (element.dataset.block === 'roof') {
          // a trapezoid with slope 1 is a triangle; its centre of mass is a third of the way up
          body = Bodies.trapezoid(0, 0, w, h, 1, options);
          origin = { x: w / 2, y: (h * 2) / 3 };
        } else {
          body = Bodies.rectangle(0, 0, w, h, { ...options, chamfer: { radius: 4 } });
        }
        element.style.transformOrigin = `${origin.x}px ${origin.y}px`;
        // wait out of sight above the play area until the box is tipped out
        Body.setPosition(body, { x: width / 2, y: -2000 });
        return { element, body, origin, room };
      });
    Composite.add(engine.world, blocks.map(({ body }) => body));
    render();
  };

  const toArea = (event: PointerEvent) => {
    const box = area.getBoundingClientRect();
    return {
      x: Math.min(Math.max(event.clientX - box.left, 0), width),
      y: Math.min(event.clientY - box.top, floor),
    };
  };

  area.addEventListener('pointerdown', (event) => {
    if (drag || event.button > 0) return;
    const target = event.target as Element;
    if (target.closest('a, button')) return;
    const block = blocks.find(({ element }) => element === target.closest('[data-block]'));
    if (!block) return;
    event.preventDefault();
    const point = toArea(event);
    // the block hangs from where it was picked up, so it swings a little as it's carried
    const spring = Constraint.create({
      pointA: point,
      bodyB: block.body,
      pointB: Vector.sub(point, block.body.position),
      stiffness: 0.2,
      damping: 0.1,
      length: 0,
    });
    Sleeping.set(block.body, false);
    Composite.add(engine.world, spring);
    block.element.setPointerCapture(event.pointerId);
    block.element.style.zIndex = String(++layer);
    block.element.classList.add('is-held');
    drag = { block, spring, pointer: event.pointerId };
    run();
  });

  area.addEventListener('pointermove', (event) => {
    if (drag?.pointer === event.pointerId) drag.spring.pointA = toArea(event);
  });

  const drop = (event: PointerEvent) => {
    if (drag?.pointer !== event.pointerId) return;
    Composite.remove(engine.world, drag.spring);
    drag.block.element.classList.remove('is-held');
    drag = null;
    run();
  };
  area.addEventListener('pointerup', drop);
  area.addEventListener('pointercancel', drop);

  game.querySelector('[data-blocks-tidy]')?.addEventListener('click', tidy);
  game.querySelector('[data-blocks-tip]')?.addEventListener('click', tipOut);

  // the physics only runs while the play area is on screen
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !started) {
      started = true;
      tipOut();
    }
    run();
  }, { threshold: 0.3 }).observe(area);

  // block sizes change with the screen width, so the box is rebuilt and tidied when the width changes
  let resized = 0;
  new ResizeObserver(() => {
    if (area.clientWidth === width) return;
    clearTimeout(resized);
    resized = window.setTimeout(() => {
      build();
      if (started) {
        tidy();
        settle();
      }
    }, 150);
  }).observe(area);

  build();
}
