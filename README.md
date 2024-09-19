# Minecraft Bot Controller

A simple Minecraft bot built using the Mineflayer library. This bot can automatically attack entities, manage its health and food levels, and respond to console commands. 

## Features

- Automatically attacks nearby entities (Vindicators and Wither Skeletons).
- Uses auto-eat functionality to maintain food levels.
- Console commands for interaction:
  - `chat <message>`: Send a chat message.
  - `stats`: Display player stats.
  - `armor`: Show armor stats.
  - `autoEquipArmor`: Equip the best available armor.
  - `attack`: Start attacking the nearest entity.
  - `stopAttack`: Stop attacking.
  - `moveRandom`: Move randomly within a specified range.
  - `setGoal <x> <y> <z>`: Set a movement goal based on coordinates.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/minecraft-bot-controller.git
   cd minecraft-bot-controller
