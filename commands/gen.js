const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { genChannelId } = require('../config.json');

function getServiceChoices() {
    const dataPath = path.join(__dirname, '../data');
    const files = fs.readdirSync(dataPath).filter(file => file.endsWith('.txt'));
    return files.map(file => ({ name: file.replace('.txt', ''), value: file.replace('.txt', '') }));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Generates the first account of the service and sends it to DMs.')
        .addStringOption(option => 
            option.setName('service')
                .setDescription('The name of the service')
                .setRequired(true)
                .addChoices(...getServiceChoices())
        ),
    async execute(interaction) {
        const serviceChoices = getServiceChoices();
        const service = interaction.options.getString('service');
        const filePath = path.join(__dirname, `../data/${service}.txt`);

        if (interaction.channelId !== genChannelId) {
            return interaction.reply({
                content: `This command can only be used in the <#${genChannelId}> channel.`,
                ephemeral: true
            });
        }

        let embed = new MessageEmbed()
            .setColor('#2B2D31')
            .setFooter('Credits to Soracx');

        if (fs.existsSync(filePath)) {
            const accounts = fs.readFileSync(filePath, 'utf8').split('\n').filter(Boolean);
            if (accounts.length > 0) {
                const account = accounts.shift();
                fs.writeFileSync(filePath, accounts.join('\n'), 'utf8');

                const [username, password] = account.split(':');
                const accountDisplay = password ? `${username}:${password}` : username;
                const dmEmbed = new MessageEmbed()
                    .setColor('#2B2D31')
                    .setTitle('Generated Account')
                    .addFields(
                        { name: 'Service Name', value: `\`\`\`${service}\`\`\``, inline: true },
                        { name: 'Account Credentials', value: `\`\`\`${accountDisplay}\`\`\``, inline: true }
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

        await interaction.reply({ embeds: [embed], ephemeral: false });
    },
