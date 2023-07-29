import AWS from 'aws-sdk'

import { awsConfig } from '@/configuration/aws'

AWS.config.update(awsConfig)

const s3Client = new AWS.S3()

export default s3Client
