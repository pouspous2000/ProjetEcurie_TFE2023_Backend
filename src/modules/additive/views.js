export class AdditiveView {
	constructor() {}

	index(additives) {
		return additives.map(additive => {
			return this.show(additive)
		})
	}

	show(additive) {
		return {
			id: additive.id,
			name: additive.name,
			price: additive.price,
			createdAt: additive.createdAt,
			updatedAt: additive.updatedAt,
		}
	}

	create(additive) {
		return this.show(additive)
	}

	update(additive) {
		return this.show(additive)
	}
}
