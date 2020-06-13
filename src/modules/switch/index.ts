import { Message, MessageEmbed, TextChannel } from 'discord.js'
import Module from '../module'
import Command from '@Command'
import Max from '~/max'
import fetch from 'node-fetch'
import { Provider, Result } from './providers'
import EgyNewTechProvider from './providers/egynewtech'
import Games2EgyptProvider from './providers/games2egypt'

export default class Switch extends Module {
    public providers: Array<Provider>
    public results: Map<Provider, Result>

    constructor(max: Max) {
        super(max)

        this.results = new Map()
        this.providers = [
            new EgyNewTechProvider(),
            new Games2EgyptProvider(),
            //new SouqProvider(),
        ]
    }

    async renderResults(): Promise<void> {
        const embeds: Array<MessageEmbed> = []

        this.results.forEach((result, provider) => {
            const embed = new MessageEmbed()

            embed.setTitle(provider.name)
            embed.setImage(provider.logo)
            embed.addField('In Stock', result.inStock ? 'Yes' : 'No')
            embed.addField('Price', result.price || '0')

            embeds.push(embed)
        })

        const webhook = await this.client.fetchWebhook(
            this.config.webhook_id,
            this.config.webhook_token
        )
        webhook.send('Nintendo Switch Stock in Egypt', {
            embeds,
        })
    }

    async checkStock(): Promise<void> {
        for (const provider of this.providers) {
            const result = await provider.check()

            this.results.set(provider, result)
        }
    }

    @Command()
    async stock(msg: Message): Promise<void> {
        if (this.results.size === 0) {
            await this.checkStock()
        }

        this.renderResults()
    }
}
