import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer'
const smtpPassword = require('aws-smtp-credentials')
import { Dotenv } from '@/utils/Dotenv'

export class EmailUtils {
	static async getTransporter() {
		new Dotenv()
		let transporter
		if (process.env.NODE_ENV !== 'PROD') {
			const testAccount = await createTestAccount()
			transporter = createTransport({
				host: 'smtp.ethereal.email',
				port: 587,
				secure: false,
				auth: {
					user: testAccount.user,
					pass: testAccount.pass,
				},
			})
		} else {
			// transporter = createTransport({
			// 	host: "smtp.sendgrid.net",
				
			// 	auth: {
			// 		'user': "apikey",
			// 		'pass': smtpPassword('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'),
			// 	},
			// 	port: 25,
			// 	secure: false,
			// 	logger: true,
			// 	debug: true,
			// 	ignoreTLS: true,
			// 	tls:{
			// 		rejectUnauthorized:false
			// 	}
			// })
		}
		return transporter
	}

	static async sendEmail(to, subject, html, attachments = []) {
		if (process.env.NODE_ENV === 'TEST') {
			return
		}
		const transporter = await this.getTransporter()
		const email = {
			from: process.env.SMTP_MAIL_SENDER,
			to,
			subject,
			html,
			attachments,
		}

		const emailInfo = await transporter.sendMail(email)

		if (process.env.NODE_ENV === 'DEV') {
			console.log(`Mail preview at ${getTestMessageUrl(emailInfo)}`)
		}

		return emailInfo
	}
}
