import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong !");

export const category = "utils";

export async function execute(interaction) {
  const sent = await interaction.reply({
    content: "Pinging...",
    fetchReply: true,
  });
  interaction.editReply(
    `Pong !\nRoundtrip latency: ${
      sent.createdTimestamp - interaction.createdTimestamp
    }ms`
  );
}
