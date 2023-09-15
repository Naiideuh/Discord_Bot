import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("eval")
  .setDescription("Évalue un code javascript")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("code")
      .setDescription("Code à exécuter")
      .setRequired(true)
  );

export const category = "configs";

export async function execute(interaction) {
  if (interaction.member.id == "238282755119644672") {
    interaction.reply({
      content: `${eval(interaction.options._hoistedOptions)}`,
      ephemeral: true,
    });
  } else {
    interaction.reply({
      content: "Tu n'as pas le droit d'utiliser cette commande",
      ephemeral: true,
    });
  }
}
