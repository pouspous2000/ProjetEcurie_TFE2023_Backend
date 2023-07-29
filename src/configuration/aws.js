import { Dotenv } from '@/utils/Dotenv'

new Dotenv()

export const awsConfig = {
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_ACCES_KEY,
	},
	region: process.env.AWS_REGION,
}
