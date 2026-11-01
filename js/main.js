/* ==========================================================================
   Entry — starts every module
   ========================================================================== */
import { initTheme } from './theme.js';
import { initPreloader } from './preloader.js';
import { initHero } from './hero.js';
import { initCursor } from './cursor.js';
import { initScroll } from './scroll.js';
import { initWork } from './work.js';
import { initUI } from './ui.js';
import { initLightbox } from './lightbox.js';
import { initStats } from './stats.js';
import { initContact } from './contact.js';
import { initGalleries } from './gallery.js';
import { initDemo } from './demo.js';
import { initVideo } from './video.js';
import { initActivity } from './activity.js';
import { initVista } from './vista.js';
import { initReveal } from './reveal.js';
import { initJourney } from './journey.js';
import { initWallet } from './wallet.js';
import { initSfx } from './sfx.js';
import { initIcons } from './icons.js';

const run = (name, fn) => { try { fn(); } catch (err) { console.error(`[${name}]`, err); } };

run('theme', initTheme);
run('cursor', initCursor);
run('scroll', initScroll);
run('work', initWork);
run('galleries', initGalleries);
run('demo', initDemo);
run('video', initVideo);
run('ui', initUI);
run('lightbox', initLightbox);
run('activity', initActivity);
run('stats', initStats);
run('contact', initContact);
run('hero', initHero);
run('vista', initVista);
run('reveal', initReveal);
run('journey', initJourney);
run('wallet', initWallet);
run('sfx', initSfx);
run('icons', initIcons);
initPreloader().then(() => document.querySelector('.hero')?.classList.add('is-in'));
