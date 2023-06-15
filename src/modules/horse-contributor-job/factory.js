import { faker } from '@faker-js/faker'
import i18next from '../../../i18n'
import { BaseFactory } from '@/core/BaseFactory'

export class HorseContributorJobFactory extends BaseFactory {
	static create() {
		return {
			name: faker.person.jobTitle(),
			...this._create(),
		}
	}

	static createVeterinary() {
		return {
			name: i18next.t('horseContributorJob_factory_veterinarian'),
			...this._create(),
		}
	}
}
