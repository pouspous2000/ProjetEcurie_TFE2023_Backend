import { DataTypes, Model } from 'sequelize'

export class PensionData extends Model {
	static getTable() {
		return 'pension_datas'
	}

	static getModelName() {
		return 'PensionData'
	}

	static associate(models) {
		PensionData.belongsTo(models.Horse, { foreignKey: 'horseId' })
		PensionData.belongsTo(models.Pension, { foreignKey: 'pensionId' })
	}
}

export default function (sequelize) {
	PensionData.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			horseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			pensionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			monthlyPrice: {
				type: DataTypes.DECIMAL,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			timestamps: true,
			updatedAt: false,
			deletedAt: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: PensionData.getModelName(),
			tableName: PensionData.getTable(),
		}
	)

	return PensionData
}
