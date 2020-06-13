export interface Result {
    inStock: boolean
    price: number | string
}

export interface Provider {
    name: string
    logo: string
    url: string
    check: () => Promise<Result>
}
