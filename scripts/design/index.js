/*
 * Design layer entry (Instrument redesign v5). scripts/main.js runs every step below after the core modules,
 * each isolated in its own try/catch. Each area owns exactly one module; do not edit another area's module.
 */
const AREAS = ['reveal', 'hero', 'work', 'about', 'journey', 'activity', 'stack', 'recognition', 'contact', 'footer', 'scrollbar'];

export const designSteps = AREAS.map((name) => [
  `design:${name}`,
  async () => {
    const mod = await import(`./${name}.js`);
    if (typeof mod.init === 'function') await mod.init();
  },
]);
