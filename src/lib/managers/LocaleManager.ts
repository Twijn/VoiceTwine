import {Locale, LocalizationMap} from "discord-api-types/v10";
import * as fs from "fs/promises";
import * as path from "path";
import logger from "../../logger";
import {Guild, GuildMember} from "discord.js";
import {DiscordUser} from "../sequelize/models/discorduser.model";
import {DiscordGuild} from "../sequelize/models/discordguild.model";

export interface Messages {

    "branding": string;

    "button.claim.label": string;
    "button.claim.success": string;
    "button.claim.error.owner-in-channel": string;

    "command.locale.name": string;
    "command.locale.description": string;
    "command.locale.message": string;
    "command.locale.user-updated": string;
    "command.locale.guild-updated": string;
    "command.locale.error.no-permission": string;

    "command.master-channel.name": string;
    "command.master-channel.description": string;

    "command.master-channel.create.name": string;
    "command.master-channel.create.description": string;
    "command.master-channel.create.success": string;
    "command.master-channel.create.error.maybe-missing-permissions": string;

    "command.master-channel.edit.name": string;
    "command.master-channel.edit.description": string;
    "command.master-channel.edit.success.message": string;
    "command.master-channel.edit.success.channel-name-updated": string;
    "command.master-channel.edit.success.naming-scheme-updated": string;
    "command.master-channel.edit.error.no-changes-provided": string;
    "command.master-channel.edit.error.master-channel-missing": string;

    "command.master-channel.option.channel-name.name": string;
    "command.master-channel.option.channel-name.description": string;
    "command.master-channel.option.naming-scheme.name": string;
    "command.master-channel.option.naming-scheme.description": string;
    "command.master-channel.option.category.name": string;
    "command.master-channel.option.category.description": string;
    "command.master-channel.option.master-channel.name": string;
    "command.master-channel.option.master-channel.description": string;

    "command.voice.name": string;
    "command.voice.description": string;

    "command.voice.edit-channel.name": string;
    "command.voice.edit-channel.description": string;

    "command.voice.grant.name": string;
    "command.voice.grant.description": string;
    "command.voice.grant.success.title": string;
    "command.voice.grant.success.description": string;
    "command.voice.grant.error.public-channel": string;

    "command.voice.set-status.name": string;
    "command.voice.set-status.description": string;
    "command.voice.set-status.option.status.name": string;
    "command.voice.set-status.option.status.description": string;
    "command.voice.set-status.success": string;
    "command.voice.set-status.error.invalid-status": string;

    "command.voice.transfer-ownership.name": string;
    "command.voice.transfer-ownership.description": string;
    "command.voice.transfer-ownership.option.user.name": string;
    "command.voice.transfer-ownership.option.user.description": string;
    "command.voice.transfer-ownership.success": string;

    "command.ping.name": string;
    "command.ping.description": string;
    "command.ping.success.latency": string;
    "command.ping.success.round-trip-latency": string;

    "embed.claim.title": string;
    "embed.claim.description": string;
}

export type MessageKeys = keyof Messages;

export interface Language {
    id: string;
    name: string;
    author: string;
    messages: Messages;
}

class LocaleManager {
    private languages: Map<Locale, Language> = new Map<Locale, Language>();

    private memberLangCache: Map<string, Locale> = new Map<string, Locale>();
    private guildLangCache: Map<string, Locale> = new Map<string, Locale>();

    private recursiveProperty(data: Record<string, unknown>, propertyPath: string[] = []): Partial<Messages> {
        let result: Partial<Messages> = {};
        for (const key of Object.keys(data)) {
            if (typeof data[key] === "string") {
                // Construct an array with the current property path
                // and the current key to get the full.key.location
                result[
                    (
                        [
                            ...propertyPath,
                            key
                        ]
                    ).join(".") as MessageKeys
                ] = data[key] as string;
            } else if (typeof data[key] === "object") {
                result = {
                    ...result,
                    ...this.recursiveProperty(data[key] as Record<string, unknown>, [...propertyPath, key])
                };
            }
        }
        return result;
    }

    private loadLanguage(data: unknown, locale: Locale): Language {
        const languageData = data as Language & { messages: Record<string, unknown>};
        if (!languageData.id || !languageData.name || !languageData.author || !languageData.messages) {
            throw new Error(`Invalid language data for locale ${locale}!`);
        }
        languageData.messages = {
            ...languageData.messages,
            ...this.recursiveProperty(languageData.messages),
        }
        return languageData as Language;
    }

    public async updateLanguages(): Promise<void> {
        for (const locale of Object.values(Locale)) {
            try {
                const filePath = path.join(process.cwd(), "lang", `${locale}.json`);
                const fileContent = await fs.readFile(filePath, 'utf-8');
                this.languages.set(
                    locale,
                    this.loadLanguage(
                        JSON.parse(fileContent),
                        locale
                    )
                );
            } catch (error) {
                // Skip missing language files
            }
        }

        logger.info(`Loaded ${this.languages.size} language${this.languages.size === 1 ? "" : "s"}`);
    }

    public getLocales(): Locale[] {
        return Array.from(this.languages.keys());
    }

    public getLanguages(): Language[] {
        return Array.from(this.languages.values());
    }

    public t(locale: Locale, key: MessageKeys, ...params: unknown[]): string {
        const messages = this.languages.get(locale)?.messages;
        let value = messages?.[key];

        if (!value) {
            logger.warn(`Missing translation for key '${key}' in locale '${locale}'`);
            return key;
        }

        params.forEach((param, index) => {
            value = value.replace(`%${index}`, param.toString());
        });

        return value;
    }

    public async tg(guild: Guild, key: MessageKeys, ...params: unknown[]): Promise<string> {
        let locale: Locale = Locale.EnglishUS;
        if (this.guildLangCache.has(guild.id)) {
            locale = this.guildLangCache.get(guild.id)!;
        } else {
            const discordGuild = await DiscordGuild.findByPk(guild.id);
            if (discordGuild?.locale) {
                locale = discordGuild.locale;
            } else if (this.getLocales().includes(guild.preferredLocale)) {
                locale = guild.preferredLocale;
            }
        }
        return this.t(locale, key, ...params);
    }

    public async tm(member: GuildMember, key: MessageKeys, ...params: unknown[]): Promise<string> {
        let locale: Locale = Locale.EnglishUS;
        if (this.memberLangCache.has(member.id)) {
            locale = this.memberLangCache.get(member.id)!;
        } else {
            const discordUser = await DiscordUser.findByPk(member.id);
            if (discordUser?.locale) {
                locale = discordUser.locale;
            } else {
                return await this.tg(member.guild, key, ...params);
            }
        }
        return this.t(locale, key, ...params);
    }

    public tall(key: MessageKeys) {
        const map: LocalizationMap = {};
        for (const locale of this.getLocales()) {
            map[locale] = this.t(locale, key);
        }
        return map;
    }

    public setMemberLocale(memberId: string, locale: Locale): void {
        this.memberLangCache.set(memberId, locale);
    }

    public setGuildLocale(guildId: string, locale: Locale): void {
        this.guildLangCache.set(guildId, locale);
    }
}

export default new LocaleManager();
