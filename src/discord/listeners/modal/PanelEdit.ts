import {GuildMember, ModalSubmitInteraction, VideoQualityMode} from "discord.js";

import logger from "../../../logger";
import {getChannelFromPanelOrMember, getMaxBitrate} from "../../../lib/utils";

import ReplyManager from "../../../lib/managers/ReplyManager";
import InteractionListener from "../../../lib/interfaces/InteractionListener";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

export default class PanelEdit implements InteractionListener<ModalSubmitInteraction> {

    matches(interaction: ModalSubmitInteraction): boolean {
        return interaction.customId === "edit";
    }

    async execute(interaction: ModalSubmitInteraction, replyManager: ReplyManager<ModalSubmitInteraction>): Promise<void> {
        let channel: ManagedChannel;

        try {
            channel = getChannelFromPanelOrMember(interaction?.message?.id, <GuildMember>interaction.member, interaction.user.id);
        } catch (e) {
            await replyManager.error(e.message);
            return;
        }

        const name = interaction.fields.getTextInputValue("name");
        const userLimit = Number(interaction.fields.getTextInputValue("user-limit"));
        const bitrate = Math.floor(Number(interaction.fields.getTextInputValue("bitrate")))*1000;
        let videoQuality = interaction.fields.getTextInputValue("video-quality") ?? "";

        if (!name || name.length < 2 || name.length > 30) {
            await replyManager.error("Name must be between 2 and 30 characters long!").catch(e => logger.error(e));
            return;
        }

        if (isNaN(userLimit) || userLimit < 0 || userLimit > 99) {
            await replyManager.error("User limit must be a number between 0 and 99!").catch(e => logger.error(e));
            return;
        }

        const maxBitrate = getMaxBitrate(channel.discord.guild.premiumTier) * 1000;
        if (isNaN(bitrate) || bitrate < 8000 || bitrate > maxBitrate) {
            await replyManager.error(`Bitrate must be a number between 8 and ${maxBitrate/1000} kbps for your server's boost level (Level ${channel.discord.guild.premiumTier})!`).catch(e => logger.error(e));
            return;
        }

        let videoQualityMode: VideoQualityMode;
        if (videoQuality.toLowerCase() === "auto") {
            videoQualityMode = VideoQualityMode.Auto;
        } else if (["full","720p"].includes(videoQuality.toLowerCase())) {
            videoQualityMode = VideoQualityMode.Full;
        } else {
            await replyManager.error("Video quality must be either 'auto' or '720p'!").catch(e => logger.error(e));
            return;
        }

        await channel.edit({
            name,
            userLimit,
            bitrate,
            videoQualityMode,
        });

        await replyManager.success(`Updated channel ${channel.url}!`).catch(e => logger.error(e));
    }

}