import {DiscordChannel, DiscordChannelStatus, DiscordChannelType} from "../sequelize/models/discordchannel.model";
import {
    ActionRowBuilder,
    CategoryChannel,
    GuildChannelEditOptions,
    ModalBuilder,
    TextInputBuilder,
    VoiceBasedChannel,
    TextInputStyle,
} from "discord.js";
import PanelManager from "../managers/PanelManager";


export default class ManagedChannel {
    database: DiscordChannel;
    discord: VoiceBasedChannel | CategoryChannel;

    constructor(database: DiscordChannel, discord: VoiceBasedChannel|CategoryChannel) {
        this.database = database;
        this.discord = discord;
    }

    public get id(): string {
        return this.database.id;
    }

    public get type() {
        return this.database.type;
    }

    editModal(): ModalBuilder {
        if (this.type !== DiscordChannelType.CHILD_CHANNEL || !this.discord.isVoiceBased()) {
            throw new Error("Edit modals can only be generated for child channels!");
        }

        return new ModalBuilder()
            .setCustomId("edit")
            .setTitle(`Edit '${this.discord.name}'`)
            .setComponents(
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents(
                        new TextInputBuilder()
                            .setStyle(TextInputStyle.Short)
                            .setCustomId("name")
                            .setLabel("Name")
                            .setMinLength(2)
                            .setMaxLength(30)
                            .setRequired(true)
                            .setValue(this.discord.name)
                    ),
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents(
                        new TextInputBuilder()
                            .setStyle(TextInputStyle.Short)
                            .setCustomId("user-limit")
                            .setLabel("User Limit (0-99, 0 = no limit)")
                            .setMinLength(1)
                            .setMaxLength(2)
                            .setRequired(true)
                            .setValue(String(this.discord.userLimit))
                    ),
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents(
                        new TextInputBuilder()
                            .setStyle(TextInputStyle.Short)
                            .setCustomId("bitrate")
                            .setLabel("Bitrate (8-96 kbps)")
                            .setMinLength(1)
                            .setMaxLength(2)
                            .setRequired(true)
                            .setValue(String(Math.floor(this.discord.bitrate / 1000)))
                    ),
                new ActionRowBuilder<TextInputBuilder>()
                    .setComponents(
                        new TextInputBuilder()
                            .setStyle(TextInputStyle.Short)
                            .setCustomId("video-quality")
                            .setLabel("Video Quality (Auto, 720p)")
                            .setMinLength(4)
                            .setMaxLength(4)
                            .setRequired(true)
                            .setValue(PanelManager.formatVideoQuality(this.discord.videoQualityMode))
                    )
            );
    }

    async updatePanels(): Promise<void> {
        const panels = PanelManager.getPanelsForChannel(this.id);
        for (const [,panel] of panels) {
            await panel.update();
        }
    }

    async updateStatus(status: DiscordChannelStatus): Promise<void> {
        this.database.status = status;
        await this.database.save();
        await this.updatePanels();
    }

    async edit(options: GuildChannelEditOptions) {
        await this.discord.edit(options);
        return this;
    }

    async delete() {
        await this.database.destroy();
        if (this.discord.deletable) {
            await this.discord.delete().catch(() => {});
        }
    }
}
