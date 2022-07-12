import { Client, Intents } from 'discord.js'
import { logger } from './utils/logger'
import ModuleLoader from './loaders/module'
import Config from './config'
// import mikroConfig from './config/mikro-orm'
import { CommandManager } from './commands/manager'
import { REST } from '@discordjs/rest'
import { MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

export default class Max {
    public client = new Client({ intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ] })

    public readonly commandMgr = CommandManager.init(this)
    public readonly moduleLoader = new ModuleLoader(this)

    public readonly rest = new REST({ version: '9' }).setToken(Config.token)
    public orm: MikroORM<PostgreSqlDriver>

    constructor() {
        this.registerEvents()
        this.init()
    }

    private async init() {
        // this.orm = await MikroORM.init<PostgreSqlDriver>(mikroConfig)

        this.moduleLoader.onReady(async () => {
            await this.commandMgr.deploy()
            await this.client.login(Config.token)
        })
    }

    private registerEvents(): void {
        this.client.on('interactionCreate', interaction => {
            this.commandMgr.handleInteraction(interaction)
        })

        this.client.on('messageCreate', msg => {
            this.commandMgr.handleMessage(msg)
        })

        this.client.on('ready', () => {
            logger.info('Max is ready!')
        })
    }
}
