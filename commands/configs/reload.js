import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("reload")
  .setDescription("Reloads a command.")
  .addStringOption((option) =>
    option
      .setName("command")
      .setDescription("The command to reload.")
      .setRequired(true)
  );

export async function execute(interaction) {
  const commandName = interaction.options
    .getString("command", true)
    .toLowerCase();
  const command = interaction.client.commands.get(commandName);

  if (!command) {
    return interaction.reply(
      `There is no command with name \`${commandName}\`!`
    );
  }

  //delete require.cache[
  //  require.resolve(`../${command.category}/${command.data.name}.js`)
  //];

  try {
    interaction.client.commands.delete(command.data.name);
    await import(`../${command.category}/${command.data.name}.js`).then(
      async (newCommand) => {
        interaction.client.commands.set(newCommand.data.name, newCommand);
        await interaction.reply({
          content: `[RELOAD] La commande \`${newCommand.data.name}\` a été rechargée`,
          ephemeral: true,
        });
      }
    );
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: `[RELOAD] Il y a eu un problème avec le reload de \`${command.data.name}\`:\n\`${error.message}\``,
      ephemeral: true,
    });
  }
}

export const category = "configs";
