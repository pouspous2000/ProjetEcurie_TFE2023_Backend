import { body } from 'express-validator'

export class HorseContributorJobValidator {
	static create() {
		return [body('name').exists().isLength({ max: 255 })]
	}

	static update() {
		return this.create()
	}
}
