;(function () {
	const initProductAccordion = () => {
		const aboutToggleItems = $('.about__accordion-toggle')

		aboutToggleItems.each(function () {
			const currentToggle = $(this)
			const siblingToggles = currentToggle.siblings(
				'.about__accordion-description'
			)

			currentToggle.click(function () {
				if (!currentToggle.hasClass('active')) {
					aboutToggleItems.each(function () {
						const siblingToggle = $(this)
						siblingToggle.removeClass('active')
						siblingToggle
							.siblings('.about__accordion-description')
							.stop()
							.slideUp(300)
					})

					currentToggle.addClass('active')

					siblingToggles.stop().slideDown(300)
				} else {
					currentToggle.removeClass('active')
					siblingToggles.stop().slideUp(300)
				}
			})
		})
	}

	const initZoomImage = () => {
		const imagesWrapper = document.querySelector(
			'.product-media-modal__content'
		)
		const images = imagesWrapper?.querySelectorAll('.js-image-zoom') || []

		images.forEach((el) => {
			el.addEventListener('click', (e) => {
				imagesWrapper.classList.toggle('zoom')
			})
		})
	}

	const formatFreeShippingAmount = (value) => {
		const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/
		const formatString = theme.moneyFormat

		return formatString.replace(placeholderRegex, value)
	}

	const setTotalFreeShipping = () => {
		if (document.querySelector('.js-free-shipping')) {
			const freeShippingTotal = document.querySelector('.free-shipping-total')
			if (freeShippingTotal) {
				const minSpend = Number(freeShippingTotal.dataset.minSpend)
				if (minSpend && minSpend > 0) {
					freeShippingTotal.innerText = `${formatFreeShippingAmount(
						Math.round(minSpend * (Shopify.currency.rate || 1))
					)}`
				}
			}
		}
	}
	function changeIconsViewBox() {
		const textWithIcon = document.querySelectorAll('.text_with_icon')
		textWithIcon.forEach((item) => {
			const icons = item.querySelectorAll('.icon-pack')
			icons.forEach((icon) => {
				icon.setAttribute('viewBox', '0 0 20 20')
			})
		})
	}

	//document.addEventListener('scroll', () => {
	//	const navigation = document.querySelector('.product__media_navigation')
	//	if (navigation) {
	//		const footer = document.querySelector('.footer')
	//		const navigationHeight = navigation.offsetHeight
	//		const screen = window.scrollY
	//		const overview = document.querySelector('#overview').scrollTop
	//		const overviewBottom =
	//			document.querySelector('#overview').clientHeight + overview
	//		if (screen >= overview && screen <= overviewBottom) {
	//			document.querySelector('#overview-link').classList.add('active')
	//		} else {
	//			document.querySelector('#overview-link').classList.remove('active')
	//		}
	//		if (window.innerHeight + screen - navigationHeight > footer.offsetTop) {
	//			navigation.style.opacity = '0'
	//			navigation.style.visibility = 'hidden'
	//		} else {
	//			navigation.style.opacity = '1'
	//			navigation.style.visibility = 'visible'
	//		}
	//	}
	//})

	const navigationSections = [
		{
			sectionSelector: '#overview',
			linkSelector: '#overview-link',
		},
		{
			sectionSelector: '#product-specifications',
			linkSelector: '#specifications-link',
		},
	]

	function navigationInit(sections) {
		const navigation = document.querySelector('.product__media_navigation')
		if (navigation) {
			navigation.style.transform = 'translateX(-50%) translateY(calc(100% + 16px))'
		}
		document.addEventListener('scroll', () => {
			if (navigation) {
				navigation.classList.add('show-navigation')
			}
			if (navigation) {
				const footer = document.querySelector('.footer')
				const navigationHeight = navigation.offsetHeight
				const secondSection = document.querySelectorAll('#MainContent .shopify-section')[1]
				const screen = window.scrollY
				sections.forEach((section, i) => {
					if (section) {
						const em = document.querySelector(`${section.sectionSelector}`)
						if (em) {
							const rect = em.getBoundingClientRect()	
							if (rect.top <= 1 && rect.top > rect.height * -1) {
								document
									.querySelector(`${section.linkSelector}`)
									.classList.add('active')
							} else {
								document
									.querySelector(`${section.linkSelector}`)
									.classList.remove('active')
							}
							document.querySelector(`${section.linkSelector}`).addEventListener('click', () => {
								em.scrollIntoView({ behavior: 'smooth' });
							})
						} else {
							document.querySelector(`${section.linkSelector}`).style.display = 'none';
						}
					}
				})
				
				const rect = secondSection.getBoundingClientRect();
				const isSecondSectionScrolled = rect.top < 0;
				const isNearFooter = window.innerHeight + screen - navigationHeight > footer.offsetTop;

				navigation.style.transform = isSecondSectionScrolled && !isNearFooter
				? 'translateX(-50%) translateY(0)'
				: 'translateX(-50%) translateY(calc(100% + 16px))';
			}
		})
	}

	document.addEventListener('shopify:section:load', function () {
		initProductAccordion()
		initZoomImage()
		setTotalFreeShipping()
		changeIconsViewBox()
		navigationInit(navigationSections)
	})

	navigationInit(navigationSections)
	initProductAccordion()
	initZoomImage()
	setTotalFreeShipping()
	changeIconsViewBox()
})()

function productQuantityChange(el){		
	this.q_condition = window.quantity_rules[el.dataset.type];
	this.first_order = window.qtyCondition.first_time;
	if( this.q_condition ){
		this.close_buttons = el.closest('.product-form__buttons');
		this.add_btn = this.close_buttons.querySelector('button[name="add"]');
		this.error_msg = this.close_buttons.querySelector('.quantity-message__error');
		this.su_cc_msg = this.close_buttons.querySelector('.quantity-message__success');
		this.cart_qty = Number(el.querySelector('.quantity__input').dataset.cartQuantity);
		this.input_value = Number(el.input.value);		

		this.min_qty = Number(this.q_condition.minimum_quantity_returned);		
		if (this.first_order){
			this.min_qty = Number(this.q_condition.minimum_quantity_first_time);
		}
		this.min_qty = this.min_qty - this.cart_qty;
		this.min_qty = this.min_qty < 0 ? 0 : this.min_qty;
		this.con_text = `Your ${ this.first_order ? 'first': '' } ${ capitalizeFirstLetter(el.dataset.type) } order must include at least <strong>${ this.min_qty }</strong> units.`;
		if( this.cart_qty > 0 ) {
			this.con_text += `You have already added quantity <strong>${ this.cart_qty }</strong> in your cart.`;	
		}

		if( this.min_qty > this.input_value ){
			this.error_msg.querySelector('span').innerHTML = this.con_text;
			this.error_msg.classList.remove('hidden');
			this.su_cc_msg.classList.add('hidden');
			this.add_btn.setAttribute('disabled', 'disabled');
		} else {
			if ( this.cart_qty > 0 ){
				this.su_cc_msg.querySelector('span').innerHTML = 'You’ve reached the required minimum quantity. And you have alredy added <strong>'+this.cart_qty+'</strong> quantity in the cart.';
			}else{
				this.su_cc_msg.querySelector('span').innerHTML = 'You’ve reached the required minimum quantity';		
			}			
			this.su_cc_msg.classList.remove('hidden');
			this.error_msg.classList.add('hidden');
			this.add_btn.removeAttribute('disabled');
		}
		this.error_msg.closest('.quantity-message').classList.remove('hidden');
	}
}

document.querySelector('quantity-input') && productQuantityChange(document.querySelector('quantity-input'));

function triggerAddToCart(el) {
	const id = el.id;	
	const popup_btn = document.querySelector('modal-opener[data-modal="#'+id+'"]');
	//popup_btn.closest('product-form').querySelector('button[name="add"]').click();
	this.product_form = popup_btn.closest('product-form');
	this.cart = document.querySelector('cart-drawer');
	if( this.product_form && this.cart ){
		this.cart.renderContents(this.product_form.pro_response);
	}
}