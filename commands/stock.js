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
        const freePath = path.join(__dirname, '../data/FreeGen');
        const premiumPath = path.join(__dirname, '../data/PremiumGen');

        const freeFiles = fs.readdirSync(freePath).filter(file => file.endsWith('.txt'));
        const premiumFiles = fs.readdirSync(premiumPath).filter(file => file.endsWith('.txt'));

        let freeTable = new AsciiTable('Free Stock');
        freeTable.setHeading('Service', 'Availability');

        if (freeFiles.length > 0) {
            freeFiles.forEach(file => {
                const service = file.replace('.txt', '');
                const accounts = fs.readFileSync(path.join(freePath, file), 'utf8').split('\n').filter(Boolean).length;
                freeTable.addRow(service, `${accounts} accounts`);
            });
        } else {
            freeTable.addRow('No services available.', '');
        }

        let premiumTable = new AsciiTable('Premium Stock');
        premiumTable.setHeading('Service', 'Availability');

        if (premiumFiles.length > 0) {
            premiumFiles.forEach(file => {
                const service = file.replace('.txt', '');
                const accounts = fs.readFileSync(path.join(premiumPath, file), 'utf8').split('\n').filter(Boolean).length;
                premiumTable.addRow(service, `${accounts} accounts`);
            });
        } else {
            premiumTable.addRow('No services available.', '');
        }

             const embed = new MessageEmbed()
            .setColor('#2B2D31')
            .setDescription('```\n' + freeTable.toString() + '\n```\n```\n' + premiumTable.toString() + '\n```')
            .setFooter('Credits to Soracx');
        await interaction.reply({ embeds: [embed] });
    },
};

