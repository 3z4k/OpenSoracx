const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Creates a txt file for the service.')
        .addStringOption(option => 
            option.setName('service')
                .setDescription('The name of the service')
                .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const service = interaction.options.getString('service');
        const filePath = path.join(__dirname, `../data/${service}.txt`);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setFooter('Credits to Soracx');

        if (fs.existsSync(filePath)) {
            embed.setTitle('Service Exists')
                .setDescription(`The service **${service}** already exists.`);
        } else {
            fs.writeFileSync(filePath, '', 'utf8');
            embed.setTitle('Service Created')
                .setDescription(`Service **${service}** has been created.`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
