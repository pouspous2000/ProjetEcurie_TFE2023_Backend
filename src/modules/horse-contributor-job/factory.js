import { faker } from '@faker-js/faker'
import i18next from '../../../i18n'

export class HorseContributorJobFactory {
	static create() {
		return {
			name: faker.person.jobTitle(),
			...this._create(),
		}
	}

	static bulkCreate(nbRecords) {
		const records = []
		for (let i = 0; i < nbRecords; i++) {
			records.push(this.create())
		}
		return records
	}

	static createVeterinary() {
		return {
			name: i18next.t('horseContributorJob_factory_veterinarian'),
			...this._create(),
		}
	}

	static _create() {
		return {
			createdAt: new Date(),
			updatedAt: new Date(),
		}
	}
}
