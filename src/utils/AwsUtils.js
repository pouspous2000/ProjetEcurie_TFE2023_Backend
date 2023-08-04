import s3Client from '@/aws'
import createError from 'http-errors'
import { errorHandlerLogger } from '@/loggers/loggers'
import i18next from '../../i18n'

export class AwsService {
	constructor(bucket = process.env.FILE_BUCKET) {
		this._client = s3Client
		this._bucket = bucket
	}

	get bucket() {
		return this._bucket
	}

	async findByKey(key) {
		try {
			return await this._client
				.getObject({
					Bucket: this._bucket,
					Key: key,
				})
				.promise()
		} catch (error) {
			if (error.statusCode === 404 && error.code === 'NoSuchKey') {
				throw createError(404, i18next.t('aws_404'))
			}
			errorHandlerLogger.log('error', error)
			throw error
		}
	}

	async upload(key, data) {
		if (process.env.NODE_ENV === 'TEST') {
			return
		}

		try {
			return await this._client
				.upload({
					Bucket: this._bucket,
					Key: key,
					Body: data,
				})
				.promise()
		} catch (error) {
			errorHandlerLogger.log('error', error)
			throw error
		}
	}
}
