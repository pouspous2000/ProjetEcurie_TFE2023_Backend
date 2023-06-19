export class RoleView {
	static index(roles) {
		return roles.map(role => RoleView.single(role))
	}

	static single(role) {
		return {
			id: role.dataValues.id,
			name: role.dataValues.name,
			isEditable: role.isEditable,
			parent: {
				id: role.dataValues.parent?.id,
				name: role.dataValues.parent?.name,
			},
			children: role.dataValues.children.map(child => ({
				id: child.id,
				name: child.name,
			})),
			createdAt: role.dataValues.createdAt,
			updatedAt: role.dataValues.updatedAt,
		}
	}

	static create(role) {
		return {
			id: role.dataValues.id,
			name: role.dataValues.name,
			parentId: role.dataValues.parentId,
			isEditable: role.dataValues.isEditable,
			createdAt: role.dataValues.createdAt,
			updatedAt: role.dataValues.updatedAt,
		}
	}

	static update(role) {
		return this.create(role)
	}
}
