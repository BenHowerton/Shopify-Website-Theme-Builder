;(function () {
	const initCarousel = () => {
		$('.gallery-carousel').each(function (index, element) {
			if ($(this).hasClass('gallery-carousel_started')) {
				return
			}
			$(this).addClass('gallery-carousel_started')
			const id = $(this).attr('id')
			const box = $(this).find('.gallery-carousel')
			const speed = box.data('speed') * 1000

			const swiper = new Swiper(`#${id} .gallery-carousel__swiper`, {
				loop: true,
				speed: speed,
				allowTouchMove: false,
				longSwipesRatio: 0.1,
				spaceBetween: 8,
				slidesPerView: 1.5,
				autoplay: {
					delay: 0,
					disableOnInteraction: true,
				},
				breakpoints: {
					750: {
						slidesPerView: 2.68,
						spaceBetween: 16,
					},
				},
			})

			let duration
			let distanceRatio
			let startTimer

			const stopAutoplay = () => {
				if (!swiper || !swiper.slides || swiper.slides.length === 0) {
					return
				}
				if (startTimer) clearTimeout(startTimer)
				swiper.setTranslate(swiper.getTranslate())
				const currentSlideWidth = swiper.slides[swiper.activeIndex].offsetWidth
				distanceRatio = Math.abs(
					(currentSlideWidth * swiper.activeIndex + swiper.getTranslate()) /
						currentSlideWidth
				)

				duration = swiper.params.speed * distanceRatio
				swiper.autoplay.stop()
			}

			const startAutoplay = (delay = duration) => {
				startTimer = setTimeout(() => {
					swiper.autoplay.start()
				}, delay)
			}

			const toggleEl = document.querySelector('.gallery-carousel_stop')
			let isPlaying = true
			let clickable = true
			const handleTogglePlay = () => {
				if (!swiper || !swiper.slides || swiper.slides.length === 0) {
					return
				}
				if (!clickable) return
				clickable = false

				if (isPlaying) stopAutoplay()
				else {
					const distance =
						swiper.width * swiper.activeIndex + swiper.getTranslate()

					duration = distance !== 0 ? duration : 0
					swiper.slideTo(swiper.activeIndex, duration)
					startAutoplay()
				}
				isPlaying = !isPlaying
				if (isPlaying) toggleEl.classList.remove('gallery-carousel_stop_active')
				else toggleEl.classList.add('gallery-carousel_stop_active')
				setTimeout(() => {
					clickable = true
				}, 200)
			}
			$(this)
				.find('.gallery-carousel_stop')
				.on('click', () => handleTogglePlay())
		})
	}

	document.addEventListener('DOMContentLoaded', function () {
		initCarousel()
		document.addEventListener('shopify:section:load', function () {
			initCarousel()
		})
	})
})()
