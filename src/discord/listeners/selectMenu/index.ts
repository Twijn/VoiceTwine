import {AnySelectMenuInteraction} from "discord.js";

import InteractionListener from "../../../lib/interfaces/InteractionListener";
import InteractionHandler from "../../../lib/objects/InteractionHandler";

import GrantMembers from "./GrantMembers";

const listeners: InteractionListener<AnySelectMenuInteraction>[] = [
    new GrantMembers(),
];

export default new InteractionHandler<AnySelectMenuInteraction>(listeners);
