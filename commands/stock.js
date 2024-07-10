const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('Displays available stocks.'),
    async execute(interaction) {
        const files = fs.readdirSync(path.join(__dirname, '../data')).filter(file => file.endsWith('.txt'));

        if (files.length === 0) {
            const embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Available Stocks')
                .setDescription('No services available.')
                .setFooter('Credits to Soracx');

            await interaction.reply({ embeds: [embed] });
            return;
        }

        const stockDescriptions = files.map(file => {
            const service = file.replace('.txt', '');
            const accounts = fs.readFileSync(path.join(__dirname, `../data/${file}`), 'utf8').split('\n').filter(Boolean).length;
            return `${service}: ${accounts} accounts`;
        }).join('\n');

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Available Stocks')
            .setDescription(stockDescriptions)
            .setFooter('Credits to Soracx');

        await interaction.reply({ embeds: [embed] });
    },
};
