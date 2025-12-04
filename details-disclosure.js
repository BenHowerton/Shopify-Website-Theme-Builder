class DetailsDisclosure extends HTMLElement {
  constructor() {
    super();
    this.mainDetailsToggle = this.querySelector("details");

    document.addEventListener("keyup", this.onKeyUp.bind(this));
    document.addEventListener("click", this.onFocusOut.bind(this));
  }

  onKeyUp(event) {
    if (event.code && event.code.toUpperCase() !== "ESCAPE") return;

    this.mainDetailsToggle.removeAttribute("open");
    document.body.classList.remove("overflow-hidden");
  }

  onFocusOut(event) {
    const withBoundaries = event.composedPath().includes(this.mainDetailsToggle);

    if (!withBoundaries) {
      this.mainDetailsToggle.removeAttribute("open");
    }
  }

  close() {
    this.mainDetailsToggle.removeAttribute("open");
    document.body.classList.remove("overflow-hidden");
  }
}

customElements.define("details-disclosure", DetailsDisclosure);
