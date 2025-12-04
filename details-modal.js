class DetailsModal extends HTMLElement {
  constructor() {
    super();
    this.header = document.querySelector(".header-wrapper");
    this.detailsContainer = this.querySelector("details");
    this.summaryToggle = this.querySelector("summary");
    this.header.preventHide = false;

    this.detailsContainer.addEventListener(
      "keyup",
      (event) => event.code === "Escape" && this.close()
    );
    this.summaryToggle.addEventListener(
      "click",
      this.onSummaryClick.bind(this)
    );

    this.summaryToggle.setAttribute("role", "button");
  }

  isOpen() {
    return this.detailsContainer.hasAttribute("open");
  }

  onSummaryClick(event) {
    event.preventDefault();
    if (event.target.closest("details").hasAttribute("open")) {
      this.close();
      this.header.preventHide = false;

      if (event.currentTarget.classList.contains('header__icon--search')) {
        document.querySelector('.header__overlay').classList.remove('active');
      }
    } else {
      this.open(event);
      if (!this.header) return;
      this.header.preventHide = this.detailsContainer.open;

      if (event.currentTarget.classList.contains('header__icon--search')) {
        document.querySelector('.header__overlay').classList.add('active');
      }
    }
  }

  onBodyClick(event) {
    if (!this.contains(event.target) || event.target.classList.contains("modal-overlay"))
      this.close(false);
  }

  open(event) {
    this.onBodyClickEvent = this.onBodyClickEvent || this.onBodyClick.bind(this);
    event.target.closest("details").setAttribute("open", true);
    document.body.addEventListener("click", this.onBodyClickEvent);
    document.body.classList.add("overflow-hidden");

    trapFocus(
      this.detailsContainer.querySelector('[tabindex="-1"]'),
      this.detailsContainer.querySelector('input:not([type="hidden"])')
    );

    if (this.header.parentNode.classList.contains('color-background-overlay') && this.classList.contains('header__search')) {
      this.header.parentNode.classList.remove('color-background-overlay');
      this.header.parentNode.classList.add('color-background-overlay-hidden');
    }
  }

  close(focusToggle = true) {
    removeTrapFocus(focusToggle ? this.summaryToggle : null);
    this.detailsContainer.removeAttribute("open");
    document.body.removeEventListener("click", this.onBodyClickEvent);
    document.body.classList.remove("overflow-hidden");
    this.header.preventHide = false;

    if (this.header.parentNode.classList.contains('color-background-overlay-hidden') && this.classList.contains('header__search')) {
      const colorScheme = document.querySelector('main').querySelectorAll('.shopify-section')[0]?.querySelector('[data-header-transparent]')?.getAttribute('data-header-transparent-color-scheme');
      this.header.parentNode.classList.remove('color-background-overlay-hidden');
      this.header.parentNode.classList.add('color-background-overlay');
      if (colorScheme)
        this.header.parentNode.classList.add(colorScheme);
    }

    document.querySelector('.header__overlay').classList.remove('active');
  }
}

customElements.define("details-modal", DetailsModal);
