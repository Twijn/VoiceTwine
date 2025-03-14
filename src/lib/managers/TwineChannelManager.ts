import {
    CategoryChannel,
    ChannelType,
    Client,
    Collection,
    Guild, GuildMember,
    VoiceChannel
} from "discord.js";

import {DiscordChannel, DiscordChannelType} from "../sequelize/models/discordchannel.model";
import {DiscordUser} from "../sequelize/models/discorduser.model";

import logger from "../../logger";

import PanelManager from "./PanelManager";

import ManagedChannel from "../objects/ManagedChannel";

const DEFAULT_CATEGORY_NAME = "Voice-Twine Channels";
const DEFAULT_CHANNEL_NAME = "+ Create New Channel";

class TwineChannelManager {

    private channels = new Collection<string, ManagedChannel>();

    async loadChannels(client: Client) {
        const databaseChannels = await DiscordChannel.findAll();
        logger.info("Loading database channels...");
        for (const databaseChannel of databaseChannels) {
            try {
                const discordChannel = await client.channels.fetch(databaseChannel.id);
                if (discordChannel.isVoiceBased() || discordChannel instanceof CategoryChannel) {
                    this.channels.set(databaseChannel.id, new ManagedChannel(databaseChannel, discordChannel));
                }
            } catch(error) {
                logger.error(`Discord channel ${databaseChannel.id} no longer exists. Deleting from database!`);
                databaseChannel.destroy().catch(e => logger.error(e));
            }
        }
        logger.info(`Loaded ${this.channels.size} channels!`);
    }

    getChannel(id: string) {
        return this.channels.get(id);
    }

    async deleteChannel(id: string): Promise<ManagedChannel|null> {
        const channel = this.channels.get(id);
        if (channel) {
            if (channel.database.type === DiscordChannelType.MASTER_CHANNEL) {
                const otherChannels = this.channels.filter(
                    x => x.database.masterChannelId === channel.database.id
                );
                for (const channel of otherChannels.values()) {
                    if (channel.discord instanceof CategoryChannel &&
                        channel.discord.children.cache.size > 0) continue;

                    if (channel.discord.deletable) {
                        await channel.delete().catch(e => logger.error(e));
                    }
                }
            }

            await channel.delete();
        }
        this.channels.delete(id);
        return channel;
    }

    async createMaster(guild: Guild, channelName?: string|null, discordCategory?: CategoryChannel|null) {
        if (!channelName) channelName = DEFAULT_CHANNEL_NAME;

        if (!discordCategory) {
            try {
                discordCategory = await guild.channels.create({
                    name: DEFAULT_CATEGORY_NAME, type: ChannelType.GuildCategory
                });
            } catch (error) {
                logger.error(error);
                throw "Error creating master category channel! Please make sure I have permission to manage channels!";
            }
        }

        let discordChannel: VoiceChannel;
        try {
            discordChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildVoice,
                parent: discordCategory,
            });
        } catch(error) {
            logger.error(error);
            throw "Error creating master voice channel! Please make sure I have permission to manage channels. (Check the category permissions too!)";
        }

        try {
            const dbChannel = await DiscordChannel.create({
                id: discordChannel.id,
                type: DiscordChannelType.MASTER_CHANNEL,
                guildId: guild.id,
                ownerId: null,
            });

            const dbCategory = await DiscordChannel.create({
                id: discordCategory.id,
                type: DiscordChannelType.MASTER_CATEGORY,
                masterChannelId: dbChannel.id,
                guildId: guild.id,
                ownerId: null,
            });

            const category = new ManagedChannel(dbCategory, discordCategory);
            const channel = new ManagedChannel(dbChannel, discordChannel);

            this.channels.set(category.database.id, category);
            this.channels.set(channel.database.id, channel);

            return {
                category, channel
            };
        } catch (error) {
            logger.error(error);
            throw "An unexpected error occurred!";
        }
    }

    async createChild(masterChannel: ManagedChannel, member: GuildMember) {
        const guild = masterChannel.discord.guild;

        // Ensure the user has been added to the database
        await DiscordUser.upsert(member.user);

        const discordChannel = await guild.channels.create({
            name: `${member.displayName}'s Channel`.substring(0, 30),
            type: ChannelType.GuildVoice,
            parent: masterChannel.discord.parent,
        });

        const databaseChannel = await DiscordChannel.create({
            id: discordChannel.id,
            type: DiscordChannelType.CHILD_CHANNEL,
            masterChannelId: masterChannel.discord.id,
            guildId: guild.id,
            ownerId: member.id,
        });

        const combinedChannel = new ManagedChannel(databaseChannel, discordChannel);

        discordChannel.send({
            ...PanelManager.constructPanel(combinedChannel),
            content: `<@${member.id}>`,
        });

        this.channels.set(databaseChannel.id, combinedChannel);

        logger.info(`Create new child channel '${discordChannel.name}' in '${guild.name}'`);

        return combinedChannel;
    }

}

export default new TwineChannelManager();
