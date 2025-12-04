if (!customElements.get('recipient-form')) {
	customElements.define('recipient-form', class RecipientForm extends HTMLElement {
		constructor() {
			super();
			this.checkboxInput = this.querySelector(`#Recipient-checkbox-${ this.dataset.sectionId }`);
			this.checkboxInput.disabled = false;
			this.hiddenControlField = this.querySelector(`#Recipient-control-${ this.dataset.sectionId }`);
			this.hiddenControlField.disabled = true;
			this.emailInput = this.querySelector(`#Recipient-email-${ this.dataset.sectionId }`);
			this.nameInput = this.querySelector(`#Recipient-name-${ this.dataset.sectionId }`);
			this.messageInput = this.querySelector(`#Recipient-message-${ this.dataset.sectionId }`);
			this.sendonInput = this.querySelector(`#Recipient-send-on-${ this.dataset.sectionId }`);
			this.offsetProperty = this.querySelector(`#Recipient-timezone-offset-${ this.dataset.sectionId }`);
			if (this.offsetProperty) this.offsetProperty.value = new Date().getTimezoneOffset();

			this.currentProductVariantId = this.dataset.productVariantId;
			this.addEventListener('change', this.onChange.bind(this));
			this.onChange();
		}

		cartUpdateUnsubscriber = undefined;
		variantChangeUnsubscriber = undefined;
		cartErrorUnsubscriber = undefined;

		connectedCallback() {
			this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
				if (event.source === 'product-form' && event.productVariantId.toString() === this.currentProductVariantId) {
					this.resetRecipientForm();
				}
			});

			this.variantChangeUnsubscriber = subscribe(PUB_SUB_EVENTS.variantChange, (event) => {
				if (event.data.sectionId === this.dataset.sectionId) {
					this.currentProductVariantId = event.data.variant.id.toString();
				}
			});

			this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartError, (event) => {
				if (event.source === 'product-form' && event.productVariantId.toString() === this.currentProductVariantId) {
					this.displayErrorMessage(event.message, event.errors);
				}
			});
		}

		disconnectedCallback() {
			if (this.cartUpdateUnsubscriber) {
				this.cartUpdateUnsubscriber();
			}

			if (this.variantChangeUnsubscriber) {
				this.variantChangeUnsubscriber();
			}

			if (this.cartErrorUnsubscriber) {
				this.cartErrorUnsubscriber();
			}
		}

		onChange() {
			if (this.checkboxInput.checked) {
				this.enableInputFields();
			} else {
				this.clearInputFields();
				this.disableInputFields();
				this.clearErrorMessage();
			}
		}

		inputFields() {
			return [
				this.emailInput,
				this.nameInput,
				this.messageInput,
				this.sendonInput
			];
		}

		disableableFields() {
			return [...this.inputFields(), this.offsetProperty];
		}

		clearInputFields() {
			this.inputFields().forEach((field) => field.value = '');
		}

		enableInputFields() {
			this.disableableFields().forEach((field) => field.disabled = false);
		}

		disableInputFields() {
			this.disableableFields().forEach((field) => field.disabled = true);
		}

		displayErrorMessage(title, body) {
			this.clearErrorMessage();
			if (typeof body === 'object') {
				return Object.entries(body).forEach(([key, value]) => {
					const errorMessageId = `RecipientForm-${ key }-error-${ this.dataset.sectionId }`
					const fieldSelector = `#Recipient-${ key }-${ this.dataset.sectionId }`;
					const message = `${value.join(', ')}`;
					const errorMessageElement = this.querySelector(`#${errorMessageId}`);
					const errorTextElement = errorMessageElement?.querySelector('.error-message')
					if (!errorTextElement) return;

					errorTextElement.innerText = `${message}.`;
					errorMessageElement.classList.remove('hidden');

					const inputElement = this[`${key}Input`];
					if (!inputElement) return;

					inputElement.setAttribute('aria-invalid', true);
					inputElement.setAttribute('aria-describedby', errorMessageId);
				});
			}
		}

		createErrorListItem(target, message) {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.setAttribute('href', target);
			a.innerText = message;
			li.appendChild(a);
			li.className = "error-message";
			return li;
		}

		clearErrorMessage() {
			this.querySelectorAll('.recipient-fields .form__message').forEach(field => {
				field.classList.add('hidden');
				const textField = field.querySelector('.error-message');
				if (textField) textField.innerText = '';
			});

			[this.emailInput, this.messageInput, this.nameInput, this.sendonInput].forEach(inputElement => {
				inputElement.setAttribute('aria-invalid', false);
				inputElement.removeAttribute('aria-describedby');
			});
		}

		resetRecipientForm() {
			if (this.checkboxInput.checked) {
				this.checkboxInput.checked = false;
				this.clearInputFields();
				this.clearErrorMessage();
			}
		}
	});
}