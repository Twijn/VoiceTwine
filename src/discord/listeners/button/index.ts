import {ButtonInteraction} from "discord.js";

import InteractionListener from "../../../lib/interfaces/InteractionListener";
import InteractionHandler from "../../../lib/objects/InteractionHandler";

import PanelStatusUpdate from "./PanelStatusUpdate";
import PanelUpdate from "./PanelUpdate";

const listeners: InteractionListener<ButtonInteraction>[] = [
    new PanelStatusUpdate(),
    new PanelUpdate(),
];

export default new InteractionHandler<ButtonInteraction>(listeners);

