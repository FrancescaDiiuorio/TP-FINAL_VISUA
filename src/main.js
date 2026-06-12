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
