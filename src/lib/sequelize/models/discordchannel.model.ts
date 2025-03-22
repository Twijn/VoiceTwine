import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";

import sequelize from "../database";

import {DiscordGuild} from "./discordguild.model";
import {DiscordUser} from "./discorduser.model";

export enum DiscordChannelType {
    MASTER_CATEGORY = "master_category",
    MASTER_CHANNEL = "master_channel",
    CHILD_CHANNEL = "child_channel",
}

export enum DiscordChannelStatus {
    PUBLIC = "public",
    PRIVATE = "private",
    HIDDEN = "hidden",
}

export class DiscordChannel extends Model<InferAttributes<DiscordChannel>, InferCreationAttributes<DiscordChannel>> {
    declare id: string;
    declare type: DiscordChannelType;
    declare status: DiscordChannelStatus;
    declare members: string;
    declare masterChannelId: string;
    declare guildId: string;
    declare ownerId: string;

    declare createdAt?: Date;
    declare updatedAt?: Date;
}

DiscordChannel.init({
    id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM,
        values: Object.values(DiscordChannelType),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM,
        values: Object.values(DiscordChannelStatus),
        defaultValue: DiscordChannelStatus.PUBLIC,
        allowNull: false,
    },
    members: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    masterChannelId: {
        type: DataTypes.STRING(20),
        references: {
            model: DiscordChannel,
            key: "id",
        },
        onDelete: "CASCADE",
        allowNull: true,
    },
    guildId: {
        type: DataTypes.STRING(20),
        references: {
            model: DiscordGuild,
            key: "id",
        },
        onDelete: "CASCADE",
        allowNull: false,
    },
    ownerId: {
        type: DataTypes.STRING(20),
        references: {
            model: DiscordUser,
            key: "id",
        },
        allowNull: true,
    }
}, {
    sequelize,
    tableName: "discord_channel",
    timestamps: true,
});
