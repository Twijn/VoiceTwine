import { ModalSubmitInteraction} from "discord.js";

import ReplyManager, { ReplyType } from "../../../lib/managers/ReplyManager";
import InteractionListener from "../../../lib/interfaces/InteractionListener";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";

export default class MasterEdit implements InteractionListener<ModalSubmitInteraction> {

    matches(interaction: ModalSubmitInteraction): boolean {
        return interaction.customId.startsWith("master-edit-");
    }

    async execute(interaction: ModalSubmitInteraction, replyManager: ReplyManager<ModalSubmitInteraction>): Promise<void> {
        const masterChannelId = interaction.customId.replace("master-edit-", "");
        let channel = TwineChannelManager.getChannel(masterChannelId);

        if (!channel) {
            await replyManager.tm(
                ReplyType.ERROR,
                "command.master-channel.edit.error.master-channel-missing",
                masterChannelId
            );
            return;
        }
        
        const name = interaction.fields.getTextInputValue("channel-name");
        const namingScheme = interaction.fields.getTextInputValue("naming-scheme");

        if (!name || name.length < 3 || name.length > 30) {
            await replyManager.error("Channel name must be between 3 and 30 characters long!");
            return;
        }

        if (!namingScheme || namingScheme.length < 3 || namingScheme.length > 100) {
            await replyManager.error("Naming scheme must be between 3 and 100 characters long!");
            return;
        }

        await channel.edit({
            name
        });
        await TwineChannelManager.updateChannel(channel.database.id, {
            namingScheme
        });

        await replyManager.tm(
            ReplyType.SUCCESS,
            "modal.master-channel.edit.success.message",
            channel.discord.name
        );
    }

}