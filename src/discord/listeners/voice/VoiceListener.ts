import {Events, VoiceState} from "discord.js";

import Listener from "../../../lib/interfaces/Listener";
import TwineChannelManager from "../../../lib/managers/TwineChannelManager";
import {DiscordChannelType} from "../../../lib/sequelize/models/discordchannel.model";
import logger from "../../../logger";
import {createBaseEmbed, ERROR_COLOR} from "../../../lib/managers/ReplyManager";

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

export default class VoiceListener implements Listener<Events.VoiceStateUpdate> {

    event = Events.VoiceStateUpdate;

    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const newChannel = TwineChannelManager.getChannel(newState.channelId);

        if (newChannel && newChannel.database.type === DiscordChannelType.MASTER_CHANNEL) {
            if (createActivity.filter(x => x.userId === newState.member.id).length < ACTIVITY_LIMIT) {
                const childChannel = await TwineChannelManager.createChild(newChannel, newState.member);

                await newState.setChannel(childChannel.discord.id).catch(() => {
                    logger.info(`Deleting channel ${childChannel.name} as we couldn't move the creator to the channel.`)
                    childChannel.delete();
                });

                createActivity.push({
                    userId: newState.member.id,
                    timestamp: Date.now(),
                });
            } else {
                logger.info(`Member ${newState.member.id} reached join limit`);
                await newState.member.send({
                    embeds: [
                        createBaseEmbed(newState.guild, ERROR_COLOR)
                            .setTitle("Rate Limit Reached")
                            .setDescription("Please join master VoiceTwine channels a little bit slower!\n\n**Continuously abusing this limit might result in a ban from using VoiceTwine or guild punishments.**")
                    ],
                }).catch(() => {});
                await newState.disconnect("Rate limit reached").catch(() => {});
            }
        }

        const oldChannel = TwineChannelManager.getChannel(oldState.channelId);

        if (oldChannel && oldChannel.database.type === DiscordChannelType.CHILD_CHANNEL &&
            oldChannel.discord.members.size === 0) {
            await TwineChannelManager.deleteChannel(oldChannel.database.id);
        }
    }

}
