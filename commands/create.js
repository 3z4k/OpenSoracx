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
                .setRequired(true))
        .addStringOption(option =>
            option.setName('servicetype')
                .setDescription('The type of service (free or premium)')
                .setRequired(true)
                .addChoices(
                    { name: 'Free', value: 'Free' },
                    { name: 'Premium', value: 'Premium' }
                )),
    adminOnly: true,
    async execute(interaction) {
        const service = interaction.options.getString('service');
        const serviceType = interaction.options.getString('servicetype');
        const folderPath = path.join(__dirname, `../data/${serviceType}Gen`);
        const filePath = path.join(folderPath, `${service}.txt`);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setFooter('Credits to Soracx');

        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        if (fs.existsSync(filePath)) {
            embed.setTitle('Service Exists')
                .setDescription(`The service **${service}** already exists in the ${serviceType} category.`);
        } else {
            fs.writeFileSync(filePath, '', 'utf8');
            embed.setTitle('Service Created')
                .setDescription(`Service **${service}** has been created in the ${serviceType} category.`);
        }

        await interaction.reply({ embeds: [embed] });
    },
};

