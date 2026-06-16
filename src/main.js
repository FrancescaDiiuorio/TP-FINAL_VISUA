const heroImage = document.querySelector('.hero__image');
const heroSection = document.querySelector('.hero');

if (heroImage && heroSection) {
	const updateHeroParallax = () => {
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
		const heroRect = heroSection.getBoundingClientRect();
		const progress = Math.min(1, Math.max(0, (-heroRect.top) / viewportHeight));
		const translateY = progress * 90;
		const scale = 1.08 + progress * 0.08;
		const blur = Math.max(0, 1 - progress * 0.85);

		heroImage.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
		heroImage.style.filter = `blur(${blur}px) brightness(0.72) contrast(0.95) saturate(0.75)`;
	};

	updateHeroParallax();
	window.addEventListener('scroll', updateHeroParallax, { passive: true });
	window.addEventListener('resize', updateHeroParallax);
}

// ─── Flourish scroll-driven story ────────────────────────────────────────
// Ajustar TOTAL_SLIDES al número real de slides en story/3707371
const TOTAL_SLIDES = 13;

const flourishSection = document.querySelector('.flourish-scroll');

if (flourishSection) {
	let lastSentSlide = -1;
	let playerReady = false;

	function getFlourishIframe() {
		return flourishSection.querySelector('iframe');
	}

	function sendSlide(index) {
		const iframe = getFlourishIframe();
		if (!iframe) return;
		
		// Utilizar el hash de la URL para cambiar de slide internamente sin recargar el iframe
		const baseSrc = iframe.src.split('#')[0];
		iframe.src = `${baseSrc}#slide-${index}`;
	}

	function getTargetSlide() {
		const rect = flourishSection.getBoundingClientRect();
		const scrolled = -rect.top;
		const scrollable = flourishSection.offsetHeight - window.innerHeight;
		if (scrollable <= 0) return 0;
		const progress = Math.max(0, Math.min(1, scrolled / scrollable));
		return Math.min(TOTAL_SLIDES - 1, Math.floor(progress * TOTAL_SLIDES));
	}

	function onFlourishScroll() {
		if (!playerReady) return;
		const slide = getTargetSlide();
		if (slide !== lastSentSlide) {
			lastSentSlide = slide;
			sendSlide(slide);
		}
	}

	function markPlayerReady() {
		if (playerReady) return;
		playerReady = true;
		// Sincroniza inmediatamente con la posición de scroll actual
		const slide = getTargetSlide();
		lastSentSlide = slide;
		sendSlide(slide);
	}

	// Flourish manda postMessages al parent al inicializarse (resize, etc.)
	// Cuando recibimos cualquier mensaje del iframe, sabemos que el player está listo
	window.addEventListener('message', (event) => {
		const iframe = getFlourishIframe();
		if (iframe && event.source === iframe.contentWindow) {
			markPlayerReady();
		}
	});

	// Fallback por si no llega ningún mensaje del iframe
	setTimeout(markPlayerReady, 4000);

	window.addEventListener('scroll', onFlourishScroll, { passive: true });
}

// ─── Capítulo de la cifra: conteo 0 → 70.000.000 con el scroll ──────────
(function () {
	const TARGET = 70000000;
	const section = document.getElementById('figure');
	if (!section) return;

	const countEl = document.getElementById('count');
	const barEl = document.getElementById('bar');
	const figureEl = countEl.closest('.figure');
	const hintEl = document.getElementById('hint');
	const nf = new Intl.NumberFormat('es-AR'); // 70.000.000

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) {
		countEl.textContent = nf.format(TARGET);
		figureEl.classList.add('is-complete');
		return;
	}

	const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

	function update() {
		const rect = section.getBoundingClientRect();
		const scrollable = section.offsetHeight - window.innerHeight;
		const raw = Math.min(1, Math.max(0, -rect.top / scrollable));

		// el número cuenta en la franja central del scroll (con "aire" antes/después)
		const counting = Math.min(1, Math.max(0, (raw - 0.12) / 0.70));
		const value = Math.round(ease(counting) * TARGET);

		countEl.textContent = nf.format(value);
		barEl.style.setProperty('--progress', counting);
		figureEl.classList.toggle('is-complete', counting >= 0.999);
		hintEl.style.opacity = raw > 0.05 ? '0' : '1';
	}

	update();
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
})();