import Loader from './Loader'
import Logger from '../utils/logger'
import Max from '../max'
import path from 'path'

export default class ModuleLoader extends Loader {
    constructor(max: Max) {
        super({
            name: 'module',
            path: path.join(__dirname, '..', 'modules'),
            recursive: true,
            logger: Logger,
            classes: {
                instantiate: true,
                params: [max],
                loadConfig: true,
            },
        })
    }
}
