import { body } from 'express-validator'

export class RoleValidator {
	static create() {
		return [body('name').exists().isLength({ min: 1, max: 255 }), body('parentId').isInt({ min: 1 })]
	}

	static update() {
		return this.create()
	}
}
