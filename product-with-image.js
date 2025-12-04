;(function () {
	const splitScreenSlid = () => {
		$('.product-with-image__section').each(function () {
			if ($(this).hasClass('slider_started')) {
				return ''
			}
			$(this).addClass('slider_started')
			const id = $(this).attr('id')
			const box = $(this).find('.product-with-image')
			const autoplay = box.data('autoplay')
			const stopAutoplay = box.data('stop-autoplay')
			const delay = box.data('delay') * 1000
			const speed = box.data('speed') * 1000
			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: delay,
						disableOnInteraction: false,
					},
				}
			} else {
				autoplayParm = {}
			}
			let swiperParms = {
				effect: box.data('effect'),
				speed: speed,
				keyboard: true,
				loop: false,
				creativeEffect: {
					prev: {
						shadow: false,
						translate: [0, 0, -400],
					},
					next: {
						translate: ['100%', 0, 0],
					},
				},
				coverflowEffect: {
					rotate: 50,
					stretch: 0,
					depth: 100,
					modifier: 1,
					slideShadows: false,
				},
				flipEffect: {
					slideShadows: false,
				},
				...autoplayParm,
			}

			const swiperText = new Swiper(
				`#${id} .product-with-image__product-swiper`,
				{
					pagination: {
						el: `#${id} .swiper-pagination`,
						clickable: true,
					},
					...swiperParms,
					spaceBetween: 24,
					on: {
						slideChange() {
							box.css('--bullet-duration', `${delay + speed}ms`)
						},
					},
				}
			)
			if (autoplay && stopAutoplay) {
				const sliderWrapper = document.querySelector(
					`#${id} .product-with-image__product-block`
				)
				sliderWrapper.addEventListener('mouseenter', function () {
					const activeBullet = document.querySelector(
						`#${id} .swiper-pagination-bullet-active`
					)
					swiperText.autoplay.stop()
					activeBullet.classList.remove('start')
					activeBullet.classList.add('stop')
				})
				sliderWrapper.addEventListener('mouseleave', function () {
					const activeBullet = document.querySelector(
						`#${id} .swiper-pagination-bullet-active`
					)
					swiperText.autoplay.start()
					activeBullet.classList.remove('stop')
					activeBullet.classList.add('start')
					box.css('--bullet-duration', `${delay}ms`)
				})
			}
		})
	}
	document.addEventListener('DOMContentLoaded', function () {
		splitScreenSlid()
		document.addEventListener('shopify:section:load', function () {
			splitScreenSlid()
		})
	})
})()
