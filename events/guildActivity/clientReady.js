import { EmbedBuilder, Events, Guild } from "discord.js";
import {
  discordbot_Database,
  GuildMessagesByChannelDatabase,
} from "../../utils/database/MySQL.js";

export const name = Events.ClientReady;

export const once = false;

class guildActivity {
  month = 0;
  hours = 0;
  seconds = 0;
  constructor() {}

  setMonth(month) {
    this.month = month;
  }

  setSeconds(seconds) {
    this.seconds = seconds;
  }

  setHours(hours) {
    this.hours = hours;
  }
}

export async function execute(readyClient) {
  const nowGlobal = new Date();
  var guildActivityMonth = new guildActivity();
  let timer = setInterval(() => {
    const now = new Date();
    console.log(guildActivityMonth.hours, now.getHours());
    if (now.getHours() != guildActivityMonth.hours) {
      guildActivityMonth.setMonth(now.getMonth());
      guildActivityMonth.setHours(now.getHours());

      readyClient.guilds.cache.forEach(async (guild) => {
        let guildSettingsDatabase = new discordbot_Database();
        let activityChannel = (
          await guildSettingsDatabase.getGuildSettings(guild.id)
        )[0][0].activity_channel;
        console.log(activityChannel);
        guildSettingsDatabase.db.close();

        if (activityChannel != null) {
          let guildMessagesByChannelDatabase =
            new GuildMessagesByChannelDatabase();
          let channels = (
            await guildMessagesByChannelDatabase.getChannelsByGuildIdOrderByNumber(
              guild.id
            )
          )[0];
          console.log(channels);
          guildMessagesByChannelDatabase.db.close();

          let descriptionEmbed = `Voici le top 3 des channels avec le plus d'activités ce mois-ci :`;
          for (let i = 0; i < 3 || channels.length; i++) {
            if (channels[i] != null) {
              let channelClientCache = readyClient.channels.cache.find(
                (channelFind) => channelFind.id == channels[i].channel_id
              );
              descriptionEmbed += `\n${i + 1}. ${channelClientCache.name} : ${
                channels[i].nbr_messages
              }`;
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
        }
      });
    }
  }, 1000 * 5);
}
