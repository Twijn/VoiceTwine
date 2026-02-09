import {AnySelectMenuInteraction, GuildMember, MessageFlags, PermissionsBitField} from "discord.js";
import {Locale} from "discord-api-types/v10";

import InteractionListener from "../../../lib/interfaces/InteractionListener";
import {DiscordUser} from "../../../lib/sequelize/models/discorduser.model";
import {DiscordGuild} from "../../../lib/sequelize/models/discordguild.model";
import localeManager from "../../../lib/managers/LocaleManager";

export default class LocaleSelectMenu implements InteractionListener<AnySelectMenuInteraction> {

    matches(interaction: AnySelectMenuInteraction): boolean {
        return interaction.customId === "user-locale" || interaction.customId === "guild-locale";
    }

    async execute(interaction: AnySelectMenuInteraction): Promise<void> {
        const locale = interaction.values[0] as Locale;
        const member = interaction.member as GuildMember;

        if (interaction.customId === "user-locale") {
            await DiscordUser.upsert({
                ...member.user,
                locale,
            });
            localeManager.setMemberLocale(member.id, locale);

            await interaction.reply({
                content: localeManager.t(locale, "command.locale.user-updated", locale),
                flags: MessageFlags.Ephemeral,
            });
        } else if (interaction.customId === "guild-locale") {
            const permissions = new PermissionsBitField(interaction.memberPermissions);
            if (!permissions.has("ManageGuild")) {
                await interaction.reply({
                    content: await localeManager.tm(member, "command.locale.error.no-permission"),
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            await DiscordGuild.update({locale}, {
                where: {id: interaction.guildId},
            });
            localeManager.setGuildLocale(interaction.guildId!, locale);

            await interaction.reply({
                content: localeManager.t(locale, "command.locale.guild-updated", locale),
                flags: MessageFlags.Ephemeral,
            });
        }
    }
}
