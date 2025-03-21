import {DiscordChannel, DiscordChannelStatus, DiscordChannelType} from "../sequelize/models/discordchannel.model";
import {
    ActionRowBuilder,
    CategoryChannel,
    GuildChannelEditOptions,
    ModalBuilder,
    OverwriteResolvable,
    PermissionsBitField,
    TextInputBuilder,
    TextInputStyle, User,
    VoiceBasedChannel,
} from "discord.js";
import PanelManager from "../managers/PanelManager";
import {DiscordUser} from "../sequelize/models/discorduser.model";
import logger from "../../logger";

export const ownerOverwrites = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.Connect,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.MoveMembers,
    PermissionsBitField.Flags.MuteMembers,
];

export const memberOverwrites = [
    PermissionsBitField.Flags.ViewChannel,
    PermissionsBitField.Flags.Connect,
];

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

    public get status() {
        return this.database.status;
    }

    public get name() {
        return this.discord.name;
    }

    public get url() {
        return this.discord.url;
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
        await this.updatePermissions();
        await this.updatePanels();
    }

    async setOwner(user: User): Promise<void> {
        if (!this.discord.members.has(user.id)) {
            throw new Error("The new owner must be in the channel to transfer!");
        }

        await DiscordUser.upsert(user);
        this.database.ownerId = user.id;
        await this.database.save();
        this.updatePanels().catch(e => logger.error(e));
    }

    async edit(options: GuildChannelEditOptions) {
        await this.discord.edit(options);
        return this;
    }

    private getOverwrites(): OverwriteResolvable[] {
        let overwrites: OverwriteResolvable[] = [
            {
                id: this.database.ownerId,
                allow: ownerOverwrites,
            },
        ];

        if (this.status !== DiscordChannelStatus.PUBLIC) {
            const deny = [
                PermissionsBitField.Flags.Connect,
            ];

            if (this.status === DiscordChannelStatus.HIDDEN) {
                deny.push(PermissionsBitField.Flags.ViewChannel);
            }

            overwrites = [
                {
                    id: this.discord.guildId,
                    deny,
                },
                ...overwrites,
            ]
        }

        if (this.database.members) {
            overwrites = [
                ...overwrites,
                ...this.database.members
                    .split(",")
                    .map(id => {
                        return {
                            id,
                            allow: memberOverwrites,
                        };
                    })
            ];
        }

        return overwrites;
    }

    async updatePermissions(): Promise<void> {
        await this.discord.permissionOverwrites.set(this.getOverwrites());
    }

    async editAllowedMembers(members: string[]) {
        this.database.members = members.join(",");
        await this.database.save();
        await this.updatePermissions();
    }

    async delete() {
        await this.database.destroy();
        if (this.discord.deletable) {
            await this.discord.delete().catch(() => {});
        }
    }
}
