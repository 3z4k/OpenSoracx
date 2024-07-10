const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { genChannelId } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Generates the first account of the service and sends it to DMs.')
        .addStringOption(option => 
            option.setName('service')
                .setDescription('The name of the service')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.channelId !== genChannelId) {
            return interaction.reply({
                content: `This command can only be used in the <#${genChannelId}> channel.`,
                ephemeral: true
            });
        }

        const service = interaction.options.getString('service');
        const filePath = path.join(__dirname, `../data/${service}.txt`);

        let embed = new MessageEmbed()
            .setColor('#0099ff')
            .setFooter('Credits to Soracx');

        if (fs.existsSync(filePath)) {
            const accounts = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
            if (accounts.length > 0) {
                const account = accounts.shift();
                fs.writeFileSync(filePath, accounts.join('\n'), 'utf8');

                const [username, password] = account.split(':');
                const dmEmbed = new MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Generated Account')
                    .addFields(
                        { name: 'ACCOUNT USERNAME', value: `\`\`\`${username}\`\`\``, inline: false },
                        { name: 'ACCOUNT PASSWORD', value: `\`\`\`${password}\`\`\``, inline: false }
                    )
                    .setFooter('Credits to Soracx');

                try {
                    await interaction.user.send({ embeds: [dmEmbed] });

                    embed.setTitle('Account Generated')
                        .setDescription('Account has been sent to your DMs.');
                } catch (error) {
                    console.error('Error sending DM:', error);

                    embed.setTitle('DM Failed')
                        .setDescription('Failed to send the account to your DMs. Please check your DM settings and try again.');
                }
            } else {
                embed.setTitle('No Accounts Available')
                    .setDescription(`No accounts available for **${service}**.`);
            }
        } else {
            embed.setTitle('Service Not Found')
                .setDescription(`Service **${service}** does not exist.`);
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
