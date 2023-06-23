import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'
import { ArrayUtils } from '@/utils/ArrayUtils'

export class UserFactory extends BaseFactory {
	static uniqueConstraints = {
		email: [],
		confirmationCode: [],
	}

	static create(roleId, isConfirmed = false) {
		let email
		do {
			email = faker.internet.email()
		} while (this.uniqueConstraints.email.includes(email))

		this.uniqueConstraints.email.push(email)

		let confirmationCode = 'confirmation'
		let i = 1
		while (this.uniqueConstraints.confirmationCode.includes(confirmationCode)) {
			confirmationCode = `confirmation_${i}`
			i++
		}
		this.uniqueConstraints.confirmationCode.push(confirmationCode)

		return {
			roleId: roleId,
			email: email,
			password: 'password',
			status: isConfirmed ? 'ACTIVE' : 'PENDING',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}

	static bulkCreate(nbRecords, roleIds, isConfirmed = false) {
		const records = []
		for (let i = 0; i < nbRecords; i++) {
			records.push(this.create(ArrayUtils.getRandomElement(roleIds), isConfirmed))
		}
		return records
	}

	static createCecile(roleId) {
		this.uniqueConstraints.email.push('cecile.bonnet@gail.com')

		let confirmationCode = 'confirmation'
		let i = 1
		while (this.uniqueConstraints.confirmationCode.includes(confirmationCode)) {
			confirmationCode = `confirmation_${i}`
			i++
		}
		this.uniqueConstraints.confirmationCode.push(confirmationCode)

		return {
			roleId: roleId,
			email: 'cecile.bonnet@gail.com',
			password: 'password',
			status: 'ACTIVE',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}

	static createTestAdmin(roleId) {
		const email = 'user.test.admin@gail.com'
		this.uniqueConstraints.email.push(email)
		let confirmationCode = 'test_user_admin_confirmation_code'
		this.uniqueConstraints.confirmationCode.push(confirmationCode)
		return {
			roleId: roleId,
			email: email,
			password: 'password',
			status: 'ACTIVE',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}

	static createTestEmployee(roleId) {
		const email = 'user.test.employee@gail.com'
		this.uniqueConstraints.email.push(email)
		let confirmationCode = 'test_user_employee_confirmation_code'
		this.uniqueConstraints.confirmationCode.push(confirmationCode)
		return {
			roleId: roleId,
			email: email,
			password: 'password',
			status: 'ACTIVE',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}

	static createTestClient(roleId) {
		const email = 'user.test.client@gail.com'
		this.uniqueConstraints.email.push(email)
		let confirmationCode = 'test_user_client_confirmation_code'
		this.uniqueConstraints.confirmationCode.push(confirmationCode)
		return {
			roleId: roleId,
			email: email,
			password: 'password',
			status: 'ACTIVE',
			confirmationCode: confirmationCode,
			...this._create(),
		}
	}
}
