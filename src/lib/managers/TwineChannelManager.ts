import {
    CategoryChannel,
    ChannelType,
    Client,
    Collection,
    Guild,
    GuildMember,
    OverwriteResolvable,
    PermissionOverwrites,
    VoiceChannel
} from "discord.js";

import {DiscordChannel, DiscordChannelType} from "../sequelize/models/discordchannel.model";
import {DiscordUser} from "../sequelize/models/discorduser.model";

import logger from "../../logger";

import PanelManager from "./PanelManager";

import ManagedChannel, {ownerOverwrites} from "../objects/ManagedChannel";
import {DiscordGuild} from "../sequelize/models/discordguild.model";
import { formatChannelName } from "../utils/channelNaming";

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
                logger.debug(error);
                logger.error(`Discord channel ${databaseChannel.id} no longer exists. Deleting from database!`);
                databaseChannel.destroy().catch(e => logger.error(e));
            }
        }

        const childChannels = this.channels.filter(x => x.type === DiscordChannelType.CHILD_CHANNEL);
        for (const [,child] of childChannels) {
            if (child.discord.members.size === 0) {
                child.delete().then(() => {
                    logger.debug(`Deleted child channel '${child.discord.name}' from '${child.discord.guild.name}' due to inactivity`);
                }, e => logger.error(e));
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

    async createMaster(guild: Guild, channelName?: string|null, discordCategory?: CategoryChannel|null, namingScheme?: string|null) {
        if (!channelName) channelName = DEFAULT_CHANNEL_NAME;

        // upsert the owner user & Guild in case it doesn't exist.
        await DiscordUser.upsert((await guild.fetchOwner()).user);
        await DiscordGuild.upsert(guild);

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
                namingScheme: namingScheme || null,
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
        const start = Date.now();
        const guild = masterChannel.discord.guild;

        // Ensure the user has been added to the database
        await DiscordUser.upsert(member.user);

        // Get the bitrate and video quality from the master channel if it's a voice channel
        const bitrate = masterChannel.discord.isVoiceBased() ? masterChannel.discord.bitrate : undefined;
        const videoQualityMode = masterChannel.discord.isVoiceBased() ? masterChannel.discord.videoQualityMode : undefined;

        // Get formatted channel name using our utility function
        const channelName = await formatChannelName(masterChannel, member);

        // Get the parent category
        const parentCategory = masterChannel.discord.parent;

        // Create permission overwrites array with owner permissions
        const permissionOverwrites: OverwriteResolvable[] = [
            {
                id: member.id,
                allow: ownerOverwrites,
            }
        ];

        // If parent category exists, sync its permission overwrites
        if (parentCategory) {
            // Get all permission overwrites from the category
            parentCategory.permissionOverwrites.cache.forEach((overwrite: PermissionOverwrites) => {
                // Skip if this is the owner (we already added them with special permissions)
                if (overwrite.id === member.id) return;

                // Add this permission overwrite to our array
                permissionOverwrites.push({
                    id: overwrite.id,
                    allow: overwrite.allow,
                    deny: overwrite.deny
                });
            });

            logger.info(`Synced ${permissionOverwrites.length - 1} permission overwrites from category '${parentCategory.name}'`);
        }

        const discordChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: parentCategory,
            bitrate: bitrate, // Set the bitrate to match the master channel
            videoQualityMode: videoQualityMode, // Set the video quality to match the master channel
            permissionOverwrites: permissionOverwrites,
        });

        const databaseChannel = await DiscordChannel.create({
            id: discordChannel.id,
            type: DiscordChannelType.CHILD_CHANNEL,
            masterChannelId: masterChannel.discord.id,
            guildId: guild.id,
            ownerId: member.id,
        });

        const combinedChannel = new ManagedChannel(databaseChannel, discordChannel);

        PanelManager.constructPanel(combinedChannel).catch(e => logger.error(e));

        this.channels.set(databaseChannel.id, combinedChannel);

        logger.info(`Create new child channel '${discordChannel.name}' in '${guild.name}' (Took ${Date.now() - start} ms)`);

        return combinedChannel;
    }

}

export default new TwineChannelManager();
