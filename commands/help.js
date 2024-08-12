const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;
const author = packageJson.author;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information.'),
    async execute(interaction) {
        const ping = Math.round(interaction.client.ws.ping);

        let embed = new MessageEmbed()
            .setColor('#2B2D31')
            .setTitle(`Information about ${interaction.client.user.username}`)
            .setDescription('An advanced service bot for managing and generating accounts.')
            .addFields(
                { name: '__My Features__', value: '* Manage and generate accounts.\n* Notify server restocks.\n* Display available stocks.\n* View bot statistics and more!', inline: false },
                { name: '__How do you use me?__', value: 'Use the following commands to interact with me:\n\n`/create` - Create a new service.\n`/add` - Add an account to a service.\n`/gen` - Generate an account from a service and send it to DMs.\n`/freegen` - Generate a free account from a service and send it to DMs.\n`/premiumgen` - Generate a premium account from a service and send it to DMs.\n`/restock` - Notify the server of a service restock.\n`/stock` - Display available stocks.\n`/help` - Display this help menu.', inline: false },
                { name: '__STATS:__', value: `* Developer: ${author}\n* Ping: ${ping}ms\n* Version: ${version}\n* [SourceCode](https://github.com/3z4k/Soracx-GenBot)`, inline: false },
            )
            .setFooter('Credits to Soracx')
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

