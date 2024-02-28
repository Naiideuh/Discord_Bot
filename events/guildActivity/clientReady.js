import { EmbedBuilder, Events, Guild } from "discord.js";
import {
  discordbot_Database,
  GuildMessagesByChannelDatabase,
} from "../../utils/database/MySQL.js";

export const name = Events.ClientReady;

export const once = false;

class guildActivity {
  month = 0;
  seconds = 0;
  constructor() {}

  setMonth(month) {
    this.month = month;
  }

  setSeconds(seconds) {
    this.seconds = seconds;
  }
}

export async function execute(readyClient) {
  const nowGlobal = new Date();
  var guildActivityMonth = new guildActivity();
  let timer = setInterval(() => {
    const now = new Date();
    if (now.getMonth() != guildActivityMonth.month) {
      guildActivityMonth.setMonth(now.getMonth());

      readyClient.guilds.cache.forEach(async (guild) => {
        let guildSettingsDatabase = new discordbot_Database();
        let activityChannel = (
          await guildSettingsDatabase.getGuildSettings(guild.id)
        )[0][0].activity_channel;
        guildSettingsDatabase.db.close();

        let guildMessagesByChannelDatabase =
          new GuildMessagesByChannelDatabase();
        let channels = (
          await guildMessagesByChannelDatabase.getChannelsByGuildIdOrderByNumber(
            guild.id
          )
        )[0];
        guildMessagesByChannelDatabase.db.close();

        let descriptionEmbed = `Voici le top 3 des channels avec le plus d'activités ce mois-ci :`;
        for (let channel of channels) {
          if (channel != null) {
            let channelType = readyClient.channels.cache.find(
              (channelFind) => channelFind.id == channel.channel_id
            );
            descriptionEmbed += `\n${channelType.name} : ${channel.nbr_messages}`;
          }
        }
        const Embed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(
            "Activité des channels ce mois ci pour la guilde " + guild.name
          )
          .setDescription(descriptionEmbed);

        readyClient.channels.cache
          .find((channel) => channel.id == activityChannel)
          .send({
            embeds: [Embed],
          });
      });
    }
  }, 1000 * 60 * 60 * 24);
}
