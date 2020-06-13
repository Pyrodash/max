import { Client } from 'discord.js'
import Logger from './utils/logger'
import ModuleLoader from './loaders/module'
import { CommandHandler } from './commands'

let instance: Max

export default class Max {
    public client: Client = new Client()
    public moduleLoader: ModuleLoader = new ModuleLoader(this)
    public commandHandler: CommandHandler

    constructor() {
        instance = this

        this.commandHandler = CommandHandler.get()
        this.registerEvents()
        this.client.login(process.env.BOT_TOKEN)
    }

    static get(): Max {
        return instance || (instance = new Max())
    }

    registerEvents(): void {
        this.client.on('ready', () => {
            Logger.write('Max is ready!')
        })
    }
}
