# VoiceTwine
Create simple, dynamic voice channels to remove clutter from your Discord server!
## Installation
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

Install dependencies & build the application. Developer dependencies **are required** to build typescript code.

```bash
npm i
npm run build
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
