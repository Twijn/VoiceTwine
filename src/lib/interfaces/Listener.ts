import {ClientEvents} from "discord.js";

export enum ListenerType {
    ON = "on",
    ONCE = "once",
}

export default interface Listener<K extends keyof ClientEvents> {
    type?: ListenerType;
    event: string;
    execute: (...args: ClientEvents[K]) => Promise<void>;
}
