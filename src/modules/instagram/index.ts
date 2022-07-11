import { CommandInteraction } from 'discord.js'
import { Command, CommandGroup } from '~/commands'
import Module from '../module'

@CommandGroup
export default class Instagram extends Module {
    @Command({ description: 'replies with pong!' })
    ping(interaction: CommandInteraction) {
        interaction.reply('pong!')
    }
}
