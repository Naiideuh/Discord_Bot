import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
} from "discord.js";

import mysql from "mysql";

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "discordbot",
});

export const data = new SlashCommandBuilder()
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
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
          .addChannelTypes(ChannelType.GuildText)
      )
      .setDescription(
        "Choisis le channel pour envoyer les notifications de niveaux"
      )
  );

export async function execute(interaction) {
  console.log(interaction.options._hoistedOptions[0].channel.id);
  interaction.reply({
    content: `Settings appliqué`,
  });

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
}

export const category = "configs";
