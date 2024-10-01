const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const readline = require('readline');
const armorManager = require('mineflayer-armor-manager');
const { GoalFollow } = goals;
const fs = require('fs');

// Load configuration from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

const bot = mineflayer.createBot({
  host: config.host,
  port: config.port,
  username: config.username,
  version: false,
  auth: 'offline'
});

bot.loadPlugin(pathfinder);
bot.loadPlugin(armorManager);

// Dynamically import the auto-eat plugin
(async () => {
  const autoeat = await import('mineflayer-auto-eat');
  bot.loadPlugin(autoeat.plugin);
})();

let isAttacking = false;
let killAuraInterval = null;
let foodCheckInterval = null;
let lastAttackTime = 0;
let eatingCooldownActive = false; // To track eating cooldown

// Function to attack the nearest entity
function attackEntity() {
  if (!killAuraInterval) {
    isAttacking = true;

    if (!foodCheckInterval) {
      foodCheckInterval = setInterval(() => {
        if (bot.food < 10) {
          console.log('Low food, disabling attack and starting to eat...');
          stopKillAura();
          handleAutoEat();
        }
      }, 5000);
    }

    killAuraInterval = setInterval(() => {
      const mob = bot.nearestEntity(entity =>
        entity.name === 'zombified_piglin' || entity.name === 'wither_skeleton'
      );

      const now = Date.now();
      if (mob && now - lastAttackTime > 1200) {
        const frontDirectionYaw = bot.entity.yaw; 
        const frontDirectionPitch = bot.entity.pitch;
        bot.look(frontDirectionYaw, frontDirectionPitch, true); 

        if (bot.entity.position.distanceTo(mob.position) <= 3) {
          equipWeapon(); 
          setTimeout(() => { 
            bot.attack(mob); 
            lastAttackTime = now; 
          }, Math.random() * 300 + 300);
        } else {
          const defaultMove = new Movements(bot, require('minecraft-data')(bot.version));
          bot.pathfinder.setMovements(defaultMove);
          bot.pathfinder.setGoal(new GoalFollow(mob, 1), true);
        }
      } else if (!mob) {
        const randomLook = Math.random();
        if (randomLook < 0.5) {
          const yawChange = (Math.random() - 0.5) * 0.5;
          const pitchChange = (Math.random() - 0.5) * 0.5;
          bot.look(bot.entity.yaw + yawChange, bot.entity.pitch + pitchChange, false);
        }
      }
    }, 800);
  }
}

// Function to equip a weapon
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

// Handle auto-eating with messages and cooldown
function handleAutoEat() {
  if (bot.food < bot.autoEat.options.startAt && !eatingCooldownActive && !bot.autoEat.isEating) {
    console.log('Starting to eat...');
    bot.chat('I am hungry! Time to eat!');
    bot.autoEat.enable();

    eatingCooldownActive = true; // Activate cooldown

    // Simulate cooldown after eating
    setTimeout(() => {
      console.log('Finished eating. Applying cooldown.');
      bot.autoEat.disable();
      bot.chat('I am full now, no more food for a while!');

      // Cooldown message
      setTimeout(() => {
        console.log('Cooldown period ended.');
        eatingCooldownActive = false; // Reset cooldown
      }, bot.autoEat.options.cooldown);
    }, 3000); // Simulate time taken to eat (3 seconds)
  }
}

// Auto-eat setup
bot.once('spawn', () => {
  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 15,
    bannedFood: [],
    cooldown: 5000 // Cooldown of 5 seconds after eating
  };
});

// Listen for health changes to trigger auto-eating
bot.on('health', handleAutoEat);

// Console feedback for auto-eat events
bot.on('autoeat_started', () => {
  console.log('Auto Eat started!');
});

bot.on('autoeat_stopped', () => {
  console.log('Auto Eat stopped!');
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
      autoEquipArmor();
      break;
    case 'attack':
      attackEntity();
      break;
    case 'stopAttack':
      stopKillAura();
      break;
    case 'eat':
      handleAutoEat(); // Manual trigger for eating
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
   bot.armorManager.equipAll();
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