import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
} from "discord.js";
import { Logger } from "../../utils/logger.js";
import {
  GuildSettingsDatabase,
  LevelSystemDatabase,
} from "../../utils/database/MySQL.js";

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
  )
  .addSubcommand((guild_activity_channel) =>
    guild_activity_channel
      .setName("guildactivitychannel")
      .addChannelOption((channel) =>
        channel
          .setName("channel")
          .setRequired(true)
          .setDescription("Channel pour afficher l'activité de la guilde")
          .addChannelTypes(ChannelType.GuildText)
      )
      .setDescription(
        "Choisis le channel défini pour afficher l'activité de la guilde"
      )
  )
  .addSubcommand((change_formula_levels) =>
    change_formula_levels
      .setName("changeformulalevels")
      .addNumberOption((base) =>
        base
          .setName("base")
          .setRequired(true)
          .setDescription("Base de la formule du niveau")
          .setMinValue(1)
          .setMaxValue(1000)
      )
      .addNumberOption((exponent) =>
        exponent
          .setName("exponent")
          .setRequired(true)
          .setDescription("Raison de la suite des niveaux")
          .setMinValue(1)
          .setMaxValue(1000)
      )
      .setDescription("Modifie la formule des niveaux des utilisateurs")
  )
  .addSubcommand((update_levels) =>
    update_levels
      .setName("updatelevels")
      .setDescription("Remets à jour les niveaux")
  );

export async function execute(interaction) {
  Logger.info(`Utilisation de la commande ${interaction.options._subcommand}`);
  switch (interaction.options._subcommand) {
    case "levelchannel":
      executeLevelChannel(interaction);
      break;
    case "voicechannelgenerator":
      executeVoiceChannelGenerator(interaction);
      break;
    case "guildactivitychannel":
      executeGuildActivityChannel(interaction);
      break;
    case "changeformulalevels":
      executeChangeFormulaLevels(interaction);
      break;
    case "updatelevels":
      executeUpdateLevels(interaction);
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
  var guildSettingsDatabase = new GuildSettingsDatabase();
  try {
    let guildSettings = await guildSettingsDatabase.getGuildSettings(
      interaction.member.guild.id
    );
    if (!guildSettings) {
      guildSettingsDatabase.createGuildSettingsRow(interaction.member.guild.id);
    }
    await guildSettingsDatabase.updateGuildSettingsLevelChannel(
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
  var guildSettingsDatabase = new GuildSettingsDatabase();
  try {
    let guildSettings = await guildSettingsDatabase.getGuildSettings(
      interaction.member.guild.id
    );
    if (!guildSettings) {
      guildSettingsDatabase.createGuildSettingsRow(interaction.member.guild.id);
    }
    await guildSettingsDatabase.updateGuildSettingsVoiceChannelGenerator(
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

async function executeGuildActivityChannel(interaction) {
  var guildSettingsDatabase = new GuildSettingsDatabase();
  try {
    let guildSettings = await guildSettingsDatabase.getGuildSettings(
      interaction.member.guild.id
    );
    if (!guildSettings) {
      guildSettingsDatabase.createGuildSettingsRow(interaction.member.guild.id);
    }
    await guildSettingsDatabase.updateGuildSettingsGuildActivityChannel(
      interaction.options._hoistedOptions[0].channel.id,
      interaction.member.guild.id
    );
  } catch (e) {
    console.log(
      `[GAMEBOT_SETTINGS] Erreur pendant le changement de guildd_activity_channel pour la guilde ${interaction.member.guild.id}`
    );
  } finally {
    interaction.reply({
      content: `Settings appliqué`,
      ephemeral: true,
    });
  }
}

async function executeChangeFormulaLevels(interaction) {
  var guildSettingsDatabase = new GuildSettingsDatabase();
  try {
    let guildSettings = await guildSettingsDatabase.getGuildSettings(
      interaction.member.guild.id
    );
    if (!guildSettings) {
      guildSettingsDatabase.createGuildSettingsRow(interaction.member.guild.id);
    }
    let formula = JSON.stringify({
      base: interaction.options._hoistedOptions[0].value,
      exponent: interaction.options._hoistedOptions[1].value,
    });
    await guildSettingsDatabase.updateGuildSettingsFormula(
      formula,
      interaction.member.guild.id
    );
  } catch (e) {
    console.log(
      `[GAMEBOT_SETTINGS] Erreur pendant le changement de formula pour la guilde ${interaction.member.guild.id}`
    );
  } finally {
    interaction.reply({
      content: `Settings appliqué`,
      ephemeral: true,
    });
  }
}

async function executeUpdateLevels(interaction) {
  var levelSystemDatabase = new LevelSystemDatabase();
  let users = (await levelSystemDatabase.getUsers(interaction.guild.id))[0];
  var guildSettingsDatabase = new GuildSettingsDatabase();
  let guildSettings = await guildSettingsDatabase.getGuildSettings(
    interaction.guild.id
  );
  let levelChannelId = guildSettings.level_channel;
  let formula = JSON.parse(guildSettings.formula);
  const base = formula.base;
  const exponent = formula.exponent;
  let Embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`Réinitialisation des niveaux`)
    .setDescription("Les niveaux de tous les utilisateurs ont été remis à zéro")
    .setTimestamp(new Date().getTime());
  let levelChannel = interaction.client.channels.cache.find(
    (channel) => channel.id == levelChannelId
  );
  levelChannel.send({ embeds: [Embed] });
  for (let user of users) {
    const user_id = user.user_id;
    const guild_id = guildSettings.guild_id;
    await levelSystemDatabase.setUserLevel(user_id, guild_id, 1);
    let userDatas = await levelSystemDatabase.getUserById(user_id, guild_id);
    while (userDatas.points + 1 >= base * exponent ** userDatas.level) {
      await levelSystemDatabase.increaseUserLevel(user_id, guild_id);
      let userClientFetched = interaction.client.users.cache.find(
        (userCache) => userCache.id == user_id
      );
      Embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Bravo pour le passage de niveau !`)
        .setDescription(
          `Félicitations à <@${user_id}> pour être passé au niveau ${
            userDatas.level + 1
          }
              \nTu comptabilises un total de ${userDatas.points + 1} points
              \nProchain niveau à ${
                base * exponent ** (userDatas.level + 1)
              } points`
        )
        .setThumbnail(
          userClientFetched ? userClientFetched.displayAvatarURL() : null
        )
        .setTimestamp(new Date().getTime());
      levelChannel.send({ embeds: [Embed] });
      userDatas = await levelSystemDatabase.getUserById(user_id, guild_id);
    }
  }
  interaction.reply({
    content: `Mise à niveau terminée`,
    ephemeral: true,
  });
}
