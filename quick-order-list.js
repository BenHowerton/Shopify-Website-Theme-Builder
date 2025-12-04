if (!customElements.get('quick-order-list')) {
  customElements.define(
    'quick-order-list',
    class QuickOrderList extends BulkAdd {
      cartUpdateUnsubscriber = undefined;
      hasPendingQuantityUpdate = false;
      constructor() {
        super();
        this.isListInsideModal = this.closest('bulk-modal');
        this.updateVaraintJson = {};

        this.stickyHeaderElement = document.querySelector('sticky-header');
        if (this.stickyHeaderElement) {
          this.stickyHeader = {
            height: this.stickyHeaderElement.offsetHeight,
            type: `${this.stickyHeaderElement.getAttribute('data-sticky-type')}`,
          };
        }

        this.totalBar = this.getTotalBar();
        if (this.totalBar) {
          this.totalBarPosition = window.innerHeight - this.totalBar.offsetHeight;

          this.handleResize = this.handleResize.bind(this);
          window.addEventListener('resize', this.handleResize);
        }

        this.querySelector('form').addEventListener('submit', (event) => event.preventDefault());


        this.quantity_rules = {};
        const pro_type = this.dataset.productType;
        if( pro_type != null && window.quantity_rules[pro_type] != null ){
          const qty_rule = window.quantity_rules[pro_type];
          const increment = Number(qty_rule.increment);
          if( increment > 1 ){
            this.quantity_rules = window.quantity_rules[pro_type];
          }
          this.querySelectorAll('.quantity__input').forEach((qty_el)=>{
            if( increment > 1 ){
              const qty_parent = qty_el.closest('quantity-input');
              qty_el.min = 0;
              qty_el.step = increment;
              typeof qty_parent != null && qty_parent.inputValueChange == "function" ? qty_parent.inputValueChange(qty_el) : '';
            }
          })          
        }

        this.querySelectorAll('.quantity__input:not([data-cart-quantity="0"])').forEach((el)=>{
          const id = el.dataset.index;
          const varinat_ele = el.closest('.variant-item');
          this.updateVaraintJson[id] == undefined && (
            this.updateVaraintJson[id] = JSON.parse(varinat_ele.querySelector('.variant_json').textContent),
            this.updateVaraintJson[id].quantity = Number(el.value)
          );
        })
      }

      connectedCallback() {
        this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, async (event) => {
          // skip if cart event was triggered by this section
          if (event.source === this.id) return;          

          this.toggleTableLoading(true);
          await this.refresh();
          this.toggleTableLoading(false);
        });

        this.initEventListeners();
      }

      disconnectedCallback() {
        this.cartUpdateUnsubscriber?.();
        window.removeEventListener('resize', this.handleResize);
      }

      handleResize() {
        this.totalBarPosition = window.innerHeight - this.totalBar.offsetHeight;
        this.stickyHeader.height = this.stickyHeaderElement ? this.stickyHeaderElement.offsetHeight : 0;
      }

      initEventListeners() {
        this.querySelectorAll('.pagination__item').forEach((link) => {
          link.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            const url = new URL(event.currentTarget.href);

            this.toggleTableLoading(true);
            await this.refresh(url.searchParams.get('page') || '1');
            this.scrollTop();
            this.toggleTableLoading(false);
          });
        });

        this.querySelector('.quick-order-list__contents').addEventListener(
          'keyup',
          this.handleScrollIntoView.bind(this)
        );

        this.quickOrderListTable.addEventListener('keydown', this.handleSwitchVariantOnEnter.bind(this));

        this.initVariantEventListeners();
      }

      initVariantEventListeners() {
        this.allInputsArray = Array.from(this.querySelectorAll('input[type="number"]'));

        this.querySelectorAll('quantity-input').forEach((qty) => {
          const debouncedOnChange = debounce(this.onChange.bind(this), BulkAdd.ASYNC_REQUEST_DELAY, true);
          qty.addEventListener('change', (event) => {
            this.hasPendingQuantityUpdate = true;
            debouncedOnChange(event);
          });
        });

        this.querySelectorAll('.quick-order-list-remove-button').forEach((button) => {
          button.addEventListener('click', (event) => {
            event.preventDefault();
            this.toggleLoading(true);
            this.startQueue(button.dataset.index, 0);
          });
        });
      }

      get currentPage() {
        return this.querySelector('.pagination-wrapper')?.dataset?.page ?? '1';
      }

      get cartVariantsForProduct() {
        return JSON.parse(this.querySelector('[data-cart-contents]')?.innerHTML || '[]');
      }

      onChange(event) {        
        const inputValue = parseInt(event.target.value);
        this.cleanErrorMessageOnType(event);
        if (inputValue == 0) {
          event.target.setAttribute('value', inputValue);
          this.startQueue(event.target.dataset.index, inputValue);
        } else {
          this.validateQuantity(event);
        }
        
        const varinat_ele = event.target.closest('.variant-item');
        const id = event.target.dataset.index;
        this.updateVaraintJson[id] == undefined && (
          this.updateVaraintJson[id] = JSON.parse(varinat_ele.querySelector('.variant_json').textContent));
      }

      cleanErrorMessageOnType(event) {
        const handleKeydown = () => {
          event.target.setCustomValidity(' ');
          event.target.reportValidity();
          event.target.removeEventListener('keydown', handleKeydown);
        };

        event.target.addEventListener('keydown', handleKeydown);
      }

      validateInput(target) {
        const targetValue = parseInt(target.value);
        const targetMin = parseInt(target.dataset.min);
        const targetStep = parseInt(target.step);

        if (target.max) {
          return (
            targetValue == 0 ||
            (targetValue >= targetMin && targetValue <= parseInt(target.max) && targetValue % targetStep == 0)
          );
        } else {
          return targetValue == 0 || (targetValue >= targetMin && targetValue % targetStep == 0);
        }
      }

      get quickOrderListTable() {
        return this.querySelector('.quick-order-list__table');
      }

      getSectionsToRender() {
        return [
          {
            id: this.id,
            section: this.dataset.section,
            selector: `#${this.id}`,
          },
          {
            id: 'cart-icon-bubble',
            section: 'cart-icon-bubble',
            selector: '#shopify-section-cart-icon-bubble',
          },
          {
            id: `quick-order-list-live-region-text-${this.dataset.productId}`,
            section: 'cart-live-region-text',
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
          }
        ];
      }

      toggleTableLoading(enable) {
        this.quickOrderListTable.classList.toggle('quick-order-list__container--disabled', enable);
        this.toggleLoading(enable);
      }

      async refresh(pageNumber = null) {
        const url = this.dataset.url || window.location.pathname;

        return fetch(`${url}?section_id=${this.dataset.section}&page=${pageNumber || this.currentPage}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            const responseQuickOrderList = html.querySelector(`#${this.id}`);

            if (!responseQuickOrderList) {
              return;
            }

            this.innerHTML = responseQuickOrderList.innerHTML;
            this.initEventListeners();
          })
          .catch((e) => {
            console.error(e);
          });
      }

      renderSections(parsedState) {
        const { items, sections } = parsedState;

        this.getSectionsToRender().forEach(({ id, selector, section }) => {
          const sectionElement = document.getElementById(id);
          if (!sectionElement) return;

          const newSection = new DOMParser().parseFromString(sections[section], 'text/html').querySelector(selector);

          if (section === this.dataset.section) {
            if (this.queue.length > 0 || this.hasPendingQuantityUpdate) return;

            const focusedElement = document.activeElement;
            let focusTarget = focusedElement?.dataset?.target;
            if (focusTarget?.includes('remove')) {
              focusTarget = focusedElement.closest('quantity-popover')?.querySelector('[data-target*="increment-"]')
                ?.dataset.target;
            }

            const total = this.getTotalBar();
            if (total) {
              total.innerHTML = newSection.querySelector('.quick-order-list__total').innerHTML;
            }

            const table = this.quickOrderListTable;
            const newTable = newSection.querySelector('.quick-order-list__table');

            // only update variants if they are from the active page
            const shouldUpdateVariants =
              this.currentPage === (newSection.querySelector('.pagination-wrapper')?.dataset.page ?? '1');
            if (newTable && shouldUpdateVariants) {
              table.innerHTML = newTable.innerHTML;

              const newFocusTarget = this.querySelector(`[data-target='${focusTarget}']`);
              if (newFocusTarget) {
                newFocusTarget?.focus({ preventScroll: true });
              }

              this.initVariantEventListeners();
            }
          } else if (section === 'cart-drawer') {
            sectionElement.closest('cart-drawer')?.classList.toggle('is-empty', items.length === 0);
            sectionElement.querySelector(selector).innerHTML = newSection.innerHTML;
          } else {
            sectionElement.innerHTML = newSection.innerHTML;
          }
        });
      }

      getTotalBar() {
        return this.querySelector('.quick-order-list__total');
      }

      scrollTop() {
        const { top } = this.getBoundingClientRect();

        if (this.isListInsideModal) {
          this.scrollIntoView();
        } else {
          window.scrollTo({ top: top + window.scrollY - (this.stickyHeader?.height || 0), behavior: 'instant' });
        }
      }

      scrollQuickOrderListTable(target) {
        const inputTopBorder = target.getBoundingClientRect().top;
        const inputBottomBorder = target.getBoundingClientRect().bottom;

        if (this.isListInsideModal) {
          const totalBarCrossesInput = inputBottomBorder > this.totalBar.getBoundingClientRect().top;
          const tableHeadCrossesInput =
            inputTopBorder < this.querySelector('.quick-order-list__table thead').getBoundingClientRect().bottom;

          if (totalBarCrossesInput || tableHeadCrossesInput) {
            this.scrollToCenter(target);
          }
        } else {
          const stickyHeaderBottomBorder = this.stickyHeaderElement?.getBoundingClientRect().bottom;
          const totalBarCrossesInput = inputBottomBorder > this.totalBarPosition;
          const inputOutsideOfViewPort =
            inputBottomBorder < this.querySelector('.variant-item__quantity-wrapper').offsetHeight;
          const stickyHeaderCrossesInput =
            this.stickyHeaderElement &&
            this.stickyHeader.type !== 'on-scroll-up' &&
            this.stickyHeader.height > inputTopBorder;
          const stickyHeaderScrollupCrossesInput =
            this.stickyHeaderElement &&
            this.stickyHeader.type === 'on-scroll-up' &&
            this.stickyHeader.height > inputTopBorder &&
            stickyHeaderBottomBorder > 0;

          if (
            totalBarCrossesInput ||
            inputOutsideOfViewPort ||
            stickyHeaderCrossesInput ||
            stickyHeaderScrollupCrossesInput
          ) {
            this.scrollToCenter(target);
          }
        }
      }

      scrollToCenter(target) {
        target.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }

      handleScrollIntoView(event) {
        if ((event.key === 'Tab' || event.key === 'Enter') && this.allInputsArray.length !== 1) {
          this.scrollQuickOrderListTable(event.target);
        }
      }

      handleSwitchVariantOnEnter(event) {
        if (event.key !== 'Enter' || event.target.tagName !== 'INPUT') return;

        event.preventDefault();
        event.target.blur();

        if (!this.validateInput(event.target) || this.allInputsArray.length <= 1) return;

        const currentIndex = this.allInputsArray.indexOf(event.target);
        const offset = event.shiftKey ? -1 : 1;
        const nextIndex = (currentIndex + offset + this.allInputsArray.length) % this.allInputsArray.length;

        this.allInputsArray[nextIndex]?.select();
      }

      updateMultipleQty(items) {
        if (this.queue.length == 0) this.hasPendingQuantityUpdate = false;

        this.toggleLoading(true);
        const url = this.dataset.url || window.location.pathname;

        const body = JSON.stringify({
          updates: items,
          sections: this.getSectionsToRender().map(({ section }) => section),
          sections_url: `${url}?page=${this.currentPage}`,
        });

        this.updateMessage();
        this.setErrorMessage();
        
        this.setRequestStarted(false);        
        const parent_el = this;

        let sub_total = 0;
        let sub_item = 0;
        for (const key in this.updateVaraintJson) {
          const varinat_ele = this.querySelector('#Variant-'+key);
          let qty =0, price = 0;          

          if (items.hasOwnProperty(key)) {
            this.updateVaraintJson[key].quantity = items[key];
            price = this.updateVaraintJson[key].price;
            qty = items[key];
          }else{
            qty = items[key] ? items[key] : 0;
            qty = qty == 0 && this.updateVaraintJson[key].quantity != undefined ? this.updateVaraintJson[key].quantity : qty
            price = this.updateVaraintJson[key].price;
          }

          price = qty * price
          varinat_ele.querySelectorAll('.variant-item__totals').forEach((el)=>{
            el.querySelector('.price').textContent = formatMoney(price)
          });
          sub_total = sub_total + price;          
          sub_item = sub_item + qty;          
        }

        parent_el.querySelector('.quick-order-list__total-items span').textContent = sub_item;
        parent_el.querySelector('.totals__subtotal-value').textContent = formatMoney(sub_total);
        
        /*
          fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
            .then((response) => response.text())
            .then(async (state) => {
              const parsedState = JSON.parse(state);
              this.renderSections(parsedState);
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: this.id,
                cartData: parsedState,
              });
            })
            .catch((e) => {
              console.error(e);
              this.setErrorMessage(window.cartStrings.error);
            })
            .finally(() => {
              this.queue.length === 0 && this.toggleLoading(false);
              this.setRequestStarted(false);
            });
        */
      }

      setErrorMessage(message = null) {
        this.errorMessageTemplate =
          this.errorMessageTemplate ??
          document.getElementById(`QuickOrderListErrorTemplate-${this.dataset.productId}`).cloneNode(true);
        const errorElements = document.querySelectorAll('.quick-order-list-error');

        errorElements.forEach((errorElement) => {
          errorElement.innerHTML = '';
          if (!message) return;
          const updatedMessageElement = this.errorMessageTemplate.cloneNode(true);
          updatedMessageElement.content.querySelector('.quick-order-list-error-message').innerText = message;
          errorElement.appendChild(updatedMessageElement.content);
        });
      }

      updateMessage(quantity = null) {
        const messages = this.querySelectorAll('.quick-order-list__message-text');
        const icons = this.querySelectorAll('.quick-order-list__message-icon');

        if (quantity === null || isNaN(quantity)) {
          messages.forEach((message) => (message.innerHTML = ''));
          icons.forEach((icon) => icon.classList.add('hidden'));
          return;
        }

        const isQuantityNegative = quantity < 0;
        const absQuantity = Math.abs(quantity);

        const textTemplate = isQuantityNegative
          ? absQuantity === 1
            ? window.quickOrderListStrings.itemRemoved
            : window.quickOrderListStrings.itemsRemoved
          : quantity === 1
          ? window.quickOrderListStrings.itemAdded
          : window.quickOrderListStrings.itemsAdded;

        messages.forEach((msg) => (msg.innerHTML = textTemplate.replace('[quantity]', absQuantity)));

        if (!isQuantityNegative) {
          icons.forEach((i) => i.classList.remove('hidden'));
        }
      }

      updateError(updatedValue, id) {
        let message = '';
        if (typeof updatedValue === 'undefined') {
          message = window.cartStrings.error;
        } else {
          message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
        }
        this.updateLiveRegions(id, message);
      }

      updateLiveRegions(id, message) {
        const variantItemErrorDesktop = document.getElementById(`Quick-order-list-item-error-desktop-${id}`);
        if (variantItemErrorDesktop) {
          variantItemErrorDesktop.querySelector('.variant-item__error-text').innerHTML = message;
          variantItemErrorDesktop.closest('tr').classList.remove('hidden');
        }
        if (variantItemErrorMobile)
          variantItemErrorMobile.querySelector('.variant-item__error-text').innerHTML = message;

        this.querySelector('#shopping-cart-variant-item-status').setAttribute('aria-hidden', true);

        const cartStatus = document.getElementById('quick-order-list-live-region-text');
        cartStatus.setAttribute('aria-hidden', false);

        setTimeout(() => {
          cartStatus.setAttribute('aria-hidden', true);
        }, 1000);
      }

      toggleLoading(loading, target = this) {
        target.querySelector('#shopping-cart-variant-item-status').toggleAttribute('aria-hidden', !loading);
        target
          .querySelectorAll('.variant-remove-total .loading__spinner')
          ?.forEach((spinner) => spinner.classList.toggle('hidden', !loading));
      }
    }
  );
  

  function quickOrderListAddtoCart(event, el) {    
    event.preventDefault();
    const parent_el = el.closest('quick-order-list'), th_e = parent_el;
    const listOfItem = parent_el.updateVaraintJson;    
    const updates = {};
    const product_handle = parent_el.dataset.handle;
    const added_cart_qty_o = window.qtyCondition.cart_type && window.qtyCondition.cart_type[product_handle] != undefined ? window.qtyCondition.cart_type[product_handle] : null;    
    let min_qty = 0;
    if ( parent_el.quantity_rules ){
      if ( window.qtyCondition.first_time ){
      min_qty = Number(parent_el.quantity_rules.minimum_quantity_first_time);
      }else{
        min_qty = Number(parent_el.quantity_rules.minimum_quantity_returned);
      }
    }
    
    let total_qty = 0;
    for (const key in listOfItem) {
      if( listOfItem[key].quantity > 0 ){
        updates[key] = listOfItem[key].quantity
        total_qty = total_qty + listOfItem[key].quantity;
        if( added_cart_qty_o && added_cart_qty_o[key] ){
          updates[key] = listOfItem[key].quantity + added_cart_qty_o[key];
          total_qty = total_qty + added_cart_qty_o[key];
        }
      }
    }
    
    if( min_qty > 0 && min_qty > total_qty ){
      let require_type = parent_el.quantity_rules?.requires_with_first_order?.toLowerCase();
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
        parent_el.querySelectorAll('.quick-order-list-total__column').forEach((quick_el) => {
          quick_el.querySelector('.quick-order-list__message-text').innerText = `${ text } produc type "${ require_type.toUpperCase() }" minimum qunatity ${re_min_qty}.`;
        });       
      }else{       
        let text = window.qtyCondition.first_time ? window.qtyCondition.fristOrderText : window.qtyCondition.returnOrderText;
        text = text.replace('TTT', parent_el.quantity_rules.product_type).replace('RRR', min_qty);        
        parent_el.querySelectorAll('.quick-order-list-total__column').forEach((quick_el) => {          
          quick_el.querySelector('.quick-order-list__message-text').innerHTML = text;
        }); 
        // let text = `Need to add ${ min_qty - total_qty } `;
        // if( min_qty - total_qty < 1 ){
        //   parent_el.querySelectorAll('.quick-order-list-total__column').forEach((quick_el) => {          
        //     quick_el.querySelector('.quick-order-list__message-text').innerText = `${ text }.`;
        //   });
        // }
      }
      return;
    }else{
      parent_el.querySelectorAll('.quick-order-list-total__column').forEach((quick_el) => {          
        quick_el.querySelector('.quick-order-list__message-text').innerText = '';
      });
    }
    
    if ( Object.entries(updates).length > 0 ){
      el.classList.add('loading');
      el.querySelector('.loading__spinner').classList.remove('hidden');

      const url = parent_el.dataset.url || window.location.pathname;
      th_e.cart = document.querySelector('cart-drawer');

      const body = JSON.stringify({
        updates: updates,
        sections: parent_el.getSectionsToRender().map(({ section }) => section),
        sections_url: `${url}?page=${parent_el.currentPage}`,
      });
      
      fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } })
        .then((response) => {
          return response.text();
        })
        .then((state) => {                    
          const parsedState = JSON.parse(state);          
          if(!th_e.cart){            
            window.location = routes.cart_url;  
          }else{                        
            const quickAddModal = th_e.closest('modal-dialog');
            if (quickAddModal) {              
              setTimeout(() => { th_e.cart.renderContents(parsedState) });              
              quickAddModal.hide(true);
            } else {              
              th_e.cart.renderContents(parsedState);
            }
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

if (!customElements.get('quick-order-list-remove-all-button')) {
  customElements.define(
    'quick-order-list-remove-all-button',
    class QuickOrderListRemoveAllButton extends HTMLElement {
      constructor() {
        super();
        this.quickOrderList = this.closest('quick-order-list');

        this.actions = {
          confirm: 'confirm',
          remove: 'remove',
          cancel: 'cancel',
        };

        this.addEventListener('click', (event) => {
          event.preventDefault();
          if (this.dataset.action === this.actions.confirm) {
            this.toggleConfirmation(false, true);
          } else if (this.dataset.action === this.actions.remove) {
            const items = this.quickOrderList.cartVariantsForProduct.reduce(
              (acc, variantId) => ({ ...acc, [variantId]: 0 }),
              {}
            );

            this.quickOrderList.updateMultipleQty(items);
            this.toggleConfirmation(true, false);
          } else if (this.dataset.action === this.actions.cancel) {
            this.toggleConfirmation(true, false);
          }
        });
      }

      toggleConfirmation(showConfirmation, showInfo) {
        this.quickOrderList
          .querySelector('.quick-order-list-total__confirmation')
          .classList.toggle('hidden', showConfirmation);
        this.quickOrderList.querySelector('.quick-order-list-total__info').classList.toggle('hidden', showInfo);
      }
    }
  );
}
