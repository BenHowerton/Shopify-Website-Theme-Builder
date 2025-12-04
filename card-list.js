;(function () {
	const initCardList = () => {
		const texts = document.querySelectorAll('.card-list__text')
		const images = document.querySelectorAll('.card-list__item_img_active')
		const items = document.querySelectorAll('.card-list__item_active')

		for (let i = 0; i < texts.length; i++) {
			const textHeight = texts[i].offsetHeight
			if (window.matchMedia('(min-width: 990px)').matches) {
				images[i].style.height = '100%'

				items[i].addEventListener('mouseenter', () => {
					if (window.matchMedia('(min-width: 990px)').matches) {
						images[i].style.height = `calc(100% - ${textHeight}px)`
					}
				})

				items[i].addEventListener('mouseleave', () => {
					if (window.matchMedia('(min-width: 990px)').matches) {
						images[i].style.height = '100%'
					}
				})
			} else {
				images[i].style.height = `calc(100% - ${textHeight}px)`
			}
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		initCardList()
		document.addEventListener('shopify:section:load', function () {
			initCardList()
		})
	})
	window.addEventListener('resize', function () {
		initCardList()
	})
})()
;(function () {
	let swiper
	const cardList = () => {
		$('.card-list-section').each(function () {
			const id = $(this).attr('id')
			const box = $(this).find('.card-list')
			const autoplay = box.data('autoplay')
			const stopAutoplay = box.data('stop-autoplay')
			const delay = 4 * 1000

			let autoplayParm = {}
			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: delay,
						pauseOnMouseEnter: stopAutoplay,
						disableOnInteraction: false,
					},
				}
			}

			//let paginationType = determinePaginationType()

			let swiperParms = {
				slidesPerView: 1,
				loop: false,
				spaceBetween: 16,
				autoHeight: false,
				calculateHeight: false,
				keyboard: true,
				pagination: {
					el: `#${id} .swiper-pagination`,
					clickable: true,
					type: 'bullets',
				},
				...autoplayParm,
			}

			//if (swiper) {
			//	swiper.destroy()
			//}
			if (window.innerWidth <= 576) {
				swiper = new Swiper(`#${id} .swiper`, swiperParms)
			}
		})
	}
	if (window.innerWidth > 576) {
		const slides = document.querySelectorAll('.card-list__list .swiper-slide')
		slides.forEach((slide) => {
			slide.classList.remove('swiper-slide')
		})
	}
	document.addEventListener('DOMContentLoaded', function () {
		cardList()
		document.addEventListener('shopify:section:load', function () {
			cardList()
		})
		//window.addEventListener('resize', function () {
		//	cardList()
		//})
	})
})()
//;(function () {
//	let swiperMulticolumn
//	const multicolumnSwipeEnabled = document.querySelector('.card-list-section')
//	const initSlider = () => {
//		multicolumnSwipeEnabled.classList.add('multicolumn-swiper-wrapper')
//		const slides = document.querySelectorAll('.card-list__item')
//		slides.forEach((slide) => {
//			slide.classList.add('swiper-slide')
//		})
//		swiperMulticolumn = new Swiper('.card-list-section', {
//			loop: false,
//			slidesPerView: 1,
//			spaceBetween: 0,
//			pagination: {
//				el: '.swiper-pagination',
//				clickable: true,
//				type: 'bullets',
//			},
//			breakpoints: {
//				576: {
//					slidesPerView: 2,
//				},
//			},
//		})
//	}
//	const destroySlider = () => {
//		multicolumnSwipeEnabled.classList.remove('multicolumn-swiper-wrapper')
//		const slides = document.querySelectorAll('.card-list__item')
//		swiperMulticolumn.destroy(true, true)
//		swiperMulticolumn = undefined
//		slides.forEach((slide) => {
//			slide.removeAttribute('style')
//			slide.classList.remove('swiper-slide')
//		})
//	}
//	const initMulticolumn = () => {
//		const multicolumnSection = document.querySelector('.card-list-section')
//		const sectionResizeObserver = new ResizeObserver((entries) => {
//			const [entry] = entries
//			if (entry.contentRect.width < 576 && multicolumnSwipeEnabled) {
//				initSlider()
//			} else if (swiperMulticolumn) {
//				destroySlider()
//			}
//		})
//		sectionResizeObserver.observe(multicolumnSection)
//	}
//	if (swiperMulticolumn) {
//		destroySlider()
//	}
//	initMulticolumn()
//	document.addEventListener('shopify:section:load', function () {
//		if (swiperMulticolumn) {
//			destroySlider()
//		}
//		initMulticolumn()
//	})
//})()
