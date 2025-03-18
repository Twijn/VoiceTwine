import {EmbedBuilder, Guild, InteractionCallbackResponse, InteractionResponse, Message, MessageFlags} from "discord.js";

export const SUCCESS_COLOR = 0x32a852;
export const ERROR_COLOR = 0xab4b3c;
export const THEME_COLOR = 0x819ec9;

enum ReplyType {
    INFO,
    SUCCESS,
    ERROR,
}

export function createBaseEmbed(guild: Guild = null, color: number = THEME_COLOR) {
    const iconURL = guild?.iconURL() ?? "https://cdn.twijn.net/voicetwine/images/icon/1-64x64.png";
    return new EmbedBuilder()
        .setColor(color)
        .setFooter({
            iconURL: iconURL,
            text: `${guild?.name ? `${guild.name} • ` : ''}VoiceTwine`,
        });
}

export type TwineInteraction = {
    reply: (message: any) => Promise<Message>;
    editReply: (message: any) => Promise<InteractionResponse|Message>;
    deferred: boolean;
    deferReply: (options?: any) => Promise<InteractionCallbackResponse>;
    guild: Guild;
}

export default class ReplyManager<T extends TwineInteraction> {
    private readonly interaction: T;

    private repliedWith: ReplyType = null;

    private createMessageData(title: string, messageText: string, color: number) {
        return {
            embeds: [
                createBaseEmbed(this.interaction.guild, color)
                    .setTitle(title)
                    .setDescription(messageText),
            ],
            flags: MessageFlags.Ephemeral,
        };
    }

    private reply(title: string, messageText: string, color: number): Promise<InteractionResponse|Message> {
        return this.interaction[this.interaction.deferred ? "editReply" : "reply"](this.createMessageData(title, messageText, color));
    }

    constructor(interaction: T) {
        this.interaction = interaction;
    }

    defer() {
        return this.interaction.deferReply();
    }

    edit(messageText: string, title?: string): Promise<InteractionResponse|Message> {
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

        return this.interaction.editReply(this.createMessageData(title, messageText, color));
    }

    success(messageText: string): Promise<InteractionResponse|Message> {
        this.repliedWith = ReplyType.SUCCESS;
        return this.reply("Success!", messageText, SUCCESS_COLOR);
    }

    error(messageText: string): Promise<InteractionResponse|Message> {
        this.repliedWith = ReplyType.ERROR;
        return this.reply("Error", messageText, ERROR_COLOR);
    }

    info(messageText: string, title?: string): Promise<InteractionResponse|Message> {
        if (!title) title = "Information";
        this.repliedWith = ReplyType.INFO;
        return this.reply(title, messageText, THEME_COLOR);
    }

}
