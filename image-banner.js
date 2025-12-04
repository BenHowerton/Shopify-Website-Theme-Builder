;(function () {
	const initSection = () => {
		const section = document.querySelector('.image-banner-container')
		const sectionAnimated = document.querySelector('.image-banner__container')
		const heading = document.querySelector('.image-banner__heading')
		const { animation, imageRatio } = section.dataset
		const isAnimation = animation == 'true' && imageRatio == 'large'

		function changeSectionSizes() {
			const sectionTop = section.getBoundingClientRect().top
			const windowHeight = window.innerHeight

			if (sectionTop <= 0 && window.innerWidth >= 750 && isAnimation) {
				const scrollProgress = Math.abs(sectionTop) / windowHeight
				const clampedProgress = Math.min(Math.max(scrollProgress, 0), 1)
				const newSize = 100 - 55 * clampedProgress

				if (heading) {
					heading.style.opacity = `${clampedProgress}`
				}

				if (newSize < 75) {
					sectionAnimated.style.borderRadius = 'var(--border-radius-main)'
					sectionAnimated.style.overflow = 'hidden'
				} else {
					sectionAnimated.style.borderRadius = '0'
				}
				sectionAnimated.style.width = `${newSize}%`
				sectionAnimated.style.height = `${newSize}%`
			} else {
				sectionAnimated.style.borderRadius = '0'
				sectionAnimated.style.width = '100%'
				sectionAnimated.style.height = '100%'
			}
		}

		if (window.innerWidth >= 750) {
			window.addEventListener('scroll', changeSectionSizes)
		} else {
			window.removeEventListener('scroll', changeSectionSizes)
		}
	}

	initSection()

	document.addEventListener('shopify:section:load', function () {
		initSection()
	})
	window.addEventListener('resize', initSection)
})()
