import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

import mysql from "mysql";

import { db } from "../../levels/MySQL.js";

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
  try {
    db.query(
      `select * from guild_settings where guild_id = ${interaction.member.guild.id}`,
      (error, result) => {
        if (result.length == 0) {
          db.query(
            `insert into guild_settings (guild_id) value (${interaction.member.guild.id})`
          );
        }

        db.query(
          `update guild_settings set level_channel = ${interaction.options._hoistedOptions[0].channel.id} where guild_id = ${interaction.member.guild.id}`
        );
      }
    );
  } catch (e) {
    console.log(
      `[SETTINGS] Erreur pendant le changement de level_channel pour la guilde ${interaction.member.guild.id}`
    );
  } finally {
    interaction.reply({
      content: `Settings appliqué`,
      ephemeral: true,
    });
  }
}

async function executeVoiceChannelGenerator(interaction) {
  try {
    db.query(
      `select * from guild_settings where guild_id = ${interaction.member.guild.id}`,
      (error, result) => {
        if (result.length == 0) {
          db.query(
            `insert into guild_settings (guild_id) value (${interaction.member.guild.id})`
          );
        }
        db.query(
          `update guild_settings set voiceChannel_generator = ${interaction.options._hoistedOptions[0].channel.id} where guild_id = ${interaction.member.guild.id}`
        );
      }
    );
  } catch (e) {
    console.log(
      `[SETTINGS] Erreur pendant le changement de voiceChannel_generator pour la guilde ${interaction.member.guild.id}\n${e}`
    );
  } finally {
    interaction.reply({
      content: `Settings appliqué`,
      ephemeral: true,
    });
  }
}
