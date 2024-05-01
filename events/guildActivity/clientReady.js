import { EmbedBuilder, Events, Guild } from "discord.js";
import {
  GuildSettingsDatabase,
  GuildMessagesByChannelDatabase,
} from "../../utils/database/MySQL.js";

export const name = Events.ClientReady;

export const once = false;

class GuildActivity {
  month = 0;
  hours = 0;
  seconds = 0;
  constructor() {
    this.month = 2;
    this.hours = new Date().hours;
    this.seconds = new Date().seconds;
  }

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

function tempsJusquA17h(date) {
  // Cloner la date pour éviter la modification de l'objet original
  var dateClone = new Date(date.getTime());

  // Définir l'heure à 17h
  dateClone.setHours(17, 0, 0, 0);

  // Calculer la différence en millisecondes
  var differenceEnMillisecondes = dateClone - date;

  return differenceEnMillisecondes;
}

export async function execute(readyClient) {
  var guildActivity = new GuildActivity();
  let date = new Date();
  let delayTime = tempsJusquA17h(date);
  setTimeout(() => {
    setInterval(() => {
      let now = new Date();
      console.log(guildActivity.month, now.getMonth());
      if (now.getMonth() != guildActivity.month) {
        guildActivity.month = now.getMonth;
        readyClient.guilds.cache.forEach(async (guild) => {
          let guildSettingsDatabase = new GuildSettingsDatabase();
          let activityChannel = (
            await guildSettingsDatabase.getGuildSettings(guild.id)
          ).activity_channel;
          console.log(activityChannel);
          guildSettingsDatabase.db.close();
          let guildMessagesByChannelDatabase =
            new GuildMessagesByChannelDatabase();
          if (activityChannel != null) {
            console.log("activityChannel found");
            let channels =
              await guildMessagesByChannelDatabase.getChannelsByGuildIdOrderByNumber(
                guild.id
              );
            console.log(" channels found");
            console.log(channels.length);
            let descriptionEmbed = `Voici le top 3 des channels avec le plus d'activités ce mois-ci :`;
            for (let i = 0; i < 3 && i < channels.length; i++) {
              if (channels[i] != null) {
                let channelClientCache = readyClient.channels.cache.find(
                  (channelFind) => channelFind.id == channels[i].channel_id
                )
                  ? readyClient.channels.cache.find(
                      (channelFind) => channelFind.id == channels[i].channel_id
                    )
                  : { name: null };
                descriptionEmbed += `\n${i + 1}. ${channelClientCache.name} : ${
                  channels[i].nbr_messages
                }`;
              }
            }
            console.log("Message send ");
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
          guildMessagesByChannelDatabase.deleteGuildChannels(guild.id);
          console.log("Messages deleted");
        });
      }
    }, 1000 * 60 * 60 * 24);
  }, delayTime);
}
