import { promises as fs } from 'fs'
import path from 'path'
import { EventEmitter } from 'events'

const ALLOWED_FILE_EXTS = ['.ts']

interface ClassOptions {
    instantiate?: boolean
    params?: Array<any>
    loadConfig?: boolean
}

const defaultClassOptions: ClassOptions = { instantiate: true, params: [] }

interface Logger {
    write: (text: string) => void
}

interface LoaderOptions {
    name: string
    path?: string
    recursive?: boolean
    indexFile?: string | ((file: string) => string)
    ignored?: Array<string>
    autoLoad?: boolean
    classes?: ClassOptions
    logger: Logger
}

export default class Loader extends EventEmitter {
    private name: string
    private path: string

    private recursive: boolean
    private indexFile: string | ((file: string) => string)

    private classes: ClassOptions
    private logger: Logger

    private ignored: Array<string>
    private files: Array<any>

    public ready = false

    constructor(opts: LoaderOptions) {
        super()

        this.name = opts.name
        this.path = opts.path

        this.recursive = opts.recursive
        this.indexFile = opts.indexFile || 'index.ts'

        this.classes = opts.classes || defaultClassOptions
        this.logger = opts.logger

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

    async load(fileName: string): Promise<any> {
        const filePath = path.join(this.path, fileName)
        let file = await import(filePath)
        let name = this.recursive
            ? path.dirname(fileName)
            : path.basename(fileName, path.extname(fileName))

        if (this.classes.instantiate && typeof file.default === 'function') {
            const cls = file.default

            cls.__path = filePath
            cls.__directory = path.dirname(filePath)

            if (this.classes.loadConfig) {
                try {
                    const config = await import(
                        path.join(cls.__directory, 'config.json')
                    )

                    cls.__config = config.default
                } catch (err) {
                    cls.__config = {}
                }
            }

            file = new cls(...this.classes.params)
            name = cls.name

            cls.__instance = file
        }

        this.files.push(file)
        this.emit('loaded file', name)

        if (this.logger) this.logger.write(`Loaded ${this.name} ${name}`)

        return file
    }
}
