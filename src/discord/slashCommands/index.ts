import TwineCommand from "../../lib/interfaces/commands/TwineCommand";

import MasterChannel from "./master-channel";
import Voice from "./voice";

import PingCommand from "./PingCommand";

const slashCommands: TwineCommand[] = [
    new MasterChannel(),
    new Voice(),

    new PingCommand(),
]

export default slashCommands;
