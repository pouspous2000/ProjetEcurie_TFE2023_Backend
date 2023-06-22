import i18next from '../../../i18n'

export class AuthenticationView {
	constructor() {}

	register() {
		return {
			message: i18next.t('authentication_register_message'),
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
