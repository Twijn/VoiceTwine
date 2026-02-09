import TwineCommand from "../../lib/interfaces/commands/TwineCommand";

import MasterChannel from "./master-channel";
import Voice from "./voice";

import PingCommand from "./PingCommand";
import LocaleCommand from "./LocaleCommand";

const slashCommands: TwineCommand[] = [
    new MasterChannel(),
    new Voice(),

    new LocaleCommand(),
    new PingCommand(),
]

export default slashCommands;
