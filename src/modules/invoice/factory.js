import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class InvoiceFactory extends BaseFactory {
	static create(clientId, status = 'UNPAID', paidAt = undefined) {
		const currentDate = new Date()
		const nextMonthDate = new Date(currentDate)
		nextMonthDate.setMonth(currentDate.getMonth() + 1)

		return {
			clientId,
			bucket: process.env.FILE_BUCKET,
			key: null,
			number: 1,
			price: faker.commerce.price({ min: 100, max: 3000 }),
			status,
			dueDateAt: nextMonthDate,
			paidAt: paidAt ? paidAt : null,
			...this._create(),
		}
	}

	static createPaid(clientId) {
		return this.create(clientId, 'PAID', new Date())
	}
}
