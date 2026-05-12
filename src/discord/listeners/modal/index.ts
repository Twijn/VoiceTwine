import {ModalSubmitInteraction} from "discord.js";

import InteractionListener from "../../../lib/interfaces/InteractionListener";
import InteractionHandler from "../../../lib/objects/InteractionHandler";

import PanelEdit from "./PanelEdit";
import MasterEdit from "./MasterEdit";

const listeners: InteractionListener<ModalSubmitInteraction>[] = [
    new PanelEdit(),
    new MasterEdit(),
];

export default new InteractionHandler<ModalSubmitInteraction>(listeners);
