;(function () {
	const productMarkers = () => {
		$(document).ready(function () {
			$('.js-product-markers__item').click(function () {
				$('.product-markers__img-box').css({
					borderTopLeftRadius: '0px',
					borderTopRightRadius: '0px',
				})

				$('.product-markers-for-mobile .js-product-markers__item-inner').each(
					function (index) {
						$(this).css({ display: 'none' })
					}
				)

				$(
					`.product-markers-for-mobile .js-product-markers__item-inner[data-index='${$(
						this
					).data('index')}']`
				).css({
					display: 'block',
				})
			})

			$('.js-product-markers__item').hover(
				function () {
					const marker = $(this)
					const tooltip = marker.find('.card-wrapper')

					const tooltipRect = tooltip[0].getBoundingClientRect()
					const boxRect = $(
						'.product-markers__img-box'
					)[0].getBoundingClientRect()

					if (tooltipRect.right > boxRect.right) {
						marker.addClass('product-markers__card-goToLeft')
					}

					if (tooltipRect.bottom >= boxRect.bottom) {
						marker.addClass('product-markers__card-goToTop')
					}

					if (tooltipRect.top <= boxRect.top) {
						marker.addClass('product-markers__card-goToBottom')
					}
				},
				function () {
					const marker = $(this)
					marker.removeClass(
						'product-markers__card-goToLeft product-markers__card-goToTop product-markers__card-goToBottom'
					)
				}
			)
		})
	}

	document.addEventListener('DOMContentLoaded', function () {
		productMarkers()
		document.addEventListener('shopify:section:load', function () {
			productMarkers()
		})
	})
})()
