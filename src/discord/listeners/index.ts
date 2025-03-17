import Listener from "../../lib/interfaces/Listener";

import ChannelDeleteListener from "./channel/ChannelDeleteListener";
import ChannelUpdateListener from "./channel/ChannelUpdateListener";

import GuildCreateListener from "./guild/GuildCreateListener";
import GuildDeleteListener from "./guild/GuildDeleteListener";
import GuildUpdateListener from "./guild/GuildUpdateListener";

import MessageDeleteListener from "./message/MessageDeleteListener";

import VoiceListener from "./voice/VoiceListener";

import ReadyListener from "./ReadyListener";

const listeners: Listener<any>[] = [
    new ChannelDeleteListener(),
    new ChannelUpdateListener(),

    new GuildCreateListener(),
    new GuildDeleteListener(),
    new GuildUpdateListener(),

    new MessageDeleteListener(),

    new VoiceListener(),

    new ReadyListener(),
]

export default listeners;
