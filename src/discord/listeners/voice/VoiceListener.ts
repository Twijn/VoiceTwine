import {Events, GuildMember, VoiceState} from "discord.js";

import Listener from "../../../lib/interfaces/Listener";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import {DiscordChannelType} from "../../../lib/sequelize/models/discordchannel.model";
import logger from "../../../logger";
import {createBaseEmbed, ERROR_COLOR} from "../../../lib/managers/ReplyManager";
import ManagedChannel from "../../../lib/objects/ManagedChannel";

const ACTIVITY_TRACKING_TIME = 60 * 1000; // 60 seconds
const ACTIVITY_LIMIT = 3;

interface CreateActivity {
    userId: string;
    timestamp: number;
}

let createActivity: CreateActivity[] = [];

setInterval(() => {
    createActivity = createActivity.filter(x => Date.now() < x.timestamp + ACTIVITY_TRACKING_TIME);
}, 1000);

const createChildChannel = async (masterChannel: ManagedChannel, voiceState: VoiceState) => {
    const childChannel = await TwineChannelManager.createChild(masterChannel, voiceState.member);

    await voiceState.setChannel(childChannel.discord.id).catch(() => {
        logger.info(`Deleting channel ${childChannel.name} as we couldn't move the creator to the channel.`)
        childChannel.delete();
    });

    createActivity.push({
        userId: voiceState.member.id,
        timestamp: Date.now(),
    });
}

const sendJoinLimitMessage = async (member: GuildMember) => {
    logger.info(`Member ${member.user.username} (${member.id}) reached join limit`);
    await member.send({
        embeds: [
            createBaseEmbed(member.guild, ERROR_COLOR)
                .setTitle("Rate Limit Reached")
                .setDescription("Please join master VoiceTwine channels a little bit slower!\n\n**Continuously abusing this limit might result in a ban from using VoiceTwine or guild punishments.**")
        ],
    }).catch(() => {});
}

export default class VoiceListener implements Listener<Events.VoiceStateUpdate> {

    event = Events.VoiceStateUpdate;

    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const newChannel = TwineChannelManager.getChannel(newState.channelId);

        if (newChannel) {
            if (newChannel.database.type === DiscordChannelType.MASTER_CHANNEL) {
                if (createActivity.filter(x => x.userId === newState.member.id).length < ACTIVITY_LIMIT) {
                    createChildChannel(newChannel, newState).catch(e => logger.error(e));
                } else {
                    sendJoinLimitMessage(newState.member).catch(e => logger.error(e));
                    newState.disconnect("Rate limit reached").catch(() => {});
                }
            } else if (newChannel.type === DiscordChannelType.CHILD_CHANNEL &&
                newChannel.database.ownerId === newState.member.id) {
                newChannel.updatePanels().catch(e => logger.error(e));
            }
        }

        const oldChannel = TwineChannelManager.getChannel(oldState.channelId);

        if (oldChannel && oldChannel.database.type === DiscordChannelType.CHILD_CHANNEL) {
            if (oldChannel.discord.members.size === 0) {
                await TwineChannelManager.deleteChannel(oldChannel.database.id);
            } else if (!oldChannel.ownerPresent) {
                oldChannel.updatePanels().catch(e => logger.error(e));
            }
        }
    }

}
