class CartRemoveButton extends HTMLElement {
	constructor() {
		super()

		this.checkout_btn = document.querySelector('cart-drawer button[name="checkout"]');
		this.addEventListener('click', (event) => {
			event.preventDefault()
			const cartItems =
				this.closest('cart-items') || this.closest('cart-drawer-items')
			cartItems.updateQuantity(this.dataset.index, 0)
		})
	}
}

customElements.define('cart-remove-button', CartRemoveButton)

class CartItems extends HTMLElement {
	constructor() {
		super()
		this.lineItemStatusElement =
			document.getElementById('shopping-cart-line-item-status') ||
			document.getElementById('CartDrawer-LineItemStatus')

		if (document.querySelector('.cart-shipping')) {
			this.minSpend = document.querySelector('.cart-shipping').dataset.minSpend;
			this.minTotal = Math.round(this.minSpend * (Shopify.currency.rate || 1));
			this.cartShipping();
		}

			const debouncedOnChange = debounce((event) => {
			this.onChange(event)
		}, ON_CHANGE_DEBOUNCE_TIMER)

		this.addEventListener('change', debouncedOnChange.bind(this))
		
    this.cartDItems = document.querySelector('cart-drawer-items')
	}

	cartUpdateUnsubscriber = undefined

	cartShipping() {
    let progressPrev = getComputedStyle(document.querySelector('.cart-shipping__progress-current')).getPropertyValue('width');    
    document.documentElement.style.setProperty('--progress-prev', progressPrev);

    this.total = document.querySelector('.cart-shipping').dataset.total;
    this.progress = this.total / this.minTotal * 100;
    if (this.progress > 100)
      this.progress = 100;

		if (this.minTotal > this.total) {
      let amount = this.minTotal - this.total;
      let message = document.querySelector('.cart-shipping').dataset.message.replace('||amount||', formatMoney(amount));
      document.querySelector('.cart-shipping__message_default').innerText = message;
      document.querySelector('.cart-shipping__message_success').classList.remove('active');
      document.querySelector('.cart-shipping__message_default').classList.add('active');
    }
    else {
      document.querySelector('.cart-shipping__message_default').classList.remove('active');
      document.querySelector('.cart-shipping__message_success').classList.add('active');
    }

    document.querySelector('.cart-shipping__progress-current').style.width = this.progress+'%';
  }

	connectedCallback() {
		this.cartUpdateUnsubscriber = subscribe(
			PUB_SUB_EVENTS.cartUpdate,
			(event) => {
				if (event.source === 'cart-items') {
					return
				}
				this.onCartUpdate()
			}
		)
	}

	disconnectedCallback() {
		if (this.cartUpdateUnsubscriber) {
			this.cartUpdateUnsubscriber()
		}
	}

	onChange(event) {
		this.updateQuantity(
			event.target.dataset.index,
			event.target.value,
			document.activeElement.getAttribute('name')
		)
	}

	onCartUpdate() {
		fetch(`${routes.cart_url}?section_id=main-cart-items`)
			.then((response) => response.text())
			.then((responseText) => {
				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const sourceQty = html.querySelector('cart-items')
				this.innerHTML = sourceQty.innerHTML
			})
			.catch((e) => {
				console.error(e)
			})
	}

	getSectionsToRender() {
		return [
			{
				id: 'main-cart-items',
				section: document.getElementById('main-cart-items').dataset.id,
				selector: '.js-contents',
			},
			{
				id: 'cart-icon-bubble',
				section: 'cart-icon-bubble',
				selector: '.shopify-section',
			},
			{
				id: 'cart-live-region-text',
				section: 'cart-live-region-text',
				selector: '.shopify-section',
			},
			{
				id: 'main-cart-footer',
				section: document.getElementById('main-cart-footer').dataset.id,
				selector: '.js-contents-totals',
			},
			{
        id: 'main-cart-shipping',
        section: document.getElementById('main-cart-shipping').dataset.id || null,
        selector: '.js-contents-shipping'
      },
      {
        id: 'cart-type-count',
        selector: '.json',
        section: 'cart-type-count',            
      }
		]
	}

	updateQuantity(line, quantity, name) {
		this.enableLoading(line)
		this.querySelectorAll('.quantity__button').forEach((button) =>
			button.classList.add('disabled')
		)

		if (
			document.querySelectorAll(
				'.card--product card__add-to-cart button[name="add"]'
			)
		) {
			document
				.querySelectorAll(
					'.card--product .card__add-to-cart button[name="add"]'
				)
				.forEach((button) => {
					button.setAttribute('aria-disabled', false)
					if (button.querySelector('span')) {
						button.querySelector('span').classList.remove('hidden')
						button.querySelector('.sold-out-message').classList.add('hidden')
					}
				})
		}

		if (document.querySelector('.cart-shipping')) {
      let progressPrev = getComputedStyle(document.querySelector('.cart-shipping__progress-current')).getPropertyValue('width');    
      document.documentElement.style.setProperty('--progress-prev', progressPrev);
    }

		const body = JSON.stringify({
			line,
			quantity,
			sections: this.getSectionsToRender().map((section) => section.section),
			sections_url: window.location.pathname,
		})

		fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
			.then((response) => {
				return response.text()
			})
			.then((state) => {
				const parsedState = JSON.parse(state)
				const quantityElement = document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`)
				const items = document.querySelectorAll('.cart-item')
				if (parsedState.errors) {
					quantityElement.value = quantityElement.getAttribute('value');
					this.updateLiveRegions(line, parsedState.errors);
					quantityElement.closest('quantity-input').inputValueChange(quantityElement);					
					return
				}
				
				this.classList.toggle('is-empty', parsedState.item_count === 0)
				const cartDrawerWrapper = document.querySelector('cart-drawer')
				const cartFooter = document.getElementById('main-cart-footer')

				if (cartFooter)
					cartFooter.classList.toggle('is-empty', parsedState.item_count === 0)
				if (cartDrawerWrapper)
					cartDrawerWrapper.classList.toggle(
						'is-empty',
						parsedState.item_count === 0
					)
				
				this.getSectionsToRender().forEach((section) => {
					if( section.id != 'cart-type-count' ){
						const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);						
						elementToReplace.innerHTML = this.getSectionInnerHTML(
							parsedState.sections[section.section],
							section.selector
						)
					}else{												
						const json_content = this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);        
						if( json_content ){							
							const obj = {...window.qtyCondition}							
							delete obj['cart_type'];
							delete obj['type_to_cart'];							
							window.qtyCondition = { ...obj, ...JSON.parse(json_content)};							
						}else{
							delete window.qtyCondition['cart_type'];
							delete window.qtyCondition['type_to_cart'];
						}
						//this.cartDItems && typeof this.cartDItems.callAddRemove == "function"  && ( this.cartDItems.callAddRemove() );
					}
				})				
				
				const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined
				let message = ''
				if (
					items.length === parsedState.items.length && quantityElement &&
					updatedValue !== parseInt(quantityElement.value)
				) {
					if (typeof updatedValue === 'undefined') {
						message = window.cartStrings.error
					} else {
						message = window.cartStrings.quantityError.replace(
							'[quantity]',
							updatedValue
						)
					}
				}				
				this.updateLiveRegions(line, message)								

				const lineItem =
					document.getElementById(`CartItem-${line}`) ||
					document.getElementById(`CartDrawer-Item-${line}`)
				if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
					cartDrawerWrapper
						? trapFocus(
								cartDrawerWrapper,
								lineItem.querySelector(`[name="${name}"]`)
						  )
						: lineItem.querySelector(`[name="${name}"]`).focus()
				} else if (parsedState.item_count === 0 && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper.querySelector('.drawer__inner-empty'),
						cartDrawerWrapper.querySelector('a')
					)
				} else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
					trapFocus(
						cartDrawerWrapper,
						document.querySelector('.cart-item__name')
					)
				}
				
				//publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' })
				const product_section = document.querySelector('.main-product');
				if(product_section){					
					const pro_sec_qty = product_section.querySelector('quantity-input .quantity__input[data-cart-quantity]');
					let targetVariantId = product_section.querySelector('[name="id"]').value
					if( pro_sec_qty ){						
						const item = parsedState.items.find(item => item.variant_id === Number(targetVariantId));						
						if( !item ){
							pro_sec_qty.dataset.cartQuantity = 0;
						}else{
							pro_sec_qty.dataset.cartQuantity = item.quantity;
						}
						productQuantityChange(product_section.querySelector('quantity-input'));
					}
				}
			})
			// .catch(() => {
			// 	this.querySelectorAll('.loading-overlay').forEach((overlay) =>
			// 		overlay.classList.add('hidden')
			// 	)
			// 	this.querySelectorAll('.quantity__button').forEach((button) =>
			// 		button.classList.remove('disabled')
			// 	)
			// 	const errors =
			// 		document.getElementById('cart-errors') ||
			// 		document.getElementById('CartDrawer-CartErrors')
			// 	if (errors) errors.textContent = window.cartStrings.error
			// })
			.finally(() => {
				this.querySelectorAll('.quantity__button').forEach((button) =>
					button.classList.remove('disabled')
				)
				if (document.querySelector('.cart-shipping')) {
          this.cartShipping();
        }
				this.disableLoading(line)
				this.checkout_btn && (this.checkout_btn.removeAttribute('disabled'));
			})
	}

	updateLiveRegions(line, message) {
		const lineItemError =
			document.getElementById(`Line-item-error-${line}`) ||
			document.getElementById(`CartDrawer-LineItemError-${line}`)

		if (lineItemError) {
			if (message) {
				lineItemError.style.display = 'flex'
				lineItemError.querySelector('.cart-item__error-text').innerHTML =
					message
			} else {
				lineItemError.style.display = 'none'
				lineItemError.querySelector('.cart-item__error-text').innerHTML = ''
			}
		}

		this.lineItemStatusElement.setAttribute('aria-hidden', true)

		const cartStatus =
			document.getElementById('cart-live-region-text') ||
			document.getElementById('CartDrawer-LiveRegionText')
		cartStatus.setAttribute('aria-hidden', false)

		setTimeout(() => {
			cartStatus.setAttribute('aria-hidden', true)
		}, 1000)
	}

	getSectionInnerHTML(html, selector) {		
		return new DOMParser()
			.parseFromString(html, 'text/html')
			.querySelector(selector).innerHTML
	}

	enableLoading(line) {
		const mainCartItems =
			document.getElementById('main-cart-items') ||
			document.getElementById('CartDrawer-CartItems')
		if (mainCartItems) mainCartItems.classList.add('cart__items--disabled')

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		)
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		)

		;[...cartItemElements, ...cartDrawerItemElements].forEach((overlay) =>
			overlay.classList.remove('hidden')
		)

		document.activeElement.blur()
		this.lineItemStatusElement.setAttribute('aria-hidden', false)
	}

	disableLoading(line) {
		const mainCartItems =
			document.getElementById('main-cart-items') ||
			document.getElementById('CartDrawer-CartItems')
		if (mainCartItems) mainCartItems.classList.remove('cart__items--disabled')

		const cartItemElements = this.querySelectorAll(
			`#CartItem-${line} .loading-overlay`
		)
		const cartDrawerItemElements = this.querySelectorAll(
			`#CartDrawer-Item-${line} .loading-overlay`
		)

		cartItemElements.forEach((overlay) => overlay.classList.add('hidden'))
		cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'))
	}
}

customElements.define('cart-items', CartItems)

if (!customElements.get('cart-note')) {
	customElements.define(
		'cart-note',
		class CartNote extends HTMLElement {
			constructor() {
				super()

				this.addEventListener(
					'change',
					debounce((event) => {
						const body = JSON.stringify({ note: event.target.value })
						fetch(`${routes.cart_update_url}`, {
							...fetchConfig(),
							...{ body },
						})
					}, ON_CHANGE_DEBOUNCE_TIMER)
				)
			}
		}
	)
}
