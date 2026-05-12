import {
    CacheType,
    EmbedBuilder,
    Guild, GuildMember,
    InteractionEditReplyOptions, InteractionReplyOptions,
    InteractionResponse,
    Message,
    MessageFlags,
    RepliableInteraction,
} from "discord.js";
import { version } from "../utils";

import localeManager, {Messages} from "./LocaleManager";
import {Locale} from "discord-api-types/v10";

export const SUCCESS_COLOR = 0x32a852;
export const ERROR_COLOR = 0xab4b3c;
export const THEME_COLOR = 0x244785;

export enum ReplyType {
    INFO = "info",
    SUCCESS = "success",
    ERROR = "error",
}

export function createBaseEmbed(guild: Guild | null = null, color: number = THEME_COLOR) {
    const iconURL = guild?.iconURL() ?? "https://cdn.twijn.net/voicetwine/logo-128px.png";
    return new EmbedBuilder()
        .setColor(color)
        .setFooter({
            iconURL: iconURL,
            text: `${guild?.name ? `${guild.name} • ` : ''}VoiceTwine v${version}`,
        });
}

export type TwineInteraction = RepliableInteraction<CacheType>;

export default class ReplyManager<T extends TwineInteraction> {
    private readonly interaction: T;

    private repliedWith: ReplyType | null = null;

    private createMessageData(title: string, messageText: string, color: number) {
        return {
            embeds: [
                createBaseEmbed(this.interaction.guild ?? null, color)
                    .setTitle(title)
                    .setDescription(messageText),
            ],
            flags: MessageFlags.Ephemeral,
        };
    }

    private reply(title: string, messageText: string, color: number): Promise<InteractionResponse|Message> {
        if (this.interaction.deferred) {
            return this.interaction.editReply(this.createMessageData(title, messageText, color) as InteractionEditReplyOptions) as Promise<InteractionResponse|Message>;
        } else {
            return this.interaction.reply(this.createMessageData(title, messageText, color) as InteractionReplyOptions) as Promise<InteractionResponse|Message>;
        }
    }

    constructor(interaction: T) {
        this.interaction = interaction;
    }

    public edit(messageText: string, title?: string): Promise<InteractionResponse|Message> {
        let color = THEME_COLOR;

        switch (this.repliedWith) {
            case ReplyType.SUCCESS:
                title = "Success!";
                color = SUCCESS_COLOR;
                break;
            case ReplyType.ERROR:
                title = "Error!";
                color = ERROR_COLOR;
                break;
            default:
                if (!title) {
                    title = "Information";
                }
        }

        return this.interaction.editReply(this.createMessageData(title, messageText, color) as InteractionEditReplyOptions) as Promise<InteractionResponse|Message>;
    }

    public defer(ephemeral: boolean = true): Promise<InteractionResponse|Message> {
        if (ephemeral) {
            return this.interaction.deferReply({
                flags: MessageFlags.Ephemeral,
            }) as Promise<InteractionResponse|Message>;
        } else {
            return this.interaction.deferReply() as Promise<InteractionResponse|Message>;
        }
    }

    public success(messageText: string): Promise<InteractionResponse|Message> {
        this.repliedWith = ReplyType.SUCCESS;
        return this.reply("Success!", messageText, SUCCESS_COLOR);
    }

    public error(messageText: string): Promise<InteractionResponse|Message> {
        this.repliedWith = ReplyType.ERROR;
        return this.reply("Error", messageText, ERROR_COLOR);
    }

    public info(messageText: string, title?: string): Promise<InteractionResponse|Message> {
        if (!title) title = "Information";
        this.repliedWith = ReplyType.INFO;
        return this.reply(title, messageText, THEME_COLOR);
    }

    public t(type: ReplyType, locale: Locale, key: keyof Messages, ...args: unknown[]): Promise<InteractionResponse|Message> {
        return this[type](localeManager.t(locale, key, ...args));
    }

    public async tm(type: ReplyType, key: keyof Messages, ...args: unknown[]): Promise<InteractionResponse|Message> {
        return this[type](await localeManager.tm(this.interaction.member as GuildMember, key, ...args));
    }

}
