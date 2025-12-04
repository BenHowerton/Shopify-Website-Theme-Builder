;(function () {
	const getDistanceToNext = (element, nextElement) => {
		if (element && nextElement) {
			return (
				nextElement.getBoundingClientRect().left -
				element.getBoundingClientRect().right
			)
		}
	}

	const getDistanceToPrev = (element, prevElement) => {
		if (element && prevElement) {
			return (
				prevElement.getBoundingClientRect().right -
				element.getBoundingClientRect().left
			)
		}
	}

	const footer = () => {
		const footerSections = document.querySelectorAll('.footer')

		const resizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.contentRect.width >= 990) {
					const blockLogo = entry.target.querySelector('.footer-block--logo')
					const blockContacts = entry.target.querySelector(
						'.footer-block--contacts'
					)

					const calculatePaddingLeft = (element) => {
						if (element) {
							if (
								element.previousElementSibling?.classList.contains(
									'footer-block--menu'
								)
							) {
								const distance =
									getDistanceToPrev(element, element.previousElementSibling) / 2
							}
						}
					}

					const calculatePaddingRight = (element) => {
						if (element) {
							if (
								element.nextElementSibling?.nextElementSibling?.classList.contains(
									'footer-block--menu'
								)
							) {
								const distance =
									(-1 / 2) *
									getDistanceToNext(
										element,
										element.nextElementSibling?.nextElementSibling
									)
							}
						}
					}

					calculatePaddingLeft(blockLogo)
					calculatePaddingRight(blockLogo)
					calculatePaddingLeft(blockContacts)
					calculatePaddingRight(blockContacts)
				}
			})
		})

		footerSections.forEach((section) => {
			resizeObserver.observe(section)
		})

		const initFooterAccordion = () => {
			document.querySelectorAll('.accordion details').forEach((detail) => {
				detail.addEventListener('toggle', function () {
					const icon = this.querySelector('.collapsible-content__icon')
					if (this.open) {
						icon.classList.add('active')
					} else {
						icon.classList.remove('active')
					}
				})
			})
		}

		initFooterAccordion()
		document.addEventListener('shopify:section:load', function () {
			initFooterAccordion()
		})
	}

	document.addEventListener('shopify:section:load', footer)
	footer()
})()
