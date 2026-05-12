import {DiscordChannel, DiscordChannelStatus, DiscordChannelType} from "../sequelize/models/discordchannel.model";
import {
    ActionRowBuilder, APISelectMenuDefaultValue, ButtonBuilder, ButtonStyle,
    CategoryChannel, cleanCodeBlockContent, codeBlock,
    GuildChannelEditOptions, LabelBuilder, MentionableSelectMenuBuilder, MessageCreateOptions, MessageEditOptions,
    ModalBuilder,
    OverwriteResolvable,
    PermissionsBitField, SelectMenuDefaultValueType,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle, User,
    VideoQualityMode,
    VoiceBasedChannel,
} from "discord.js";
import PanelManager from "../managers/PanelManager";
import {DiscordUser} from "../sequelize/models/discorduser.model";
import logger from "../../logger";
import {createBaseEmbed} from "../managers/ReplyManager";
import {BLANK_FIELD, formatStatus, formatVideoQuality, getMaxBitrate} from "../utils";

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

    public get ownerPresent() {
        return this?.database?.ownerId && this.discord.members.has(this.database.ownerId);
    }

    private getOverwrites(): OverwriteResolvable[] {
        let overwrites: OverwriteResolvable[] = [];

        if (this.database?.ownerId) {
            overwrites.push({
                id: this.database.ownerId ?? '',
                allow: ownerOverwrites,
            });
        }

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
                    .filter(id => id !== this.database.ownerId)
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

    constructClaimableMessageData(): MessageEditOptions {
        const embeds = [
            createBaseEmbed(this.discord.guild)
                .setAuthor({
                    name: `VoiceTwine Panel • 🔊 ${this.name}`,
                    iconURL: "https://cdn.twijn.net/voicetwine/logo-128px.png"
                })
                .setTitle("The owner has left this channel!")
                .setDescription("Click the button below to claim this channel!"),
        ];

        const components = [
            new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("claim")
                        .setLabel("Claim Channel")
                        .setStyle(ButtonStyle.Success)
                        .setEmoji("📌")
                ),
        ];

        return {
            embeds, components,
        }
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

        const createdAtMs = this.database.createdAt?.getTime();
        if (!this.ownerPresent &&
            createdAtMs !== undefined &&
            Date.now() - createdAtMs > 5000) {
            return this.constructClaimableMessageData();
        }

        const embeds = [
            createBaseEmbed(this.discord.guild)
                .setAuthor({
                    name: `VoiceTwine Panel • 🔊 ${this.name}`,
                    iconURL: "https://cdn.twijn.net/voicetwine/logo-128px.png"
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
                        value: this.database?.ownerId ? `<@${this.database.ownerId}>` : "None",
                        inline: true,
                    },
                    {
                        name: "⭐ Channel Status",
                        value: codeBlock(cleanCodeBlockContent(formatStatus(this.database?.status ?? DiscordChannelStatus.PUBLIC))),
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

        const modal = new ModalBuilder()
            .setCustomId("edit")
            .setTitle(`Edit '${this.discord.name}'`);

        const nameInput = new TextInputBuilder()
            .setStyle(TextInputStyle.Short)
            .setCustomId("name")
            .setMinLength(2)
            .setMaxLength(30)
            .setRequired(true)
            .setValue(this.discord.name);

        const nameLabel = new LabelBuilder()
            .setLabel("Name")
            .setDescription("The name of your channel (2-30 characters)")
            .setTextInputComponent(nameInput);

        modal.addLabelComponents(nameLabel);

        const userLimitInput = new TextInputBuilder()
            .setStyle(TextInputStyle.Short)
            .setCustomId("user-limit")
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(true)
            .setValue(String(this.discord.userLimit));

        const userLimitLabel = new LabelBuilder()
            .setLabel("User Limit")
            .setDescription("The maximum number of users that can be in the channel at once. Set to 0 for no limit.")
            .setTextInputComponent(userLimitInput);

        modal.addLabelComponents(userLimitLabel);

        const bitrateInput = new TextInputBuilder()
            .setStyle(TextInputStyle.Short)
            .setCustomId("bitrate")
            .setMinLength(1)
            .setMaxLength(3)
            .setRequired(true)
            .setValue(String(Math.floor(this.discord.bitrate / 1000)));

        const bitrateLabel = new LabelBuilder()
            .setLabel("Bitrate")
            .setDescription(`The audio quality of your channel in kbps. Must be between 8 and ${getMaxBitrate(this.discord.guild.premiumTier)}.`)
            .setTextInputComponent(bitrateInput);

        modal.addLabelComponents(bitrateLabel);

        const videoQualityInput = new StringSelectMenuBuilder()
            .setCustomId("video-quality")
            .setPlaceholder("Select the video quality for your channel")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions([
                {
                    label: "Auto",
                    value: "auto",
                    default: !this.discord.videoQualityMode || this.discord.videoQualityMode === VideoQualityMode.Auto,
                },
                {
                    label: "720p",
                    value: "720p",
                    default: this.discord.videoQualityMode === VideoQualityMode.Full,
                },
            ]);

        const videoQualityLabel = new LabelBuilder()
            .setLabel("Video Quality")
            .setDescription("Choose video quality: Auto adjusts by connection quality, while 720p always targets 720p.")
            .setStringSelectMenuComponent(videoQualityInput);

        modal.addLabelComponents(videoQualityLabel);

        return modal;
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

        if (this.database.ownerId === user.id) {
            throw new Error("You can't transfer ownership to the current owner!");
        }

        // Check if the old owner exists in granted members. If not, add them!
        const members = this?.database?.members?.split(",") ?? [];
        if (this.database.ownerId && !members.includes(this.database.ownerId)) {
            members.push(this.database.ownerId);
            this.database.members = members.filter(x => x !== "").join(",");
        }

        await DiscordUser.upsert(user);
        this.database.ownerId = user.id;
        await this.database.save();

        this.updatePermissions().catch(e => logger.error(e));
        this.updatePanels().catch(e => logger.error(e));
    }

    async edit(options: GuildChannelEditOptions) {
        await this.discord.edit(options);
        return this;
    }

    async setAllowedMembers(members: string[]) {
        this.database.members = members.length > 0 ? members.filter(x => x !== "").join(",") : null;
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
