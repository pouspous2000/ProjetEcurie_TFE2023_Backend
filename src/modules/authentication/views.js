import i18next from '../../../i18n'

export class AuthenticationView {
	static register() {
		return {
			message: i18next.t('authentication_register_message'),
		}
	}

	static confirm() {
		return {
			message: i18next.t('authentication_confirm_message'),
		}
	}

	static update() {
		return {
			message: i18next.t('authentication_update_message'),
		}
	}
}
