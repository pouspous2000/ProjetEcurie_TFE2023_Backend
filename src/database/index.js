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
import HorseContributorHorseContributorJobModel from '@/modules/horseContributor-horseContributorJob/model'
import AdditiveModel from '@/modules/additive/model'
import HorseModel from '@/modules/horse/model'
import HorseUserModel from '@/database/models/horse-user'
import PensionDataModel from '@/modules/pension-data/model'
import AdditiveDataModel from '@/modules/additive-data/model'
import TaskModel from '@/modules/task/model'
import LessonModel from '@/modules/lesson/model'
import EventModel from '@/modules/event/model'
import EventUserModel from '@/database/models/event-user'
import CompetitionModel from '@/modules/competition/model'
import CompetitionUserModel from '@/database/models/competition-user'
import RideModel from '@/modules/ride/model'
import RideDataModel from '@/modules/ride-data/model'
import DailyRideModel from '@/modules/daily-ride/model'

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
	HorseModel,
	HorseUserModel,
	PensionDataModel,
	TaskModel,
	AdditiveDataModel,
	LessonModel,
	EventModel,
	EventUserModel,
	CompetitionModel,
	CompetitionUserModel,
	RideModel,
	RideDataModel,
	DailyRideModel,
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
