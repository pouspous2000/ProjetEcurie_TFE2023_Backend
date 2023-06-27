import { Sequelize } from 'sequelize'
import * as configs from '@/configuration/sequelize'

// import models here
import UserModel from '@/modules/authentication/model'
import StableModel from '@/modules/stable/model'
import RoleModel from '@/modules/role/model'
import ContactModel from '@/modules/contact/model'
import PensionModel from '@/modules/pension/model'
import HorseContributorJobModel from '@/modules/horse-contributor-job/model'
import HorseContributorModel from '@/modules/horse-contributor/model'
import HorseContributorHorseContributorJobModel from '@/database/models/horseContributor-horseContributorJob'
import AdditiveModel from '@/modules/additive/model'

const sequelize = new Sequelize(configs[process.env.NODE_ENV])

// add all models into this array
const modelDefiners = [
	UserModel,
	HorseContributorJobModel,
	StableModel,
	RoleModel,
	ContactModel,
	PensionModel,
	HorseContributorModel,
	HorseContributorHorseContributorJobModel,
	AdditiveModel,
]

// eslint-disable-next-line no-restricted-syntax
modelDefiners.forEach(modelDefiner => {
	modelDefiner(sequelize)
})

// associations
Object.keys(sequelize.models).forEach(modelName => {
	if (sequelize.models[modelName].associate) {
		sequelize.models[modelName].associate(sequelize.models)
	}
})

export default sequelize
