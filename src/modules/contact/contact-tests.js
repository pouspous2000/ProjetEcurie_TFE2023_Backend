import { describe, it, beforeEach, afterEach } from 'mocha'
import chaiHttp from 'chai-http'
import chai from 'chai'

import app from '@/app'
import db from '@/database'
import { RoleFactory } from '@/modules/role/factory'
import { UserFactory } from '@/modules/authentication/factory'
import { ContactFactory } from '@/modules/contact/factory'
import { ContactView } from '@/modules/contact/views'
import i18next from '../../../i18n'

chai.should()
chai.use(chaiHttp)

const routePrefix = '/contacts'

describe('Contact module', function () {
	let roleAdmin, roleEmployee, roleClient
	let testAdminUser, testEmployeeUser, testClientUser1, testClientUser2
	let testAdminContact, testEmployeeContact, testClientContact, testClientContact2

	let testAdminUsers, testEmployeeUsers, testClientUsers

	beforeEach(async function () {
		await db.models.PensionData.destroy({ truncate: { cascade: true } })
		await db.models.Contact.destroy({ truncate: { cascade: true } })
		await db.models.User.destroy({ truncate: { cascade: true } })
		await db.models.Role.destroy({ truncate: { cascade: true } })

		//create roles
		roleAdmin = await db.models.Role.create(RoleFactory.createAdmin())
		roleEmployee = await db.models.Role.create(RoleFactory.createEmployee())
		roleClient = await db.models.Role.create(RoleFactory.createClient())

		//create users
		testAdminUser = await db.models.User.create(UserFactory.createTestAdmin(roleAdmin.id))
		testEmployeeUser = await db.models.User.create(UserFactory.createTestEmployee(roleEmployee.id))
		testClientUser1 = await db.models.User.create(UserFactory.createTestClient(roleClient.id))
		testClientUser2 = await db.models.User.create(UserFactory.create(roleClient.id, true))

		testAdminUser.token = testAdminUser.generateToken()
		testEmployeeUser.token = testEmployeeUser.generateToken()
		testClientUser1.token = testClientUser1.generateToken()

		testAdminUsers = [testAdminUser]
		testEmployeeUsers = [testEmployeeUser]
		testClientUsers = [testClientUser1, testClientUser2]

		//create contacts
		testAdminContact = await db.models.Contact.create(ContactFactory.create(testAdminUser.id))
		testEmployeeContact = await db.models.Contact.create(ContactFactory.create(testEmployeeUser.id))
		testClientContact = await db.models.Contact.create(ContactFactory.create(testClientUser1.id))
		testClientContact2 = await db.models.Contact.create(ContactFactory.create(testClientUser2.id))
	})

	afterEach(function () {
		testAdminUser = testEmployeeUser = testClientUser1 = testClientUser2 = undefined
		testAdminContact = testEmployeeContact = testClientContact = testClientContact2 = undefined
		roleAdmin = roleEmployee = roleClient = undefined
		testAdminUsers = testEmployeeUsers = testClientUsers = undefined
	})

	describe('index', async function () {
		describe('permissions', async function () {
			it('with role admin', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(200)
				response.body.should.have.length([...testAdminUsers, ...testEmployeeUsers, ...testClientUsers].length)
			})

			it('with role employee', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(200)
				response.body.should.have.length([...testEmployeeUsers, ...testClientUsers].length)
			})

			it('with role client', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)
				response.should.have.status(200)
				response.body.should.have.length(1)
			})
		})
	})

	describe('show', async function () {
		let testAdminUser2, testEmployeeUser2
		let testAdminContact2, testEmployeeContact2

		beforeEach(async function () {
			testAdminUser2 = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
			testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
			testAdminContact2 = await db.models.Contact.create(ContactFactory.create(testAdminUser2.id))
			testEmployeeContact2 = await db.models.Contact.create(ContactFactory.create(testEmployeeUser2.id))
		})

		afterEach(function () {
			testAdminUser2 = testEmployeeUser2 = undefined
			testAdminContact2 = testEmployeeContact2 = undefined
		})

		describe('permissions', async function () {
			describe('with role admin', async function () {
				describe('get an admin', async function () {
					it('any admin - allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testAdminContact2.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(200)
						response.body.should.have.property('id').eql(testAdminContact2.id)
						response.body.should.have.property('firstName').eql(testAdminContact2.firstName)
						response.body.should.have.property('lastName').eql(testAdminContact2.lastName)
						response.body.should.have.property('phone').eql(testAdminContact2.phone)
						response.body.should.have.property('mobile').eql(testAdminContact2.mobile)
						response.body.should.have.property('address').eql(testAdminContact2.address)
						response.body.should.have.property('invoicingAddress').eql(testAdminContact2.invoicingAddress)
						response.body.should.have.property('createdAt').not.eql(null)
						response.body.should.have.property('updatedAt').not.eql(null)
					})
				})

				describe('get an employee', async function () {
					it('any employee - allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testEmployeeContact2.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(200)
					})
				})

				describe('get a client', async function () {
					it('any client - allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(200)
					})
				})
			})

			describe('with role employee', async function () {
				describe('get an admin', async function () {
					it('any admin - not allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testAdminContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('get an employee', async function () {
					it('get self - allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(200)
					})

					it("get another employee's contact - not allowed", async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testEmployeeContact2.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('get a client', async function () {
					it('any client - allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(200)
					})
				})
			})

			describe('with role client', async function () {
				describe('get an admin', async function () {
					it('any admin - not allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testAdminContact.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('get an employee', async function () {
					it('any employee - not allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('get a client', async function () {
					it('get self - allowed', async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
						response.should.have.status(200)
					})

					it("get another client's contact - not allowed", async function () {
						const response = await chai
							.request(app)
							.get(`${routePrefix}/${testClientContact2.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})
			})
		})

		describe('404', async function () {
			it('with role admin but does not matter', async function () {
				const lastContact = await db.models.Contact.findOne({
					order: [['id', 'DESC']],
				})
				const response = await chai
					.request(app)
					.get(`${routePrefix}/${lastContact.id + 1}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(404)
				response.body.should.have.property('message').eql(i18next.t('contact_404'))
			})
		})
	})

	describe('delete', async function () {
		let testAdminUser2, testEmployeeUser2
		let testAdminContact2, testEmployeeContact2

		beforeEach(async function () {
			testAdminUser2 = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
			testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
			testAdminContact2 = await db.models.Contact.create(ContactFactory.create(testAdminUser2.id))
			testEmployeeContact2 = await db.models.Contact.create(ContactFactory.create(testEmployeeUser2.id))
		})

		afterEach(function () {
			testAdminUser2 = testEmployeeUser2 = undefined
			testAdminContact2 = testEmployeeContact2 = undefined
		})

		describe('permissions', async function () {
			describe('with role admin', async function () {
				describe('delete an admin', async function () {
					it('delete self - allowed', async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testAdminContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(204)
					})

					it("delete another admin's contact - allowed", async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testAdminContact2.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(204)
					})
				})

				describe('delete an employee', async function () {
					it('any employee - allowed', async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(204)
					})
				})

				describe('delete a client', async function () {
					it('any client - allowed', async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
						response.should.have.status(204)
					})
				})
			})

			describe('with role employee', async function () {
				describe('delete an admin', async function () {
					it('any admin - not allowed', async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testAdminContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(401)
					})
				})

				describe('delete an employee', async function () {
					it('delete self - contact', async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(204)
					})

					it("delete another employee's contact - not allowed", async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testEmployeeContact2.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('delete a client', async function () {
					it('any client - allowed', async function () {
						const response = await chai
							.request(app)
							.delete(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
						response.should.have.status(204)
					})
				})
			})
		})

		describe('404', async function () {
			it('with role admin but does not matter', async function () {
				const lastContact = await db.models.Contact.findOne({
					order: [['id', 'DESC']],
				})
				const response = await chai
					.request(app)
					.delete(`${routePrefix}/${lastContact.id + 1}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)

				response.should.have.status(404)
				response.body.should.have.property('message').eql(i18next.t('contact_404'))
			})
		})
	})

	describe('create', async function () {
		describe('permissions', async function () {
			describe('with role admin', function () {
				describe('create an admin', function () {
					it('any admin - allowed', async function () {
						const newAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
						const contactData = ContactFactory.create(newAdminUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
							.send(contactData)
						response.should.have.status(201)
						const newAdminContact = await db.models.Contact.findOne({
							order: [['id', 'DESC']],
						})

						const view = new ContactView().create(newAdminContact)
						Object.keys(view).forEach(key => {
							if (view[key] instanceof Date) {
								view[key] = view[key].toISOString()
							}
						})
						response.body.should.eql(view)
					})
				})

				describe('create an employee', async function () {
					it('any employee - allowed', async function () {
						const newEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
						const contactData = ContactFactory.create(newEmployeeUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
							.send(contactData)
						response.should.have.status(201)
					})
				})

				describe('create a client', async function () {
					describe('any client - allowed', async function () {
						const newClientUser = await db.models.User.create(UserFactory.create(roleClient.id, true))
						const contactData = ContactFactory.create(newClientUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
							.send(contactData)
						response.should.have.status(201)
					})
				})
			})

			describe('with role employee', async function () {
				describe('create an admin', async function () {
					it('any admin - not allowed', async function () {
						const newAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
						const contactData = ContactFactory.create(newAdminUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('create an employee', async function () {
					it('self - allowed', async function () {
						const testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
						testEmployeeUser2.token = testEmployeeUser2.generateToken()
						const contactData = ContactFactory.create(testEmployeeUser2.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testEmployeeUser2.token}`)
							.send(contactData)
						response.should.have.status(201)
					})

					it("other employee 's contact - not allowed", async function () {
						const testEmployeeUser2 = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
						const contactData = ContactFactory.create(testEmployeeUser2.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('create a client', async function () {
					it('any client - allowed', async function () {
						await testClientContact.destroy()
						const contactData = ContactFactory.create(testClientUser1.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(201)
					})
				})
			})

			describe('with role client', async function () {
				describe('create an admin', async function () {
					it('any admin - not allowed', async function () {
						await testAdminContact.destroy()
						const contactData = ContactFactory.create(testAdminUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('create an employee', async function () {
					it('any employee - not allowed', async function () {
						await testEmployeeContact.destroy()
						const contactData = ContactFactory.create(testEmployeeUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('create a client', async function () {
					it('self - allowed', async function () {
						await testClientContact.destroy()
						const contactData = ContactFactory.create(testClientUser1.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(201)
					})

					it("other client's contact - not allowed", async function () {
						await testClientContact2.destroy()
						const contactData = ContactFactory.create(testEmployeeUser.id)
						const response = await chai
							.request(app)
							.post(`${routePrefix}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})
			})
		})

		describe('middleware', async function () {
			it('empty data', async function () {
				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['address', 'userId', 'firstName', 'lastName'])
			})
		})

		describe('sql', async function () {
			it('non unique value : mobile', async function () {
				const client = await db.models.User.create(UserFactory.create(roleClient.id, true))
				const contactData = ContactFactory.create(client.id)
				contactData.mobile = testClientContact.mobile

				const response = await chai
					.request(app)
					.post(`${routePrefix}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(contactData)
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['mobile'])
			})
		})
	})

	describe('update', async function () {
		const contactData = {
			firstName: 'updatedFirstName',
			lastName: 'updatedLastName',
			address: 'updatedAddress',
			phone: 'updatedPhone',
			mobile: 'updatedMobile',
			invoicingAddress: 'updatedInvoicingAddress',
		}

		describe('permissions', async function () {
			describe('with role admin', async function () {
				describe('update an admin', async function () {
					it('any admin - allowed', async function () {
						const newAdminUser = await db.models.User.create(UserFactory.create(roleAdmin.id, true))
						const newAdminContact = await db.models.Contact.create(ContactFactory.create(newAdminUser.id))

						const response = await chai
							.request(app)
							.put(`${routePrefix}/${newAdminContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
							.send(contactData)

						let updatedAdminContact = await db.models.Contact.findByPk(newAdminContact.id)

						response.should.have.status(200)
						const view = new ContactView().update(updatedAdminContact)
						Object.keys(view).forEach(key => {
							if (view[key] instanceof Date) {
								view[key] = view[key].toISOString()
							}
						})
						response.body.should.eql(view)
					})
				})

				describe('update an employee', async function () {
					it('any employee - allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
							.send(contactData)
						response.should.have.status(200)
					})
				})

				describe('update a client', async function () {
					it('any client - allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testAdminUser.token}`)
							.send(contactData)
						response.should.have.status(200)
					})
				})
			})

			describe('with role employee', async function () {
				describe('update an admin', async function () {
					it('any admin - not allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testAdminContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('update an employee', async function () {
					it('self - allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(200)
					})

					it("another employee's client contact - not allowed", async function () {
						const newEmployeeUser = await db.models.User.create(UserFactory.create(roleEmployee.id, true))
						const newEmployeeContact = await db.models.Contact.create(
							ContactFactory.create(newEmployeeUser.id)
						)

						const response = await chai
							.request(app)
							.put(`${routePrefix}/${newEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('update a client', async function () {
					it('any client - allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testEmployeeUser.token}`)
							.send(contactData)
						response.should.have.status(200)
					})
				})
			})

			describe('with role client', async function () {
				describe('update an admin', async function () {
					it('any admin - not allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testAdminContact.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('update an employee', async function () {
					it('any employee - not allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testEmployeeContact.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})

				describe('update a client', async function () {
					it('self - allowed', async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testClientContact.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(200)
					})

					it("other client's contact - not allowed", async function () {
						const response = await chai
							.request(app)
							.put(`${routePrefix}/${testClientContact2.id}`)
							.set('Authorization', `Bearer ${testClientUser1.token}`)
							.send(contactData)
						response.should.have.status(401)
						response.body.should.have.property('message').eql(i18next.t('contact_401'))
					})
				})
			})
		})

		describe('404', async function () {
			it('with role admin but does not matter', async function () {
				const lastContact = await db.models.Contact.findOne({
					order: [['id', 'DESC']],
				})

				const response = await chai
					.request(app)
					.put(`${routePrefix}/${lastContact.id + 1}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send(contactData)
				response.should.have.status(404)
			})
		})

		describe('middleware', async function () {
			it('empty data', async function () {
				const response = await chai
					.request(app)
					.put(`${routePrefix}/${testAdminUser.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
					.send({})
				response.should.have.status(422)
				response.body.errors.map(error => error.path).should.eql(['address', 'firstName', 'lastName'])
			})
		})
	})

	describe('getContactByRole', async function () {
		describe('permissions', async function () {
			it('with role admin - allowed', async function () {
				let response = await chai
					.request(app)
					.get(`${routePrefix}/by-role/${roleAdmin.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(200)
				response.body.should.have.length(testAdminUsers.length)

				response = await chai
					.request(app)
					.get(`${routePrefix}/by-role/${roleEmployee.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(200)
				response.body.should.have.length(testEmployeeUsers.length)

				response = await chai
					.request(app)
					.get(`${routePrefix}/by-role/${roleClient.id}`)
					.set('Authorization', `Bearer ${testAdminUser.token}`)
				response.should.have.status(200)
				response.body.should.have.length(testClientUsers.length)
			})

			it('with role employee - allowed', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/by-role/${roleAdmin.id}`)
					.set('Authorization', `Bearer ${testEmployeeUser.token}`)
				response.should.have.status(200)
			})

			it('with role client - not allowed', async function () {
				const response = await chai
					.request(app)
					.get(`${routePrefix}/by-role/${roleAdmin.id}`)
					.set('Authorization', `Bearer ${testClientUser1.token}`)
				response.should.have.status(401)
				response.body.should.have
					.property('message')
					.eql(i18next.t('authentication_role_incorrectRolePermission'))
			})
		})
	})
})
