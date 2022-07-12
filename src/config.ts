export default class Config {
    static get prefix() {
        return process.env.PREFIX
    }

    static get token() {
        return process.env.TOKEN
    }

    static get clientId() {
        return process.env.CLIENT_ID
    }
}
