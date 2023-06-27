import { BaseFactory } from '@/core/BaseFactory'
import { faker } from '@faker-js/faker'

export class HorseFactory extends BaseFactory {
	static create(ownerId, pensionId = undefined) {
		return {
			ownerId: ownerId,
			pensionId: pensionId ? pensionId : null,
			name: faker.animal.horse(),
			comment: faker.lorem.sentences(Math.random() * 10),
			...this._create(),
		}
	}
}
