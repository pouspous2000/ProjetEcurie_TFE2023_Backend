import path from 'path'
import { PathUtils } from '@/utils/PathUtils'

export class RgpdController {
	constructor() {}

	getRgpd(request, response) {
		return response.sendFile(path.join(PathUtils.getSrcPath(), 'modules', 'rgpd', 'rgpd.html'))
	}
}
