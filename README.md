# VoiceTwine
Create simple, dynamic voice channels to remove clutter from your Discord server!
## Navigation

- [Installation](#installation)
    - [Manual Installation](#manual-installation)
    - [Pterodactyl Installation](#pterodactyl-installation)
- [Updating](#updating)
    - [Manual Installation](#manual-installation-updating)
    - [Pterodactyl Installation](#pterodactyl-installation-updating)

## Installation
### Manual Installation
> Installation of VoiceTwine requires a basic understanding of server administration
> & Unix commands.

NodeJS and NPM are required to run VoiceTwine. Install the latest on
the [NodeJS website](https://nodejs.org/en/download).
A recent MariaDB installation is also required, with a dedicated username, password,
and database set up for VoiceTwine.

Download a VoiceTwine release from [GitHub](https://github.com/Twijn/VoiceTwine/releases)
or clone the git repository using the following command:

```bash
git clone https://github.com/Twijn/VoiceTwine.git
```

Copy the `.example.env` file to `.env`

```bash
cp .example.env .env
```

Edit the `.env` file with your favorite file editing tool

```bash
nano .env
```

Update the MariaDB credentials to point to a user created on your Maria installation,
and fill out the discord client ID, secret, and token below.

```dotenv
# Environment Settings
NODE_ENV=production
LOG_LEVEL=info

# MariaDB Settings       # v CHANGE THESE AS NEEDED v
MARIADB_HOST=127.0.0.1
MARIADB_PORT=3306
MARIADB_USER=twine
MARIADB_PASS=Password
MARIADB_DB=voicetwine

# Discord Settings       # v CHANGE THESE AS NEEDED v
DISCORD_CLIENT_ID=discord_client_id
DISCORD_CLIENT_SECRET=discord_client_secret
DISCORD_TOKEN=discord_token
```

Install VoiceTwine dependencies with NPM
```bash
npm ci
```

Build VoiceTwine
```bash
npm run build
```

Create and seed the database
```bash
npm run migrate
```

Start VoiceTwine
```bash
npm start
```

Now you're (effectively) done!

It's recommended to use [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) or systemd to start and restart the application, as shown below:

Creating & opening service file: 
```bash
nano /etc/systemd/system/voicetwine.service
```
Copy & paste service details:
```text
[Unit]
Description=VoiceTwine - Create simple, dynamic voice channels to remove clutter from your Discord server!
Documentation=https://github.com/Twijn/VoiceTwine
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/node /path/to/repo/dist/app.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
**Make sure to edit the `/path/to/repo` to point to your installation path.**

To run the service on system restart, use the following command:

```bash
sudo systemctl enable voicetwine
```

### Pterodactyl Installation
We now have a [Pterodactyl egg available for VoiceTwine!](/panel-eggs/pterodactyl/egg-voice-twine.json)

To use it, import the above egg into your Panel and create a new server. You'll want to have a MariaDB set up prior to that, ensuring that it's accessible by the Pterodactyl network.

## Updating
### Manual Installation: Updating
Update source code by downloading a release or using `git pull`.

Install any missing/updated dependencies
```bash
npm ci
```

Build source code
```bash
npm run build
```

Update the database
```bash
npm run migrate
```

You may now restart the application!

### Pterodactyl Installation: Updating
You can update your Pterodactyl installation of VoiceTwine by reinstalling the server.
