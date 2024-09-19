const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const readline = require('readline');
const armorManager = require('mineflayer-armor-manager');
const { GoalFollow } = goals; // Extract GoalFollow
const fs = require('fs');

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const bot = mineflayer.createBot({
  host: config.host, // Server IP from config
  port: config.port, // Port from config
  username: config.username, // Bot name from config
  version: false,
  auth: 'offline'
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(armorManager);

// Dynamically import the auto-eat plugin
(async () => {
  const autoeat = await import('mineflayer-auto-eat');
  bot.loadPlugin(autoeat.plugin); // Load the auto-eat plugin
})();

let isAttacking = false; // To track if the bot is in attack mode
let killAuraInterval = null;
let foodCheckInterval = null; // Interval for checking food status
let lastAttackTime = 0; // Track time for attacks

// Function to attack the nearest entity
function attackEntity() {
  if (!killAuraInterval) {
    isAttacking = true;

    // Set up an interval to check food every 5 seconds
    if (!foodCheckInterval) {
      foodCheckInterval = setInterval(() => {
        if (bot.food < 10) {
          console.log('Low food, disabling attack and starting to eat...');
          stopKillAura();
          bot.autoEat.enable(); // Enable auto-eat
        }
      }, 5000); // Check every 5 seconds
    }

    killAuraInterval = setInterval(() => {
      const mob = bot.nearestEntity(entity =>
        entity.name === 'zombified_piglin' || entity.name === 'wither_skeleton'
      );

      const now = Date.now();
      if (mob && now - lastAttackTime > 1600) { // Minecraft's attack cooldown is ~1.6 seconds

        // Look in front of the bot instead of directly at the mob
        const frontDirectionYaw = bot.entity.yaw; 
        const frontDirectionPitch = bot.entity.pitch;
        bot.look(frontDirectionYaw, frontDirectionPitch, true); 

        if (bot.entity.position.distanceTo(mob.position) <= 3) {
          equipWeapon(); // Equip weapon before attacking
          setTimeout(() => { 
            bot.attack(mob); // Attack the mob when close enough
            lastAttackTime = now; // Update the last attack time
          }, Math.random() * 1000 + 500); // Random delay between 0.5s and 1.5s
        } else {
          const defaultMove = new Movements(bot, require('minecraft-data')(bot.version));
          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(new GoalFollow(mob, 1), true); // Move towards the mob
        }
      } else if (!mob) {
        // Randomly look around if no mob is found
        const randomLook = Math.random();
        if (randomLook < 0.5) {
          const yawChange = (Math.random() - 0.5) * 0.5;
          const pitchChange = (Math.random() - 0.5) * 0.5;
          bot.look(bot.entity.yaw + yawChange, bot.entity.pitch + pitchChange, false);
        }
      }
    }, 1000); // Check every second
  }
}

// Function to equip a weapon (e.g., sword or axe)
function equipWeapon() {
  const weapon = bot.inventory.items().find(item => item.name.includes('sword') || item.name.includes('axe'));
  if (weapon) {
    bot.equip(weapon, 'hand', (err) => {
      if (err) console.log('Failed to equip weapon:', err);
      else console.log(`Equipped ${weapon.name}`);
    });
  }
}

// Stop the attack mode
function stopKillAura() {
  if (killAuraInterval) {
    clearInterval(killAuraInterval);
    killAuraInterval = null;
    isAttacking = false;
    bot.chat('Kill Aura deactivated!');
  }

  if (foodCheckInterval) {
    clearInterval(foodCheckInterval);
    foodCheckInterval = null;
  }
}

// Resume attacking after eating
bot.on('autoeat_finished', () => {
  console.log('Finished eating. Resuming attack mode...');
  if (!isAttacking) {
    bot.autoEat.disable(); // Disable auto-eat after eating
    attackEntity(); // Resume attack mode
  }
});

// Auto-eat setup
bot.once('spawn', () => {
  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 19, // Start eating when food is 19 or less
    bannedFood: []
  };
});

// Console feedback for auto-eat
bot.on('autoeat_started', () => {
  console.log('Auto Eat started!');
});

bot.on('autoeat_stopped', () => {
  console.log('Auto Eat stopped!');
});

bot.on('health', () => {
  if (bot.food === 20) bot.autoEat.disable();
});

// Handle console commands
function handleConsoleInput(input) {
  const args = input.split(' ');
  const command = args[0];

  switch (command) {
    case 'chat':
      const message = args.slice(1).join(' ');
      bot.chat(message);
      break;
    case 'stats':
      printStats();
      break;
    case 'armor':
      printArmorStats();
      break;
    case 'autoEquipArmor':
      autoEquipArmor(); // Command for auto-equip
      break;
    case 'attack':
      attackEntity(); // Command to attack the nearest entity
      break;
    case 'stopAttack':
      stopKillAura(); // Command to stop attack mode
      break;
    default:
      console.log(`Unknown command: ${command}`);
      break;
  }
}

// Print player stats
function printStats() {
   const health = bot.health;
   const food = bot.food;
   const inventory = bot.inventory.items().map(item => `${item.name} x${item.count}`).join(', ');
   const position = bot.entity.position;

   console.log(`Player Stats:`);
   console.log(`Health: ${health}`);
   console.log(`Food: ${food}`);
   console.log(`Position: ${position}`);
   console.log(`Inventory: ${inventory}`);
}

// Print armor stats
function printArmorStats() {
   const helmet = bot.inventory.slots[5] ? bot.inventory.slots[5].name : 'None';
   const chestplate = bot.inventory.slots[6] ? bot.inventory.slots[6].name : 'None';
   const leggings = bot.inventory.slots[7] ? bot.inventory.slots[7].name : 'None';
   const boots = bot.inventory.slots[8] ? bot.inventory.slots[8].name : 'None';

   console.log(`Armor Stats:`);
   console.log(`Helmet: ${helmet}`);
   console.log(`Chestplate: ${chestplate}`);
   console.log(`Leggings: ${leggings}`);
   console.log(`Boots: ${boots}`);
}

// Automatically equip the best armor available
function autoEquipArmor() {
   bot.armorManager.equipAll(); // Equip the best armor available
}

// Setup console input
const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
});

rl.on('line', (input) => {
   handleConsoleInput(input);
});

// Handle errors and disconnects
bot.on('error', (err) => {
   console.error('Bot encountered an error:', err);
});

bot.on('end', () => {
   console.log('Bot has disconnected.');
});
