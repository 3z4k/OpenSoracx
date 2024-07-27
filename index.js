const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const colors = require('colors');
const figlet = require('figlet');
require('dotenv').config();

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;
const author = packageJson.author;

const { clientId, guildId, adminRoleId, soracxRoleId, vanityLink } = require('./config.json');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

const totalCommands = commandFiles.length;
const stockFiles = fs.readdirSync('./data').filter(file => file.endsWith('.txt'));
const totalStocks = stockFiles.length;

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log(colors.cyan('Started refreshing application (/) commands.'));

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log(colors.green('Successfully reloaded application (/) commands.'));
    } catch (error) {
        console.error(colors.red('Error refreshing application (/) commands:'), error);
    }
})();

client.once('ready', async () => {
    const asciiArt = figlet.textSync('Soracx Gen', { font: 'Slant' }).trimRight();
    const userTag = client.user.tag;
    const lines = asciiArt.split('\n');
    const longestLineLength = Math.max(...lines.map(line => line.length));

    const paddedLines = lines.map((line, index) => {
        let infoLine = '';
        if (index === 0) infoLine = userTag;
        else if (index === 1) infoLine = `Version: ${version}`;
        else if (index === 2) infoLine = `Total Stocks: ${totalStocks}`;
        else if (index === 3) infoLine = `Total Commands: ${totalCommands}`;
        else if (index === 4) infoLine = `Developer: ${author}`;
        return line + ' '.repeat(longestLineLength - line.length) + '   ' + infoLine;
    });

    paddedLines.forEach(line => console.log(colors.green(line)));

    rotateStatus();
    await checkAllMembersForSoracx();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    if (command.adminOnly && !interaction.member.roles.cache.has(adminRoleId)) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(colors.red('Error executing command:'), error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
    checkForSoracxRole(newPresence);
});

client.login(process.env.TOKEN);

function rotateStatus() {
    const files = fs.readdirSync('./data').filter(file => file.endsWith('.txt'));

    let statusIndex = 0;
    const statuses = files.map(file => {
        const fileName = file.replace('.txt', '');
        return { type: 'WATCHING', message: `${fileName}` };
    });

    setInterval(() => {
        const status = statuses[statusIndex];
        client.user.setActivity(
            status.message,
            { type: status.type }
        );
        statusIndex = (statusIndex + 1) % statuses.length;
    }, 10000);
}

async function checkForSoracxRole(presence) {
    if (!presence.activities) return;

    const hasSoracxLink = presence.activities.some(activity =>
        activity.state && activity.state.includes(vanityLink)
    );

    const member = presence.member;
    const role = presence.guild.roles.cache.get(soracxRoleId);

    if (hasSoracxLink) {
        if (!member.roles.cache.has(soracxRoleId)) {
            try {
                await member.roles.add(role);
                console.log(colors.green(`Assigned Soracx role to ${member.user.tag}`));
            } catch (error) {
                console.error(colors.red(`Error assigning role to ${member.user.tag}:`), error);
            }
        }
    } else {
        if (member.roles.cache.has(soracxRoleId)) {
            try {
                await member.roles.remove(role);
                console.log(colors.green(`Removed Soracx role from ${member.user.tag}`));
            } catch (error) {
                console.error(colors.red(`Error removing role from ${member.user.tag}:`), error);
            }
        }
    }
}

async function checkAllMembersForSoracx() {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    try {
        await guild.members.fetch();

        guild.members.cache.forEach(member => {
            if (member.presence) {
                checkForSoracxRole(member.presence);
            }
        });
    } catch (error) {
        console.error(colors.red('Error fetching members:'), error);
    }
}

