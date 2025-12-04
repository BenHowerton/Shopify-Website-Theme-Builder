if (typeof ProductModel === 'undefined') {
  class ProductModel extends DeferredMedia {
    constructor() {
      super();
    }

    loadContent() {
      super.loadContent();

      Shopify.loadFeatures([
        {
          name: 'model-viewer-ui',
          version: '1.0',
          onLoad: this.setupModelViewerUI.bind(this),
        },
      ]);
    }

    setupModelViewerUI(errors) {
      if (errors) return;

      this.modelViewerUI = new Shopify.ModelViewerUI(this.querySelector('model-viewer'));

      const $this = this;
      const target = $this.querySelector('model-viewer');

      const observer = new MutationObserver(records => {
        if ($this.closest('.swiper') != null) {
          if (!target.classList.contains('shopify-model-viewer-ui__disabled')) {
            $this.closest('.swiper').swiper.params.noSwiping = true;
            $this.closest('.swiper').swiper.params.noSwipingClass = 'swiper-slide';
          } else {
            $this.closest('.swiper').swiper.params.noSwiping = false;
          }
        }
      });

      observer.observe(target, { attributes: true });
    }
  }
  customElements.define('product-model', ProductModel);
}

if (typeof window.ProductModel === 'undefined') {
  window.ProductModel = {
    loadShopifyXR() {
      Shopify.loadFeatures([
        {
          name: 'shopify-xr',
          version: '1.0',
          onLoad: this.setupShopifyXR.bind(this),
        },
      ]);
    },

    setupShopifyXR(errors) {
      if (errors) return;

      if (!window.ShopifyXR) {
        document.addEventListener('shopify_xr_initialized', () =>
          this.setupShopifyXR()
        );
        return;
      }

      document.querySelectorAll('[id^="ProductJSON-"]').forEach((modelJSON) => {
        window.ShopifyXR.addModels(JSON.parse(modelJSON.textContent));
        modelJSON.remove();
      });
      window.ShopifyXR.setupXRElements();
    },
  };

  window.addEventListener('DOMContentLoaded', () => { window.ProductModel?.loadShopifyXR(); });
}
