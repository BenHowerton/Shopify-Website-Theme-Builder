class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);

    const facetButton = this.querySelector(".facets__open-button");
    if (facetButton) {
			facetButton.onclick = () => {
        this.querySelector(".facets__wrapper").classList.add("active");
        this.closest(".collection-wrapper")
					.querySelector(".products-grid__overlay")
					.classList.add("active");
				document.body.classList.add("overflow-hidden");
      }
    }
    const overlay = this.closest(".collection-wrapper").querySelector(".products-grid__overlay");
    if (overlay) 
    overlay.onclick = (event) => {
      event.currentTarget.closest(".collection-wrapper").querySelector(".facets__wrapper").classList.remove("active");
      event.currentTarget.classList.remove('active');
      document.body.classList.remove("overflow-hidden");
    }

    const facetsClose = this.querySelector(".facets__close");
    if (facetsClose) {
      facetsClose.onclick = () => {
        this.querySelector(".facets__wrapper").classList.remove("active");
        this.closest(".collection-wrapper")
          .querySelector(".products-grid__overlay")
          .classList.remove("active");
        document.body.classList.remove("overflow-hidden");
      };
    }
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer){
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
        FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
    
    if (document.querySelector('.js-load-more') || document.querySelector('.js-infinite-scroll')) {
      loadMore();
    }

    colorSwatches();
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount')?.innerHTML || '0 results';
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    const containerMobile = document.querySelector('.mobile-facets__count');
    container.innerHTML = count;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    if (containerMobile) {
      containerMobile.innerHTML = count;
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;

      if (activeFacetsElement.querySelector('.active-facets__button') && document.querySelector(".facets__open-button")) {
        document.querySelector(".facets__open-button").classList.add('facets__open-button_accent');
      }
      else if (!activeFacetsElement.querySelector('.active-facets__button') && document.querySelector(".facets__open-button")) {
        document.querySelector(".facets__open-button").classList.remove('facets__open-button_accent');
      }

      if (activeFacetsElement.querySelector('.active-facets__button') && document.querySelector(".facets__wrapper-bottom .button--secondary")) {
        document.querySelector(".facets__wrapper-bottom .button--secondary").removeAttribute('disabled');
      }
      else if (!activeFacetsElement.querySelector('.active-facets__button') && document.querySelector(".facets__wrapper-bottom .button--secondary")) {
        document.querySelector(".facets__wrapper-bottom .button--secondary").setAttribute('disabled', '');
      }

      if (activeFacetsElement.querySelector('.active-facets__button') && document.querySelector(".mobile-facets__clear")) {
        document.querySelectorAll(".mobile-facets__clear").forEach(item => {
          item.removeAttribute('disabled');
        })
      }
      else if (!activeFacetsElement.querySelector('.active-facets__button') && document.querySelector(".mobile-facets__clear")) {
        document.querySelectorAll(".mobile-facets__clear").forEach(item => {
          item.setAttribute('disabled', '');
        })
      }

    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector('.facets__selected');
    const sourceElement = source.querySelector('.facets__selected');

    const targetElementAccessibility = target.querySelector('.facets__summary');
    const sourceElementAccessibility = source.querySelector('.facets__summary');

    if (sourceElement && targetElement) {
      target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector('.facets__summary').outerHTML = source.querySelector('.facets__summary').outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'))
      this.onSubmitForm(searchParams, event)
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            const noJsElements = document.querySelectorAll('.no-js-list');
            noJsElements.forEach((el) => el.remove());
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event)
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));
    this.setMinAndMaxValues();
    this.controlSlider();
    this.controlInput();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }

  fillSlider () {
    const inputRangeWrappers = document.querySelectorAll('.facets__price .facets__range');
    inputRangeWrappers.forEach(inputWrapper => {
      const inputsRange = inputWrapper.querySelectorAll('.field__range');
      const inputRangeFrom = inputsRange[0];
      const inputRangeTo = inputsRange[1];

      const range = inputRangeTo.max - inputRangeTo.min;
      const fromCurrent = inputRangeFrom.value - inputRangeTo.min;
      const toCurrent = inputRangeTo.value - inputRangeTo.min;
      const minRange = fromCurrent / range * 100;
      const maxRange = toCurrent / range * 100;

      inputWrapper.setAttribute(
        'style',
        `--range-min: ${minRange}%; --range-max: ${maxRange}%`
      );
    })
  }

  controlSlider () {
    const inputRangeWrappers = document.querySelectorAll('.facets__price .facets__range');
    const inputNumberWrappers = document.querySelectorAll('.facets__price .facets__price-wrapper');

    inputRangeWrappers.forEach((inputWrapper, index) => {
      const inputsRange = inputWrapper.querySelectorAll('.field__range');
      const inputRangeFrom = inputsRange[0];
      const inputRangeTo = inputsRange[1];
      const inputNumberFrom = inputNumberWrappers[index].querySelectorAll('.field__input')[0];
      const inputNumberTo = inputNumberWrappers[index].querySelectorAll('.field__input')[1];

      inputRangeFrom.oninput = () => {
        const from = parseInt(inputRangeFrom.value, 10);
        const to = parseInt(inputRangeTo.value, 10);
        if (from > to) {
          inputRangeFrom.value = to;
          inputNumberFrom.value = to;
        }
        else {
          inputNumberFrom.value = from;
        }

        this.fillSlider();
      }

      if (Number(inputRangeTo.value) <= 0 ) {
        inputRangeTo.style.zIndex = 2;
      } else {
        inputRangeTo.style.zIndex = 0;
      }

      inputRangeTo.oninput = () => {
        const from = parseInt(inputRangeFrom.value, 10);
        const to = parseInt(inputRangeTo.value, 10);
        if (from <= to) {
          inputRangeTo.value = to;
          inputNumberTo.value = to;
        }
        else {
          inputNumberTo.value = from;
          inputRangeTo.value = from;
        }

        if (Number(inputRangeTo.value) <= 0 ) {
          inputRangeTo.style.zIndex = 2;
        } else {
          inputRangeTo.style.zIndex = 0;
        }

        this.fillSlider();
      }
    })
  }

  controlInput() {
    const inputRangeWrappers = document.querySelectorAll('.facets__price .facets__range');
    const inputNumberWrappers = document.querySelectorAll('.facets__price .facets__price-wrapper');

    inputNumberWrappers.forEach((inputWrapper, index) => {
      const inputsNumber = inputWrapper.querySelectorAll('.field__input');
      const inputNumberFrom = inputsNumber[0];
      const inputNumberTo = inputsNumber[1];
      const inputRangeFrom = inputRangeWrappers[index].querySelectorAll('.field__range')[0];
      const inputRangeTo = inputRangeWrappers[index].querySelectorAll('.field__range')[1];

      inputNumberFrom.oninput = () => {
        const from = parseInt(inputNumberFrom.value, 10);
        const to = parseInt(inputNumberTo.value, 10);
        if (from > to) {
          inputRangeFrom.value = to;
          inputNumberFrom.value = to;
        } 
        else {
          inputRangeFrom.value = from;
        }

        this.fillSlider();
      }

      inputNumberTo.oninput = () => {
        const from = parseInt(inputNumberFrom.value, 10);
        const to = parseInt(inputNumberTo.value, 10);
        if (from <= to) {
          inputRangeTo.value = to;
          inputNumberTo.value = to;
        }
        else {
          inputNumberTo.value = from;
        }

        this.fillSlider();
      }

    })
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', this.closeFilter.bind(this));
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    form.onActiveFilterClick(event);
  }
}

customElements.define('facet-remove', FacetRemove);
