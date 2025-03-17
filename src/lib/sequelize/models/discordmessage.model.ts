import {DataTypes, InferAttributes, InferCreationAttributes, Model} from "sequelize";

import sequelize from "../database";

import {DiscordChannel} from "./discordchannel.model";

export class DiscordMessage extends Model<InferAttributes<DiscordMessage>, InferCreationAttributes<DiscordMessage>> {
    declare id: string;
    declare channelId: string;
    declare panelChannelId: string;
}

DiscordMessage.init({
    id: {
        type: DataTypes.STRING(20),
        primaryKey: true,
    },
    channelId: {
        type: DataTypes.STRING(20),
        allowNull: false,
    },
    panelChannelId: {
        type: DataTypes.STRING(20),
        references: {
            model: DiscordChannel,
            key: "id",
        },
        onDelete: "CASCADE",
        allowNull: true,
    },
}, {
    sequelize,
    tableName: "discord_message",
    timestamps: true,
});
