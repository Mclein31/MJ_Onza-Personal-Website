import { initTheme } from './theme.js';
import { initPreloader } from './preloader.js';
import { initHero } from './hero.js';
import { initIcons } from './icons.js';
import { initCursor } from './cursor.js';
import { initScroll } from './scroll.js';
import { initWork } from './work.js';
import { initUI } from './ui.js';
import { initPalette } from './palette.js';
import { initLightbox } from './lightbox.js';
import { initStats } from './stats.js';
import { initContact } from './contact.js';
import { initGalleries } from './gallery.js';
import { initDemo } from './demo.js';

// Each module guards its own DOM, so one failure never takes down the page
const run = (name, fn) => { try { fn(); } catch (err) { console.error(`[${name}]`, err); } };

run('theme', initTheme);
run('cursor', initCursor);
run('scroll', initScroll);
run('work', initWork);
run('galleries', initGalleries);
run('demo', initDemo);
run('ui', initUI);
run('palette', initPalette);
run('lightbox', initLightbox);
run('stats', initStats);
run('contact', initContact);
run('icons', initIcons);
run('hero', initHero);
initPreloader().then(() => document.querySelector('.hero')?.classList.add('is-in'));
