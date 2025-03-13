import Listener from "./Listener";

import GuildCreateListener from "./guild/GuildCreateListener";
import GuildDeleteListener from "./guild/GuildDeleteListener";
import GuildUpdateListener from "./guild/GuildUpdateListener";

import ReadyListener from "./ReadyListener";

const listeners: Listener<any>[] = [
    new GuildCreateListener(),
    new GuildDeleteListener(),
    new GuildUpdateListener(),

    new ReadyListener(),
]

export default listeners;
