import { createTransport, createTestAccount, getTestMessageUrl } from 'nodemailer'
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
			transporter = createTransport({
				host: process.env.SMTP_HOST,
				port: process.env.SMTP_PORT,
				auth: {
					user: process.env.SMTP_USERNAME,
					pass: process.env.SMTP_PASSWORD,
				},
				logger: false,
				secure: Number(process.env.SMTP_PORT) === 465,
			})
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
