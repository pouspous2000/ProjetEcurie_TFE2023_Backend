import { DataTypes, Model } from 'sequelize'

export class AdditiveData extends Model {
	static getTable() {
		return 'additive_datas'
	}

	static getModelName() {
		return 'AdditiveData'
	}

	static associate(models) {
		AdditiveData.belongsTo(models.Additive, { foreignKey: 'additiveId' })
		AdditiveData.belongsTo(models.Horse, { foreignKey: 'horseId' })
	}
}

export default function (sequelize) {
	AdditiveData.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			additiveId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			horseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			price: {
				type: DataTypes.DECIMAL,
				allowNull: false,
			},
			status: {
				type: DataTypes.ENUM,
				allowNull: false,
				values: ['ACTIVE', 'CANCELLED', 'INVOICED'],
			},
		},
		{
			sequelize,
			modelName: AdditiveData.getModelName(),
			tableName: AdditiveData.getTable(),
			timestamps: true,
			updatedAt: false,
		}
	)

	return AdditiveData
}
