const fs = require('fs');
const express = require('express');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, adminRoleId, soracxRoleId } = require('./config.json');
const app = require('./server');
const colors = require('colors'); 
const figlet = require('figlet'); 

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const version = packageJson.version;

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
    console.log(colors.green(figlet.textSync('Soracx Gen').trimRight()));
    console.log(colors.blue(`Logged in as ${client.user.tag}`));
    console.log(colors.yellow(`Now you are running Soracx on v${version}`));

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(colors.cyan(`Server is running on http://localhost:${PORT}`));
});

function rotateStatus() {
    let statusIndex = 0;
    const statuses = [
        { type: 'WATCHING', message: 'Soracx Gen' },
        { type: 'WATCHING', message: getCrunchyrollStatus }
    ];

    setInterval(() => {
        const status = statuses[statusIndex];
        client.user.setActivity(
            typeof status.message === 'function' ? status.message() : status.message,
            { type: status.type }
        );
        statusIndex = (statusIndex + 1) % statuses.length;
    }, 10000); 
}

function getCrunchyrollStatus() {
    try {
        const data = fs.readFileSync('./data/CrunchyRoll.txt', 'utf8');
        const lines = data.split('\n').filter(line => line.trim() !== '');
        return `Crunchyroll and ${lines.length} stocks`;
    } catch (error) {
        console.error(colors.red('Error reading Crunchyroll data:'), error);
        return 'Crunchyroll and stocks';
    }
}

async function checkForSoracxRole(presence) {
    if (!presence.activities) return;

    const soracxLink = '.gg/soracx';
    const hasSoracxLink = presence.activities.some(activity => 
        activity.state && activity.state.includes(soracxLink)
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
