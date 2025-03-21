import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {GuildMember, ModalSubmitInteraction, VideoQualityMode} from "discord.js";
import ReplyManager from "../../../lib/managers/ReplyManager";
import logger from "../../../logger";
import ManagedChannel from "../../../lib/objects/ManagedChannel";
import {getChannelFromPanelOrMember} from "../../../lib/utils";

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

        if (isNaN(bitrate) || bitrate < 8000 || bitrate > 96000) {
            await replyManager.error("Bitrate must be a number between 8 and 96 kbps!").catch(e => logger.error(e));
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