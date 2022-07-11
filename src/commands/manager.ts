import Max from '~/max'
import { ICommand } from './'
import Config from '~/config'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Routes } from 'discord-api-types/v9'
import { logger } from '~/utils/logger'
import { CommandInteraction, Interaction } from 'discord.js'

type CommandMap = Map<string, ICommand>

export class CommandManager {
    static instance: CommandManager

    static init(max: Max): CommandManager {
        return (this.instance = new CommandManager(max))
    }

    private max: Max
    private _commands: CommandMap = new Map()

    public get commands(): CommandMap {
        return this._commands
    }

    constructor(max: Max) {
        this.max = max
    }

    public register(command: ICommand) {
        this._commands.set(command.name, command)
    }

    public async deploy() {
        const commands = Array.from(this.commands.values())
            .map((cmd) => {
                const builder = new SlashCommandBuilder()
                    .setName(cmd.name)
                    .setDescription(cmd.description)

                return builder.toJSON()
            })
        
        await this.max.rest.put(Routes.applicationCommands(Config.clientId), { body: commands })

        logger.info('Deployed slash commands')
    }

    public async handle(interaction: Interaction) {
        if (!interaction.isCommand()) return

        const { commandName } = interaction
        const command = this.commands.get(commandName)

        if (command) {
            command.handler(interaction as CommandInteraction)
        }
    }
}
