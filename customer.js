const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
};

const attributes = {
  expanded: 'aria-expanded',
  expandedTarget: 'data-expand',
  confirmMessage: 'data-confirm-message',
  id: 'data-id'
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container ? {
      container,
      addressContainer: container.querySelector(selectors.addressContainer),
      toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
      cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
      deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
      countrySelects: container.querySelectorAll(selectors.addressCountrySelect)
    } : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew'
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target, items) {
    if (items === undefined) items = false;

    target.setAttribute(
      attributes.expanded,
      (target.getAttribute(attributes.expanded) === 'false').toString()
    );

    if (target.getAttribute('data-type') === 'reset') { // Cancel buttons
      const item = target.closest('.js-expand-elem');
      const empty = document.querySelector('.account-none--address');

      item.closest('.js-expand-elem').setAttribute(
        attributes.expandedTarget,
        (item.closest('.js-expand-elem').getAttribute(attributes.expandedTarget) === 'false').toString()
      )

      if (empty) {
        empty.setAttribute(
          attributes.expandedTarget,
          (item.getAttribute(attributes.expandedTarget) === 'false').toString()
        )
      }
    } else if (target.getAttribute('data-type') === 'new') {
      const item = document.getElementById('AddAddress');
      const empty = document.querySelector('.account-none--address');

      if (item.getAttribute(attributes.expandedTarget) === 'false') {
        setTimeout(function () {
          $('html, body').animate({
            scrollTop: $("#AddAddress").offset().top
          }, 700);
        }, 100);
      }

      item.setAttribute(
        attributes.expandedTarget,
        (item.getAttribute(attributes.expandedTarget) === 'false').toString()
      )

      if (empty) {
        empty.setAttribute(
          attributes.expandedTarget,
          (item.getAttribute(attributes.expandedTarget) === 'false').toString()
        )
      }
    } else { // Edit address buttons
      items.forEach(el => {
        if (target.getAttribute('id').slice(15) === el.getAttribute('id').slice(12)) {
          el.setAttribute(
            attributes.expandedTarget,
            (el.getAttribute(attributes.expandedTarget) === 'false').toString()
          )
        }

        if (el.getAttribute(attributes.expandedTarget) === 'false') {
          const formBox = target.closest('.address-list__item').previousElementSibling;
          const addressId = target.getAttribute('id').slice(15);

          setTimeout(function () {
            $('html, body').animate({
              scrollTop: formBox?.offsetTop
            }, 700);
          }, 100);

          this._setupCountries();

          const selectCountry = formBox?.querySelector(`#AddressCountry_${addressId}`);
          const initCountry = selectCountry?.dataset.default;
          selectCountry.value = initCountry;

          const selectProvince = formBox?.querySelector(`#AddressProvince_${addressId}`);
          const initProvince = selectProvince?.dataset.default;
          selectProvince.value = initProvince;
        }
      })
    }
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(
      currentTarget,
      currentTarget.closest('.addresses').querySelectorAll('.js-expand-elem')
    );
  }

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(
      currentTarget
    );
  }

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  }
}
