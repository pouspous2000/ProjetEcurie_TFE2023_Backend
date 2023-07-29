import path from 'path'
import multer from 'multer'
import multerS3 from 'multer-s3'
import createError from 'http-errors'
import s3Client from '@/aws'
import i18next from '../../i18n'

const uploadFile = multer({
	storage: multerS3({
		bucket: process.env.FILE_BUCKET,
		s3: s3Client,
		acl: 'public-read',
		key: (request, file, cb) => {
			cb(
				null,
				file.originalname
					.replace(/\.[^.]+$/, '')
					.replace(/[^\w\s]/gi, '')
					.replace(/\s+/g, '_')
					.toLowerCase()
			)
		},
	}),
	fileFilter: (request, file, callback) => {
		const allowedExtensions = ['.pdf']
		const allowedMimeTypes = ['application/pdf']
		const isAllowedExtension = allowedExtensions.includes(path.extname(file.originalname.toLowerCase()))
		const isAllowedMimeType = allowedMimeTypes.includes(file.mimetype)
		if (isAllowedExtension && isAllowedMimeType) {
			return callback(null, true)
		} else {
			callback(createError(422, i18next.t('invoice_422_invalidPdf')))
		}
	},
	limits: {
		fileSize: 1024 * 1024 * 2, // 2mb
	},
})

export default uploadFile
