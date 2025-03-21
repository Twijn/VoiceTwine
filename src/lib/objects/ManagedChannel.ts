import {DiscordChannel, DiscordChannelStatus, DiscordChannelType} from "../sequelize/models/discordchannel.model";
import {
    ActionRowBuilder, APISelectMenuDefaultValue, ButtonBuilder, ButtonStyle,
    CategoryChannel, cleanCodeBlockContent, codeBlock,
    GuildChannelEditOptions, MentionableSelectMenuBuilder, MessageCreateOptions, MessageEditOptions,
    ModalBuilder,
    OverwriteResolvable,
    PermissionsBitField, SelectMenuDefaultValueType,
    TextInputBuilder,
    TextInputStyle, User,
    VoiceBasedChannel,
} from "discord.js";
import PanelManager from "../managers/PanelManager";
import {DiscordUser} from "../sequelize/models/discorduser.model";
import logger from "../../logger";
import {createBaseEmbed} from "../managers/ReplyManager";
import {BLANK_FIELD, formatStatus, formatVideoQuality} from "../utils";

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

    constructGrantComponent(): ActionRowBuilder<MentionableSelectMenuBuilder> {
        let defaultValues: APISelectMenuDefaultValue<SelectMenuDefaultValueType.User|SelectMenuDefaultValueType.Role>[] = [];

        if (this.database.members) {
            const ids = this.database.members.split(",");
            for (const id of ids) {
                let type = SelectMenuDefaultValueType.User;
                if (this.discord.guild.roles.cache.has(id)) {
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

        return new ActionRowBuilder<MentionableSelectMenuBuilder>()
            .setComponents(mentionableMenu);
    }

    constructMessageData(isEdit: true): MessageEditOptions;
    constructMessageData(isEdit: false): MessageCreateOptions;
    constructMessageData(isEdit: boolean): MessageCreateOptions | MessageEditOptions {
        if (!this.discord.isVoiceBased()) {
            throw "Channel must be voice based!";
        }

        const embeds = [
            createBaseEmbed(this.discord.guild)
                .setAuthor({
                    name: `VoiceTwine Panel • 🔊 ${this.name}`,
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
                        value: codeBlock(cleanCodeBlockContent(this.name)),
                        inline: true,
                    },
                    {
                        name: "👥 User Limit",
                        value: codeBlock(cleanCodeBlockContent(
                            this.discord.userLimit > 0 ? `${this.discord.userLimit} user${this.discord.userLimit !== 1 ? "s" : ""}` :
                                `No user limit`
                        )),
                        inline: true,
                    },
                    BLANK_FIELD,
                    {
                        name: "👑 Channel Owner",
                        value: `<@${this.database.ownerId}>`,
                        inline: true,
                    },
                    {
                        name: "⭐ Channel Status",
                        value: codeBlock(cleanCodeBlockContent(formatStatus(this.database.status))),
                        inline: true,
                    },
                    BLANK_FIELD,
                    {
                        name: "🎵 Bitrate",
                        value: codeBlock(cleanCodeBlockContent(`${Math.floor(this.discord.bitrate / 1000)} kbps`)),
                        inline: true,
                    },
                    {
                        name: "📺 Video Quality",
                        value: codeBlock(cleanCodeBlockContent(`${formatVideoQuality(this.discord.videoQualityMode)}`)),
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

        if (this.database.status !== DiscordChannelStatus.PUBLIC) {
            firstRowButtons.push(new ButtonBuilder()
                .setCustomId("status-public")
                .setLabel("Make Public")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🌐"));
        }
        if (this.database.status !== DiscordChannelStatus.PRIVATE) {
            firstRowButtons.push(new ButtonBuilder()
                .setCustomId("status-private")
                .setLabel("Make Private")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("🔒"));
        }
        if (this.database.status !== DiscordChannelStatus.HIDDEN) {
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

        if (this.database.status !== DiscordChannelStatus.PUBLIC) {
            components.push(
                this.constructGrantComponent()
            );
        }

        const messageOptions = {
            embeds, components,
        };

        return isEdit ?
            messageOptions as MessageEditOptions :
            messageOptions as MessageCreateOptions;
    }

    getEditModal(): ModalBuilder {
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
                            .setValue(formatVideoQuality(this.discord.videoQualityMode))
                    )
            );
    }

    async updatePanels(): Promise<void> {
        const panels = PanelManager.getPanelsForChannel(this.id);
        for (const [,panel] of panels) {
            await panel.update();
        }
    }

    async updatePermissions(): Promise<void> {
        await this.discord.permissionOverwrites.set(this.getOverwrites());
    }

    async setStatus(status: DiscordChannelStatus): Promise<void> {
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

    async setAllowedMembers(members: string[]) {
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
