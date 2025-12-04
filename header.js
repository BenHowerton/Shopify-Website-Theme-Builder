(function () {
  const deleteColorSchemes = (element) => {
    element.classList.forEach(className => {
      if (className.startsWith('color-background-') && className != 'color-background-overlay') {
        element.classList.remove(className);
      }
    });
  }

  const header = () => {
    const header = document.querySelector(".shopify-section-header");
    const menu = document.querySelector(".list-menu--inline");
    const menuLinks = document.querySelectorAll(".list-menu-item");
    const search = document.querySelector("details-modal.header__search");
    const searchModal = document.querySelector("details-modal.header__search > details");
    const allSubmenu = document.querySelectorAll(".header__submenu");
    const isLightLogo = document.querySelector('main').querySelectorAll('.shopify-section')[0]?.querySelector('[data-header-transparent]')?.getAttribute('data-header-light-logo') || "";
    const main = document.getElementById('MainContent')
    const sections = main.querySelectorAll('.shopify-section')
    const sectionFirstChildTransparent = sections[0]?.querySelector(
      '[data-header-transparent]'
    )
    const headerTransparent = header
    .querySelector('.header-wrapper')
    .classList.contains('header-wrapper--full-width')
    
    if (isLightLogo == 'true')
			header.classList.add('header--light-logo');
    else
      header.classList.remove('header--light-logo');

    if (!(sectionFirstChildTransparent && headerTransparent)) {
      deleteColorSchemes(header);
      header.classList.remove("color-background-overlay");
    }

    header.addEventListener("keydown", (e) => {
      if (e.code === "Escape" && search.isOpen) {
        search.close();
      }
    });

    /*const annBar = document.querySelector(".section-announcement");
    const annBarObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        document.documentElement.style.setProperty("--ann-height", `${entry.boundingClientRect.height}px`);
      } else {
        document.documentElement.style.setProperty("--ann-height", `0px`);
      }
    });

    if (annBar) {
      annBarObserver.observe(annBar);
    } else {
      document.documentElement.style.setProperty("--ann-height", `0px`);
    }*/

    menuLinks.forEach((link) => {
      link.addEventListener("mouseenter", (e) => {
        if (link.classList.contains("list-menu--megamenu")) {
          link.classList.add("list-menu--megamenu-visible");
          document.querySelector('.header__overlay').classList.add('active');

          menuLinks.forEach((el) => {
            el.classList.add("list-menu-item--inactive");
            el.classList.remove("list-menu-item--active");
            if (el !== link) {
              el.classList.remove("list-menu--megamenu-visible");
              //document.querySelector('.header__overlay').classList.remove('active');
            }
          });
          link.classList.remove("list-menu-item--inactive");
          link.classList.add("list-menu-item--active");
        } else {
          menuLinks.forEach((el) => {
            el.classList.add("list-menu-item--inactive");
            el.classList.remove("list-menu-item--active");
            el.classList.remove("list-menu--megamenu-visible");
            document.querySelector('.header__overlay').classList.remove('active');
          });
          link.classList.remove("list-menu-item--inactive");
          link.classList.add("list-menu-item--active");
        }
      });
    });

    document.body.addEventListener('mousedown', function() {
			document.body.classList.add('mouse-focus');
		});

		document.body.addEventListener('keydown', function(e) {
				if (e.key === 'Tab') {
					document.body.classList.remove('mouse-focus');
				}
		});

    allSubmenu.forEach((submenu) => {
      const links = submenu.querySelectorAll(".header__submenu-item:not(.header__submenu-item--grandchild)");

      links.forEach((link) => {
        const childLinks = link.parentElement.querySelectorAll(".header__submenu-item--grandchild");

        link.addEventListener("mouseenter", (e) => {
          links.forEach((el) => {
            el.classList.add("header__submenu-item--inactive");
          });
          link.classList.remove("header__submenu-item--inactive");
        });

        childLinks.forEach((childLink) => {
          childLink.addEventListener("mouseenter", (e) => {
            childLinks.forEach((el) => {
              el.classList.add("header__submenu-item--inactive");
            });
            childLink.classList.remove("header__submenu-item--inactive");
          });
        });

        link.addEventListener("mouseleave", (e) => {
          childLinks.forEach((el) => {
            el.classList.remove("header__submenu-item--inactive");
          });
        });
      });

      submenu.addEventListener("mouseleave", (e) => {
        links.forEach((el) => {
          el.classList.remove("header__submenu-item--inactive");
        });
      });
    });

    menu?.addEventListener("mouseleave", (e) => {
      menuLinks.forEach((link) => {
        link.classList.remove("list-menu-item--inactive");
        link.classList.remove("list-menu-item--active");
        link.classList.remove("list-menu--megamenu-visible");
        document.querySelector('.header__overlay').classList.remove('active');
      });

      document.querySelectorAll(".header__submenu-item").forEach((link) => {
        link.classList.remove("header__submenu-item--inactive");
      })
    });

    if (header && header.classList.contains("color-background-overlay")) {
      const colorScheme = document.querySelector('main').querySelectorAll('.shopify-section')[0]?.querySelector('[data-header-transparent]')?.getAttribute('data-header-transparent-color-scheme');
      header.addEventListener("mouseenter", () => {
        header.classList.remove("color-background-overlay");
        /*if (colorScheme)
          header.classList.remove(colorScheme);*/
        deleteColorSchemes(header);
        header.classList.add("color-background-overlay-hidden");
      });

      header.addEventListener("mouseleave", () => { 
        if (!searchModal.hasAttribute("open")) {
          if (!header.classList.contains('shopify-section-header-sticky') 
            && !header.classList.contains('shopify-section-header-scroll')
            && !header.querySelector('.menu-drawer-container').classList.contains('menu-opening')
          ) {
            const main = document.getElementById('MainContent')
            const sections = main.querySelectorAll('.shopify-section')
            const sectionFirstChildTransparent = sections[0].querySelector(
              '[data-header-transparent]'
            )
            const headerTransparent = header
            .querySelector('.header-wrapper')
            .classList.contains('header-wrapper--full-width')
            
            if (sectionFirstChildTransparent && headerTransparent) {
              header.classList.add("color-background-overlay");
              if (colorScheme)
                header.classList.add(colorScheme);
            }
            header.classList.remove("color-background-overlay-hidden");
          }
        }
      });
    }

    if (header.querySelector('.header__submenu-button')) {
      header.querySelector('.js-open-list-menu-item').addEventListener('click', (event) => {
        const submenu = event.currentTarget.closest('.header__submenu');
        const items = submenu.querySelectorAll('.header__submenu-li');
        if (items) {
          items.forEach(item => {
            item.classList.add('active');
          })
        }

        event.currentTarget.parentElement.classList.add('hide');
      })
    }
  };

  document.addEventListener("shopify:section:load", header);
  document.addEventListener("shopify:section:unload", header);
  document.addEventListener("shopify:section:reorder", header);

  header();
})();
