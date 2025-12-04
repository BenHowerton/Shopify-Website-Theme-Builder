const sliderInit = (isUpdate) => {
	if (
		document.querySelectorAll('.js-media-list') &&
		document.querySelectorAll('.js-media-list').length > 0
	) {
		document.querySelectorAll('.js-media-list').forEach((elem) => {
			const mediaListId = elem.dataset?.jsMediaListId
			const mediaSublist = Array.from(
				document.querySelectorAll('.js-media-sublist')
			).find(
				(subElem) =>
					subElem.dataset?.jsMediaListId === mediaListId && subElem.swiper
			)

			const autoplay = elem.dataset.autoplay == 'true' ? true : false
			let autoplaySettings
			const stopAutoplay = elem.dataset.stopAutoplay == 'true' ? true : false
			const delay = elem.dataset.delay * 1000
			const speed = elem.dataset.speed * 1000
			const id = elem.dataset.section
			
			if (autoplay) {
				autoplaySettings = {
					autoplay: {
						delay: delay,
						pauseOnMouseEnter: stopAutoplay,
						disableOnInteraction: false,
						waitForTransition: true,
					},
				}
			} else {
				autoplaySettings = {}
			}
			let slider = new Swiper(elem, {
				slidesPerView: 1,
				spaceBetween: 1,
				autoHeight: true,
				speed: speed,
				navigation: {
					nextEl: `#${id}-slider .product__slider-nav .swiper-button-next`,
					prevEl: `#${id}-slider .product__slider-nav .swiper-button-prev`
				},
				pagination: {
					el: `#${id}-slider .product__pagination`,
					type: 'bullets',
					clickable: true,
				},
				thumbs: {
					swiper: mediaListId && mediaSublist ? mediaSublist.swiper : '',
				},
				on: {
					init: function () {
						elem.style.setProperty('--bullet-duration', `${delay}ms`)
						document.body.style.setProperty(
							'--bullet-duration-product-modal',
							`${delay}ms`
						)
					},
					slideChangeTransitionStart: function () {
						if (mediaListId && mediaSublist) {
							mediaSublist.swiper.slideTo(this.activeIndex)
						}
					},
					slideChange: function () {
						window.pauseAllMedia()
						this.params.noSwiping = false
						elem.style.setProperty('--bullet-duration', `${delay + speed}ms`)
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

						document.body.style.setProperty(
							'--bullet-duration-product-modal',
							`${delay + speed}ms`
						)

						if (
							document.querySelector('.js-popup-slider') &&
							document.querySelector('.js-popup-slider').swiper
						) {
							document
								.querySelector('.js-popup-slider')
								.swiper.slideTo(this.activeIndex)
						}
					},
					slideChangeTransitionEnd: function () {
						if (this.slides[this.activeIndex].querySelector('model-viewer')) {
							this.slides[this.activeIndex]
								.querySelector('.shopify-model-viewer-ui__button--poster')
								.removeAttribute('hidden')
						}
					},
					touchStart: function () {
						if (this.slides[this.activeIndex].querySelector('model-viewer')) {
							if (
								!this.slides[this.activeIndex]
									.querySelector('model-viewer')
									.classList.contains('shopify-model-viewer-ui__disabled')
							) {
								this.params.noSwiping = true
								this.params.noSwipingClass = 'swiper-slide'
							} else {
								this.params.noSwiping = false
							}
						}
					},
				},
				...autoplaySettings,
			})

			if (autoplay && stopAutoplay) {
				const sliderWrapper = document.querySelector('.product__main')
				sliderWrapper.addEventListener('mouseenter', () => {
					document
						.querySelector('.product__main .swiper-pagination-bullet-active')
						.classList.remove('animation-start')
					document
						.querySelector('.product__main .swiper-pagination-bullet-active')
						.classList.add('animation-none')
				})
				sliderWrapper.addEventListener('mouseleave', () => {
					document
						.querySelector('.product__main .swiper-pagination-bullet-active')
						.classList.remove('animation-none')
					document
						.querySelector('.product__main .swiper-pagination-bullet-active')
						.classList.add('animation-start')
				})
			}

			if (isUpdate) {
				setTimeout(function () {
					slider.update()
				}, 800)
			}
		})
	}
}

const subSliderInit = (isUpdate) => {
	if (
		document.querySelectorAll('.js-media-sublist') &&
		document.querySelectorAll('.js-media-sublist').length > 0
	) {
		document.querySelectorAll('.js-media-sublist').forEach((elem, index) => {
			const box = document.querySelector('.js-media-sublist')

			const mainImg = document.querySelector('.product__media-list')
			const mainImgHeight = mainImg.offsetHeight
			const subitems = document.querySelectorAll('.product__media-subitem')
			const subitemsWidth = subitems[0].offsetWidth
			const subitemsHeight = subitemsWidth / 0.775 + 16
			const subitemsCountInView = mainImgHeight / subitemsHeight

			let perViewDesktopPlus = subitems.length > 6 ? 5.8 : subitems.length
			let perViewDesktop = subitems.length > 5 ? 5 : subitems.length
			let perViewTablet = subitems.length > 3 ? 3.9 : subitems.length
			let perViewLaptop = subitems.length > 4 ? 3.8 : subitems.length
			let perViewLarge = subitems.length > 8 ? 7.8 : subitems.length

			const perView =
				box.dataset.sectionLayout == 'container' ? perViewTablet : perViewLarge
			perViewDesktopPlus =
				box.dataset.sectionLayout == 'container'
					? perViewTablet
					: perViewDesktopPlus

			let subSlider = new Swiper(elem, {
				slidesPerView: 3.5,
				spaceBetween: 8,
				direction: 'horizontal',
				freeMode: false,
				watchSlidesProgress: true,
				//autoHeight: true,
				centeredSlides: true,
				centeredSlidesBounds: true,
				slideToClickedSlide: true,
				updateOnWindowResize: true,
				on: {
					touchEnd: function (s, e) {
						let range = 5
						let diff = (s.touches.diff = s.isHorizontal()
							? s.touches.currentX - s.touches.startX
							: s.touches.currentY - s.touches.startY)
						if (diff < range || diff > -range) s.allowClick = true
					},
				},
				breakpoints: {
					990: {
						spaceBetween: 16,
						direction: 'vertical',
						slidesPerView: perViewTablet,
						centeredSlides: true,
						centeredSlidesBounds: true,
						slideToClickedSlide: true,
					},
					1200: {
						spaceBetween: 16,
						direction: 'vertical',
						slidesPerView: perViewLaptop,
					},
					1400: {
						spaceBetween: 16,
						direction: 'vertical',
						slidesPerView: perViewDesktop,
					},
					1600: {
						spaceBetween: 16,
						direction: 'vertical',
						slidesPerView:
							box.dataset.sectionLayout == 'container'
								? perViewTablet
								: perViewDesktop,
					},
					1920: {
						spaceBetween: 16,
						direction: 'vertical',
						slidesPerView: perViewDesktopPlus,
					},
					2300: {
						spaceBetween: 16,
						direction: 'vertical',
						slidesPerView: perView,
					},
				},
			})

			const sliderResizeObserve = new ResizeObserver((entries) => {
				const [entry] = entries
				setTimeout(() => {
					const sliders = document.querySelectorAll('.js-media-list')
					const thumbs = document.querySelectorAll('.product__media-sublist')
					if (sliders.length > 0 && thumbs.length > 0) {
						if (index >= 0 && index < sliders.length) {
							const sliderHeight = sliders[index].getBoundingClientRect().height
							thumbs[index].style.height = `${sliderHeight - 1}px`
						}
					}
				}, 400)
			})
			if (document.querySelector('.product-section'))
				sliderResizeObserve.observe(document.querySelector('.product-section'))
			if (document.querySelector('.featured-product'))
				sliderResizeObserve.observe(document.querySelector('.featured-product'))

			if (isUpdate) {
				setTimeout(function () {
					subSlider.update()
				}, 800)
			}
		})
	}
}

const popupSliderInit = (isUpdate) => {
	if (document.querySelector('.js-popup-slider')) {
		let popupSlider = new Swiper(document.querySelector('.js-popup-slider'), {
			slidesPerView: 1,
			navigation: {
				nextEl: '.product-media-modal .product__slider-nav .swiper-button-next',
				prevEl: '.product-media-modal .product__slider-nav .swiper-button-prev',
			},
			pagination: {
				el: '.product-media-modal .product__pagination',
				type: 'bullets',
				clickable: true,
			},
			on: {
				afterInit: function () {
					if (document.querySelector('.product__outer--slideshow')) {
						document
							.querySelectorAll('.product__media-list .product__media-toggle')
							.forEach((elem, index) => {
								elem.addEventListener('click', (e) => {
									if (
										document.querySelector('.js-popup-slider') &&
										document.querySelector('.js-popup-slider').swiper
									) {
										document
											.querySelector('.js-popup-slider')
											.swiper.slideTo(index)
									}
								})
							})
					}
				},
				slideChange: function () {
					window.pauseAllMedia()
					this.params.noSwiping = false
					document
						.querySelector('.product-media-modal__content')
						.classList.remove('zoom')
				},
				touchMove: function () {
					document
						.querySelector('.product-media-modal__content')
						.classList.remove('zoom')
				},
				slideChangeTransitionEnd: function () {
					if (this.slides[this.activeIndex].querySelector('model-viewer')) {
						this.slides[this.activeIndex]
							.querySelector('.shopify-model-viewer-ui__button--poster')
							.removeAttribute('hidden')
					}
				},
			},
		})

		if (isUpdate) {
			setTimeout(function () {
				popupSlider.update()
			}, 800)
		}
	}
}

if (navigator.userAgent.indexOf('iPhone') > -1) {
	document
		.querySelector('[name=viewport]')
		.setAttribute(
			'content',
			'width=device-width, initial-scale=1, maximum-scale=1'
		)
}

function getFocusableElements(container) {
	if (!container) return []
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
		)
	)
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
	summary.setAttribute('role', 'button')
	summary.setAttribute('aria-expanded', 'false')

	if (summary.nextElementSibling.getAttribute('id')) {
		summary.setAttribute('aria-controls', summary.nextElementSibling.id)
	}

	summary.addEventListener('click', (event) => {
		event.currentTarget.setAttribute(
			'aria-expanded',
			!event.currentTarget.closest('details').hasAttribute('open')
		)
	})

	if (summary.closest('header-drawer')) return
	summary.parentElement.addEventListener('keyup', onKeyUpEscape)
})

function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== 'ESCAPE') return

	const openDetailsElement = event.target.closest('details[open]')
	if (!openDetailsElement) return

	const summaryElement = openDetailsElement.querySelector('summary')
	openDetailsElement.removeAttribute('open')
	summaryElement.setAttribute('aria-expanded', false)
	summaryElement.focus()
}

const trapFocusHandlers = {}

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container)
	var first = elements[0]
	var last = elements[elements.length - 1]

	removeTrapFocus()

	trapFocusHandlers.focusin = (event) => {
		if (
			event.target !== container &&
			event.target !== last &&
			event.target !== first
		)
			return

		document.addEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.focusout = function () {
		document.removeEventListener('keydown', trapFocusHandlers.keydown)
	}

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== 'TAB') return // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault()
			first.focus()
		}

		//  On the first focusable element and tab backward, focus the last element.
		if (
			(event.target === container || event.target === first) &&
			event.shiftKey
		) {
			event.preventDefault()
			last.focus()
		}
	}

	document.addEventListener('focusout', trapFocusHandlers.focusout)
	document.addEventListener('focusin', trapFocusHandlers.focusin)

	if (elementToFocus) elementToFocus.focus()
}

function pauseAllMedia() {
	document.querySelectorAll('.js-youtube').forEach((video) => {
		video.contentWindow.postMessage(
			'{"event":"command","func":"' + 'pauseVideo' + '","args":""}',
			'*'
		)
	})
	document.querySelectorAll('.js-vimeo').forEach((video) => {
		video.contentWindow.postMessage('{"method":"pause"}', '*')
	})
	document.querySelectorAll('video').forEach((video) => video.pause())
	document.querySelectorAll('product-model').forEach((model) => {
		if (model.modelViewerUI) model.modelViewerUI.pause()
	})
}

function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener('focusin', trapFocusHandlers.focusin)
	document.removeEventListener('focusout', trapFocusHandlers.focusout)
	document.removeEventListener('keydown', trapFocusHandlers.keydown)

	if (elementToFocus && !elementToFocus.classList.contains('card-focused'))
		elementToFocus.focus()
}

class QuantityInput extends HTMLElement {
	constructor() {		
		super()
		const th_e = this;
		this.input = this.querySelector('input')
		this.changeEvent = new Event('change', { bubbles: true })
		this.quick_add_bulk = this.closest('quick-add-bulk') || this.closest('quantity-popover');

		const cart_item = this.closest('.cart-item')

		if(cart_item){
			const qty_rule = window.quantity_rules[cart_item.dataset.productType];
			if( qty_rule ){
				const qty_step = Number(qty_rule.increment);
				if( qty_step > 0 ){
					let qty_min = qty_rule.minimum_quantity_returned;
					if( window.qtyCondition.first_time ){
						qty_min = qty_rule.minimum_quantity_first_time;
					}
					this.input.step = qty_step;
					this.input.min = qty_step;					
				}
			}
		}

		this.querySelectorAll('button').forEach((button) => {
			this.setMinimumDisable()

			button.addEventListener('click', this.onButtonClick.bind(this))
		})

		var eventList = ['paste', 'input']

		for (event of eventList) {
			this.input.addEventListener(event, function (e) {
				const numberRegex = /^0*?[1-9]\d*$/
				
				if (
					numberRegex.test(e.currentTarget.value) ||
					e.currentTarget.value === ''
				) {					
					e.currentTarget.value
				} else {					
					if( th_e.quick_add_bulk != null ){
						e.currentTarget.value = 0
					}else{
						e.currentTarget.value = 1
					}					
				}

				if( this.quick_add_bulk != null && e.currentTarget.value == 0 ){
					this.previousElementSibling.classList.add('disabled')
				} else {
					if (this.previousElementSibling) {
						if (e.currentTarget.value === 1 || e.currentTarget.value === '') {
							this.previousElementSibling.classList.add('disabled')
						} else {
							this.previousElementSibling.classList.remove('disabled')
						}	
					}
				}
				th_e.inputValueChange(e.currentTarget);
				typeof productQuantityChange == "function" && productQuantityChange(th_e);
			})
		}

		this.input.addEventListener('focusout', function (e) {
			if (e.currentTarget.value === '') {
				if( th_e.quick_add_bulk != null ){
					e.currentTarget.value = 0
				}else{
					e.currentTarget.value = 1
				}				
			}
			th_e.inputValueChange(e.currentTarget);
		})
		
		if(this.querySelector('.quantity-text')){
			const div = document.createElement('div');
			div.className = 'calc_width hidden';
			div.innerText = this.input.value;
			this.querySelector('.quantity-text').append(div);			
		}
		this.inputValueChange(this.input);			
	}

	setMinimumDisable() {
		if( this.quick_add_bulk != null && this.input.value == 0 ){
			this.querySelector('button[name="minus"]').classList.add('disabled')
		} if( this.quick_add_bulk != null &&  this.input.value == this.input.min ){
			this.querySelector('button[name="minus"]').classList.add('disabled')
		} else if (this.input.value == 1 && this.quick_add_bulk == null) {
			this.querySelector('button[name="minus"]').classList.add('disabled')
		} else {
			this.querySelector('button[name="minus"]').classList.remove('disabled')
		}
	}

	onButtonClick(event) {
		event.preventDefault()
		const previousValue = this.input.value

		event.target.name === 'plus' ||
		event.target.classList.contains('quantity__button_plus')
			? this.input.stepUp()
			: this.input.stepDown()		

		if (previousValue !== this.input.value)
			this.input.dispatchEvent(this.changeEvent)

		this.setMinimumDisable()
		this.inputValueChange(this.input);

		const calc_width = this.querySelector('.calc_width');
		if( calc_width ){
			calc_width.innerText = this.input.value;
			calc_width.classList.remove('hidden');
			const input_width = calc_width.offsetWidth;
			calc_width.classList.add('hidden');
			if ( input_width > 25 ){
				this.input.style.setProperty('--input-width', (input_width + 5)+'px');
			}else{
				this.input.style.setProperty('--input-width', '');
			}
		}	
		typeof productQuantityChange == "function" && productQuantityChange(this);
	}

	inputValueChange(input_el){		
		if( input_el.step != null && input_el.step == '1') return;
		const step = Number(input_el.step);
		const n_pack = parseInt(input_el.value / step);
		const qty_label = input_el.closest('.quantity-text')?.querySelector('.quantity-label');
		if( n_pack > 0 ){
			if( qty_label ){
				qty_label.innerText = `(${ n_pack } pack)`;
				qty_label.classList.remove('hidden');
				this.classList.add('qty-pack');
			}
		}else{
			this.classList.remove('qty-pack');
			qty_label && (qty_label.classList.add('hidden'));
		}
		if( input_el.value == 0 ){
			this.classList.remove('qty-pack');
			qty_label && (qty_label.classList.add('hidden'));
		}
	}
}

customElements.define('quantity-input', QuantityInput)

function debounce(fn, wait) {
	let t
	return (...args) => {
		clearTimeout(t)
		t = setTimeout(() => fn.apply(this, args), wait)
	}
}

const serializeForm = (form) => {
	const obj = {}
	const formData = new FormData(form)
	for (const key of formData.keys()) {
		obj[key] = formData.get(key)
	}
	return JSON.stringify(obj)
}

function fetchConfig(type = 'json') {
	return {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: `application/${type}`,
		},
	}
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == 'undefined') {
	window.Shopify = {}
}

Shopify.bind = function (fn, scope) {
	return function () {
		return fn.apply(scope, arguments)
	}
}

Shopify.setSelectorByValue = function (selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i]
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i
			return i
		}
	}
}

Shopify.addListener = function (target, eventName, callback) {
	target.addEventListener
		? target.addEventListener(eventName, callback, false)
		: target.attachEvent('on' + eventName, callback)
}

Shopify.postLink = function (path, options) {
	options = options || {}
	var method = options['method'] || 'post'
	var params = options['parameters'] || {}

	var form = document.createElement('form')
	form.setAttribute('method', method)
	form.setAttribute('action', path)

	for (var key in params) {
		var hiddenField = document.createElement('input')
		hiddenField.setAttribute('type', 'hidden')
		hiddenField.setAttribute('name', key)
		hiddenField.setAttribute('value', params[key])
		form.appendChild(hiddenField)
	}
	document.body.appendChild(form)
	form.submit()
	document.body.removeChild(form)
}

Shopify.CountryProvinceSelector = function (
	country_domid,
	province_domid,
	options
) {
	this.countryEl = document.getElementById(country_domid)
	this.provinceEl = document.getElementById(province_domid)
	this.provinceContainer = document.getElementById(
		options['hideElement'] || province_domid
	)

	Shopify.addListener(
		this.countryEl,
		'change',
		Shopify.bind(this.countryHandler, this)
	)

	this.initCountry()
	this.initProvince()
}

Shopify.CountryProvinceSelector.prototype = {
	initCountry: function () {
		var value = this.countryEl.getAttribute('data-default')
		Shopify.setSelectorByValue(this.countryEl, value)
		this.countryHandler()
	},

	initProvince: function () {
		var value = this.provinceEl.getAttribute('data-default')
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value)
		}
	},

	countryHandler: function (e) {
		var opt = this.countryEl.options[this.countryEl.selectedIndex]
		var raw = opt.getAttribute('data-provinces')
		var provinces = JSON.parse(raw)

		this.clearOptions(this.provinceEl)
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = 'none'
		} else {
			for (let i = 0; i < provinces.length; i++) {
				var opt = document.createElement('option')
				opt.value = provinces[i][0]
				opt.innerHTML = provinces[i][1]
				this.provinceEl.appendChild(opt)
			}

			this.provinceContainer.style.display = ''
		}
	},

	clearOptions: function (selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild)
		}
	},

	setOptions: function (selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement('option')
			opt.value = values[i]
			opt.innerHTML = values[i]
			selector.appendChild(opt)
		}
	},
}

const body = document.body;
let bodyScrollTop = null;
let locked = false;

function getScrollbarWidth() {
	return window.innerWidth - document.documentElement.clientWidth;
}

function preventScroll(e) {
	e.preventDefault();
}

 function lockScroll () {
	bodyScrollTop = (typeof window.pageYOffset !== 'undefined') ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	var scrollBarWidth = getScrollbarWidth();
	body.style.paddingRight = scrollBarWidth + 'px';

	body.classList.add('scroll-locked');
	body.style.setProperty('--scroll', `${-bodyScrollTop + 'px'}`);
	//body.style.top = -bodyScrollTop + 'px';
	locked = true;

	document.addEventListener('scroll', preventScroll, { passive: false });
};

function unlockScroll() {
	body.classList.remove('scroll-locked');
	//body.style.top = '';
	body.style.setProperty('--scroll', `${-bodyScrollTop + 'px'}`);
	body.style.paddingRight = ''; 
	window.scrollTo(0, bodyScrollTop);

	document.removeEventListener('scroll', preventScroll);
};

class MenuDrawer extends HTMLElement {
	constructor() {
		super()

		this.mainDetailsToggle = this.querySelector('details')
		const summaryElements = this.querySelectorAll('summary')
		this.addAccessibilityAttributes(summaryElements)

		this.headerWrapper = document.querySelector('.header-wrapper')
		if (this.headerWrapper) this.headerWrapper.preventHide = false

		if (navigator.platform === 'iPhone')
			document.documentElement.style.setProperty(
				'--viewport-height',
				`${window.innerHeight}px`
			)

		this.addEventListener('keyup', this.onKeyUp.bind(this))
		this.addEventListener('focusout', this.onFocusOut.bind(this))
		this.bindEvents()
	}

	bindEvents() {
		this.querySelectorAll('summary').forEach((summary) =>
			summary.addEventListener('click', this.onSummaryClick.bind(this))
		)
		this.querySelectorAll('button').forEach((button) => {
			if (this.querySelector('.toggle-scheme-button') === button) return
			if (this.querySelector('.header__localization-button') === button) return
			if (this.querySelector('.header__localization-lang-button') === button)
				return
			button.addEventListener('click', this.onCloseButtonClick.bind(this))
		})
	}

	addAccessibilityAttributes(summaryElements) {
		summaryElements.forEach((element) => {
			element.setAttribute('role', 'button')
			element.setAttribute('aria-expanded', false)
			element.setAttribute('aria-controls', element.nextElementSibling.id)
		})
	}

	onKeyUp(event) {
		if (event.code.toUpperCase() !== 'ESCAPE') return

		const openDetailsElement = event.target.closest('details[open]')
		if (!openDetailsElement) return

		openDetailsElement === this.mainDetailsToggle
			? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary'))
			: this.closeSubmenu(openDetailsElement)
	}

	onSummaryClick(event) {
		const summaryElement = event.currentTarget
		const detailsElement = summaryElement.parentNode
		const isOpen = detailsElement.hasAttribute('open')

		if (detailsElement === this.mainDetailsToggle) {
			if (isOpen) event.preventDefault()
			isOpen
				? this.closeMenuDrawer(summaryElement)
				: this.openMenuDrawer(summaryElement)
		} else {
			trapFocus(
				summaryElement.nextElementSibling,
				detailsElement.querySelector('button')
			)

			setTimeout(() => {
				detailsElement.classList.add('menu-opening')
			})
		}
	}

	openMenuDrawer(summaryElement) {
		if (this.headerWrapper) this.headerWrapper.preventHide = true
		setTimeout(() => {
			this.mainDetailsToggle.classList.add('menu-opening')
		})
		summaryElement.setAttribute('aria-expanded', true)
		trapFocus(this.mainDetailsToggle, summaryElement)
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
	}

	closeMenuDrawer(event, elementToFocus = false) {
		if (event !== undefined) {
			this.mainDetailsToggle.classList.remove('menu-opening')
			this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
				details.removeAttribute('open')
				details.classList.remove('menu-opening')
			})
			this.mainDetailsToggle
				.querySelector('summary')
				.setAttribute('aria-expanded', false)
			document.body.classList.remove(
				`overflow-hidden-${this.dataset.breakpoint}`
			)
			removeTrapFocus(elementToFocus)
			this.closeAnimation(this.mainDetailsToggle)
			this.header =
				this.header || document.querySelector('.shopify-section-header')
			const main = document.querySelector('main')
			if (
				main
					?.querySelectorAll('.shopify-section')[0]
					?.classList.contains('section--has-overlay') &&
				!this.header.classList.contains('animate')
			) {
				this.header.classList.remove('color-background-overlay-hidden')
				const colorScheme =
					main
						.querySelectorAll('.shopify-section')[0]
						?.querySelector('[data-header-transparent]')
						?.getAttribute('data-header-transparent-color-scheme') || ''
				if (
					main
						.querySelectorAll('.shopify-section')[0]
						?.querySelector('[data-header-transparent]') &&
					this.header
						.querySelector('.header-wrapper').classList.contains('header-wrapper--full-width')
				) {
					this.header.classList.add('color-background-overlay')
					this.header.classList.add(colorScheme)
				}
			}

			if (this.headerWrapper) this.headerWrapper.preventHide = false
		}
	}

	onFocusOut(event) {
		setTimeout(() => {
			if (
				this.mainDetailsToggle.hasAttribute('open') &&
				!this.mainDetailsToggle.contains(document.activeElement)
			)
				this.closeMenuDrawer()
		})
	}

	onCloseButtonClick(event) {
		const detailsElement = event.currentTarget.closest('details')
		this.closeSubmenu(detailsElement)
	}

	closeSubmenu(detailsElement) {
		detailsElement.classList.remove('menu-opening')
		removeTrapFocus()
		this.closeAnimation(detailsElement)
	}

	closeAnimation(detailsElement) {
		let animationStart

		const handleAnimation = (time) => {
			if (animationStart === undefined) {
				animationStart = time
			}

			const elapsedTime = time - animationStart

			if (elapsedTime < 400) {
				window.requestAnimationFrame(handleAnimation)
			} else {
				detailsElement.removeAttribute('open')
				if (detailsElement.closest('details[open]')) {
					trapFocus(
						detailsElement.closest('details[open]'),
						detailsElement.querySelector('summary')
					)
				}
			}
		}

		window.requestAnimationFrame(handleAnimation)
	}
}

customElements.define('menu-drawer', MenuDrawer)

class HeaderDrawer extends MenuDrawer {
	constructor() {
		super()
		this.headerWrapper = document.querySelector('.header-wrapper')
		if (this.headerWrapper) this.headerWrapper.preventHide = false

		const overlay = document.querySelector('.header-drawer-overlay');
		if (overlay) {
			overlay.addEventListener('click', (event) => {
				this.closeMenuDrawer(event);
			});
		}
	}

	openMenuDrawer(summaryElement) {
		if (this.headerWrapper) this.headerWrapper.preventHide = true
		this.header =
			this.header || document.querySelector('.shopify-section-header')
		this.borderOffset =
			this.borderOffset ||
			this.closest('.header-wrapper').classList.contains(
				'header-wrapper--border-bottom'
			)
				? 1
				: 0

		const main = document.querySelector('main')
		if (
			main
				?.querySelectorAll('.shopify-section')[0]
				?.classList.contains('section--has-overlay')
		) {
			const colorScheme =
				main
					.querySelectorAll('.shopify-section')[0]
					?.querySelector('[data-header-transparent]')
					?.getAttribute('data-header-transparent-color-scheme') || ''
			this.header.classList.remove('color-background-overlay')
			if (colorScheme) this.header.classList.remove(colorScheme)
			const header = document.querySelector(".shopify-section-header");
			const headerTransparent = header
				.querySelector('.header-wrapper')
				.classList.contains('header-wrapper--full-width')
			const sections = main.querySelectorAll('.shopify-section')
			const sectionFirstChildTransparent = sections[0].querySelector(
				'[data-header-transparent]'
			)
			if (sectionFirstChildTransparent && headerTransparent) {
				this.header.classList.add('color-background-overlay-hidden')
			}
		}

		setTimeout(() => {
			this.mainDetailsToggle.classList.add('menu-opening')
			document.querySelector('.header-drawer-overlay').classList.add('active')
		})

		summaryElement.setAttribute('aria-expanded', true)
		trapFocus(this.mainDetailsToggle, summaryElement)
		//document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`)
		this.closest('sticky-header').disableScroll();
		lockScroll();
	}

	closeMenuDrawer(event, elementToFocus = false) {
		if (event !== undefined) {
			this.mainDetailsToggle.classList.remove('menu-opening')
			document.querySelector('.header-drawer-overlay').classList.remove('active')
			this.mainDetailsToggle.querySelectorAll('details').forEach((details) => {
				details.removeAttribute('open')
				details.classList.remove('menu-opening')
				document.querySelector('.header-drawer-overlay').classList.remove('active')
			})
			this.mainDetailsToggle
				.querySelector('summary')
				.setAttribute('aria-expanded', false)
			/*document.body.classList.remove(
				`overflow-hidden-${this.dataset.breakpoint}`
			)*/
			unlockScroll();
			this.closest('sticky-header').enableScroll();
			removeTrapFocus(elementToFocus)
			this.closeAnimation(this.mainDetailsToggle)
			this.header =
				this.header || document.querySelector('.shopify-section-header')
			const main = document.querySelector('main')
			if (
				main
					?.querySelectorAll('.shopify-section')[0]
					?.classList.contains('section--has-overlay') &&
				!this.header.classList.contains('animate')
			) {
				this.header.classList.remove('color-background-overlay-hidden')
				const colorScheme =
					main
						.querySelectorAll('.shopify-section')[0]
						?.querySelector('[data-header-transparent]')
						?.getAttribute('data-header-transparent-color-scheme') || ''
				if (
					main
						.querySelectorAll('.shopify-section')[0]
						?.querySelector('[data-header-transparent]') &&
					this.header
						.querySelector('.header-wrapper').classList.contains('header-wrapper--full-width')
				) {
					this.header.classList.add('color-background-overlay')
					this.header.classList.add(colorScheme)
				}
			}

			if (this.headerWrapper) this.headerWrapper.preventHide = false
		}
	}
}

customElements.define('header-drawer', HeaderDrawer)

class ModalDialog extends HTMLElement {
	constructor() {
		super()
		this.querySelector('[id^="ModalClose-"]').addEventListener(
			'click',
			this.hide.bind(this, false)
		)
		this.addEventListener('keyup', (event) => {
			if (event.code.toUpperCase() === 'ESCAPE') this.hide()
		})
		if (this.classList.contains('media-modal')) {
			this.addEventListener('pointerup', (event) => {
				if (
					event.pointerType === 'mouse' &&
					!event.target.closest('deferred-media, product-model')
				)
					this.hide()
			})
		} else {
			this.addEventListener('click', (event) => {
				if (event.target === this) this.hide()
			})
		}
	}

	connectedCallback() {
		if (this.moved) return
		this.moved = true
		document.body.appendChild(this)
	}

	show(opener) {
		this.openedBy = opener
		const popup = this.querySelector('.template-popup')
		document.body.classList.add('overflow-hidden-modal')
		this.setAttribute('open', '')
		if (popup) popup.loadContent()
		trapFocus(this, this.querySelector('[role="dialog"]'))
		window.pauseAllMedia()
	}

	hide() {
		let isOpen = false

		this.removeAttribute('open')
		removeTrapFocus(this.openedBy)
		window.pauseAllMedia()

		document.querySelectorAll('body > quick-add-modal').forEach((el) => {
			if (el.hasAttribute('open')) {
				isOpen = true
			}
		})

		if (!isOpen) {
			document.body.classList.remove('overflow-hidden-modal')
			document.body.dispatchEvent(new CustomEvent('modalClosed'))
		}

		const images = document.querySelector('.product-media-modal__content')

		if (images) {
			images.classList.remove('zoom')
		}

		if (this.id == "PopupModal-noaddtocart" && typeof triggerAddToCart == "function"){
			triggerAddToCart(this);
		}
	}
}

customElements.define('modal-dialog', ModalDialog)
class BulkModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      if (this.innerHTML.trim() === '') {
        const productUrl = this.dataset.url.split('?')[0];
        fetch(`${productUrl}?section_id=bulk-quick-order-list`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            const sourceQty = html.querySelector('.quick-order-list-container').parentNode;
            this.innerHTML = sourceQty.innerHTML;
          })
          .catch((e) => {
            console.error(e);
          });
      }
    };

    new IntersectionObserver(handleIntersection.bind(this)).observe(
      document.querySelector(`#QuickBulk-${this.dataset.productId}-${this.dataset.sectionId}`)
    );
  }
}

customElements.define('bulk-modal', BulkModal);
class ModalOpener extends HTMLElement {
	constructor() {
		super()

		const button = this.querySelector('button')

		if (!button) return
		button.addEventListener('click', () => {
			const modal = document.querySelector(this.getAttribute('data-modal'))
			if (modal) modal.show(button)
		})
	}
}

customElements.define('modal-opener', ModalOpener)

class DeferredMedia extends HTMLElement {
	constructor() {
		super()
		this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener(
			'click',
			this.loadContent.bind(this)
		)
	}

	loadContent() {
		if (!this.getAttribute('loaded')) {
			const content = document.createElement('div')
			content.appendChild(
				this.querySelector('template').content.firstElementChild.cloneNode(true)
			)

			this.setAttribute('loaded', true)
			window.pauseAllMedia()
			this.appendChild(
				content.querySelector('video, model-viewer, iframe')
			).focus()

			if (
				this.closest('.swiper')?.swiper.slides[
					this.closest('.swiper').swiper.activeIndex
				].querySelector('model-viewer')
			) {
				if (
					!this.closest('.swiper')
						.swiper.slides[
							this.closest('.swiper').swiper.activeIndex
						].querySelector('model-viewer')
						.classList.contains('shopify-model-viewer-ui__disabled')
				) {
					this.closest('.swiper').swiper.params.noSwiping = true
					this.closest('.swiper').swiper.params.noSwipingClass = 'swiper-slide'
				}
			}
		}
	}
}

customElements.define('deferred-media', DeferredMedia)

class VariantSelects extends HTMLElement {
	constructor() {
		super()
		this.addEventListener('change', this.onVariantChange)
	}

	onVariantChange(event) {
		this.getAvailableVariant(event)
		this.updateOptions()
		this.updateMasterId()
		this.toggleAddButton(true, '', false)
		this.updatePickupAvailability()
		this.updateVariantStatuses()

		if (!this.currentVariant) {
			this.toggleAddButton(true, '', true)
			this.setUnavailable()
		} else {
			if (!this.closest('floated-form')) {
				this.updateMedia()
			}
			this.updateURL()
			this.updateVariantInput()
			this.resetProductFormState()
			this.renderProductInfo()
		}
	}

	getAvailableVariant(event) {
		if (this.variantData || this.querySelector('[type="application/json"]')) {
			let fixedOptionValue
			const fieldsets = this.querySelectorAll('fieldset')

			if (event.target.tagName == 'SELECT') {
				fixedOptionValue =
					event.target.options[event.target.selectedIndex].value
			} else if (event.target.tagName == 'INPUT') {
				fixedOptionValue = event.target.value
			}

			fieldsets.forEach((fieldset, index) => {
				const select = fieldset.querySelector('select[name^="options"]')
				const radio = fieldset.querySelector(
					`input[type="radio"][value="${fixedOptionValue}"]`
				)

				if (select) {
					if (select.name.includes(event.target.name)) {
						this.fixedSelectIndex = index
					}
				} else if (radio) {
					this.fixedSelectIndex = index
				}
			})

			const fixedOptionValues = Array.from(fieldsets)
				.slice(0, this.fixedSelectIndex + 1)
				.map((fieldset) => {
					const select = fieldset.querySelector('select[name^="options"]')
					if (select) {
						return select.options[select.selectedIndex].value
					}
					const radioSelected = fieldset.querySelector(
						'input[type="radio"]:checked'
					)
					if (radioSelected) {
						return radioSelected.value
					}
					return null
				})
				.filter((value) => value !== null)

			this.availableVariant = this.getVariantData().find(
				(variant) =>
					variant.available &&
					fixedOptionValues.every(
						(value, index) => variant[`option${index + 1}`] === value
					)
			)

			if (!this.availableVariant) {
				this.availableVariant = this.getVariantData().find(
					(variant) =>
						variant.available &&
						variant[`option${this.fixedSelectIndex + 1}`] === fixedOptionValue
				)
			}
		}
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll('.js-radio-colors'))

		this.options = Array.from(
			this.querySelectorAll('select'),
			(select) => select.value
		).concat(
			fieldsets.map((fieldset) => {
				return Array.from(fieldset.querySelectorAll('input')).find(
					(radio) => radio.checked
				).value
			})
		)
	}

	updateMasterId() {
		if (this.variantData || this.querySelector('[type="application/json"]')) {
			this.currentVariant = this.getVariantData().find((variant) => {
				this.options.sort()
				variant.options.sort()

				return !variant.options
					.map((option, index) => {
						return this.options[index] === option
					})
					.includes(false)
			})

			if (
				(!this.currentVariant || !this.currentVariant?.available) &&
				this.availableVariant
			) {
				this.currentVariant = this.availableVariant

				const fieldsets = this.querySelectorAll('fieldset')

				fieldsets.forEach((fieldset, index) => {
					const optionValue = this.currentVariant[`option${index + 1}`]
					const select = fieldset.querySelector('select[name^="options"]')
					const radioToSelect = fieldset.querySelector(
						`input[type="radio"][value="${optionValue}"]`
					)

					if (index != this.fixedSelectIndex) {
						if (select) {
							select.value = optionValue
						} else if (radioToSelect) {
							radioToSelect.checked = true
						}
					}
				})
			}
		}
	}

	isHidden(elem) {
		const styles = window.getComputedStyle(elem)
		return styles.display === 'none' || styles.visibility === 'hidden'
	}

	updateMedia() {
		if (!this.currentVariant || !this.currentVariant?.featured_media) return

		const swiperWrappers = document.querySelectorAll('.product__media-wrapper')

		swiperWrappers.forEach((elem) => {
			if (!this.isHidden(elem)) {
				const newMedia = elem.querySelector(
					`[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
				)

				if (elem.querySelector('.js-media-list')) {
					elem
						.querySelector('.js-media-list')
						.swiper.slideTo(
							elem
								.querySelector('.js-media-list')
								.swiper.slides.indexOf(newMedia)
						)
				}
			}
		})
	}

	updateURL() {
		if (!this.classList.contains('featured-product-radios')) {
			if (!this.currentVariant || this.dataset.updateUrl === 'false') return
			window.history.replaceState(
				{},
				'',
				`${this.dataset.url}?variant=${this.currentVariant.id}`
			)
		}
	}

	updateVariantInput() {
		const productForms = document.querySelectorAll(
			`#product-form-${this.dataset.section}, #product-form-installment-${this.dataset.section}`
		)
		productForms.forEach((productForm) => {
			const input = productForm.querySelector('input[name="id"]')
			input.value = this.currentVariant.id
			input.dispatchEvent(new Event('change', { bubbles: true }))
		})
	}

	updateVariantStatuses() {
		const selectedOptionOneVariants = this.variantData.filter(
			(variant) => this.querySelector(':checked').value === variant.option1
		)
		const inputWrappers = [...this.querySelectorAll('.product-form__controls')]
		inputWrappers.forEach((option, index) => {
			if (index === 0) return
			const optionInputs = [
				...option.querySelectorAll('input[type="radio"], option'),
			]
			const previousOptionSelected =
				inputWrappers[index - 1].querySelector(':checked').value
			const availableOptionInputsValue = selectedOptionOneVariants
				.filter(
					(variant) =>
						variant.available &&
						variant[`option${index}`] === previousOptionSelected
				)
				.map((variantOption) => variantOption[`option${index + 1}`])
			this.setInputAvailability(optionInputs, availableOptionInputsValue)
		})
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
				if (input.tagName === 'OPTION') {
					input.innerText = input.getAttribute('value')
				} else if (input.tagName === 'INPUT') {
					input.classList.remove('disabled')
				}
			} else {
				if (input.tagName === 'OPTION') {
					input.innerText =
						window.variantStrings.unavailable_with_option.replace(
							'[value]',
							input.getAttribute('value')
						)
				} else if (input.tagName === 'INPUT') {
					input.classList.add('disabled')
				}
			}
		})
	}

	updatePickupAvailability() {
		const pickUpAvailability = document.querySelector('pickup-availability')
		if (!pickUpAvailability) return

		if (this.currentVariant && this.currentVariant.available) {
			pickUpAvailability.fetchAvailability(this.currentVariant.id)
		} else {
			pickUpAvailability.removeAttribute('available')
			pickUpAvailability.innerHTML = ''
		}
	}

	renderProductInfo() {
		const requestedVariantId = this.currentVariant.id
		const sectionId = this.dataset.originalSection
			? this.dataset.originalSection
			: this.dataset.section

		fetch(
			`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${
				this.dataset.originalSection
					? this.dataset.originalSection
					: this.dataset.section
			}`
		)
			.then((response) => response.text())
			.then((responseText) => {
				// prevent unnecessary ui changes from abandoned selections
				if (!this.currentVariant) return
				if (this.currentVariant.id !== requestedVariantId) return

				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const destination = document.getElementById(
					`price-${this.dataset.section}`
				)
				const source = html.getElementById(
					`price-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				)
				const skuSource = html.getElementById(
					`Sku-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				)
				const skuDestination = document.getElementById(
					`Sku-${this.dataset.section}`
				)
				const inventorySource = html.getElementById(
					`Inventory-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				)
				const inventoryDestination = document.getElementById(
					`Inventory-${this.dataset.section}`
				)
				const colorNameSource = html.getElementById(
					`ColorName-${
						this.dataset.originalSection
							? this.dataset.originalSection
							: this.dataset.section
					}`
				)
				const colorNameDestination = document.getElementById(
					`ColorName-${this.dataset.section}`
				)

				if (source && destination) destination.innerHTML = source.innerHTML
				if (inventorySource && inventoryDestination)
					inventoryDestination.innerHTML = inventorySource.innerHTML
				if (skuSource && skuDestination) {
					skuDestination.innerHTML = skuSource.innerHTML
					skuDestination.classList.toggle(
						'visibility-hidden',
						skuSource.classList.contains('visibility-hidden')
					)
				}
				if (colorNameSource && colorNameDestination)
					colorNameDestination.innerHTML = colorNameSource.innerHTML

				const price = document.getElementById(`price-${this.dataset.section}`)

				if (price) price.classList.remove('visibility-hidden')

				if (inventoryDestination)
					inventoryDestination.classList.toggle(
						'visibility-hidden',
						inventorySource.innerText === ''
					)

				this.parent_el = this.closest('.product__info-container');
				if(this.parent_el.querySelector('.product-form__input')){
					this.parent_el.querySelector('.product-form__input').innerHTML = html.querySelector('.product-form__input').innerHTML;
					this.parent_el.querySelector('.quantity-message').classList.add('hidden');
				}

				this.toggleAddButton(
					!this.currentVariant.available,
					window.variantStrings.soldOut
				)
			})
	}

	toggleAddButton(disable = true, text, modifyClass = true) {
		const productForm = document.getElementById(
			`product-form-${this.dataset.section}`
		)
		if (!productForm) return
		const addButton = productForm.querySelector('[name="add"]')
		const addButtonText = productForm.querySelector('[name="add"] > span')
		if (!addButton) return

		if (disable) {
			addButton.setAttribute('disabled', 'disabled')
			if (text) addButtonText.textContent = text
		} else {
			addButton.removeAttribute('disabled')
			addButtonText.textContent = window.variantStrings.addToCart
		}

		if (!modifyClass) return
	}

	setUnavailable() {
		const button = document.getElementById(
			`product-form-${this.dataset.section}`
		)
		const addButton = button.querySelector('[name="add"]')
		const price = document.getElementById(`price-${this.dataset.section}`)
		const inventory = document.getElementById(
			`Inventory-${this.dataset.section}`
		)
		const sku = document.getElementById(`Sku-${this.dataset.section}`)

		if (!addButton) return
		this.toggleAddButton(true, window.variantStrings.unavailable)
		if (price) price.classList.add('visibility-hidden')
		if (inventory) inventory.classList.add('visibility-hidden')
		if (sku) sku.classList.add('visibility-hidden')
	}

	resetProductFormState() {
		const productForm = document
			.getElementById(`product-form-${this.dataset.section}`)
			.closest('product-form')
		if (productForm) {
			const quantity = productForm.querySelector('quantity-input')
			if (quantity) quantity.input.value = 1
			productForm?.handleErrorMessage()
		}
	}

	getVariantData() {
		this.variantData =
			this.variantData ||
			JSON.parse(this.querySelector('[type="application/json"]').textContent)
		return this.variantData
	}
}

customElements.define('variant-selects', VariantSelects)

class VariantRadios extends VariantSelects {
	constructor() {
		super()
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute('value'))) {
				input.classList.remove('disabled')
			} else {
				input.classList.add('disabled')
			}
		})
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll('fieldset'))
		this.options = fieldsets.map((fieldset) => {
			return Array.from(fieldset.querySelectorAll('input')).find(
				(radio) => radio.checked
			).value
		})
	}
}

customElements.define('variant-radios', VariantRadios)

class PasswordViewer {
	constructor() {
		const passwordField = document.querySelectorAll('.field--pass')

		passwordField.forEach((el) => {
			const input = el.querySelector('input')
			const btnWrapper = el.querySelector('.button-pass-visibility')
			const btnOpen = el.querySelector('.icon-eye-close')
			const btnClose = el.querySelector('.icon-eye')

			input.addEventListener('input', () => {
				input.value !== ''
					? (btnWrapper.style.display = 'block')
					: (btnWrapper.style.display = 'none')
			})

			btnOpen.addEventListener('click', () => {
				input.type = 'text'
				btnOpen.style.display = 'none'
				btnClose.style.display = 'block'
			})

			btnClose.addEventListener('click', () => {
				input.type = 'password'
				btnOpen.style.display = 'block'
				btnClose.style.display = 'none'
			})
		})
	}
}

class ProductRecommendations extends HTMLElement {
	constructor() {
		super()

		const handleIntersection = (entries, observer) => {
			if (!entries[0].isIntersecting) return
			observer.unobserve(this)

			if (this.querySelector('.product-recommendations__loading')) {
				this.querySelector('.product-recommendations__loading').classList.add(
					'loading'
				)
				this.querySelector('.product-recommendations__loading').style.display =
					'flex'
			}

			fetch(this.dataset.url)
				.then((response) => response.text())
				.then((text) => {
					const html = document.createElement('div')
					html.innerHTML = text
					const recommendations = html.querySelector('product-recommendations')
					if (recommendations && recommendations.innerHTML.trim().length) {
						this.innerHTML = recommendations.innerHTML
					}

					if (this.querySelector('.product-recommendations__empty')) {
						this.querySelector(
							'.product-recommendations__empty'
						).style.display = 'flex'
					}

					/* Color swatches */
					const generateSrcset = (image, widths = []) => {
						const imageUrl = new URL(image['src'])
						return widths
							.filter((width) => width <= image['width'])
							.map((width) => {
								imageUrl.searchParams.set('width', width.toString())
								return `${imageUrl.href} ${width}w`
							})
							.join(', ')
					}

					const createImageElement = (image, classes, sizes, productTitle) => {
						const previewImage = image['preview_image']
						const newImage = new Image(
							previewImage['width'],
							previewImage['height']
						)
						newImage.className = classes
						newImage.alt = image['alt'] || productTitle
						newImage.sizes = sizes
						newImage.src = previewImage['src']
						newImage.srcset = generateSrcset(
							previewImage,
							[165, 360, 533, 720, 940, 1066]
						)
						newImage.loading = 'lazy'
						return newImage
					}

					const checkSwatches = () => {
						document
							.querySelectorAll('.js-color-swatches-wrapper')
							.forEach((wrapper) => {
								wrapper
									.querySelectorAll('.js-color-swatches input')
									.forEach((input) => {
										input.addEventListener('click', (event) => {
											const primaryImage =
												wrapper.querySelector('.media--first')
											const secondaryImage =
												wrapper.querySelector('.media--second')
											const handleProduct = wrapper.dataset.product

											if (event.currentTarget.checked && primaryImage) {
												wrapper
													.querySelector('.js-color-swatches-link')
													.setAttribute(
														'href',
														event.currentTarget.dataset.variantLink
													)
												if (
													wrapper.querySelector(
														'.card__add-to-cart button[name="add"]'
													)
												) {
													wrapper
														.querySelector(
															'.card__add-to-cart button[name="add"]'
														)
														.setAttribute('aria-disabled', false)
													if (
														wrapper.querySelector(
															'.card__add-to-cart button[name="add"] > span'
														)
													) {
														wrapper
															.querySelector(
																'.card__add-to-cart button[name="add"] > span'
															)
															.classList.remove('hidden')
														wrapper
															.querySelector(
																'.card__add-to-cart button[name="add"] .sold-out-message'
															)
															.classList.add('hidden')
													}
													wrapper.querySelector(
														'.card__add-to-cart input[name="id"]'
													).value = event.currentTarget.dataset.variantId
												}
												const currentColor = event.currentTarget.value

												jQuery.getJSON(
													window.Shopify.routes.root +
														`products/${handleProduct}.js`,
													function (product) {
														const variant = product.variants.filter(
															(item) =>
																item.featured_media != null &&
																item.options.includes(currentColor)
														)[0]

														if (variant) {
															const newPrimaryImage = createImageElement(
																variant['featured_media'],
																primaryImage.className,
																primaryImage.sizes,
																product.title
															)

															if (newPrimaryImage.src !== primaryImage.src) {
																let flag = false
																if (secondaryImage) {
																	const secondaryImagePathname = new URL(
																		secondaryImage.src
																	).pathname
																	const newPrimaryImagePathname = new URL(
																		newPrimaryImage.src
																	).pathname

																	if (
																		secondaryImagePathname ==
																		newPrimaryImagePathname
																	) {
																		primaryImage.remove()
																		secondaryImage.classList.remove(
																			'media--second'
																		)
																		secondaryImage.classList.add('media--first')
																		flag = true
																	}
																}
																if (flag == false) {
																	primaryImage.animate(
																		{ opacity: [1, 0] },
																		{
																			duration: 200,
																			easing: 'ease-in',
																			fill: 'forwards',
																		}
																	).finished
																	setTimeout(function () {
																		primaryImage.replaceWith(newPrimaryImage)
																		newPrimaryImage.animate(
																			{ opacity: [0, 1] },
																			{ duration: 200, easing: 'ease-in' }
																		)
																		if (secondaryImage) {
																			secondaryImage.remove()
																		}
																	}, 200)
																}
															}
														}
													}
												)
											}
										})
									})
							})
					}

					checkSwatches()

					const addClasses = (slider) => {
						const sliderWrapper = slider.querySelector(
							'.product-recommendations__wrapper'
						)
						const slides = slider.querySelectorAll(
							'.product-recommendations__item'
						)

						slider.classList.add('swiper')
						if (sliderWrapper) sliderWrapper.classList.add('swiper-wrapper')

						if (slides.length > 1) {
							slides.forEach((slide) => {
								slide.classList.add('swiper-slide')
							})
						}
					}

					const initSlider = () => {
						const productSlider = () => {
							const productSliders = Array.from(
								document.querySelectorAll('.products-slider')
							)
							if (productSliders.length === 0) return
							productSliders.forEach((slider) => {
								const sectionId = slider.dataset.id
								const perRow = +slider.dataset.perRow
								let perRowTablet
								let perRowDesktop
								let perRowLarge
								const speed = slider.dataset.speed * 1000
								const delay = slider.dataset.delay * 1000
								const productLimit = +slider.dataset.productLimit
								const autoplay = toBoolean(slider.dataset.autoplay)
								const stopAutoplay = toBoolean(slider.dataset.stopAutoplay)
								const showArrows = toBoolean(slider.dataset.showArrows)
								const productCount = +slider.dataset.productCount
								let autoplayParm = {}
								let arrowsParm = {}
								let paginationParm = {}

								if (
									autoplay &&
									productCount > perRow &&
									productLimit > perRow
								) {
									autoplayParm = {
										autoplay: {
											delay: delay,
											pauseOnMouseEnter: stopAutoplay,
											disableOnInteraction: false,
										},
									}
								}
								if (showArrows) {
									arrowsParm = {
										navigation: {
											nextEl: `#${sectionId} .swiper-button-next`,
											prevEl: `#${sectionId} .swiper-button-prev`,
										},
									}
								}
								const containerOuter =
									(document.body.offsetWidth -
										document.querySelector(`#${sectionId} .popular-product__wrapper`)
											.offsetWidth) /
									2

								document.querySelector(
									`#${sectionId} .swiper-pagination`
								).style.paddingLeft = `${containerOuter}px`
								const buttonNext = document.querySelector(
									`#${sectionId} .swiper-button-next`
								)
								const buttonPrev = document.querySelector(
									`#${sectionId} .swiper-button-prev`
								)
								if (buttonNext && buttonPrev) {
									if (window.innerWidth >= 1200) {
										const buttonOffset = +containerOuter - 21

										buttonNext.style.right = `${buttonOffset}px`
										buttonPrev.style.left = `${buttonOffset}px`
									} else {
										buttonNext.style.right = `${containerOuter + 21}px`
										buttonPrev.style.left = `${containerOuter + 21}px`
									}
								}

								const sectionHeader = document.querySelector(
									'.popular-products .popular-product__wrapper'
								)
								let columnGaps = (perRow - 1) * 16
								let oneCard = (sectionHeader.offsetWidth - columnGaps) / perRow
								let perViewRightOffset = +(
									(containerOuter * 2) /
									oneCard
								).toFixed(3)

								perViewRightOffset =
									+((containerOuter * 2) / oneCard).toFixed(3) -
									+(perViewRightOffset / oneCard) * 16

								if (perRow == 1) {
									perRowTablet =
										perRowDesktop =
										perRowLarge =
											1 + perViewRightOffset
								} else {
									let columnGapsTablet = (2 - 1) * 16
									let columnGaps = (3 - 1) * 16
									let oneCard = (sectionHeader.offsetWidth - columnGaps) / 3
									let oneCardTablet =
										(sectionHeader.offsetWidth - columnGapsTablet) / 2

									let perViewRightOffsetDekstop =
										+((containerOuter * 2) / oneCard).toFixed(3) -
										+(perViewRightOffset / oneCard) * 16
									let perViewRightOffsetTablet =
										+((containerOuter * 2) / oneCardTablet).toFixed(3) -
										+(perViewRightOffset / oneCardTablet) * 16

									perRowTablet = 2 + perViewRightOffsetTablet
									perRowDesktop = 3 + perViewRightOffsetDekstop
									perRowLarge = perRow + perViewRightOffset
								}
								if (perRow == 2) {
									perRowTablet =
										perRowDesktop =
										perRowLarge =
											2 + perViewRightOffset
								}

								if (productCount > 4) {
									paginationParm = {
										pagination: {
											el: `#${sectionId} .swiper-pagination`,
											clickable: true,
										},
									}
								}

								let swiperParms = {
									speed: speed,
									keyboard: true,
									slidesPerView: 1.1,
									spaceBetween: 10,
									slidesOffsetBefore: containerOuter,
									breakpoints: {
										576: {
											slidesPerView: perRowTablet,
										},
										750: {
											spaceBetween: 16,
											slidesPerView: perRowTablet,
										},
										990: {
											spaceBetween: 16,
											slidesPerView: perRowDesktop,
										},
										1200: {
											spaceBetween: 16,
											slidesPerView: perRow + perViewRightOffset,
										},
										1800: {
											spaceBetween: 16,
											slidesPerView: perRowLarge,
										},
										2000: {
											spaceBetween: 16,
											slidesPerView: perRowLarge,
										},
									},
									...paginationParm,
									...arrowsParm,
									...autoplayParm,
								}
								function changeBtnPosition() {
									if (window.innerWidth < 750) {
										document
											.querySelectorAll(`#${sectionId} .swiper-button`)
											.forEach((button) => {
												button.style.display = 'none'
											})
										return
									}
									const image1 = document.querySelectorAll(
										`#${sectionId} .swiper .product-card .card`
									)[0]

									if (image1) {
										document
											.querySelectorAll(`#${sectionId} .swiper-button`)
											.forEach((button) => {
												button.style.display = 'block'
												button.style.top = image1.offsetHeight / 2 - 15 + 'px'
											})
									}
								}
								const swiper = new Swiper(`#${sectionId} .swiper`, swiperParms)

								swiper.on('slideChange', function () {
									let allBullets = document.querySelectorAll(
										`#${sectionId} .swiper-pagination-bullet`
									)
									if (allBullets && allBullets.length > 0) {
										allBullets.forEach((item) => {
											item.classList.remove('swiper-pagination-bullet-active')
										})
										allBullets[swiper.activeIndex].classList.add(
											'swiper-pagination-bullet-active'
										)
									}
								})
								changeBtnPosition()
							})
						}

						function toBoolean(string) {
							return string === 'true' ? true : false
						}
						if (document.querySelector('product-recommendations') !== null) {
							const initslider = setInterval(() => {
								if (
									document
										.querySelector('product-recommendations')
										.querySelector('.swiper') !== null
								) {
									if (
										document
											.querySelector('product-recommendations')
											.querySelector('.swiper')
											.classList.contains('swiper-initialized')
									) {
										clearInterval(initslider)
									}
									productSlider()
								}
							}, 100)
						}

						productSlider()
						document.addEventListener('shopify:section:load', function () {
							productSlider()
						})
						window.addEventListener('resize', function () {
							productSlider()
						})
					}

					//const destroySlider = () => {
					//	const slider = this.querySelector('.swiper--recomend-products')

					//	if (slider) {
					//		removeClasses(slider)
					//	}
					//}

					const initSection = () => {
						const resizeObserver = new ResizeObserver((entries) => {
							const [entry] = entries
							initSlider()
						})

						resizeObserver.observe(this)
					}

					initSection()
				})
				.catch((e) => {
					console.error(e)
				})
				.finally(() => {
					if (this.querySelector('.product-recommendations__loading')) {
						this.querySelector(
							'.product-recommendations__loading'
						).classList.remove('loading')
						this.querySelector('.product-recommendations__loading').remove()
					}
				})
		}

		new IntersectionObserver(handleIntersection.bind(this), {
			rootMargin: '0px 0px 200px 0px',
		}).observe(this)
	}
}

customElements.define('product-recommendations', ProductRecommendations)

class LocalizationForm extends HTMLElement {
	constructor() {
		super()
		this.elements = {
			input: this.querySelector(
				'input[name="locale_code"], input[name="country_code"]'
			),
			button: this.querySelector('button'),
			panel: this.querySelector('ul'),
		}
		this.elements.button.addEventListener('click', this.openSelector.bind(this))
		this.elements.button.addEventListener(
			'focusout',
			this.closeSelector.bind(this)
		)
		this.addEventListener('keyup', this.onContainerKeyUp.bind(this))

		this.querySelectorAll('a').forEach((item) =>
			item.addEventListener('click', this.onItemClick.bind(this))
		)
	}

	hidePanel() {
		this.elements.button.setAttribute('aria-expanded', 'false')
		this.elements.panel.setAttribute('hidden', true)
	}

	onContainerKeyUp(event) {
		if (event.code.toUpperCase() !== 'ESCAPE') return

		this.hidePanel()
		this.elements.button.focus()
	}

	onItemClick(event) {
		event.preventDefault()
		this.elements.input.value = event.currentTarget.dataset.value
		this.querySelector('form')?.submit()
	}

	openSelector() {
		this.elements.button.focus()
		this.elements.panel.toggleAttribute('hidden')
		this.elements.button.setAttribute(
			'aria-expanded',
			(
				this.elements.button.getAttribute('aria-expanded') === 'false'
			).toString()
		)
	}

	closeSelector(event) {
		if (!this.contains(event.relatedTarget)) {
			this.hidePanel()
		}
	}
}

customElements.define('localization-form', LocalizationForm);
class BulkAdd extends HTMLElement {
  static ASYNC_REQUEST_DELAY = 0;

  constructor() {
    super();
    this.queue = [];
    this.setRequestStarted(false);
    this.ids = [];
  }

  startQueue(id, quantity) {
    this.queue.push({ id, quantity });

    const interval = setInterval(() => {
      if (this.queue.length > -1) {
        if (!this.requestStarted) {
          this.sendRequest(this.queue);
        }
				clearInterval(interval);
      } else {
        clearInterval(interval);
      }
    }, BulkAdd.ASYNC_REQUEST_DELAY);
  }

  sendRequest(queue) {
    this.setRequestStarted(true);
    const items = {};

    queue.forEach((queueItem) => {
      items[parseInt(queueItem.id)] = queueItem.quantity;
    });
    this.queue = this.queue.filter((queueElement) => !queue.includes(queueElement));

    this.updateMultipleQty(items);
  }

  setRequestStarted(requestStarted) {
    this._requestStarted = requestStarted;
  }

  get requestStarted() {
    return this._requestStarted;
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {		
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;

    if (inputValue < event.target.dataset.min) {			
      this.setValidity(event, index, window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min));
    } else if (inputValue > parseInt(event.target.max)) {			
      this.setValidity(event, index, window.quickOrderListStrings.max_error.replace('[max]', event.target.max));
    } else if (inputValue % parseInt(event.target.step) != 0) {			
      this.setValidity(event, index, window.quickOrderListStrings.step_error.replace('[step]', event.target.step));
    } else {			
      event.target.setCustomValidity('');
      event.target.reportValidity();
      event.target.setAttribute('value', inputValue);
      this.startQueue(index, inputValue);
    }
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }
}

if (!customElements.get('bulk-add')) {
  customElements.define('bulk-add', BulkAdd);
}
(function () {
	const initHeaderOverlay = () => {
		const main = document.getElementById('MainContent')
		const sections = main.querySelectorAll('.shopify-section')

		if (sections.length > 0) {
			const sectionFirstChild = sections[0].querySelector(
				'[data-header-overlay]'
			)
			const sectionFirstChildTransparent = sections[0].querySelector(
				'[data-header-transparent]'
			)
			const headerGroupSections = document.querySelectorAll(
				'.shopify-section-group-header-group'
			)
			const header = document.querySelector('.shopify-section-header')
			const headerTransparent = header
				.querySelector('.header-wrapper')
				.classList.contains('header-wrapper--full-width')
			const colorScheme = sectionFirstChild?.getAttribute(
				'data-header-transparent-color-scheme'
			)

			if (sectionFirstChild) {
				if (headerGroupSections[headerGroupSections.length - 1] === header) {
					sections[0].classList.add('section--has-overlay')
					if (sectionFirstChildTransparent && headerTransparent) {
						header.classList.add('color-background-overlay')
						header.classList.forEach((className) => {
							if (
								className.startsWith('color-background-') &&
								className != 'color-background-overlay'
							) {
								header.classList.remove(className)
							}
						})
						header.classList.add(colorScheme)
					}
				} else {
					sections[0].classList.remove('section--has-overlay')
					if (sectionFirstChildTransparent && headerTransparent) {
						header.classList.remove('color-background-overlay')
						//header.classList.remove(colorScheme)
						header.classList.forEach((className) => {
							if (
								className.startsWith('color-background-') &&
								className != 'color-background-overlay'
							) {
								header.classList.remove(className)
							}
						})
					}
				}
			} else {
				sections[0].classList.remove('section--has-overlay')
				if (sectionFirstChildTransparent && headerTransparent) {
					header.classList.remove('color-background-overlay')
					//header.classList.remove(colorScheme)
					header.classList.forEach((className) => {
						if (
							className.startsWith('color-background-') &&
							className != 'color-background-overlay'
						) {
							header.classList.remove(className)
						}
					})
				}
			}
		}
	}

	initHeaderOverlay()

	document.addEventListener('shopify:section:load', initHeaderOverlay)
	document.addEventListener('shopify:section:unload', initHeaderOverlay)
	document.addEventListener('shopify:section:reorder', initHeaderOverlay)
})()
;(function () {
	const productSlider = () => {
		const productSliders = Array.from(
			document.querySelectorAll('.popular-products-section .products-slider')
		)
		if (productSliders.length === 0) return
		productSliders.forEach((slider) => {
			const sectionId = slider.dataset.id
			const perRow = +slider.dataset.perRow
			let perRowTablet
			let perRowDesktop
			let perRowLarge
			const speed = slider.dataset.speed * 1000
			const delay = slider.dataset.delay * 1000
			const autoplay = toBoolean(slider.dataset.autoplay)
			const stopAutoplay = toBoolean(slider.dataset.stopAutoplay)
			const showArrows = toBoolean(slider.dataset.showArrows)
			let autoplayParm = {}
			let arrowsParm = {}
			if (autoplay) {
				autoplayParm = {
					autoplay: {
						delay: delay,
						pauseOnMouseEnter: stopAutoplay,
						disableOnInteraction: false,
					},
				}
			}
			if (showArrows) {
				arrowsParm = {
					navigation: {
						nextEl: `#${sectionId} .swiper-button-next`,
						prevEl: `#${sectionId} .swiper-button-prev`,
					},
				}
			}
			const containerOuter =
				(document.body.offsetWidth -
					document.querySelector(`#${sectionId} .popular-product__wrapper`).offsetWidth) /
				2
			
			document.querySelector(
				`#${sectionId} .swiper-pagination`
			).style.padding = `0 ${containerOuter}px 1rem`
			const buttonNext = document.querySelector(
				`#${sectionId} .swiper-button-next`
			)
			const buttonPrev = document.querySelector(
				`#${sectionId} .swiper-button-prev`
			)
			if (buttonNext && buttonPrev) {
				if (window.innerWidth >= 1200) {
					const buttonOffset = +containerOuter - 21

					buttonNext.style.right = `${buttonOffset}px`
					buttonPrev.style.left = `${buttonOffset}px`
				} else {
					buttonNext.style.right = `${containerOuter + 21}px`
					buttonPrev.style.left = `${containerOuter + 21}px`
				}
			}

			const sectionHeader = document.querySelector(
				'.popular-products .popular-product__wrapper'
			)
			let columnGaps = (perRow - 1) * 16
			let oneCard = (sectionHeader.offsetWidth - columnGaps) / perRow
			let perViewRightOffset = +((containerOuter * 2) / oneCard).toFixed(3)

			perViewRightOffset =
				+((containerOuter * 2) / oneCard).toFixed(3) -
				+(perViewRightOffset / oneCard) * 16

			if (perRow == 1) {
				perRowTablet = perRowDesktop = perRowLarge = 1 + perViewRightOffset
			} else {
				let columnGapsTablet = (2 - 1) * 16
				let columnGaps = (3 - 1) * 16
				let oneCard = (sectionHeader.offsetWidth - columnGaps) / 3
				let oneCardTablet = (sectionHeader.offsetWidth - columnGapsTablet) / 2

				let perViewRightOffsetDekstop =
					+((containerOuter * 2) / oneCard).toFixed(3) -
					+(perViewRightOffset / oneCard) * 16
				let perViewRightOffsetTablet =
					+((containerOuter * 2) / oneCardTablet).toFixed(3) -
					+(perViewRightOffset / oneCardTablet) * 16

				perRowTablet = 2 + perViewRightOffsetTablet
				perRowDesktop = 3 + perViewRightOffsetDekstop
				perRowLarge = perRow + perViewRightOffset
			}
			if (perRow == 2) {
				perRowTablet = perRowDesktop = perRowLarge = 2 + perViewRightOffset
			}

			let swiperParms = {
				speed: speed,
				keyboard: true,
				slidesPerView: 1.1,
				spaceBetween: 10,
				slidesOffsetBefore: containerOuter,
				breakpoints: {
					576: {
						slidesPerView: perRowTablet,
					},
					750: {
						spaceBetween: 16,
						slidesPerView: perRowTablet,
					},
					990: {
						spaceBetween: 16,
						slidesPerView: perRowDesktop,
					},
					1200: {
						spaceBetween: 16,
						slidesPerView: perRow + perViewRightOffset,
					},
					1800: {
						spaceBetween: 16,
						slidesPerView: perRowLarge,
					},
					2000: {
						spaceBetween: 16,
						slidesPerView: perRowLarge,
					},
				},
				pagination: {
					el: `#${sectionId} .swiper-pagination`,
					clickable: true,
				},
				...arrowsParm,
				...autoplayParm,
			}

			const swiper = new Swiper(`#${sectionId} .swiper`, swiperParms)
		})
	}

	function toBoolean(string) {
		return string === 'true' ? true : false
	}
	if (document.querySelector('product-recommendations') !== null) {
		const initslider = setInterval(() => {
			if (
				document
					.querySelector('product-recommendations')
					.querySelector('.swiper') !== null
			) {
				if (
					document
						.querySelector('product-recommendations')
						.querySelector('.swiper')
						.classList.contains('swiper-initialized')
				) {
					clearInterval(initslider)
				}
				productSlider()
			}
		}, 100)
	}
	document.addEventListener('shopify:section:load', function () {
		productSlider()
	})
	document.addEventListener('DOMContentLoaded', function () {
		productSlider()
		document.addEventListener('shopify:section:load', function () {
			productSlider()
		})
		window.addEventListener('resize', function () {
			productSlider()
		})
	})
})()

function formatMoney(cents, format = "") {
	if (typeof cents === "string") {
		cents = cents.replace(".", "");
	}
	let value = "";
	const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
	const formatString = format || theme.moneyFormat;

	function formatWithDelimiters(
		number,
		precision = 2,
		thousands = ",",
		decimal = ".",
	) {
		if (isNaN(number) || number == null) {
			return 0;
		}

		number = (number / 100.0).toFixed(precision);

		const parts = number.split(".");
		const dollarsAmount = parts[0].replace(
			/(\d)(?=(\d\d\d)+(?!\d))/g,
			`$1${thousands}`,
		);
		const centsAmount = parts[1] ? decimal + parts[1] : "";

		return dollarsAmount + centsAmount;
	}

	switch (formatString.match(placeholderRegex)[1]) {
		case "amount":
			value = formatWithDelimiters(cents, 2);
			break;
		case "amount_no_decimals":
			value = formatWithDelimiters(cents, 0);
			break;
		case "amount_with_comma_separator":
			value = formatWithDelimiters(cents, 2, ".", ",");
			break;
		case "amount_no_decimals_with_comma_separator":
			value = formatWithDelimiters(cents, 0, ".", ",");
			break;
	}

	return formatString.replace(placeholderRegex, value);
}

function capitalizeFirstLetter(str) {
  if (str.length === 0) {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}