const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information.'),
    async execute(interaction) {
        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Help')
            .setDescription('Available commands:\n/create, /add, /gen, /restock, /help, /stock')
            .setFooter('Credits to Soracx');

        await interaction.reply({ embeds: [embed] });
    },
};

