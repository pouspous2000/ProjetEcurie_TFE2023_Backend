import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class RideFactory extends BaseFactory {
	static uniqueConstraints = {
		name: [],
	}

	static create(period) {
		if (!['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'].includes(period)) {
			throw new Error('invalid period')
		}

		if (this.uniqueConstraints.name.includes(period)) {
			throw new Error('already created period')
		}

		return {
			name: period,
			period: period,
			price: faker.commerce.price({ min: 100, max: 800 }),
			...this._create(),
		}
	}

	static createAll() {
		return ['WORKINGDAYS', 'WEEKEND', 'WEEK', 'DAY'].map(period => this.create(period))
	}
}
