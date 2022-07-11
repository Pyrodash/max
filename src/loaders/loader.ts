import { logger } from '~/utils/logger'
import path from 'path'
import { promises as fs } from 'fs'
import { EventEmitter } from 'events'

const ALLOWED_FILE_EXTS = ['.ts']

interface ClassOptions {
    instantiate?: boolean
    params?: Array<unknown>
}

const defaultClassOptions: ClassOptions = { instantiate: true, params: [] }

interface LoaderOptions {
    name: string
    path?: string
    recursive?: boolean
    indexFile?: string | ((file: string) => string)
    ignored?: Array<string>
    autoLoad?: boolean
    classes?: ClassOptions
}

export default class Loader<T> extends EventEmitter {
    private name: string
    private path: string

    private recursive: boolean
    private indexFile: string | ((file: string) => string)

    private classes: ClassOptions

    private ignored: Array<string>
    protected files: Array<T>

    public ready = false

    constructor(opts: LoaderOptions) {
        super()

        this.name = opts.name
        this.path = opts.path

        this.recursive = opts.recursive
        this.indexFile = opts.indexFile || 'index.ts'

        this.classes = opts.classes || defaultClassOptions

        this.ignored = opts.ignored || []
        this.files = []

        if (opts.autoLoad !== false) {
            this.loadFiles()
        }
    }

    async loadFiles(locPath = this.path, recursive?: boolean): Promise<void> {
        if (this.recursive && locPath === this.path) {
            recursive = true
        }

        let files = await fs.readdir(locPath)

        files = files.filter((file) => {
            const extname = path.extname(file)?.toLowerCase()

            return recursive ? !extname : ALLOWED_FILE_EXTS.includes(extname)
        })

        for (let fileName of files) {
            if (this.ignored.includes(fileName)) {
                continue
            }

            if (this.recursive) {
                if (typeof this.indexFile === 'function') {
                    fileName = this.indexFile(fileName)
                } else if (this.indexFile) {
                    fileName = path.join(fileName, this.indexFile)
                }
            }

            await this.load(fileName)
        }

        this.emit('loaded files')

        if (!this.ready) {
            this.ready = true
            this.emit('ready')
        }
    }

    async load(fileName: string): Promise<T> {
        const filePath = path.join(this.path, fileName)
        let file = await import(filePath)
        let name = this.recursive
            ? path.dirname(fileName)
            : path.basename(fileName, path.extname(fileName))

        if (this.classes.instantiate && typeof file.default === 'function') {
            const cls = file.default

            cls.__path = filePath
            cls.__directory = path.dirname(filePath)

            file = new cls(...this.classes.params)
            name = cls.name

            cls.__instance = file
        }

        this.files.push(file)
        this.emit('loaded file', name)

        logger.info(`Loaded ${this.name} ${name}`)

        return file
    }

    onReady(cb: () => void) {
        if(this.ready) {
            cb()
        } else {
            this.once('ready', cb)
        }
    }
}
