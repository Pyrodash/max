import { Client, Intents } from 'discord.js'
import { logger } from './utils/logger'
import ModuleLoader from './loaders/module'
import Config from './config'
import { CommandManager } from './commands/manager'
import { REST } from '@discordjs/rest'

export default class Max {
    public client = new Client({ intents: [Intents.FLAGS.GUILDS] })

    public commandMgr = CommandManager.init(this)
    public moduleLoader = new ModuleLoader(this)

    public readonly rest = new REST({ version: '9' }).setToken(Config.token)

    constructor() {
        this.registerEvents()
        
        this.moduleLoader.onReady(async () => {
            await this.commandMgr.deploy()
            await this.client.login(Config.token)
        })
    }

    registerEvents(): void {
        this.client.on('interactionCreate', async interaction => {
            this.commandMgr.handle(interaction)
        })

        this.client.on('ready', () => {
            logger.info('Max is ready!')
        })
    }
}
