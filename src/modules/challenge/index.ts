import Module from '../module'
import Command from '@Command'
import Max from '~/max'
import { Challenge } from './challenges'
import { Swearing } from './challenges/swearing'
import { CommandPayload } from '~/commands'
import { ucfirst } from '~/utils'

const activeIcon = (active: boolean) => (active ? ':white_check_mark:' : ':x:')

export default class Challenges extends Module {
    public challenges: Challenge[]

    constructor(max: Max) {
        super(max)

        this.challenges = [new Swearing()]
    }

    findChallenge(name: string): Challenge {
        name = name.toLowerCase()

        return this.challenges.find(
            (challenge) => challenge.name.toLowerCase() === name
        )
    }

    @Command({ name: 'challenges' })
    getChallenges(payload: CommandPayload): void {
        payload.send(
            this.challenges
                .map(
                    (challenge) =>
                        `**${challenge.name}** - Active: ${activeIcon(
                            challenge.active
                        )}`
                )
                .join('\n')
        )
    }

    @Command({
        name: 'enable',
        parent: 'challenge',
        permissions: ['ADMINISTRATOR'],
    })
    @Command({
        name: 'disable',
        parent: 'challenge',
        permissions: ['ADMINISTRATOR'],
    })
    toggle(payload: CommandPayload): void {
        const name = payload.message.content
        const challenge = this.findChallenge(name)
        const active = payload.command === 'enable'

        if (challenge) {
            const pastCommand = `${payload.command}d`

            if (challenge.active === active) {
                payload.send(`Challenge is already ${pastCommand}.`)
            } else {
                if (active) {
                    challenge.reset()
                }

                challenge.active = active
                payload.send(
                    `${ucfirst(pastCommand)} challenge ${challenge.name}.`
                )
            }
        } else {
            payload.send(`Challenge "${name}" was not found.`)
        }
    }
}
