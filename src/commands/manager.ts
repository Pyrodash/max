import Max from '~/max'
import { ICommand } from './'
import Config from '~/config'
import { logger } from '~/utils/logger'
import { ApplicationCommandDataResolvable, CommandInteraction, Interaction, Message } from 'discord.js'

type CommandMap = Map<string, ICommand>

export class CommandManager {
    static instance: CommandManager

    static init(max: Max): CommandManager {
        return (this.instance = new CommandManager(max))
    }

    private max: Max

    private commands: CommandMap = new Map()
    private slashCommands: CommandMap = new Map()

    constructor(max: Max) {
        this.max = max
    }

    public register(command: ICommand) {
        const container = command.isSlash ? this.slashCommands : this.commands

        container.set(command.name, command)
    }

    public async deploy() {
        if (this.slashCommands.size > 0) {
            const commands: ApplicationCommandDataResolvable[] = Array.from(this.slashCommands.values())
                .map((cmd) => {
                    return {
                        name: cmd.name,
                        description: cmd.description,
                        options: cmd.options,
                    }
                })
            
            await this.max.client.application.commands.set(commands)
            
            logger.info('Deployed slash commands')
        }
    }

    public handleInteraction(interaction: Interaction) {
        if (!interaction.isCommand()) return

        const { commandName } = interaction
        const command = this.slashCommands.get(commandName)

        if (command) {
            command.handler(interaction as CommandInteraction)
        }
    }

    public handleMessage(msg: Message) {
        if (msg.author.bot) return

        const prefix = Config.prefix

        if (msg.content.startsWith(prefix)) {
            const commandName = msg.content.slice(prefix.length)
            const command = this.commands.get(commandName)

            if (command) {
                command.handler(msg)
            }
        }
    }
}
