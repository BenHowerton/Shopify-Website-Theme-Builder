(function () {
  const initAsideMenu = () => {
    const header = document.querySelector(".header-wrapper");
    const asideMenu = document.querySelector(".aside-menu");
    const openAsideMenuBtn = document.querySelector(".aside-menu__toggle--open-btn");
    const closeAsideMenuBtn = document.querySelector(".aside-menu__toggle--close-btn");
    const heightTopAside = document.querySelector('.aside-menu__container').getBoundingClientRect().top;
    asideMenu.style.setProperty("--top-height", `${heightTopAside}px`);
    
    if (header) header.preventHide = false;

    const openAsideMenu = (e) => {
      e.preventDefault();
      if (header) header.preventHide = true;
      asideMenu.classList.add("aside-menu--open");
      document.body.classList.add("overflow-hidden-drawer");
    };

    const closeAsideMenu = (e) => {
      e.preventDefault();
      asideMenu.classList.remove("aside-menu--open");
      document.body.classList.remove("overflow-hidden-drawer");
      if (header) header.preventHide = false;
    };

    openAsideMenuBtn.addEventListener("click", openAsideMenu);
    closeAsideMenuBtn.addEventListener("click", closeAsideMenu);

    asideMenu.addEventListener("keydown", (e) => {
      if (e.code === "Escape") {
        closeAsideMenu(e);
      }
    });
  };

  document.addEventListener("shopify:section:load", initAsideMenu);
	document.addEventListener("shopify:section:unload", initAsideMenu);
	document.addEventListener("shopify:section:reorder", initAsideMenu);

  initAsideMenu();
})();
