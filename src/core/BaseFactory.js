export class BaseFactory {
	static uniqueConstraints = {}

	/*
		{
			argName: [values]
		}
	 */

	static create() {
		return {} // should be implemented by subclasses
	}

	static bulkCreate(nbRecords) {
		const records = []
		for (let i = 0; i < nbRecords; i++) {
			records.push(this.create())
		}
		return records
	}

	static _create() {
		return {
			createdAt: new Date(),
			updatedAt: new Date(),
		}
	}
}
