![Soracx](https://cdn.discordapp.com/attachments/1259785538144309329/1260118897928044625/ar_1.png?ex=668e28ad&is=668cd72d&hm=4acdbafa83010edf7c17619ac4b7c0a1b47119f17579c80ac3d93c234d035014&)


*# Soracx Gen*

## Overview

Soracx Gen is a Discord bot designed to automate account generation and management tasks. It provides a streamlined interface using Discord slash commands for efficient interaction.

## Features

- **Account Generation:** Generates accounts for specified services and sends them via DMs.
- **Command Handling:** Dynamic command loading and management. 
- **Permission System:** Role-based access control for admin-only commands.
- **Status Rotation:** Regularly rotates bot status messages for a dynamic presence.
- **Crunchyroll Integration:** Displays the number of stocks from Crunchyroll in status messages.
- **Automatic Role Management:** Automatically assigns roles based on user activities.
- **Server Integration:** Integrated Express server for potential future expansions.
- **Logging and Debugging:** Enhanced logging with colors and ASCII art for clarity and style.

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/3z4k/soracx-gen.git
   cd soracx-gen
   
2. **Install dependencies:**
   ```sh
   npm install

3.**Configure the bot:**
```json
{ 
    "clientId": "",
    "guildId": "",
    "genChannelId": "",
    "soracxRoleId": "", 
    "restockChannelId": "",
    "adminRoleId": "",
    "vanityLink": ".gg/soracx"
}
```

4.**Create a `.env`**
```TOKEN=YOUR_DISCORD_BOT_TOKEN```

5. **START THE BOT**
```node index.js```

**Usage**
* **Commands:** Interact with the bot using slash commands in Discord. Admin-only commands are restricted to users with the admin role.
* **Status Rotation:** The bot will automatically rotate its status messages every 10 seconds.
* **Automatic Role Management:** The bot will manage the Soracx role based on user presence activities.
![Screen recording 2024-07-10 12 02 47 PM](https://github.com/3z4k/Soracx-GenBot/assets/91467994/ba8bca97-7549-4222-98d4-4e7f682e79f8)

## IF YOU NEED ANY HELP RELATED TO THIS REPO MAKE SURE TO JOIN https://discord.gg/7gqSZSQKpf

