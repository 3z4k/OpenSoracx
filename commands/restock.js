const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { restockChannelId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restock')
        .setDescription('Notifies the server that the service has been restocked.')
        .addStringOption(option => 
            option.setName('service')
                .setDescription('The name of the service')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('count')
                .setDescription('Number of accounts added (optional)')
                .setRequired(false)),
    adminOnly: true,
    async execute(interaction) {
        const service = interaction.options.getString('service');
        const count = interaction.options.getInteger('count');
        const restockChannel = interaction.guild.channels.cache.get(restockChannelId);

        let description = `The service **${service}** has been restocked by an admin.`;

        if (count !== null && !isNaN(count)) {
            description += `\nAccounts added: ${count}`;
        } else {
            description += '\nService has been restocked.';
        }

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Service Restocked')
            .setDescription(description)
            .setFooter('Credits to Soracx');

        if (restockChannel) {
            restockChannel.send({ content: '@everyone', embeds: [embed] });
        } else {
            await interaction.reply({ content: 'Restock channel not found.', ephemeral: true });
            return;
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
