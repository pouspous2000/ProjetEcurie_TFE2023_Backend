import { QueryTypes } from 'sequelize'
import { Contact } from '@/modules/contact/model'
import { User } from '@/modules/authentication/model'
import { ContactFactory } from '@/modules/contact/factory'

export const upContact = async queryInterface => {
	const activeUsers = await queryInterface.sequelize.query(
		`SELECT * FROM ${User.getTable()} WHERE "status" = 'ACTIVE'`,
		{ type: QueryTypes.SELECT }
	)

	const contacts = []
	activeUsers.forEach(user => {
		contacts.push(ContactFactory.create(user.id))
	})

	await queryInterface.bulkInsert(Contact.getTable(), contacts)
}

export const downContact = async queryInterface => {
	await queryInterface.bulkDelete(Contact.getTable(), null, { force: true })
}
