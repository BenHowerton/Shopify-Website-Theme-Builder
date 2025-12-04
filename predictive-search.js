// prettier-ignore
class PredictiveSearch extends SearchForm {
	constructor() {
		super();
		this.cachedResults = {};
		this.predictiveSearchResults = this.querySelector("[data-predictive-search]");
		this.allPredictiveSearchInstances =
			document.querySelectorAll("predictive-search");
		this.isOpen = false;
		this.abortController = new AbortController();
		this.searchTerm = "";
		this.body = document.querySelector("body");
		this.headerBottom = document.querySelector(".header__bottom");
		this.promoModal = document.querySelector(".search__modal");
		this.collectionList = document.querySelector(".template-404__collections");
		this.headerInput = document.querySelector(".header__search .search__input");
		this.setupEventListeners();
	}

	setupEventListeners() {
		this.input.form.addEventListener("submit", this.onFormSubmit.bind(this));
		this.input.addEventListener("focus", this.onFocus.bind(this));
		this.addEventListener("focusout", this.onFocusOut.bind(this));
		this.addEventListener("keyup", this.onKeyup.bind(this));
	}

	getQuery() {
		return this.input.value.trim();
	}

	onChange() {
		const newSearchTerm = this.getQuery();
		if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
			// Remove the results when they are no longer relevant for the new search term
			// so they don't show up when the dropdown opens again
			this.querySelector("#predictive-search-results-groups-wrapper")?.remove();
		}

		// Update the term asap, don't wait for the predictive search query to finish loading
		this.updateSearchForTerm(this.searchTerm, newSearchTerm);

		this.searchTerm = newSearchTerm;

		if (!this.searchTerm.length) {
			this.close(true);
			return;
		}

		this.getSearchResults(this.searchTerm);
		if (this.getQuery().length) {
			this.hidePromoBlock();
		} else {
			this.showPromoBlock();
		}
	}

	onFormSubmit(event) {
		if (
			!this.getQuery().length ||
			this.querySelector('[aria-selected="true"] a') ||
			event.submitter.classList.contains("card__link")
		)
			event.preventDefault();
	}

	onFormReset(event) {
		super.onFormReset(event);
		if (super.shouldResetForm()) {
			this.searchTerm = "";
			this.abortController.abort();
			this.abortController = new AbortController();
			this.closeResults(true);
		}
	}

	onFocus() {
		const currentSearchTerm = this.getQuery();
		if (this.classList.contains("search-modal__form")) {
			if (this.headerBottom) {
				this.headerBottom.classList.add("header__bottom--visible");
			}
			if (this.promoModal) {
				this.promoModal.classList.remove("search__modal--hidden");
			}
			if (this.collectionList) {
				this.collectionList.classList.remove("hidden");
			}
		}

		if (!currentSearchTerm.length) {
			return;
		}

		if (this.searchTerm !== currentSearchTerm) {
			// Search term was changed from other search input, treat it as a user change
			this.onChange();
		} else if (this.getAttribute("results") === "true") {
			this.open();
			if (this.promoModal) {
				this.promoModal.classList.add("search__modal--hidden");
			}
			if (this.collectionList) {
				this.collectionList.classList.add("hidden");
			}
		} else {
			this.getSearchResults(this.searchTerm);
		}
	}

	onFocusOut() {
		if (this.classList.contains("search-modal__form")) {
			if (this.headerBottom) {
				this.headerBottom.classList.remove("header__bottom--visible");
			}
		}
		if (!this.classList.contains("search-modal__form")) {
			setTimeout(() => {
				if (!this.contains(document.activeElement)) this.close();
			});
		}
	}

	onBlur() {
		this.headerInput.blur();
	}

	onKeyup(event) {
		if (!this.getQuery().length) this.close(true);
		event.preventDefault();

		switch (event.code) {
			case "Enter":
				event.preventDefault();
				this.selectOption();
				break;
			case "Escape":
				this.close(true);
				this.closeResults(clearSearchTerm);
				if (this.getQuery().length) {
					this.hidePromoBlock();
				} else {
					this.showPromoBlock();
				}
				break;
		}
	}

	updateSearchForTerm(previousTerm, newTerm) {
		const searchForTextElement = this.querySelector(
			"[data-predictive-search-search-for-text]",
		);
		const currentButtonText = searchForTextElement?.innerText;
		if (currentButtonText) {
			if (
				currentButtonText.matchAll(new RegExp(previousTerm, "g")).length > 1
			) {
				// The new term matches part of the button text and not just the search term, do not replace to avoid mistakes
				return;
			}
			const newButtonText = currentButtonText.replace(previousTerm, newTerm);
			searchForTextElement.innerText = newButtonText;
		}
		if (this.getQuery().length) {
			this.hidePromoBlock();
		} else {
			this.showPromoBlock();
		}
	}

	selectOption() {
		const selectedOption = this.querySelector(
			'[aria-selected="true"] a, button[aria-selected="true"]',
		);

		if (selectedOption) selectedOption.click();
	}

	getSearchResults(searchTerm) {
		const queryKey = searchTerm.replace(" ", "-").toLowerCase();
		this.setLiveRegionLoadingState();

		if (this.cachedResults[queryKey]) {
			this.renderSearchResults(this.cachedResults[queryKey]);
			this.clickSearchTabs();
			return;
		}

		if (this.promoModal && this.classList.contains("search-modal__form")) {
			this.promoModal.classList.add("search__modal--hidden");
		}

		if (this.collectionList) {
			this.collectionList.classList.add("hidden");
		}

		fetch(
			`${routes.predictive_search_url}?q=${encodeURIComponent(searchTerm)}&section_id=predictive-search`,
			{ signal: this.abortController.signal },
		)
			.then((response) => {
				if (!response.ok) {
					var error = new Error(response.status);
					this.close();
					throw error;
				}
				return response.text();
			})
			.then((text) => {
				const resultsMarkup = new DOMParser()
					.parseFromString(text, "text/html")
					.querySelector("#shopify-section-predictive-search").innerHTML;
				// Save bandwidth keeping the cache in all instances synced
				this.allPredictiveSearchInstances.forEach(
					(predictiveSearchInstance) => {
						predictiveSearchInstance.cachedResults[queryKey] = resultsMarkup;
					},
				);
				this.renderSearchResults(resultsMarkup);
				this.clickSearchTabs();
				try {
					colorSwatches();
				} catch (err) {}
			})
			.catch((error) => {
				if (error?.code === 20) {
					// Code 20 means the call was aborted
					return;
				}
				this.close();
				throw error;
			});

		if (this.getQuery().length) {
			this.hidePromoBlock();
		} else {
			this.showPromoBlock();
		}
	}

	setLiveRegionLoadingState() {
		this.statusElement =
			this.statusElement || this.querySelector(".predictive-search-status");
		this.loadingText =
			this.loadingText || this.getAttribute("data-loading-text");

		this.setLiveRegionText(this.loadingText);
		this.setAttribute("loading", true);
	}

	setLiveRegionText(statusText) {
		this.statusElement.setAttribute("aria-hidden", "false");
		this.statusElement.textContent = statusText;

		setTimeout(() => {
			this.statusElement.setAttribute("aria-hidden", "true");
		}, 1000);
	}

	renderSearchResults(resultsMarkup) {
		this.predictiveSearchResults.innerHTML = resultsMarkup;
		this.setAttribute("results", true);

		this.setLiveRegionResults();
		this.open();
		if (this.promoModal && this.classList.contains("search-modal__form")) {
			this.promoModal.classList.add("search__modal--hidden");
		}
		if (this.collectionList) {
			this.collectionList.classList.add("hidden");
		}
	}

	clickSearchTabs() {
		const results = this.querySelectorAll(".predictive-search__results-list");
		if (results.length != 0) {
			results[0].classList.add("active");
			this.querySelector(".predictive-search__result-tab").classList.add(
				"active",
			);
			this.querySelectorAll(".predictive-search__result-tab").forEach((tab) => {
				tab.addEventListener("click", (event) => {
					event.preventDefault();
					const typeTarget = tab.dataset.typeTarget;
					this.querySelectorAll(".predictive-search__result-tab").forEach(
						(element) => {
							element.classList.remove("active");
						},
					);
					tab.classList.add("active");

					results.forEach((element) => {
						let resultsType = element.dataset.type;
						if (resultsType == typeTarget) {
							element.classList.add("active");
						} else {
							element.classList.remove("active");
						}
					});
				});
			});
		}
	}

	hidePromoBlock() {
		if (this.classList.contains("search-modal__form")) {
			if (this.promoModal) {
				this.promoModal.classList.add("search__modal--hidden");
			}
			if (this.collectionList) {
				this.collectionList.classList.add("hidden");
			}
		}
	}

	showPromoBlock() {
		if (this.classList.contains("search-modal__form")) {
			if (this.promoModal) {
				this.promoModal.classList.remove("search__modal--hidden");
			}
			if (this.collectionList) {
				this.collectionList.classList.remove("hidden");
			}
		}
	}

	setLiveRegionResults() {
		this.removeAttribute("loading");
		this.setLiveRegionText(
			this.querySelector("[data-predictive-search-live-region-count-value]")
				.textContent,
		);
	}

	open() {
		this.setAttribute("open", true);
		this.input.setAttribute("aria-expanded", true);
		this.isOpen = true;
		if (this.getQuery().length) {
			this.hidePromoBlock();
		} else {
			this.showPromoBlock();
		}
	}

	close(clearSearchTerm = false) {
		this.closeResults(clearSearchTerm);
		this.isOpen = false;
	}

	closeResults(clearSearchTerm = false) {
		if (clearSearchTerm) {
			this.input.value = "";
			this.removeAttribute("results");
		}
		const selected = this.querySelector('[aria-selected="true"]');

		if (selected) selected.setAttribute("aria-selected", false);

		this.input.setAttribute("aria-activedescendant", "");
		this.removeAttribute("loading");
		this.removeAttribute("open");
		this.input.setAttribute("aria-expanded", false);
		this.predictiveSearchResults.removeAttribute("style");
		if (this.getQuery().length) {
			this.hidePromoBlock();
		} else {
			this.showPromoBlock();
		}
	}
}

customElements.define("predictive-search", PredictiveSearch);
