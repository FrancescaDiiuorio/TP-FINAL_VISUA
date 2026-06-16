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

// ─── Flourish scroll-driven story con HTML (Intersection Observer) ────────

const flourishSection = document.querySelector('.flourish-scroll');

if (flourishSection) {
	let playerReady = false;
	let slideActual = 0; // Memoria para saber qué slide debería estar viéndose

	function getFlourishIframe() {
		return flourishSection.querySelector('iframe');
	}

	function sendSlide(index) {
		const iframe = getFlourishIframe();
		// Si no hay iframe o no está listo, no hacemos nada todavía
		if (!iframe || !playerReady) return;
		
		const baseSrc = iframe.src.split('#')[0];
		iframe.src = `${baseSrc}#slide-${index}`;
	}

	function markPlayerReady() {
		if (playerReady) return;
		playerReady = true;
		// Apenas Flourish esté listo, le mandamos la slide en la que estamos parados
		sendSlide(slideActual);
	}

	// Intenta detectar cuándo Flourish cargó por completo
	window.addEventListener('message', (event) => {
		const iframe = getFlourishIframe();
		if (iframe && event.source === iframe.contentWindow) {
			markPlayerReady();
		}
	});

	// EL SALVAVIDAS: Si Flourish tarda o el navegador bloquea el mensaje, lo forzamos a los 3 segundos
	setTimeout(markPlayerReady, 3000);

	// ─── Lógica del scroll (Intersection Observer) ───
	const steps = document.querySelectorAll('.step');
	const observer = new IntersectionObserver((entradas) => {
		entradas.forEach(entrada => {
			// Cuando el centro de la caja cruzó la mitad de tu pantalla
			if (entrada.isIntersecting) {
				// Guardamos el número en la memoria y lo enviamos
				slideActual = entrada.target.getAttribute('data-slide');
				sendSlide(slideActual);
			}
		});
	}, { rootMargin: '-50% 0px -50% 0px' });

	// Le decimos al observador que mire todas las cajas invisibles y visibles
	steps.forEach(step => observer.observe(step));
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