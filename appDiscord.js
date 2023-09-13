import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Guild,
  EmbedBuilder,
  Message,
  Events,
  Embed,
  Collection,
} from "discord.js";
import "dotenv/config";
import { getRandomEmoji } from "./utils.js";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import { database } from "./Niveaux/MySQL.js";
import fs from "node:fs";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

const foldersPath = new URL("commands", import.meta.url);
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = new URL(`${foldersPath}/${folder}`, import.meta.url);
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
          `[REUSSI] Le fichier ${filePath} a bien été pris en compte`
        );
      } else {
        console.log(
          `[WARNING] La commande ${filePath} manque d'un "data" ou d'un "execute"`
        );
      }
    });
  }
}
import mysql from "mysql";
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "discordbot",
});
database("open");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// client.on('interactionCreate', async (interaction) => {
// 	if (!interaction.isChatInputCommand()) return;

// 	if (interaction.commandName === 'ping') {
// 		await interaction.reply('Pong!');
// 	}
// });

//Interaction sur un changement d'état Vocal sur un utilisateur

//Interaction tels que des commandes slashs
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
  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type == InteractionType.APPLICATION_COMMAND) {
    // "test" command
    if (commandName === "test") {
      // Send a message into the channel where command was triggered from
      let resultat;
      db.query(
        `select * from user_level where user_id = ${interaction.user.id} and guild_id = ${interaction.guild.id}`,
        (error, result) => {
          resultat = result;
          interaction.reply({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
            content: `hello world ${getRandomEmoji()} \n ${resultat}, ${
              resultat.length
            }`,
            ephemeral: true,
          });
        }
      );

      db.query("select * from user_level", (error, result) => {
        console.log(result);
      });
    }
    //============================================================
    // Commande 1 : genshin
    if (commandName === "genshin") {
    }
  }
});

//Interaction au moment de la création d'un message
client.on(Events.MessageCreate, async (message) => {
  const user_id = message.author.id;
  const guild_id = message.member.guild.id;
  if (user_id == "373194336843595797") return;
  const A = 10;
  const EXP = 10;
  db.query(
    `select * from user_level where user_id = ${user_id} and guild_id = ${guild_id}`,
    (error, result) => {
      if (result.length == 0) {
        db.query(
          `insert into user_level (user_id, guild_id, level, points)  values (${user_id}, ${guild_id}, 1, 1)`
        );
      } else {
        db.query(
          `update user_level set points = points + 1 where user_id = ${user_id} and guild_id = ${guild_id}`
        );
        if (result[0].points >= A * EXP ** result[0].level) {
          db.query(
            `update user_level set level = level + 1 where user_id = ${user_id} and guild_id = ${guild_id}`
          );
          const Embed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(
              `Félicitation à ${
                message.member.nickname
              } pour être passé au niveau ${result[0].level + 1}`
            )
            .setDescription("")
            .setImage(message.member.avatarURL);
        }
      }
    }
  );
});

// client.on(Events.VoiceStateUpdate, async (oldChannel, newChannel) => {
// 	db.query(`insert into user_vocal (user_id, guild_id ,old_channel, new_channel, timestamp) values (${oldChannel.user.id}, ${oldChannel.member.guild.id}, ${oldChannel.channelId}, ${newChannel.channelId}, ${date.getTime()})`)
// 	if ( newChannel.channelId === null) {
// 		db.query(`select * from user_vocal where user_id = ${user_id} and guild_id = ${guild_id}`, (error, result) => {
// 			db.query(`update user_level set vocal_time = vocal_time + ${result[1].timestamp - result[0].timestamp} where user_id = ${user_id} and guild_id = ${guild_id}`)
// 			db.query(`update user_level set points = points + ${Math.floor((result[1].timestamp - result[0].timestamp)/1000)}  where user_id = ${user_id} and guild_id = ${guild_id}`)
// 		})
// 	}
// })

await client.login(process.env.DISCORD_TOKEN);
