# Minecraft Bot Controller

## Overview

**Minecraft Bot Controller** is a bot powered by [Mineflayer](https://github.com/PrismarineJS/mineflayer), designed to automate various in-game actions in Minecraft. The bot can perform tasks such as attacking specific mobs, equipping armor and weapons, and automatically eating food when its hunger level is low. It also provides a console interface for issuing commands and controlling its behavior in real time.

## Features

- **Automatic Combat:** The bot can find and attack specific mobs like Zombified Piglins and Wither Skeletons.
- **Kill Aura Mode:** Automatically track and attack the nearest mob within range.
- **Auto-Eat:** When hunger drops below a threshold, the bot will automatically eat to replenish its food bar.
- **Auto Armor Equip:** Automatically equips the best available armor when needed.
- **Console Commands:** Control the bot through console commands for attacking, chatting, equipping armor, and more.
- **Customizable:** Easily customize behavior by adjusting configurations in the `config.json` file.

## Installation

1. **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2. **Navigate to the project folder:**
    ```bash
    cd minecraft-bot-controller
    ```

3. **Install dependencies:**
    ```bash
    npm install
    ```

4. **Create a `config.json` file:**

    Inside the project folder, create a `config.json` file with your Minecraft server settings:
    ```json
    {
      "host": "your-server-ip",
      "port": your-server-port,
      "username": "bot-username"
    }
    ```

5. **Run the bot:**
    ```bash
    node bot.js
    ```

## Console Commands

After running the bot, you can issue commands via the console:

- **chat [message]**: Sends a chat message in the Minecraft server.
- **stats**: Prints the bot's current stats (health, food, inventory, and position).
- **armor**: Prints the bot's current armor status.
- **autoEquipArmor**: Automatically equips the best available armor.
- **attack**: Start attacking nearby hostile mobs (Zombified Piglins or Wither Skeletons).
- **stopAttack**: Stops the bot from attacking mobs.

## Plugins Used

- **[mineflayer](https://github.com/PrismarineJS/mineflayer):** The core library for creating Minecraft bots.
- **[mineflayer-pathfinder](https://github.com/Karang/mineflayer-pathfinder):** For pathfinding and movement.
- **[mineflayer-armor-manager](https://github.com/TheDudeFromCI/mineflayer-armor-manager):** For managing armor equipment.
- **[mineflayer-auto-eat](https://github.com/Linkdiscord/mineflayer-auto-eat):** Plugin for automatically eating food.

## Customization

- **Auto-Attack Mobs**: Modify the `attackEntity()` function to change the types of mobs the bot will attack.
- **Auto-Eat Settings**: Customize the auto-eat behavior by adjusting the `bot.autoEat.options` when the bot spawns.

## Error Handling

- The bot will log any errors to the console and attempt to reconnect if it disconnects from the server.

## Future Improvements

- Add more customizable combat strategies.
- Implement additional commands for better control.
- Expand auto-equip to support weapon choices based on the situation.

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Feel free to submit pull requests or open issues to suggest features or report bugs.

## Author

- **Navidu** (MOOZ Studio)
