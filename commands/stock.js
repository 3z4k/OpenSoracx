const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const AsciiTable = require('ascii-table');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stock')
        .setDescription('Displays available stocks.'),
    async execute(interaction) {
        const files = fs.readdirSync(path.join(__dirname, '../data')).filter(file => file.endsWith('.txt'));

        if (files.length === 0) {
            const embed = new MessageEmbed()
                .setColor('#2B2D31')
                .setTitle('Available Stocks')
                .setDescription('No services available.')
                .setFooter('Credits to Soracx');

            await interaction.reply({ embeds: [embed] });
            return;
        }

        let table = new AsciiTable('Available Stocks');
        table.setHeading('Service', 'Availability');

        files.forEach(file => {
            const service = file.replace('.txt', '');
            const accounts = fs.readFileSync(path.join(__dirname, `../data/${file}`), 'utf8').split('\n').filter(Boolean).length;
            table.addRow(service, `${accounts} accounts`);
        });

        const embed = new MessageEmbed()
            .setColor('#2B2D31')
            .setDescription('```\n' + table.toString() + '\n```')
            .setFooter('Credits to Soracx');

        await interaction.reply({ embeds: [embed] });
    },
};


