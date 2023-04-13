import path from 'path'
import { Loader } from '@pyrodash/file-loader'
import Module from './module'
import Max from '../max'

export default class ModuleManager extends Loader<Module> {
    get modules(): IterableIterator<Module> {
        return this.files.values()
    }

    constructor(max: Max) {
        super({
            path: path.join(__dirname, '..', 'modules'),
            nested: true,
            mainFile: 'index.ts',
            classes: {
                instantiate: true,
                params: [max],
                destroy: (mdl: Module) => {
                    mdl.destroy()
                }
            },
        })
    }
}
