import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";

import sequelize from "../database";

export const getUserAvatar = (user: DiscordUser, size = 64): string => {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp?size=${size}`;
    } else {
        return `https://cdn.discordapp.com/embed/avatars/${(BigInt(user.id) >> BigInt(22)) % BigInt(6)}.png`;
    }
}

export class DiscordUser extends Model<InferAttributes<DiscordUser>, InferCreationAttributes<DiscordUser>> {
    declare id: string;
    declare username: string;
    declare discriminator: string | null;
    declare global_name: string | null;
    declare avatar: string | null;

    declare createdAt?: Date;
    declare updatedAt?: Date;

    getUserAvatar(size = 64): string {
        return getUserAvatar(this, size);
    }
}

DiscordUser.init({
    id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(32),
        allowNull: false,
    },
    discriminator: {
        type: DataTypes.STRING(4),
        allowNull: true,
    },
    global_name: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize,
    tableName: "discord_user",
    timestamps: true,
});
