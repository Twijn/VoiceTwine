import {DiscordChannel} from "../sequelize/models/discordchannel.model";
import {CategoryChannel, VoiceBasedChannel} from "discord.js";


export default class ManagedChannel {
    database: DiscordChannel;
    discord: VoiceBasedChannel | CategoryChannel;

    constructor(database: DiscordChannel, discord: VoiceBasedChannel|CategoryChannel) {
        this.database = database;
        this.discord = discord;
    }

    public get type() {
        return this.database.type;
    }

    async delete() {
        await this.database.destroy();
        if (this.discord.deletable) {
            await this.discord.delete().catch(e => {});
        }
    }
}
