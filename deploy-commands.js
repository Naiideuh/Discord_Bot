import fs from "node:fs";
import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const developping = ["reload", "eval", "rocketleague"];
let commands = [];
const foldersPath = new URL("commands", import.meta.url);
const commandFolders = fs.readdirSync(foldersPath);
for (const folder of commandFolders) {
  const commandsPath = new URL(`${foldersPath}/${folder}`, import.meta.url);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = new URL(`${commandsPath}/${file}`, import.meta.url);
    await import(filePath).then((command) => {
      if ("data" in command && "execute" in command) {
        console.log(
          `[REUSSI] Le fichier ${filePath} a bien été pris en compte`
        );
        commands.push(command.data.toJSON());
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }
    });
  }
}
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
// and deploy your commands!

await (async () => {
  try {
    console.log(
      `[REFRESH TESTGUILD] Le rafraichissement de  ${commands.length} application (/) a commencé.`
    );
    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.APP_ID,
        process.env.GUILD_TEST_ID
      ),
      { body: commands }
    );

    console.log(
      `[REFRESH TESTGUILD] Le rafraichissement de ${data.length} applications a réussi.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

commands = commands.filter((element) => !developping.includes(element.name));

await (async () => {
  try {
    console.log(
      `[REFRESH ALL] Le rafraichissement de  ${commands.length} application (/) a commencé.`
    );
    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.APP_ID),
      { body: commands }
    );

    console.log(
      `[REFRESH ALL] Le rafraichissement de ${data.length} applications a réussi.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
