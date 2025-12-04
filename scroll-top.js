(function () {
	const scrollTop = () => {
		const btnScrollTop = document.querySelector(".scroll-top");
		window.addEventListener("scroll", function () {
			if (btnScrollTop) {
				if (scrollY > document.documentElement.clientHeight) {
					btnScrollTop.classList.add("show");
				} else {
					btnScrollTop.classList.remove("show");
				}
			}
		});

		btnScrollTop.onclick = () => {
			window.scrollTo({ top: 0, behavior: "smooth" });
		};
	};

	scrollTop();

	document.addEventListener("shopify:section:load", function () {
		scrollTop();
	});
})();
