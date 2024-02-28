import { Client, GatewayIntentBits, Events, Collection } from "discord.js";
import "dotenv/config";
import fs from "node:fs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

const commandsFoldersPath = new URL("commands", import.meta.url);
const commandFolders = fs.readdirSync(commandsFoldersPath);
for (const folder of commandFolders) {
  const commandsPath = new URL(
    `${commandsFoldersPath}/${folder}`,
    import.meta.url
  );
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = new URL(`${commandsPath}/${file}`, import.meta.url);
    await import(filePath).then(async (command) => {
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(
          `[COMMANDS LOADING] Le fichier ${filePath} a bien été pris en compte`
        );
      } else {
        console.log(
          `[COMMANDS LOADING] La commande ${filePath} manque d'un "data" ou d'un "execute"`
        );
      }
    });
  }
}

const eventFoldersPath = new URL("events", import.meta.url);
const eventFolders = fs.readdirSync(eventFoldersPath);
for (const folder of eventFolders) {
  const eventsPath = new URL(`${eventFoldersPath}/${folder}`, import.meta.url);
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of eventFiles) {
    const filePath = new URL(`${eventsPath}/${file}`, import.meta.url);
    await import(filePath).then(async (event) => {
      // Set a new item in the Collection with the key as the command name and the value as the exported module
      if ("name" in event && "once" in event && "execute" in event) {
        console.log(
          `[EVENTS LOADING] Le fichier ${filePath} a bien été pris en compte`
        );
        if (event.once) {
          client.once(event.name, (...args) => {
            event.execute(...args);
          });
        } else {
          client.on(event.name, (...args) => {
            event.execute(...args);
          });
        }
      } else {
        console.log(
          `[EVENTS LOADING] La commande ${filePath} manque d'un "data" d'un "execute" ou d'un "once"`
        );
      }
    });
  }
}

//commandes slashs
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.log(interaction.commandName);
    console.error("[X] Pas de commande existante avec ce nom");
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Il y a eu une erreur pendant le lancement de la commande",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "Il y a eu une erreur pendant le lancement de la commande",
        ephemeral: true,
      });
    }
  }
  return;
});

await client.login(process.env.DISCORD_TOKEN);
