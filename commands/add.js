const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds an account to the service file.')
        .addStringOption(option =>
            option.setName('service')
                .setDescription('The name of the service')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('servicetype')
                .setDescription('The type of service (free or premium)')
                .setRequired(true)
                .addChoices(
                    { name: 'Free', value: 'Free' },
                    { name: 'Premium', value: 'Premium' }
                ))
        .addStringOption(option =>
            option.setName('credentials')
                .setDescription('The account credentials')
                .setRequired(true)),
    adminOnly: true,
    async execute(interaction) {
        const credentials = interaction.options.getString('credentials');
        const service = interaction.options.getString('service');
        const serviceType = interaction.options.getString('servicetype');
        const folderPath = path.join(__dirname, `../data/${serviceType}Gen`);
        const filePath = path.join(folderPath, `${service}.txt`);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setFooter('Credits to Soracx');

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        if (fs.existsSync(filePath)) {
            fs.appendFileSync(filePath, `${credentials}\n`, 'utf8');
            embed.setTitle('Account Added')
                .setDescription(`Account has been added to **${service}** (${serviceType}).`);
        } else {
            embed.setTitle('Service Not Found')
                .setDescription(`Service **${service}** (${serviceType}) does not exist.`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};


