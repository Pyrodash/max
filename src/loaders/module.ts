import Loader from './Loader'
import Module from '../modules/module'
import Max from '../max'
import path from 'path'

export default class ModuleLoader extends Loader<Module> {
    get modules(): readonly Module[] {
        return this.files
    }

    constructor(max: Max) {
        super({
            name: 'module',
            path: path.join(__dirname, '..', 'modules'),
            recursive: true,
            classes: {
                instantiate: true,
                params: [max],
            },
        })
    }
}
