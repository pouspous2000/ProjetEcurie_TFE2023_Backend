import { body } from 'express-validator'

export class StableValidator {
	static update() {
		return [
			body('name').exists().isLength({ max: 255 }),
			body('vat').exists().isVAT('BE'),
			body('phone').exists().isLength({ max: 255 }),
			body('email').exists().isEmail(),
			body('invoiceNb').isInt({ min: 1 }),
			body('invoicePrefix').isLength({ max: 255 }),
		]
	}
}
