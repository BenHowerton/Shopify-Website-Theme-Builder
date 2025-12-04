;(function () {
	const initCollage = () => {
		$('.image-collage-section').each(function (index, element) {
			if ($(this).hasClass('image-collage_started')) {
				return ''
			}
			$(this).addClass('image-collage_started')
			const id = $(this).attr('id')
			const box = $(this).find('.image-collage')
			const speed = box.data('speed') * 1000
			new Swiper(`#${id} .image-collage__swiper`, {
				centeredSlides: true,
				loop: true,
				speed: speed,
				autoplay: {
					delay: 0,
					disableOnInteraction: false,
				},
				breakpoints: {
					320: {
						slidesPerView: 2,
						spaceBetween: 8,
					},
					750: {
						slidesPerView: 3.9,
						spaceBetween: 16,
					},
				},
			})
		})
	}

	document.addEventListener('DOMContentLoaded', function () {
		initCollage()
		document.addEventListener('shopify:section:load', function () {
			initCollage()
		})
	})
})()
