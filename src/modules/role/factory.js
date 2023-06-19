import { faker } from '@faker-js/faker'
import { BaseFactory } from '@/core/BaseFactory'

export class RoleFactory extends BaseFactory {
	static uniqueConstraints = {
		name: [],
	}

	static create() {
		let name
		do {
			name = faker.person.jobType()
		} while (this.uniqueConstraints.name.includes(name))

		this.uniqueConstraints.name.push(name)

		return {
			name: name,
			...this._create(),
		}
	}

	static createAdmin() {
		this.uniqueConstraints.name.push('ADMIN')
		return {
			name: 'ADMIN',
			isEditable: false,
			...this._create(),
		}
	}

	static createEmployee() {
		this.uniqueConstraints.name.push('EMPLOYEE')
		return {
			name: 'EMPLOYEE',
			isEditable: false,
			...this._create(),
		}
	}

	static createClient() {
		this.uniqueConstraints.name.push('CLIENT')
		return {
			name: 'CLIENT',
			isEditable: false,
			...this._create(),
		}
	}
}
