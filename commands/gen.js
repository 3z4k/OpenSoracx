const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { genChannelId, freegenroleid, premiumgenroleid, premiumGenChannelId } = require('../config.json');

const cooldowns = new Collection();

function getServiceChoices(dir) {
    const dataPath = path.join(__dirname, `../data/${dir}`);
    const files = fs.readdirSync(dataPath).filter(file => file.endsWith('.txt'));
    return files.map(file => ({ name: file.replace('.txt', ''), value: file.replace('.txt', '') }));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gen')
        .setDescription('Generates the first account of the service and sends it to DMs.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('free')
                .setDescription('Generate account from free services.')
                .addStringOption(option => {
                    const choices = getServiceChoices('FreeGen');
                    choices.forEach(choice => {
                        option.addChoices(choice);
                    });
                    return option
                        .setName('service')
                        .setDescription('The name of the free service')
                        .setRequired(true);
                })
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('premium')
                .setDescription('Generate account from premium services.')
                .addStringOption(option => {
                    const choices = getServiceChoices('PremiumGen');
                    choices.forEach(choice => {
                        option.addChoices(choice);
                    });
                    return option
                        .setName('service')
                        .setDescription('The name of the premium service')
                        .setRequired(true);
                })
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const service = interaction.options.getString('service');
        const filePath = path.join(__dirname, `../data/${subcommand === 'free' ? 'FreeGen' : 'PremiumGen'}/${service}.txt`);

        if (subcommand === 'free' && interaction.channelId !== genChannelId) {
            return interaction.reply({
                content: `This command can only be used in the <#${genChannelId}> channel.`,
                ephemeral: true
            });
        }

        if (subcommand === 'premium' && interaction.channelId !== premiumGenChannelId) {
            return interaction.reply({
                content: `This command can only be used in the <#${premiumGenChannelId}> channel.`,
                ephemeral: true
            });
        }

        if (subcommand === 'free' && interaction.member.roles.cache.has(freegenroleid)) {
            const now = Date.now();
            const timestamps = cooldowns.get(interaction.user.id);
            const cooldownAmount = 20 * 60 * 1000; // 20 minutes

            if (timestamps) {
                const expirationTime = timestamps + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = expirationTime - now;
                    const minutes = Math.floor(timeLeft / (1000 * 60));
                    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                    const embed = new MessageEmbed()
                        .setColor('#2B2D31')
                        .setTitle('Cooldown Active')
                        .setDescription(`You can use this command again in ${minutes}m ${seconds}s.`)
                        .setFooter('Credits to Soracx');

                    return interaction.reply({ embeds: [embed], ephemeral: true });
                }
            }
            cooldowns.set(interaction.user.id, now);
            setTimeout(() => cooldowns.delete(interaction.user.id), cooldownAmount);
        }

        if (subcommand === 'premium' && !interaction.member.roles.cache.has(premiumgenroleid)) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
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
};

