import 'dotenv/config';
import { getRPSChoices } from './commands/SlashCommands/game.js';
import { getSTATSChoices  } from './commands/SlashCommands/stats.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

import { REST, Routes } from 'discord.js';
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);



// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }
  return commandChoices;
}

function STATScreateCommandChoices() {
  const choices = getSTATSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }
  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    }
  ],
  type: 1,
};

//Genshin command
const GENSHIN_COMMAND = {
  name: 'genshin',
  description: 'Commande pour demander une information sur Genshin impact',
  type: 1,
};

//Stats command 
const STATS_COMMAND = {
  name: 'stats',
  description: "Affiche les stats d'un compte discord",
  options : [
    {
      type : 3,
      name : 'constantetemps',
      description : "Indique 'intervalle de temps qu'il faut prendre",
      required : true,
      choices : STATScreateCommandChoices()
    },
    {
      type : 6,
      name : 'utilisateur',
      description : 'Utilisateur à tracer sur le serveur',
      required : true
    }
  ],
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, GENSHIN_COMMAND, STATS_COMMAND];

export async function InstallSlashCommands () {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: ALL_COMMANDS });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
};

//InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

