import {
    ActionRowBuilder,
    APISelectMenuDefaultValue,
    ButtonBuilder,
    ButtonStyle,
    cleanCodeBlockContent,
    Client,
    codeBlock,
    Collection, MentionableSelectMenuBuilder,
    MessageCreateOptions,
    MessageEditOptions,
    SelectMenuDefaultValueType,
    TextChannel,
    VideoQualityMode,
    VoiceBasedChannel,
} from "discord.js";

import {createBaseEmbed} from "./ReplyManager";

import {DiscordMessage} from "../sequelize/models/discordmessage.model";

import ManagedChannel from "../objects/ManagedChannel";
import Panel from "../objects/Panel";
import {Op} from "sequelize";
import logger from "../../logger";
import {DiscordChannelStatus} from "../sequelize/models/discordchannel.model";

const BLANK_FIELD =
    {
        name: " ",
        value: " ",
        inline: true,
    };

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

    formatVideoQuality(quality: VideoQualityMode): string {
        switch (quality) {
            case VideoQualityMode.Full:
                return "720p";
            default:
                return "Auto";
        }
    }

    formatStatus(status: DiscordChannelStatus): string {
        switch (status) {
            case DiscordChannelStatus.PUBLIC:
                return "🌐 Public";
            case DiscordChannelStatus.PRIVATE:
                return "🔒 Private";
            case DiscordChannelStatus.HIDDEN:
                return "👥 Hidden";
        }
    }

    constructMessageData(channel: ManagedChannel, isEdit: true): MessageEditOptions;
    constructMessageData(channel: ManagedChannel, isEdit: false): MessageCreateOptions;
    constructMessageData(channel: ManagedChannel, isEdit: boolean): MessageCreateOptions | MessageEditOptions {
        if (!channel.discord.isVoiceBased()) {
            throw "Channel must be voice based!";
        }

        const embeds = [
            createBaseEmbed(channel.discord.guild)
                .setAuthor({
                    name: `Panel • 🔊 ${channel.discord.name}`,
                    iconURL: "https://cdn.twijn.net/voicetwine/images/icon/1-64x64.png"
                })
                .setTitle("👋 Welcome to your new Twine channel!")
                .setDescription(
                    "Here, you can customize your channel however you'd like.\n" +
                    "### ⚙️ Your current settings:"
                )
                .addFields([
                    {
                        name: "🏷️ Channel Name",
                        value: codeBlock(cleanCodeBlockContent(channel.discord.name)),
                        inline: true,
                    },
                    {
                        name: "👥 User Limit",
                        value: codeBlock(cleanCodeBlockContent(
                            channel.discord.userLimit > 0 ? `${channel.discord.userLimit} user${channel.discord.userLimit !== 1 ? "s" : ""}` :
                                `No user limit`
                        )),
                        inline: true,
                    },
                    BLANK_FIELD,
                    {
                        name: "👑 Channel Owner",
                        value: `<@${channel.database.ownerId}>`,
                        inline: true,
                    },
                    {
                        name: "⭐ Channel Status",
                        value: codeBlock(cleanCodeBlockContent(this.formatStatus(channel.database.status))),
                        inline: true,
                    },
                    BLANK_FIELD,
                    {
                        name: "🎵 Bitrate",
                        value: codeBlock(cleanCodeBlockContent(`${Math.floor(channel.discord.bitrate / 1000)} kbps`)),
                        inline: true,
                    },
                    {
                        name: "📺 Video Quality",
                        value: codeBlock(cleanCodeBlockContent(`${this.formatVideoQuality(channel.discord.videoQualityMode)}`)),
                        inline: true,
                    },
                    BLANK_FIELD,
                ]),
        ];

        const firstRowButtons = [
            new ButtonBuilder()
                .setCustomId("edit")
                .setLabel("Edit Channel")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("✏️")
        ];

        if (channel.database.status !== DiscordChannelStatus.PUBLIC) {
            firstRowButtons.push(new ButtonBuilder()
                .setCustomId("status-public")
                .setLabel("Make Public")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🌐"));
        }
        if (channel.database.status !== DiscordChannelStatus.PRIVATE) {
            firstRowButtons.push(new ButtonBuilder()
                .setCustomId("status-private")
                .setLabel("Make Private")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🔒"));
        }
        if (channel.database.status !== DiscordChannelStatus.HIDDEN) {
            firstRowButtons.push(new ButtonBuilder()
                .setCustomId("status-hidden")
                .setLabel("Hide")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("👥"));
        }

        const components: ActionRowBuilder<ButtonBuilder | MentionableSelectMenuBuilder>[] = [];

        components.push(
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(firstRowButtons)
        );

        if (channel.database.status !== DiscordChannelStatus.PUBLIC) {
            let defaultValues: APISelectMenuDefaultValue<SelectMenuDefaultValueType.User|SelectMenuDefaultValueType.Role>[] = [];

            if (channel.database.members) {
                const ids = channel.database.members.split(",");
                for (const id of ids) {
                    let type = SelectMenuDefaultValueType.User;
                    if (channel.discord.guild.roles.cache.has(id)) {
                        type = SelectMenuDefaultValueType.Role;
                    }
                    defaultValues.push({
                        id, type,
                    });
                }
            }

            const mentionableMenu = new MentionableSelectMenuBuilder()
                .setCustomId("grant")
                .setPlaceholder("Grant Access to Users or Roles")
                .setMinValues(0)
                .setMaxValues(25)
                .setDefaultValues(defaultValues);

            components.push(
                new ActionRowBuilder<MentionableSelectMenuBuilder>()
                    .addComponents(mentionableMenu)
            );
        }

        const messageOptions = {
            embeds, components,
        };

        return isEdit ?
            messageOptions as MessageEditOptions :
            messageOptions as MessageCreateOptions;
    }

    async constructPanel(channel: ManagedChannel, sendTo?: VoiceBasedChannel|TextChannel): Promise<Panel> {
        if (!channel.discord.isVoiceBased()) {
            throw "Channel must be voice based!";
        }

        if (!sendTo) {
            sendTo = channel.discord;
        }

        const discordMessage = await sendTo.send(this.constructMessageData(channel, false));

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
