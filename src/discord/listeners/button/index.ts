import {ButtonInteraction} from "discord.js";

import InteractionListener from "../../../lib/interfaces/InteractionListener";

import PanelEdit from "./PanelEdit";
import InteractionHandler from "../../../lib/objects/InteractionHandler";

const listeners: InteractionListener<ButtonInteraction>[] = [
    new PanelEdit(),
];

export default new InteractionHandler<ButtonInteraction>(listeners);

