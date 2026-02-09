import {AnySelectMenuInteraction} from "discord.js";

import InteractionListener from "../../../lib/interfaces/InteractionListener";
import InteractionHandler from "../../../lib/objects/InteractionHandler";

import GrantMembers from "./GrantMembers";
import LocaleSelectMenu from "./LocaleSelectMenu";

const listeners: InteractionListener<AnySelectMenuInteraction>[] = [
    new GrantMembers(),
    new LocaleSelectMenu(),
];

export default new InteractionHandler<AnySelectMenuInteraction>(listeners);
