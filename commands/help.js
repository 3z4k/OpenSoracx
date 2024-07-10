const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information and bot statistics.'),
    async execute(interaction) {
        const client = interaction.client;
        const commandFiles = fs.readdirSync(path.resolve(__dirname, '../commands')).filter(file => file.endsWith('.js'));
        const commandNames = commandFiles.map(file => {
            const command = require(`../commands/${file}`);
            return command.data.name;
        });

        const version = packageJson.version;
        const uptime = process.uptime();
        const uptimeFormatted = formatUptime(uptime);
        const latency = Date.now() - interaction.createdTimestamp;

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Help and Bot Statistics')
            .setDescription('Available commands:\n`' + commandNames.join('`, `') + '`')
            .addFields(
                { name: ':gear: Commands', value: client.commands.size.toString(), inline: false },
                { name: ':file_folder: Soracx Version', value: version, inline: false },
                { name: ':timer: Uptime', value: uptimeFormatted, inline: false },
                { name: ':stopwatch: Ping', value: `${latency}ms`, inline: false },
                { name: ':man_technologist: Developer', value: '[3z4k](https://github.com/3z4k)', inline: false }
            )
            .setFooter('Credits to Soracx');

        await interaction.reply({ embeds: [embed] });
    },
};

function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${days} Days︲${hours} Hrs︲${minutes} Mins︲${secs} Secs Uptime`;
}

