import {EmbedBuilder, Guild, InteractionCallbackResponse, Message, MessageFlags} from "discord.js";

const SUCCESS_COLOR = 0x32a852;
const ERROR_COLOR = 0xab4b3c;
const THEME_COLOR = 0x819ec9;

enum ReplyType {
    INFO,
    SUCCESS,
    ERROR,
}

export default class ReplyManager<T extends {reply: (message: any) => Promise<Message>, editReply: (message: any) => Promise<Message>, deferred: boolean, deferReply: (options?: any) => Promise<InteractionCallbackResponse>, guild: Guild}> {
    private interaction: T;

    private repliedWith: ReplyType = null;

    private createMessageData(title: string, messageText: string, color: number) {
        return {
            embeds: [
                new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(messageText)
                    .setColor(color)
                    .setFooter({
                        iconURL: this.interaction.guild.iconURL(),
                        text: `${this.interaction.guild.name} • VoiceTwine`,
                    }),
            ],
            flags: MessageFlags.Ephemeral,
        };
    }

    private reply(title: string, messageText: string, color: number): Promise<Message> {
        return this.interaction[this.interaction.deferred ? "editReply" : "reply"](this.createMessageData(title, messageText, color));
    }

    constructor(interaction: T) {
        this.interaction = interaction;
    }

    defer() {
        return this.interaction.deferReply();
    }

    edit(messageText: string, title?: string): Promise<Message> {
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

    success(messageText: string): Promise<Message> {
        this.repliedWith = ReplyType.SUCCESS;
        return this.reply("Success!", messageText, SUCCESS_COLOR);
    }

    error(messageText: string): Promise<Message> {
        this.repliedWith = ReplyType.ERROR;
        return this.reply("Error", messageText, ERROR_COLOR);
    }

    info(messageText: string, title?: string): Promise<Message> {
        if (!title) title = "Information";
        this.repliedWith = ReplyType.INFO;
        return this.reply(title, messageText, THEME_COLOR);
    }

}
