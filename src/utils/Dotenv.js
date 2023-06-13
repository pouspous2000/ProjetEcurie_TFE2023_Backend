import path from 'path'
import { config } from 'dotenv'
import Enum from 'enum'
import { PathUtils } from '@/utils/PathUtils'

export const EnvironmentEnum = new Enum(
	{
		PROD: '.env',
		DEV: '.env.dev',
		TEST: '.env.test',
	},
	{ freeze: true }
)

export class Dotenv {
	// notice it is NOT a "strict" singleton as it is always possible to change the class from outside of its scope
	static instance = undefined

	constructor(environment = process.env.NODE_ENV) {
		if (Dotenv.instance === undefined) {
			this.environment = environment
			config({ path: path.join(PathUtils.getRootPath(), EnvironmentEnum.get(this.environment).value) })
			Dotenv.instance = this
		}
	}

	get environment() {
		return this._environment
	}

	set environment(value) {
		if (!EnvironmentEnum.isDefined(value)) {
			throw new Error('invalid environment')
		}
		this._environment = value
	}
}
