import TwineCommand from "./TwineCommand";

import MasterChannelCommand from "./MasterChannelCommand";

import PingCommand from "./PingCommand";

const slashCommands: TwineCommand[] = [
    new MasterChannelCommand(),
    new PingCommand(),
]

export default slashCommands;
