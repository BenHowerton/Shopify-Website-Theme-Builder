;(function () {
	let swiperProductGrid = null
	const box = document.querySelector('.product-grid')
	const swiperOn = box ? box.dataset.swipeMobile : false
	const multicolumnSwipeEnabled = document.querySelector(
		'.swiper--product-grid'
	)

	const addClasses = () => {
		const slides = document.querySelectorAll('.product-grid__item')
		slides.forEach((slide) => {
			slide.classList.add('swiper-slide')
		})
	}

	const initSlider = () => {
		if (!swiperProductGrid && multicolumnSwipeEnabled) {
			swiperProductGrid = new Swiper('.swiper--product-grid', {
				loop: false,
				pagination: {
					el: `.product-grid-pagination`,
					clickable: true,
					type: 'bullets',
				},
				on: {
					slideChange: function () {
						let allBullets = this.el.querySelectorAll(
							'.swiper-pagination-bullet'
						)

						if (allBullets && allBullets.length > 0) {
							allBullets.forEach((item) => {
								item.classList.remove('swiper-pagination-bullet-active')
							})
							allBullets[this.activeIndex].classList.add(
								'swiper-pagination-bullet-active'
							)
						}
					},
				},
			})
		}
	}

	const destroySlider = () => {
		if (swiperProductGrid && typeof swiperProductGrid.destroy === 'function') {
			swiperProductGrid.destroy(true, true)
			swiperProductGrid = null
		}
		const slides = document.querySelectorAll('.product-grid__item')
		slides.forEach((slide) => {
			slide.removeAttribute('style')
			slide.classList.remove('swiper-slide')
		})
	}

	const initProductGrid = () => {
		const productGridSection = document.querySelector('.product-grid__section')
		if (!productGridSection) return

		const sectionResizeObserver = new ResizeObserver((entries) => {
			const [entry] = entries
			if (entry.contentRect.width < 750 && swiperOn) {
				addClasses()
				initSlider()
			} else if (swiperProductGrid) {
				destroySlider()
			}
		})
		sectionResizeObserver.observe(productGridSection)
	}

	if (swiperProductGrid) {
		destroySlider()
	}

	addClasses()
	initProductGrid()
	initSlider()

	document.addEventListener('shopify:section:load', function () {
		if (swiperProductGrid) {
			destroySlider()
		}
		addClasses()
		initProductGrid()
		initSlider()
	})
})()
