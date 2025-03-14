import Listener from "./Listener";

import ChannelDeleteListener from "./channel/ChannelDeleteListener";

import GuildCreateListener from "./guild/GuildCreateListener";
import GuildDeleteListener from "./guild/GuildDeleteListener";
import GuildUpdateListener from "./guild/GuildUpdateListener";

import VoiceListener from "./voice/VoiceListener";

import ReadyListener from "./ReadyListener";

const listeners: Listener<any>[] = [
    new ChannelDeleteListener(),

    new GuildCreateListener(),
    new GuildDeleteListener(),
    new GuildUpdateListener(),

    new VoiceListener(),

    new ReadyListener(),
]

export default listeners;
