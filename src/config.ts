export default class Config {
    static get token() {
        return process.env.TOKEN
    }

    static get clientId() {
        return process.env.CLIENT_ID
    }
}
