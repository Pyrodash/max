import path from 'path'
import { Loader } from '@pyrodash/file-loader'
import Module from '../modules/module'
import Max from '../max'

export default class ModuleManager extends Loader<Module> {
    get modules(): IterableIterator<Module> {
        return this.files.values()
    }

    constructor(max: Max) {
        super({
            path: path.join(__dirname, '..', 'modules'),
            nested: true,
            classes: {
                instantiate: true,
                params: [max],
            },
        })
    }
}
