const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds an account to the service file.')
        .addStringOption(option => 
            option.setName('credentials')
                .setDescription('The account credentials')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('service')
                .setDescription('The name of the service')
                .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const credentials = interaction.options.getString('credentials');
        const service = interaction.options.getString('service');
        const filePath = path.join(__dirname, `../data/${service}.txt`);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setFooter('Credits to Soracx');

        if (fs.existsSync(filePath)) {
            fs.appendFileSync(filePath, `${credentials}\n`, 'utf8');
            embed.setTitle('Account Added')
                .setDescription(`Account has been added to **${service}**.`);
        } else {
            embed.setTitle('Service Not Found')
                .setDescription(`Service **${service}** does not exist.`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
