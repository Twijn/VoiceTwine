import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    GuildMember,
    MessageFlags,
    PermissionsBitField,
    SlashCommandBuilder,
    StringSelectMenuBuilder
} from "discord.js";

import TwineCommand from "../../lib/interfaces/commands/TwineCommand";
import localeManager from "../../lib/managers/LocaleManager";
import {Locale} from "discord-api-types/v10";

function createActionRow(type: "User"|"Guild"): ActionRowBuilder<StringSelectMenuBuilder> {
    return new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(`${type.toLowerCase()}-locale`)
                .setPlaceholder(`${type} Locale`)
                .setMinValues(1)
                .setMaxValues(1)
                .setOptions(
                    localeManager.getLanguages().map(x => {
                        return { value: x.id, label: x.name };
                    })
                )
        );
}

export default class LocaleCommand implements TwineCommand {

    data = new SlashCommandBuilder()
        .setName(localeManager.t(Locale.EnglishUS, "command.locale.name"))
        .setNameLocalizations(localeManager.tall("command.locale.name"))
        .setDescription(localeManager.t(Locale.EnglishUS, "command.locale.description"))
        .setDescriptionLocalizations(localeManager.tall("command.locale.description"));

    async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        let components: ActionRowBuilder<StringSelectMenuBuilder>[] = [
            createActionRow("User"),
        ];

        const permissions = new PermissionsBitField(interaction.memberPermissions);
        if (permissions.has("ManageGuild")) {
            components.push(createActionRow("Guild"));
        }

        await interaction.reply({
            content: await localeManager.tm(interaction.member as GuildMember, "command.locale.message"),
            components,
            flags: MessageFlags.Ephemeral,
        });
    }

}
