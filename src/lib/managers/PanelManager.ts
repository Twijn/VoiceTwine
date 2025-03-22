import {Client, Collection, TextChannel, VoiceBasedChannel} from "discord.js";

import {DiscordMessage} from "../sequelize/models/discordmessage.model";

import ManagedChannel from "../objects/ManagedChannel";
import Panel from "../objects/Panel";
import {Op} from "sequelize";
import logger from "../../logger";

class PanelManager {

    private panels = new Collection<string, Panel>();

    async loadPanels(client: Client) {
        const databasePanels = await DiscordMessage.findAll({
            where: {
                panelChannelId: {
                    [Op.ne]: null,
                },
            },
        });
        logger.info("Loading database panels...");
        for (const panel of databasePanels) {
            try {
                const discordChannel = await client.channels.fetch(panel.channelId);
                if (!discordChannel.isTextBased()) {
                    logger.error(`Channel ${panel.channelId} is not text based!`);
                    continue;
                }
                const discordMessage = await discordChannel.messages.fetch(panel.id);
                this.panels.set(panel.id, new Panel(panel, discordMessage));
            } catch (e) {
                logger.error(`Failed to load panel ${panel.id}: ${e}`);
            }
        }
        logger.info(`Loaded ${this.panels.size} message panel(s)`);
    }

    getPanel(messageId: string): Panel {
        return this.panels.get(messageId);
    }

    getPanelsForChannel(channelId: string): Collection<string, Panel> {
        return this.panels.filter(x => x.database.panelChannelId === channelId);
    }

    async deletePanel(id: string) {
        const panel = this.panels.get(id);
        if (panel) {
            await panel.delete();
        }
        this.panels.delete(id);
    }

    async constructPanel(channel: ManagedChannel, sendTo?: VoiceBasedChannel|TextChannel): Promise<Panel> {
        if (!channel.discord.isVoiceBased()) {
            throw "Channel must be voice based!";
        }

        if (!sendTo) {
            sendTo = channel.discord;
        }

        const discordMessage = await sendTo.send(channel.constructMessageData(false));

        const dbMessage = await DiscordMessage.create({
            id: discordMessage.id,
            channelId: sendTo.id,
            panelChannelId: channel.id,
        });

        const panel = new Panel(dbMessage, discordMessage);
        this.panels.set(dbMessage.id, panel);

        return panel;
    }

}

export default new PanelManager();
