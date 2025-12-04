if (!customElements.get('quick-add-bulk')) {
  customElements.define(
    'quick-add-bulk',
    class QuickAddBulk extends BulkAdd {
      constructor() {
        super();
        this.quantity = this.querySelector('quantity-input');
        this.updateVaraintJson = {};

        const debouncedOnChange = debounce((event) => {
          if (parseInt(event.target.value) === 0) {
            this.startQueue(event.target.dataset.index, parseInt(event.target.value));
          } else {
            this.validateQuantity(event);
          }         
        
          const varinat_ele = event.target.closest('quick-add-bulk');        
          const id = event.target.dataset.index;
          this.updateVaraintJson[id] == undefined && (
            this.updateVaraintJson[id] = JSON.parse(varinat_ele.querySelector('.variant_json').textContent));

          this.querySelectorAll('.error').forEach((er_el) => {
            er_el.classList.add('hidden');
            er_el.innerText = '';
          });
        }, ON_CHANGE_DEBOUNCE_TIMER);

        this.addEventListener('change', debouncedOnChange.bind(this));
        this.listenForActiveInput();
        this.listenForKeydown();
        this.lastActiveInputId = null;

        const pro_type = this.dataset.productType;
        if( pro_type != null && window.quantity_rules[pro_type] != null ){
          const qty_rule = window.quantity_rules[pro_type];
          const increment = Number(qty_rule.increment);          
          if( increment > 1 ){
            this.quantity_rules = window.quantity_rules[pro_type];
          }
          this.querySelectorAll('.quantity__input').forEach((qty_el)=>{
            if( increment > 1 ){
              const value = window.qtyCondition.first_time ? qty_rule.minimum_quantity_first_time : qty_rule.minimum_quantity_returned;
              qty_el.min = 0;
              qty_el.value = value ? value: 0;
              qty_el.step = increment
              qty_el.closest('quantity-input')?.inputValueChange(qty_el);
            }
          });
          this.quantity_rules.handle = this.dataset.handle
        }
      }

      connectedCallback() {
        this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
          if (
            event.source === 'quick-add' ||
            (event.cartData.items && !event.cartData.items.some((item) => item.id === parseInt(this.dataset.index))) ||
            (event.cartData.variant_id && !(event.cartData.variant_id === parseInt(this.dataset.index)))
          ) {
            return;
          }
          // If its another section that made the update
          this.onCartUpdate().then(() => {
            this.listenForActiveInput();
            this.listenForKeydown();
          });
        });
      }

      disconnectedCallback() {
        if (this.cartUpdateUnsubscriber) {
          this.cartUpdateUnsubscriber();
        }
      }

      get input() {
        return this.querySelector('quantity-input input');
      }

      selectProgressBar() {
        return this.querySelector('.progress-bar-container');
      }

      listenForActiveInput() {
        if (!this.classList.contains('hidden')) {
          this.input?.addEventListener('focusin', (event) => event.target.select());
        }
        this.isEnterPressed = false;
      }

      listenForKeydown() {
        this.input?.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            this.input?.blur();
            this.isEnterPressed = true;
          }
        });
      }

      cleanErrorMessageOnType(event) {
        event.target.addEventListener(
          'keypress',
          () => {
            event.target.setCustomValidity('');
          },
          { once: true }
        );
      }

      get sectionId() {
        if (!this._sectionId) {
          this._sectionId = this.closest('.collection-quick-add-bulk').dataset.id;
        }

        return this._sectionId;
      }

      onCartUpdate() {
        return new Promise((resolve, reject) => {
          fetch(`${this.getSectionsUrl()}?section_id=${this.sectionId}`)
            .then((response) => response.text())
            .then((responseText) => {
              const html = new DOMParser().parseFromString(responseText, 'text/html');
              const sourceQty = html.querySelector(`#quick-add-bulk-${this.dataset.index}-${this.sectionId}`);
              if (sourceQty) {
                this.innerHTML = sourceQty.innerHTML;
              }
              resolve();
            })
            .catch((e) => {
              console.error(e);
              reject(e);
            });
        });
      }

      getSectionsUrl() {
        const pageParams = new URLSearchParams(window.location.search);
        const pageNumber = decodeURIComponent(pageParams.get('page') || '');

        return `${window.location.pathname}${pageNumber ? `?page=${pageNumber}` : ''}`;
      }

      updateMultipleQty(items) {
        this.selectProgressBar().classList.remove('hidden');
        
        this.setRequestStarted(false);        

        let total_qty = 0;        
        for (const key in this.updateVaraintJson) {          
          if (items.hasOwnProperty(key)) {            
            this.updateVaraintJson[key].quantity = items[key];            
            total_qty = total_qty + items[key];
          }
        }

        let min_qty = 0;
        if ( this.quantity_rules ){
          if ( window.qtyCondition.first_time ){
          min_qty = Number(this.quantity_rules.minimum_quantity_first_time);
          }else{
            min_qty = Number(this.quantity_rules.minimum_quantity_returned);
          }
        }

        clearTimeout(this.setTime);
        if( min_qty > 0 && min_qty > total_qty ){                
          let text = window.qtyCondition.first_time ? window.qtyCondition.fristOrderText : window.qtyCondition.returnOrderText;
          text = text.replace('TTT', this.quantity_rules.product_type).replace('RRR', min_qty);          
          this.querySelector('.error-msg').innerHTML = text;
          this.querySelector('.error-msg').classList.add('e--float');
          this.querySelector('.error-msg').classList.remove('hidden');
          this.setTime = setTimeout(() => {
            this.querySelector('.error-msg').classList.remove('e--float');
            this.querySelector('.error-msg').classList.add('hidden');
          }, 2000);
        }

        const sticky_el = document.querySelector('.sticky-summary');        
        if( sticky_el ){
          const list_of_item = {};
          let total_item = 0;          
          document.querySelectorAll('quick-add-bulk').forEach((el)=>{            
            Object.entries(el.updateVaraintJson).forEach((variant) =>{
              if( variant[1].quantity > 0 ){
                list_of_item[variant[0]] = variant[1];
                list_of_item[variant[0]]['quantity_rules'] = this.quantity_rules;
                total_item = total_item + variant[1].quantity                
              }              
            })            
          });          
          sticky_el.listOfItem = list_of_item;
          if( total_item > 0 ){
            sticky_el.classList.add('active');
            sticky_el.querySelector('.selected-items').textContent = `${ total_item } item${ total_item > 1 ? 's':'' } selected`;
          }else{
            sticky_el.classList.remove('active');
          }
        }
        /*
          const ids = Object.keys(items);
          const body = JSON.stringify({
            updates: items,
            sections: this.getSectionsToRender().map((section) => section.section),
            sections_url: this.getSectionsUrl(),
          });
          fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
            .then((response) => {
              return response.text();
            })
            .then((state) => {
              const parsedState = JSON.parse(state);
              this.renderSections(parsedState, ids);
              publish(PUB_SUB_EVENTS.cartUpdate, { source: 'quick-add', cartData: parsedState });
            })
            .catch(() => {
              // Commented out for now and will be fixed when BE issue is done https://github.com/Shopify/shopify/issues/440605
              // e.target.setCustomValidity(error);
              // e.target.reportValidity();
              // this.resetQuantityInput(ids[index]);
              // this.selectProgressBar().classList.add('hidden');
              // e.target.select();
              // this.cleanErrorMessageOnType(e);
            })
            .finally(() => {
              this.selectProgressBar().classList.add('hidden');
              this.setRequestStarted(false);
            });
          */
      }

      getSectionsToRender() {
        return [
          {
            id: `quick-add-bulk-${this.dataset.index}-${this.sectionId}`,
            section: this.sectionId,
            selector: `#quick-add-bulk-${this.dataset.index}-${this.sectionId}`,
          },
          {
            id: 'cart-icon-bubble',
            section: 'cart-icon-bubble',
            selector: '.shopify-section',
          },
          {
            id: 'CartDrawer',
            selector: '.drawer__inner',
            section: 'cart-drawer',
          },
          {
            id: 'cart-type-count',
            selector: '.json',
            section: 'cart-type-count',            
          },
        ];
      }

      renderSections(parsedState, ids) {
        const intersection = this.queue.filter((element) => ids.includes(element.id));
        if (intersection.length !== 0) return;
        this.getSectionsToRender().forEach((section) => {
          const sectionElement = document.getElementById(section.id);
          if (section.section === 'cart-drawer') {
            sectionElement.closest('cart-drawer')?.classList.toggle('is-empty', parsedState.items.length.length === 0);
          }
          const elementToReplace =
            sectionElement && sectionElement.querySelector(section.selector)
              ? sectionElement.querySelector(section.selector)
              : sectionElement;
          if (elementToReplace) {
            elementToReplace.innerHTML = this.getSectionInnerHTML(
              parsedState.sections[section.section],
              section.selector
            );
          }
        });

        if (this.isEnterPressed) {
          this.querySelector(`#Quantity-${this.lastActiveInputId}`).select();
        }

        this.listenForActiveInput();
        this.listenForKeydown();
      }
    }
  );

  function addBulkAddtoCart(event, el) {
    event.preventDefault();
    const t_pe = el.closest('.sticky-summary'), listOfItem = t_pe.listOfItem;  
    t_pe.bulk_el = document.querySelector('quick-add-bulk');  
    const updates = {};
    for (const key in listOfItem) {
      let total_qty = 0;
      if( listOfItem[key].quantity > 0 ){
        const variant = listOfItem[key];        
        const product_handle = variant.quantity_rules?.handle;
        const added_cart_qty_o = window.qtyCondition.cart_type && window.qtyCondition.cart_type[product_handle] != undefined ? window.qtyCondition.cart_type[product_handle] : null;

        total_qty = total_qty + variant.quantity;
        (added_cart_qty_o && added_cart_qty_o[variant.id] ) && (
          total_qty = total_qty + added_cart_qty_o[variant.id]  
        );
        const parent_el = document.querySelector('quick-add-bulk[data-index="'+key+'"]');

        let min_qty = 0;
        if ( variant.quantity_rules ){
          if ( window.qtyCondition.first_time ){
            min_qty = Number(variant.quantity_rules.minimum_quantity_first_time);
          }else{
            min_qty = Number(variant.quantity_rules.minimum_quantity_returned);
          }
        }
    
        if( min_qty > 0 && min_qty > total_qty ){
          let require_type = variant.quantity_rules.requires_with_first_order.toLowerCase();
          const requrie_obj = window.quantity_rules[require_type];      
          if( requrie_obj ){
            let re_min_qty = 0;
            let text = `Need to add minmum qunatity of ${ min_qty - total_qty }, and also need add `;
            if( min_qty - total_qty < 1 ){
              text = `Minmum qunatity added, and also need to add `
            }
            if ( window.qtyCondition.first_time ){
              re_min_qty = Number(requrie_obj.minimum_quantity_first_time);          
            }else{
              re_min_qty = Number(requrie_obj.minimum_quantity_returned);
            }
            parent_el &&(
              parent_el.querySelectorAll('.error').forEach((er_el) => {
                er_el.classList.remove('hidden');
                er_el.innerText = `${ text } produc type "${ require_type.toUpperCase() }" minimum qunatity ${re_min_qty}.`;
              })
            )
          }else{        
            let text = `Need to add ${ min_qty - total_qty } `;
            if( min_qty - total_qty < 1 ){
              parent_el &&(
                parent_el.querySelectorAll('.error').forEach((er_el) => {
                  er_el.classList.remove('hidden');
                  er_el.innerText = `${ text }.`;
                })
              )
            }
          }
          return;
        }else{
          parent_el && (
            parent_el.querySelectorAll('.error').forEach((er_el) => {
              er_el.classList.add('hidden');
              er_el.innerText = '';
            })
          )
        }
      }
    }

    for (const key in listOfItem) {
      if( listOfItem[key].quantity > 0 ){
        const variant = listOfItem[key];
        const product_handle = variant.quantity_rules?.handle;
        const added_cart_qty_o = window.qtyCondition.cart_type && window.qtyCondition.cart_type[product_handle] != undefined ? window.qtyCondition.cart_type[product_handle] : null;
        const added_cart_qty = added_cart_qty_o && added_cart_qty_o[key] ? added_cart_qty_o[variant.id] : 0;
        updates[key] = listOfItem[key].quantity + added_cart_qty;        
        // updates.push({
        //   id: key,
        //   quantity: listOfItem[key].quantity
        // }) 
      }
    }

    if ( Object.entries(updates).length > 0 ){
      el.classList.add('loading');
      el.querySelector('.loading__spinner').classList.remove('hidden');
      
      t_pe.cart = document.querySelector('cart-drawer');     

      const body = JSON.stringify({
        updates: updates,
        sections: t_pe.bulk_el.getSectionsToRender().map(({ section }) => section),
        sections_url: window.location.pathname,
      });
      fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);        
          publish(PUB_SUB_EVENTS.cartUpdate, { source: 'addBulkAddtoCart', cartData: parsedState });

          document.querySelectorAll('quick-add-bulk').forEach((el)=>{
            el.querySelector('.quantity__input').value = 0;
            el.updateVaraintJson = {};
          });
          t_pe.listOfItem = {};
          t_pe.classList.remove('active');          
                    
          if(!t_pe.cart){
            window.location = routes.cart_url;
          }else{            
            t_pe.cart.renderContents(parsedState);            
          }          
        })
        .catch(() => {        
        })
        .finally(() => {
          el.classList.remove('loading');
          el.querySelector('.loading__spinner').classList.add('hidden');
        });
    }
  }
}
