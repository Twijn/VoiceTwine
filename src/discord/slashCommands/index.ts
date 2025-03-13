import TwineCommand from "./TwineCommand";

import PingCommand from "./PingCommand";

const slashCommands: TwineCommand[] = [
    new PingCommand(),
]

export default slashCommands;
