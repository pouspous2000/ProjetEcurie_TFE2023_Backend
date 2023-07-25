import { DataTypes, Model } from 'sequelize'

export class AdditiveHorse extends Model {
	static getTable() {
		return 'additive_datas'
	}

	static getModelName() {
		return 'AdditiveHorse'
	}

	static associate(models) {
		AdditiveHorse.belongsTo(models.Additive, { foreignKey: 'additiveId' })
		AdditiveHorse.belongsTo(models.Horse, { foreignKey: 'horseId' })
	}
}

export default function (sequelize) {
	AdditiveHorse.init(
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
			modelName: AdditiveHorse.getModelName(),
			tableName: AdditiveHorse.getTable(),
			timestamps: true,
			updatedAt: false,
		}
	)

	return AdditiveHorse
}
