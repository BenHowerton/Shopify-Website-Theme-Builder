;(function () {
	let swiper
	const testimonials = () => {
		$('.testimonials-section').each(function () {
			const id = $(this).attr('id')
			const box = $(this).find('.testimonials')
			const autoplay = box.data('autoplay')
			const stopAutoplay = box.data('stop-autoplay')
			const delay = box.data('delay') * 1000
			const blockCount = box.data('block-count')

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

			let paginationType = determinePaginationType()

			let swiperParms = {
				effect: box.data('effect'),
				speed: box.data('speed') * 1000,
				slidesPerView: 1,
				loop: true,
				spaceBetween: 50,
				breakpoints: {
					576: {
						slidesPerView: 1.3,
						spaceBetween: 100,
					},
					750: {
						slidesPerView: 1.9,
						spaceBetween: 129,
					},
				},
				autoHeight: false,
				calculateHeight: false,
				keyboard: true,
				navigation: {
					nextEl: `#${id} .swiper-button-next`,
					prevEl: `#${id} .swiper-button-prev`,
				},
				pagination: {
					el: `#${id} .swiper-pagination`,
					clickable: true,
					renderCustom: function (swiper, current, total) {
						return current + ' - ' + total
					},
					type: paginationType,
				},
				on: {
					slideChangeTransitionEnd: function () {
						if (autoplay) {
							$('.swiper-slide-active').find('#shape').addClass('start-spin')
							$('.swiper-slide-active').find('#shape1').addClass('start-spin')
						}
					},
				},
				...autoplayParm,
			}

			if (swiper) {
				swiper.destroy()
			}

			if (blockCount > 1) {
				swiper = new Swiper(`#${id} .swiper`, swiperParms)
			}

			if (autoplay && stopAutoplay) {
				document
					.querySelector(`#${id} .testimonials__swiper`)
					.addEventListener('mouseenter', function () {
						$('.swiper-slide-active').find('#shape').removeClass('start-spin')
					})
				document
					.querySelector(`#${id} .testimonials__swiper`)
					.addEventListener('mouseleave', function () {
						$('.swiper-slide-active').find('#shape').addClass('start-spin')
					})
			}
		})
	}

	function determinePaginationType() {
		if (window.innerWidth < 750) {
			return 'bullets'
		} else {
			return 'custom'
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		testimonials()
		document.addEventListener('shopify:section:load', function () {
			testimonials()
		})
		window.addEventListener('resize', function () {
			if (
				swiper &&
				swiper.pagination &&
				swiper.pagination.type !== determinePaginationType()
			) {
				testimonials()
			}
		})
	})
})()
