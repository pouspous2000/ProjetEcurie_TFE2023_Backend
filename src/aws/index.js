import { S3Client } from '@aws-sdk/client-s3'
import { awsConfig } from '@/configuration/aws'

const s3Client = new S3Client(awsConfig)

export default s3Client
