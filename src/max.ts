import { Client, Intents } from 'discord.js'
import { logger } from './utils/logger'
import ModuleLoader from './managers/module'
import Config from './config'
// import mikroConfig from './config/mikro-orm'
import { CommandManager } from './commands/manager'
import { MikroORM } from '@mikro-orm/core'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'

export default class Max {
    public client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    })

    public readonly commandMgr = CommandManager.init(this)
    public readonly moduleLoader = new ModuleLoader(this)

    public orm: MikroORM<PostgreSqlDriver>

    constructor() {
        this.init()
    }

    private async init() {
        // this.orm = await MikroORM.init<PostgreSqlDriver>(mikroConfig)

        this.moduleLoader.onReady(async () => {
            await this.client.login(Config.token)
            await this.commandMgr.deploy()

            this.registerEvents()

            logger.info('Max is ready!')
        })
    }

    private registerEvents(): void {
        this.client.on('interactionCreate', (interaction) => {
            this.commandMgr.handleInteraction(interaction)
        })

        this.client.on('messageCreate', (msg) => {
            this.commandMgr.handleMessage(msg)
        })
    }
}
