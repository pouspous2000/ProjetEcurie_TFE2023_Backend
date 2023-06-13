import { Sequelize } from 'sequelize'
import * as configs from '@/configuration/sequelize'

// import models here
import { HorseContributorJob } from '@/modules/horse-contributor-job/model'

const sequelize = new Sequelize(configs[process.env.NODE_ENV])

// add all models into this array
const modelDefiners = [HorseContributorJob]

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
