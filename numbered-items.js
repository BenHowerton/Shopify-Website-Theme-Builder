;(function () {
	const addClasses = (slider) => {
		const sliderWrapper = slider.querySelector('.numbered-items-list__wrapper')
		const slides = slider.querySelectorAll('.numbered-items-list__item')

		slider.classList.add('swiper')
		if (sliderWrapper) sliderWrapper.classList.add('swiper-wrapper')
		if (slides.length > 1) {
			slides.forEach((slide) => {
				slide.classList.add('swiper-slide')
			})
		}
	}

	const removeClasses = (slider) => {
		const sliderWrapper = slider.querySelector('.numbered-items-list__wrapper')
		const slides = slider.querySelectorAll('.numbered-items-list__item')

		slider.classList.remove('swiper')
		if (sliderWrapper) sliderWrapper.classList.remove('swiper-wrapper')
		slides.forEach((slide) => {
			slide.removeAttribute('style')
			slide.classList.remove('swiper-slide')
		})
	}

	const initSlider = (section) => {
		const slider = section.querySelector('.swiper--numbered-items')

		if (slider) {
			addClasses(slider)

			new Swiper(slider, {
				loop: false,
				speed: 800,
				breakpoints: {
					320: {
						slidesPerView: 1,
						slidesPerGroup: 1,
						spaceBetween: 16,
					},
					750: {
						slidesPerView: 2,
						slidesPerGroup: 2,
						spaceBetween: 32,
					},
				},
				pagination: {
					el: slider.querySelector('.numbered-items__pagination'),
					clickable: true,
					type: 'custom',
					renderCustom: function (swiper, current, total) {
						let out = ''
						for (let i = 1; i <= total; i++) {
							if (i === current) {
								out += `<span class="swiper-pagination-bullet swiper-pagination-bullet-active" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`
							} else {
								out += `<span class="swiper-pagination-bullet" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`
							}
						}
						return out
					},
				},
			})
		}
	}

	const destroySlider = (section) => {
		const slider = section.querySelector('.swiper--numbered-items')

		if (slider) {
			removeClasses(slider)
		}
	}

	const initSection = (section) => {
		if (section && section.classList.contains('numbered-items-section')) {
			const sectionResizeObserver = new ResizeObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.contentRect.width < 990) {
						initSlider(entry.target)
					} else {
						destroySlider(entry.target)
					}
				})
			})

			sectionResizeObserver.observe(section)
		}
	}

	initSection(document.currentScript.parentElement)

	document.addEventListener('shopify:section:load', function (section) {
		initSection(section.target)
	})
})()
