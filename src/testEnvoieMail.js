const nodemailer = require('nodemailer')
const smtpPassword = require('aws-smtp-credentials')

var transporter = nodemailer.createTransport({
	port: 465,
	host: 'email-smtp.us-east-1.amazonaws.com',
	secure: true,
	auth: {
		user: 'AKIAYF5AB3EGXYZX4XFW',
		pass: smtpPassword('HU+OW/BZ2X8rqcMtFIsEzwrx1t+TWEgZdG/mJqly'),
	},
	debug: true,
})

const mailOptions = {
	from: 'emiliebonnetecurie@gmail.com', // Adresse e-mail de l'expéditeur
	to: 'bonnetcecile1460@gmail.com', // Adresse e-mail du destinataire
	subject: 'Test Email',
	text: "Ceci est un test d'envoi d'e-mail avec Amazon SES.",
}

// Envoyer l'e-mail
transporter.sendMail(mailOptions, (error, info) => {
	if (error) {
		console.error("Erreur lors de l'envoi de l'e-mail:", error)
	} else {
		console.log('E-mail envoyé avec succès:', info.response)
	}
})
