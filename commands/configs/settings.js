import {
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  //  .setDefaultMemberPermissions(0)
  .setName("gamebotsettings")
  .setDescription("Ouvre le panneau pour configurer")
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("levelchannel")
      .addChannelOption(
        new SlashCommandChannelOption()
          .setName("channel")
          .setRequired(true)
          .setDescription(
            "Channel dans lequel les notifications de niveaux seront envoyées"
          )
      )
      .setDescription(
        "Choisis le channel pour envoyer les notifications de niveaux"
      )
  );

export async function execute(interaction) {
  console.log(interaction.options._hoistedOptions.channel);
  interaction.reply({
    content: `Essai : ${interaction.options._hoistedOptions}`,
  });
}

export const category = 'configs'
