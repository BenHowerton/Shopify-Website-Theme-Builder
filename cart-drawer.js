class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.header = document.querySelector('.header-wrapper');
    if (this.header) this.header.preventHide = false;

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.setHeaderCartIconAccessibility();
    this.handleCartDrawerParameter();
    this.cartDItems = this.querySelector('cart-drawer-items')
    //this.cartDItems && ( this.cartDItems.callAddRemove() );
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('#cart-icon-bubble');
    cartLink?.setAttribute('role', 'button');
    cartLink?.setAttribute('aria-haspopup', 'dialog');
    cartLink?.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink)
    });
    cartLink?.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (this.header) this.header.preventHide = true;
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {this.classList.add('animate', 'active')});

    this.addEventListener('transitionend', () => {
      const containerToTrapFocusOn = this.classList.contains('is-empty') ? this.querySelector('.drawer__inner-empty') : document.getElementById('CartDrawer');
      const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
      trapFocus(containerToTrapFocusOn, focusElement);
    }, { once: true });

    document.body.classList.add('overflow-hidden-drawer');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden-drawer');
    if (this.header) this.header.preventHide = false;
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if(cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedState, updateFiled = false) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') && this.querySelector('.drawer__inner').classList.remove('is-empty');
    this.productId = parsedState.id;
    if( !updateFiled){
      this.getSectionsToRender().forEach((section => {              
        if( section.id != 'cart-type-count' ){
          const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
          sectionElement.innerHTML =
              this.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
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
          //this.cartDItems && ( this.cartDItems.callAddRemove() );
        }
      }));
    }else{
      this.getSectionsToRender().forEach((section => {              
        if( section.id != 'cart-type-count' ){
          const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
          sectionElement.innerHTML =
              this.getSectionInnerHTML(parsedState[section.id], section.selector);
        }else{
          const json_content = this.getSectionInnerHTML(parsedState[section.id], section.selector);        
          if( json_content ){
            const obj = {...window.qtyCondition}
            delete obj['cart_type'];
            delete obj['type_to_cart'];							
            window.qtyCondition = { ...obj, ...JSON.parse(json_content)};            
          }else{
            delete window.qtyCondition['cart_type'];
            delete window.qtyCondition['type_to_cart'];
          }
          //this.cartDItems && ( this.cartDItems.callAddRemove() );
        }
      }));
    }

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer'
      },
      {
        id: 'cart-icon-bubble'
      },
      {
        id: 'cart-type-count',
        selector: '.json',
        section: 'cart-type-count',            
      }
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }

  handleCartDrawerParameter() {    
    const url = new URL(window.location.href);
    const params = url.searchParams;    
    if (params.get('cart-drawer') === 'true') {        
      params.delete('cart-drawer');               
      window.history.replaceState({}, document.title, url.pathname + url.search);
      this.open()
    } 
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  constructor() {
    super();
    
    this.checkout_btn = document.querySelector('cart-drawer button[name="checkout"]');
    if( qtyCondition.first_time ){
      this.callAddRemove();
    }
  }
  
  callAddRemove(){    
    this.checkoutDiabled(true);
    setTimeout(()=>{
      if( this.querySelector('.freeProductJson') ){
        const freeJson = JSON.parse(this.querySelector('.freeProductJson').textContent);      
        if( freeJson.addFreePro == true ){
          this.addRemoveFreeProduct(true, freeJson);          
        } else if ( freeJson.removeFreePro == true ){
          this.addRemoveFreeProduct(false, freeJson);          
        } else {
          if( window.qtyCondition.type_to_cart && freeJson.free_product ){
            let qty = Object.entries(window.qtyCondition.type_to_cart).length;          
            if( freeJson.type ){            
              qty = window.qtyCondition.type_to_cart[freeJson.type.toLowerCase()] ? (qty - 1): qty;            
            }            
            if ( qty > 0 && freeJson.free_product.quantity != qty ){              
              this.updateQuantity(freeJson.variant_index, qty)            
            }else{              
              this.checkoutDiabled();
            }
          }
        }
      }else{              
        this.checkoutDiabled()
      }
    }, 500);
  }

  checkoutDiabled(removeDisabled = false){
    if( !this.checkout_btn ) return;
    if( !removeDisabled ){
      this.checkout_btn.removeAttribute('disabled');      
    } else {
      this.checkout_btn.setAttribute('disabled', 'disabled');
    }
  }

	addRemoveFreeProduct(product_add, jsonData) {		
		if( product_add ){
      let qty = 1;
      if( window.qtyCondition.type_to_cart ){
        qty = Object.entries(window.qtyCondition.type_to_cart).length 
        if( jsonData.type ){
         qty = window.qtyCondition.type_to_cart[jsonData.type.toLowerCase()] ? (qty - 1): qty;
        }
        qty = qty <= 0 ? 1 : qty;
      }
			const body = {
				id: jsonData.variant_id,
        quantity: qty,
        properties: {
          _free_product: '',
          _reference_product: jsonData.cart_refrence_product.title
        }
			};
      
      this.cart = document.querySelector('cart-drawer');
      
      body['sections'] = this.cart.getSectionsToRender().map((section) => section.id);
      body['sections_url'] = window.location.pathname;      
      
			const config = fetchConfig();
			config.body = JSON.stringify(body);

      this.checkoutDiabled(true);
			fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
					const parsedState = response;          
					if( !parsedState.errors) {
						this.cart.getSectionsToRender().forEach((section => {
              const sectionElement = section.selector ? document.querySelector(section.selector) : document.getElementById(section.id);
              if( section.id != 'cart-type-count' ){
                sectionElement.innerHTML =
                   this.cart.getSectionInnerHTML(parsedState.sections[section.id], section.selector);
              }else{
                const json_content = this.cart.getSectionInnerHTML(parsedState.sections[section.id], section.selector);        
                if( json_content ){
                  const obj = {...window.qtyCondition}
                  delete obj['cart_type'];
                  delete obj['type_to_cart'];							
                  window.qtyCondition = { ...obj, ...JSON.parse(json_content)};            
                }else{
                  delete window.qtyCondition['cart_type'];
                  delete window.qtyCondition['type_to_cart'];
                }
              }
            }));
					}
				})
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {          
          this.checkoutDiabled();
        });    
		}else{
      if( jsonData.variant_index ){
        this.updateQuantity(jsonData.variant_index, 0);
      }
		}
	}

  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner'
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section'
      },
      {
        id: 'cart-type-count',
        selector: '.json',
        section: 'cart-type-count',            
      }
    ];
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);
