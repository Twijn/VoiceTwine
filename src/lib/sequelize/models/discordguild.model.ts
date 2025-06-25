import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";

import sequelize from "../database";

import {DiscordUser} from "./discorduser.model";

export const getGuildIcon = (guild: DiscordGuild, size = 64): string => {
    if (guild.icon) {
        return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=${size}`;
    } else {
        return null;
    }
}

export const getGuildBanner = (guild: DiscordGuild, size = 64): string => {
    if (guild.banner) {
        return `https://cdn.discordapp.com/icons/${guild.id}/${guild.banner}.webp?size=${size}`;
    } else {
        return null;
    }
}

export class DiscordGuild extends Model<InferAttributes<DiscordGuild>, InferCreationAttributes<DiscordGuild>> {
    declare id: string;
    declare ownerId: string;
    declare name: string;
    declare nameAcronym: string;
    declare description: string;

    declare icon: string;
    declare banner: string;

    declare createdAt?: Date;
    declare updatedAt?: Date;

    getGuildIcon(size = 64): string {
        return getGuildIcon(this, size);
    }
}

DiscordGuild.init({
    id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    ownerId: {
        type: DataTypes.STRING(20),
        allowNull: false,
        references: {
            model: DiscordUser,
            key: "id",
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    nameAcronym: {
        type: DataTypes.STRING(5),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    icon: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    banner: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: "discord_guild",
    timestamps: true,
});
