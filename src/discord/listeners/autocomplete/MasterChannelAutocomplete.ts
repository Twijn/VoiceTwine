import {ApplicationCommandOptionChoiceData, AutocompleteInteraction, Events} from "discord.js";
import Listener, {ListenerType} from "../../../lib/interfaces/Listener";
import logger from "../../../logger";
import twineChannelManager from "../../../lib/managers/TwineChannelManager";
import {DiscordChannelType} from "../../../lib/sequelize/models/discordchannel.model";

export default class MasterChannelAutocomplete implements Listener<Events.InteractionCreate> {
    type = ListenerType.ON;

    event = Events.InteractionCreate;

    async execute(interaction: AutocompleteInteraction): Promise<void> {
        if (!interaction.isAutocomplete()) return;

        const focusedOption = interaction.options.getFocused(true);
        logger.info(focusedOption.name);
        if (focusedOption.name !== "master-channel") return;

        const matchingChannels = twineChannelManager.getChannels().filter(
            x =>
                x.discord.guildId === interaction.guildId &&
                x.type === DiscordChannelType.MASTER_CHANNEL &&
                x.name.toLowerCase().includes(focusedOption.value.toLowerCase())
        );

        let options: ApplicationCommandOptionChoiceData[] = matchingChannels.map(x => {
            return {
                name: `🔈 ${x.name}`,
                value: x.id,
            }
        });

        await interaction.respond(options);
    }

}
