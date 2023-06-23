import i18next from '../../../i18n'

export class AuthenticationView {
	constructor() {}

	registerClient() {
		return {
			message: i18next.t('authentication_register_message'),
		}
	}

	registerManually() {
		return {
			message: i18next.t('authentication_registerManually_message'),
		}
	}

	confirm() {
		return {
			message: i18next.t('authentication_confirm_message'),
		}
	}

	update() {
		return {
			message: i18next.t('authentication_update_message'),
		}
	}
}
