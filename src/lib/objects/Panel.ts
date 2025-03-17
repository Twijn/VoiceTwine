import {Channel, Message} from "discord.js";

import {DiscordMessage} from "../sequelize/models/discordmessage.model";
import ManagedChannel from "./ManagedChannel";
import TwineChannelManager from "../managers/TwineChannelManager";

import logger from "../../logger";
import client from "../../discord";
import PanelManager from "../managers/PanelManager";

export default class Panel {
    database: DiscordMessage;
    discord: Message;

    public getChannel(): Promise<Channel> {
        return client.channels.fetch(this.database.channelId);
    }

    public getOperatingChannel(): ManagedChannel {
        return TwineChannelManager.getChannel(this.database.panelChannelId);
    }

    public getMasterChannel(): ManagedChannel {
        return TwineChannelManager.getChannel(this.getOperatingChannel().database.masterChannelId);
    }

    constructor(database: DiscordMessage, discord: Message) {
        this.database = database;
        this.discord = discord;
    }

    async delete() {
        await this.discord.delete().catch(() => {});
        await this.database.destroy().catch(() => {});
        logger.debug(`Deleted panel ${this.database.id}`);
    }

    async update() {
        const childChannel = this.getOperatingChannel();

        await this.discord.edit(PanelManager.constructMessageData(childChannel, true));
    }
}
