import { Model, DataTypes } from 'sequelize'

export class Cron extends Model {
	static getTable() {
		return 'crons'
	}

	static getModelName() {
		return 'Cron'
	}

	static associate(models) {
		Cron.belongsTo(models.Invoice, { foreignKey: 'invoiceId', as: 'invoice' })
	}
}

export default function (sequelize) {
	Cron.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			invoiceId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				set(value) {
					this.setDataValue('name', value.trim())
				},
			},
			step: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['PRE_PDF', 'PDF', 'PDF_SENT'],
			},
			status: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['DONE', 'FAILED'],
			},
		},
		{
			sequelize,
			modelName: Cron.getModelName(),
			tableName: Cron.getTable(),
		}
	)

	return Cron
}
