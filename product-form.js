if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');      
      this.prevent_drawer = false;
      if (document.querySelector('cart-drawer') && this.submitButton) this.submitButton.setAttribute('aria-haspopup', 'dialog');

      this.hideErrors = this.dataset.hideErrors === 'true';

      this.pro_type = this.dataset.productType;
      if( this.pro_type != null && window.quantity_rules[this.pro_type] != null ){
        const qty_rule = window.quantity_rules[this.pro_type];
        const increment = Number(qty_rule.increment);          
        if( increment > 1 ){
          this.quantity_rules = window.quantity_rules[this.pro_type];
        }  
      }      
    }

    onSubmitHandler(evt) {
      evt.preventDefault();

      const th_e = this;
      const formData = new FormData(this.form);
      this.cart_qty = Number(this.querySelector('.quantity__input').dataset.cartQuantity);
      this.add_qty =  Number(formData.get('quantity'));
      this.popup_btn = this.querySelector('.product-button-popup modal-opener');
      this.popup_content = document.querySelector('modal-dialog'+ this.popup_btn.dataset.modal);      

      const total_qty = this.add_qty + this.cart_qty;
      let min_qty = 0;

      this.no_popup = this.submitButton.classList.contains('no-popup');      
      if( !this.no_popup ){
        this.submitButton.classList.add('no-popup');        
        if ( this.quantity_rules && window.qtyCondition.first_time ){          
          min_qty = Number(this.quantity_rules.minimum_quantity_first_time);
        }        

        let require_type = this.quantity_rules.requires_with_first_order;
        require_type = require_type != undefined ? require_type.toLowerCase() : require_type;        
        this.requrie_obj = window.quantity_rules[require_type];       
        const requrie_obj = this.requrie_obj;        
        
        if( requrie_obj != undefined ){
          let has_re_ob = false;
          if(window.qtyCondition.type_to_cart && 
              (
                window.qtyCondition.type_to_cart[requrie_obj.product_type] == undefined || 
                window.qtyCondition.type_to_cart[requrie_obj.product_type] == false
              )
            ){
            if ( window.qtyCondition.type_to_cart[requrie_obj?.product_type?.toLowerCase()] ){
              has_re_ob = true
            }
          }
          console.log(has_re_ob, 'has_re_ob');
          if ( !has_re_ob && window.qtyCondition.first_time ){
            this.prevent_drawer = true;
          }
        }
      }      
      
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      
      if (this.cart) {
        formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
      config.body = formData;

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            publish(PUB_SUB_EVENTS.cartError, {source: 'product-form', productVariantId: formData.get('id'), errors: response.description, message: response.message});
            this.handleErrorMessage(response.description);
            if (th_e.cart && response.status == 422 && response.message.indexOf('added to your cart') > -1 ) {
              th_e.updateCartDrawer(th_e);
            }
            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          if (!this.error) publish(PUB_SUB_EVENTS.cartUpdate, {source: 'product-form', productVariantId: formData.get('id')});
          this.error = false;
          
          if(!this.prevent_drawer){
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener('modalClosed', () => {
                setTimeout(() => { this.cart.renderContents(response) });
              }, { once: true });
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
          }else{
            if ( window.qtyCondition.first_time && this.popup_content ){
              this.pro_response = response;
              let text = this.popup_content.querySelector('.product-popup-modal__content p').textContent.trim();
              text = text.replace(/T_1/g, capitalizeFirstLetter(this.pro_type));
              text = text.replace(/T_2/g, capitalizeFirstLetter(this.requrie_obj.product_type));            
              this.popup_content.querySelector('.product-popup-modal__content p').innerHTML = text;            
              this.popup_btn.querySelector('button').click();
              this.prevent_drawer = false;
            }
          }

          const pro_sec_qty = this.querySelector('quantity-input .quantity__input[data-cart-quantity]');
          if(pro_sec_qty){                  
            pro_sec_qty.dataset.cartQuantity = Number(pro_sec_qty.value) + Number(pro_sec_qty.dataset.cartQuantity);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
          this.submitButton.classList.remove('no-popup');
        });
    }

    
    updateCartDrawer(ele_this) {      
      var section = ele_this.cart.getSectionsToRender().map((section) => section.id);      
      const data_section = ele_this.closest('[data-section]').dataset.section;
      section = data_section ? section +','+data_section : section;      
      fetch(window.location.pathname + '?sections='+section)
        .then(res => res.json())
        .then(data => {          
          if( data_section != null ){
            ele_this.pro_section = data[data_section];
            const pro_main = new DOMParser().parseFromString(ele_this.pro_section, 'text/html');
            ele_this.querySelector('[data-cart-quantity]').dataset.cartQuantity = pro_main.querySelector('[data-cart-quantity]').dataset.cartQuantity;
            ele_this.querySelector('.quantity-message').classList.add('hidden');
            delete data[data_section]
          }          
          setTimeout(() => {
            const quickAddModal = ele_this.closest('quick-add-modal');
            if (quickAddModal) {              
              quickAddModal.hide(true);
              if( quickAddModal.getAttribute('data-recommanaed-pro') != null ){
                document.querySelector('.shopify-section.product-section product-recommended').remove();
              }
            }
            ele_this.cart.renderContents(data, true); 
          }, 1250);
        });
    }


    handleErrorMessage(errorMessage = false) {
      if (this.hideErrors) return;

      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }
  });
}
