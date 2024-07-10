const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

let ticketService = true;
const maxTicketChannel = 15;
const ticketManagerRole = "*";
const ticketAdminRole = "*";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribes to a plan and creates a ticket.')
        .addStringOption(option => 
            option.setName('plan')
                .setDescription('The subscription plan')
                .setRequired(true)),
    async execute(interaction) {
        if (ticketService) {
            let totalTicketChannel = 0;
            const plan = interaction.options.getString('plan');

            if (["BasicGen", "ProGen", "EliteGen"].includes(plan)) {
                await interaction.reply(`${interaction.user} Ticket has been created successfully!`);
                interaction.guild.channels.cache.forEach(channel => {
                    if (channel.name.includes('ticket')) {
                        totalTicketChannel += 1;
                    }
                });

                if (totalTicketChannel >= maxTicketChannel) {
                    return await interaction.followUp(`${interaction.user} Please wait some time there are maximum tickets created!`);
                }

                const ticketChannel = await interaction.guild.channels.create(`ticket-${totalTicketChannel}`, {
                    type: 'GUILD_TEXT'
                });

                let permissions = [
                    {
                        id: interaction.guild.roles.everyone.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL]
                    },
                    {
                        id: interaction.user.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                    }
                ];

                interaction.guild.roles.cache.forEach(role => {
                    if (role.name.includes(ticketManagerRole) || role.name.includes(ticketAdminRole)) {
                        permissions.push({
                            id: role.id,
                            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                        });
                    }
                });

                await ticketChannel.permissionOverwrites.set(permissions);

                const embed = new MessageEmbed()
                    .setTitle('Subscribe Ticket')
                    .setDescription('Please wait, support will be with you shortly.')
                    .setColor(interaction.user.displayHexColor)
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .addField('Created By:', `${interaction.user}`, true)
                    .addField('Buying plan:', `${plan}`, true)
                    .setFooter('Credits to Soracx', interaction.client.user.displayAvatarURL());

                await ticketChannel.send({ embeds: [embed] });
            } else {
                await interaction.reply(`${interaction.user} Plan name is invalid, please try again.`);
            }
        } else {
            await interaction.reply(`${interaction.user} Currently, the ticket service is off by admins. Please try again later or contact the server admin!`);
        }
    }
};

// Close ticket command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('tclose')
        .setDescription('Closes a ticket')
        .setDefaultPermission(false),
    async execute(interaction) {
        if (interaction.channel.name.includes('ticket')) {
            await interaction.channel.delete();
        } else {
            await interaction.reply('This command can only be used inside a ticket channel.');
        }
    }
};

// Permission setup for the tclose command
const { Permissions } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = require('./config.json');

const commands = [
    new SlashCommandBuilder()
        .setName('tclose')
        .setDescription('Closes a ticket')
        .setDefaultPermission(false)
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        const guild = client.guilds.cache.get(guildId);
        const command = guild.commands.cache.find(cmd => cmd.name === 'tclose');

        const roles = guild.roles.cache.filter(role => role.name.includes(ticketAdminRole));
        const permissions = roles.map(role => ({
            id: role.id,
            type: 'ROLE',
            permission: true
        }));

        await command.permissions.add({ permissions });
        console.log('Successfully registered application commands.');
    } catch (error) {
        console.error(error);
    }
})();
