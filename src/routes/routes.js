import { Router } from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../../swagger.json'

import HorseContributorJobRouter from '@/modules/horse-contributor-job/routes'
import StableRouter from '@/modules/stable/routes'
import RoleRouter from '@/modules/role/routes'

// [TMP] the code below will be moved when auth
import { EmailUtils } from '@/utils/EmailUtils'
import path from 'path'
import { PathUtils } from '@/utils/PathUtils'
import { readFile } from 'fs/promises'
import handlebars from 'handlebars'

const router = Router()

router.get('/email', async (request, response) => {
	// this is a dummy test on send email with nodemailer + async fs + handlebars
	const subject = 'my subjet'
	const message = 'this is very important'

	const emailTemplateSource = await readFile(path.join(PathUtils.getSrcPath(), 'email', 'example.hbs'), 'utf8')
	const template = handlebars.compile(emailTemplateSource)
	const htmlToSend = template({ subject, message })

	const emailResponse = await EmailUtils.sendEmail('olivier.huvelle@gmail.com', subject, htmlToSend)
	response.send(emailResponse)
})

router.use(HorseContributorJobRouter)
router.use(StableRouter)
router.use(RoleRouter)

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument))

export default router
