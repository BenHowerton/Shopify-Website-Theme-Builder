;(function () {
	const imageWithText = () => {
		const overlayAdaptElement = document.querySelector(
			'.image-with-text__overlay.overlay-adapt'
		)
		if (!overlayAdaptElement) return

		const imgOrSvg = overlayAdaptElement.querySelector('img, svg')
		if (!imgOrSvg) return

		function adjustHeight(height) {
			overlayAdaptElement.style.minHeight = height + 'px'
		}

		if (imgOrSvg.tagName.toLowerCase() === 'img') {
			if (imgOrSvg.complete) {
				adjustHeight(imgOrSvg.naturalHeight)
			} else {
				imgOrSvg.addEventListener('load', function handleImageLoad() {
					adjustHeight(imgOrSvg.naturalHeight)
					imgOrSvg.removeEventListener('load', handleImageLoad)
				})
			}
		} else if (window.matchMedia('(min-width: 768px)').matches) {
			const bbox = imgOrSvg.getBBox()
			adjustHeight(bbox.height)
		}
	}

	document.addEventListener('DOMContentLoaded', function () {
		imageWithText()
		document.addEventListener('shopify:section:load', imageWithText)
		window.addEventListener('resize', imageWithText)
	})
})()
