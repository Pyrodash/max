export interface IChallenge {
    name: string
    enable(): void
    disable(): void
    reset(): void
}

export class Challenge implements IChallenge {
    public name: string
    public active = false

    enable(): void {
        this.active = true
    }

    disable(): void {
        this.active = false
    }

    reset(): void {
        return
    }
}
