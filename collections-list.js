;(() => {
	const addClasses = (slider) => {
		const sliderWrapper = slider.querySelector('.collections-list__wrapper')
		const slides = slider.querySelectorAll('.collections-list__item')

		slider.classList.add('swiper')
		if (sliderWrapper) sliderWrapper.classList.add('swiper-wrapper')
		if (slides.length > 1) {
			slides.forEach((slide) => {
				slide.classList.add('swiper-slide')
			})
		}
	}

	const removeClasses = (slider) => {
		const sliderWrapper = slider.querySelector('.collections-list__wrapper')
		const slides = slider.querySelectorAll('.collections-list__item')

		slider.classList.remove('swiper')
		if (sliderWrapper) sliderWrapper.classList.remove('swiper-wrapper')
		slides.forEach((slide) => {
			slide.removeAttribute('style')
			slide.classList.remove('swiper-slide')
		})
	}

	const initSlider = (section) => {
		const slider = section.querySelector('.swiper--collections')

		if (slider) {
			addClasses(slider)
			const numberColumns = slider.dataset.columnsMobile || 1

			new Swiper(slider, {
				loop: false,
				speed: 800,
				spaceBetween: 0,
				breakpoints: {
					320: {
						slidesPerView: 1,
						slidesPerGroup: 1,
					},
				},
				pagination: {
					el: slider.querySelector('.collections-list__pagination'),
					clickable: true,
					type: 'custom',
					renderCustom: function (swiper, current, total) {
						let out = ''
						for (let i = 1; i < total + 1; i++) {
							if (i == current) {
								out = `${out}<span class="swiper-pagination-bullet swiper-pagination-bullet-active" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`
							} else {
								out = `${out}<span class="swiper-pagination-bullet" tabindex="0" role="button" aria-label="Go to slide ${i}"></span>`
							}
						}
						return out
					},
				},
			})
		}
	}

	const destroySlider = (section) => {
		const slider = section.querySelector('.swiper--collections')

		if (slider) {
			removeClasses(slider)
		}
	}

	const initSection = (section) => {
		if (section) {
			const resizeObserver = new ResizeObserver((entries) => {
				entries.forEach((entry) => {
					if (entry.contentRect.width > 1200) {
						const collectionsItems = entry.target.querySelectorAll(
							'.collections-list__item'
						)

						collectionsItems.forEach((item) => {
							item.addEventListener('mouseover', () => {
								collectionsItems.forEach((otherItem) => {
									if (otherItem !== item) {
										otherItem.classList.add('collections-list__item--inactive')
									}
								})
							})

							item.addEventListener('mouseout', () => {
								collectionsItems.forEach((item) => {
									item.classList.remove('collections-list__item--inactive')
								})
							})
						})
					}

					if (entry.contentRect.width < 750) {
						initSlider(entry.target)
					} else {
						destroySlider(entry.target)
					}
				})
			})

			resizeObserver.observe(section)
		}
	}

	initSection(document.currentScript.parentElement)

	document.addEventListener('shopify:section:load', function (section) {
		initSection(section.target)
	})
})()
