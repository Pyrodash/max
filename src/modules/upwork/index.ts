import { EmbedBuilder, DMChannel } from 'discord.js'
import RSSParser from 'rss-parser'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import Max from '~/max'
import { logger } from '~/utils/logger'
import Module from '../module'

const MAX_FIELDS_IN_EMBED = 8

interface UpworkJob {
    title: string
    description: string
    category: string
    budget?: string
    skills: string[]
    link: string
    date: Date
}

function shorten(input: string, maxLength: number) {
    if (input.length > maxLength) {
        return `${input.substring(0, maxLength - 3)}...`
    } else {
        return input
    }
}

function msToTime(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))

    if (seconds < 60) return `${seconds} seconds`
    else if (minutes < 60) return `${minutes} minutes`
    else if (hours < 24) return `${hours} hours`
    else return `${days} days`
}

export default class Upwork extends Module {
    private feedUrl =
        ''
    private userId = ''
    private interval = 60 * 1000

    private parser = new RSSParser()
    private nhm = new NodeHtmlMarkdown()

    private history = new Map<string, boolean>()
    private timer: NodeJS.Timer
    private channel: DMChannel

    constructor(max: Max) {
        super(max)

        this.startLoop()
    }

    startLoop(): void {
        this.fetchFeed()

        this.timer = setInterval(this.fetchFeed.bind(this), this.interval)
    }

    stopLoop(): void {
        clearInterval(this.timer)
    }

    createEmbed(): EmbedBuilder {
        return new EmbedBuilder()
            .setColor(0x14a800)
            .setTitle('New work just dropped')
            .setURL('https://upwork.com/')
            .setThumbnail(
                'https://assets-global.website-files.com/603fea6471d9d8559d077603/6092b7514135708162a4be92_Favicon%20256.png'
            )
    }

    fetchFeed(): void {
        this.parser
            .parseURL(this.feedUrl)
            .then(async (feed) => {
                const items: UpworkJob[] = feed.items
                    .filter((item) => {
                        const isNew = !this.history.has(item.guid)

                        if (isNew) {
                            this.history.set(item.guid, true)
                        }

                        return isNew
                    })
                    .map((item) => {
                        const content = this.nhm.translate(item.contentSnippet)

                        const categoryIndex = content.lastIndexOf(' Category: ')
                        const skillsIndex = content.lastIndexOf(' Skills:')

                        let description = content.substring(
                            0,
                            content.lastIndexOf(' Posted On: ')
                        )
                        const category = content.substring(
                            categoryIndex + 11,
                            skillsIndex
                        )
                        const skills = content
                            .substring(
                                skillsIndex + 8,
                                content.lastIndexOf(' Country: ')
                            )
                            .split(', ')

                        let budget: string
                        let budgetIndex =
                            description.lastIndexOf(' Hourly Range: ')

                        if (budgetIndex === -1) {
                            budgetIndex = description.lastIndexOf(' Budget: ')

                            if (budgetIndex > -1) {
                                budget = description.substring(
                                    budgetIndex + 9,
                                    description.length
                                )
                            }
                        } else {
                            budget = `${description.substring(
                                budgetIndex + 15,
                                description.length
                            )}/hr`
                        }

                        if (budget) {
                            description = description.substring(0, budgetIndex)
                        }

                        return {
                            title: item.title,
                            description,
                            link: item.link,
                            category,
                            skills,
                            budget,
                            date: new Date(item.isoDate),
                        }
                    })

                if (!this.channel) {
                    this.channel = await this.client.users.createDM(this.userId)
                }

                if (items.length > 0) {
                    const embeds: EmbedBuilder[] = [this.createEmbed()]

                    let fieldCount = 0
                    let embedIndex = 0

                    for (const i in items) {
                        const item = items[i]

                        const skills = item.skills
                            .map((skill) => `\`${skill}\``)
                            .join(', ')
                        const description = shorten(item.description, 512)

                        if (fieldCount === MAX_FIELDS_IN_EMBED) {
                            fieldCount = 0
                            embedIndex++

                            embeds[embedIndex] = this.createEmbed()
                        }

                        let value = `**Category:** ${item.category}\n**Skills:** ${skills}\n`

                        if (item.budget) {
                            value += `**Budget:** ${item.budget}\n`
                        }

                        const now = new Date().getTime() - item.date.getTime()
                        const time = msToTime(now)

                        value += `*Posted ${time} ago*\n\n${description}\n${item.link}\n\n`

                        embeds[embedIndex].addFields({
                            name: shorten(item.title, 256),
                            value,
                        })

                        fieldCount++
                    }

                    for (const embed of embeds) {
                        await this.channel.send({ embeds: [embed] })
                    }
                }
            })
            .catch((err) => logger.error(err.stack))
    }

    destroy(): void {}
}
