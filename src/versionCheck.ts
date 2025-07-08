import logger from "./logger";

import { version } from "./lib/utils";

interface GitHubRelease {
    tag_name?: string;
}

const owner = process.env.GH_OWNER ?? "Twijn";
const repo = process.env.GH_REPO ?? "VoiceTwine";

const url = `https://api.github.com/repos/${owner}/${repo}/releases/latest`;

(async function() {
    logger.info("Checking for updates...");
    const data = await fetch(url);

    if (data.ok) {
        const json: GitHubRelease = await data.json();

        let remoteVersion = json?.tag_name;

        if (remoteVersion) {
            remoteVersion = remoteVersion.replace(/^v/, "");

            if (version === remoteVersion) {
                logger.info(`You are on the latest version! (v${version})`);
            } else {
                logger.warn(`An update is available! (v${version} -> v${remoteVersion})`);
                logger.warn(`Visit https://github.com/${owner}/${repo}?tab=readme-ov-file#updating for update instructions.`);
            }
        } else {
            logger.debug(data);
            logger.warn("Failed to check for updates: Invalid response");
        }
    } else {
        logger.warn("Failed to check for updates: ", data.statusText);
    }
})().catch(e => logger.error("Failed to check for updates: ", e));
