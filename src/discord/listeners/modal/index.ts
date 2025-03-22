import {ModalSubmitInteraction} from "discord.js";

import InteractionListener from "../../../lib/interfaces/InteractionListener";
import InteractionHandler from "../../../lib/objects/InteractionHandler";

import PanelEdit from "./PanelEdit";

const listeners: InteractionListener<ModalSubmitInteraction>[] = [
    new PanelEdit(),
];

export default new InteractionHandler<ModalSubmitInteraction>(listeners);
