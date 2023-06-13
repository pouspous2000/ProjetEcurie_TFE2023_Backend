import path from 'path'

export class PathUtils {
	static getRootPath() {
		return path.join(__dirname, '..', '..')
	}

	static getSrcPath() {
		return path.join(__dirname, '..')
	}
}
