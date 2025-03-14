import {
    CategoryChannel,
    ChannelType,
    Client,
    Collection,
    Guild, GuildMember,
    User,
    VoiceBasedChannel,
    VoiceChannel
} from "discord.js";
import logger from "../logger";
import {DiscordChannel, DiscordChannelType} from "./sequelize/models/discordchannel.model";
import {DiscordUser} from "./sequelize/models/discorduser.model";

const DEFAULT_CATEGORY_NAME = "Voice-Twine Channels";
const DEFAULT_CHANNEL_NAME = "+ Create New Channel";

interface CombinedChannel {
    database: DiscordChannel;
    discord: VoiceBasedChannel|CategoryChannel;
}

class TwineChannelManager {

    private channels = new Collection<string, CombinedChannel>();

    async loadChannels(client: Client) {
        const databaseChannels = await DiscordChannel.findAll();
        logger.info("Loading database channels...");
        for (const databaseChannel of databaseChannels) {
            try {
                const discordChannel = await client.channels.fetch(databaseChannel.id);
                if (discordChannel.isVoiceBased() || discordChannel instanceof CategoryChannel) {
                    this.channels.set(databaseChannel.id, {
                        discord: discordChannel,
                        database: databaseChannel,
                    });
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

    async deleteChannel(id: string): Promise<CombinedChannel|null> {
        const channel = this.channels.get(id);
        if (channel) {
            if (channel.database.type === DiscordChannelType.MASTER_CHANNEL) {
                const otherChannels = this.channels.filter(
                    x => x.database.masterChannelId === channel.database.id
                );
                otherChannels.forEach(channel => {
                    if (channel.discord instanceof CategoryChannel &&
                        channel.discord.children.cache.size > 0) return;

                    if (channel.discord.deletable) {
                        this.deleteChannel(channel.database.id).catch(e => logger.error(e));
                    }
                });
            }

            await channel.database.destroy();
            if (channel.discord.deletable) {
                channel.discord.delete().catch(e => logger.error(e));
            }
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

            const category: CombinedChannel = {
                discord: discordCategory,
                database: dbCategory,
            };

            const channel: CombinedChannel = {
                discord: discordChannel,
                database: dbChannel,
            }

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

    async createChild(masterChannel: CombinedChannel, member: GuildMember) {
        const guild = masterChannel.discord.guild;
        const [discordUser] = await DiscordUser.upsert(member.user);

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

        const combinedChannel: CombinedChannel = {
            discord: discordChannel,
            database: databaseChannel,
        }

        this.channels.set(databaseChannel.id, combinedChannel);

        return combinedChannel;
    }

}

export default new TwineChannelManager();
