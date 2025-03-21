import TwineCommand from "../../lib/interfaces/commands/TwineCommand";

import MasterChannelCommand from "./master-channel/MasterChannelCommand";

import PingCommand from "./PingCommand";

const slashCommands: TwineCommand[] = [
    new MasterChannelCommand(),
    new PingCommand(),
]

export default slashCommands;
