import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

import { discordbot_Database } from "../../utils/database/MySQL.js";

export const data = new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .setName("gamebotsettings")
  .setDescription("Ouvre le panneau pour configurer")
  .addSubcommand((level_channel) =>
    level_channel
      .setName("levelchannel")
      .addChannelOption((channel) =>
        channel
          .setName("channel")
          .setRequired(true)
          .setDescription(
            "Channel dans lequel les notifications de niveaux seront envoyées"
          )
          .addChannelTypes(ChannelType.GuildText)
      )
      .setDescription(
        "Choisis le channel pour envoyer les notifications de niveaux"
      )
  )
  .addSubcommand((voiceChannel_generator) =>
    voiceChannel_generator
      .setName("voicechannelgenerator")
      .addChannelOption((channel) =>
        channel
          .setName("channel")
          .setRequired(true)
          .setDescription("Channel pour créer des channels vocaux privés")
          .addChannelTypes(ChannelType.GuildVoice)
      )
      .setDescription(
        "Choisis le channel défini pour créer des channels vocaux privés"
      )
  );

export async function execute(interaction) {
  switch (interaction.options._subcommand) {
    case "levelchannel":
      executeLevelChannel(interaction);
      break;
    case "voicechannelgenerator":
      executeVoiceChannelGenerator(interaction);
      break;
    default:
      interaction.reply({
        content: "Cette commande n'a pas été implémentée",
        ephemeral: true,
      });
      break;
  }
}

export const category = "configs";

async function executeLevelChannel(interaction) {
  var SQLDatabase = new discordbot_Database();
  try {
    let guildSettings = (
      await SQLDatabase.getGuildSettings(interaction.member.guild.id)
    )[0][0];
    if (!guildSettings) {
      SQLDatabase.createGuildSettingsRow(interaction.member.guild.id);
    }
    console.log(interaction.options._hoistedOptions[0].channel);
    await SQLDatabase.updateGuildSettingsLevelChannel(
      interaction.options._hoistedOptions[0].channel.id,
      interaction.member.guild.id
    );
  } catch (e) {
    console.log(
      `[GAMEBOT_SETTINGS] Erreur pendant le changement de level_channel pour la guilde ${interaction.member.guild.id}`
    );
  } finally {
    interaction.reply({
      content: `Settings appliqué`,
      ephemeral: true,
    });
  }
}

async function executeVoiceChannelGenerator(interaction) {
  var SQLDatabase = new discordbot_Database();
  try {
    let guildSettings = (
      await SQLDatabase.getGuildSettings(interaction.member.guild.id)
    )[0][0];
    if (!guildSettings) {
      SQLDatabase.createGuildSettingsRow(interaction.member.guild.id);
    }
    await SQLDatabase.updateGuildSettingsVoiceChannelGenerator(
      interaction.options._hoistedOptions[0].channel.id,
      interaction.member.guild.id
    );
  } catch (e) {
    console.log(
      `[GAMEBOT_SETTINGS] Erreur pendant le changement de voiceChannel_generator pour la guilde ${interaction.member.guild.id}`
    );
  } finally {
    interaction.reply({
      content: `Settings appliqué`,
      ephemeral: true,
    });
  }
}
