import {
    ActionRowBuilder,
    ButtonBuilder,
    cleanCodeBlockContent,
    codeBlock,
    ButtonStyle,
    MessageCreateOptions
} from "discord.js";

import {createBaseEmbed} from "./ReplyManager";

import ManagedChannel from "../objects/ManagedChannel";

const BLANK_FIELD =
        {
            name: " ",
            value: " ",
            inline: true,
        };

class PanelManager {

    constructPanel(channel: ManagedChannel): MessageCreateOptions {
        if (!channel.discord.isVoiceBased()) {
            throw "Channel must be voice based!";
        }

        const embeds = [
            createBaseEmbed()
                .setAuthor({name: `Panel • 🔊 ${channel.discord.name}`})
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
                        name: "🎵 Bitrate",
                        value: codeBlock(cleanCodeBlockContent(`${Math.floor(channel.discord.bitrate / 1000)} kbps`)),
                        inline: true,
                    },
                    {
                        name: "📺 Video Quality",
                        value: codeBlock(cleanCodeBlockContent(`${channel.discord.videoQualityMode ?? "Auto"}`)),
                        inline: true,
                    },
                    BLANK_FIELD,
                ]),
        ];

        const editChannel = new ButtonBuilder()
            .setCustomId("edit")
            .setLabel("Edit Channel")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("✏️");

        const firstButtonRow = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(editChannel);

        return {
            embeds,
            components: [
                firstButtonRow,
            ],
        };
    }

}

export default new PanelManager();
