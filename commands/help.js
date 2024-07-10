const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const packageJson = require('../package.json');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information.'),
    async execute(interaction) {
        const client = interaction.client;
        const version = packageJson.version;
        const uptime = process.uptime();
        const uptimeFormatted = new Date(uptime * 1000).toISOString().substr(11, 8);

        const latency = Date.now() - interaction.createdTimestamp;

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Help')
            .setDescription(`Available commands:\n\`/create\`, \`/add\`, \`/gen\`, \`/restock\`, \`/help\`, \`/stock\``)
            .addField('Bot Statistics', `Latency: ${latency}ms\nRunning on Soracx v${version}\nBot uptime: ${uptimeFormatted}`)
            .setFooter('Coded by [3z4k](https://github.com/3z4k/Soracx-GenBot)');

        await interaction.reply({ embeds: [embed] });
    },
};
