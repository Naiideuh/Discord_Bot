import { InteractionResponseType } from "discord-interactions";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandMentionableOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "discord.js";
import "dotenv/config";
import QuickChart from "quickchart-js";

async function fetchAllMessages(channelId, client) {
  const channel = client.channels.cache.get(channelId);
  let messages = [];
  // Create message pointer
  let message = await channel.messages
    .fetch({ limit: 1 })
    .then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

  while (message) {
    await channel.messages
      .fetch({ limit: 100, before: message.id })
      .then((messagePage) => {
        messagePage.forEach((msg) => messages.push(msg));

        // Update our message pointer to be last message in page of messages
        message =
          0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
      });
  }
  return messages;
}

const STATSChoices = [
  {
    name: "deuxsemaines",
    value: "deuxsemaines",
  },
  {
    name: "mois",
    value: "mois",
  },
  {
    name: "annee",
    value: "annee",
  },
];

export const data = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("Affiche les stats d'un compte Discord")
  .addStringOption(
    new SlashCommandStringOption()
      .setName("temps")
      .setChoices(...STATSChoices)
      .setDescription("Indique l'intervalle de temps qu'il faut prendre")
      .setRequired(true)
  )
  .addUserOption(
    new SlashCommandUserOption()
      .setName("utilisateur")
      .setDescription("Utilisateur à tracer sur le serveur")
      .setRequired(true)
  );

export async function execute(interaction) {
  console.log("Début de la fonction -stats-");
  interaction.reply({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
    content: "Le résultat arrive, patiente !",
    ephemeral: true,
  });
  const choice = interaction.options._hoistedOptions[0].value;
  const Utilisateur = interaction.options._hoistedOptions[1];

  let pseudo;
  if (Utilisateur.member.nickname === null) {
    pseudo = Utilisateur.user.nickname;
  } else {
    pseudo = Utilisateur.member.nickname;
  }
  let constanteTemps;
  switch (choice) {
    case "jour":
      constanteTemps = 1000 * 24 * 60 * 60;
      break;
    case "deuxsemaines":
      constanteTemps = 1000 * 24 * 60 * 60 * 14;
      break;
    case "mois":
      constanteTemps = 1000 * 24 * 60 * 60 * 30;
      break;
    case "annee":
      constanteTemps = 1000 * 24 * 60 * 60 * 30 * 12;
      break;
    default:
      constanteTemps = 1000 * 24 * 60 * 60 * 30;
  }
  let elemtList;
  let listNomChannels = [];
  let userMessages = [];
  let ordonnee = [];
  let abscisse = [];
  let channelIdToSend = interaction.channel.id;
  await interaction.guild.channels.fetch().then(async (listChannels) => {
    for (let channel of listChannels) {
      if (channel[1].type == "0") {
        elemtList = {
          name: channel[1].name,
          id: channel[1].id,
          type: channel[1].type,
        };
        listNomChannels.push(elemtList);
      }
    }
    for (let channel of listNomChannels) {
      let messages = await fetchAllMessages(channel.id, interaction.client);
      for (let message of messages) {
        if (message.author.id == Utilisateur.value) {
          elemtList = {
            timestamp: message.createdTimestamp,
            channelId: message.channelId,
          };
          userMessages.push(elemtList);
        }
      }
    }
    let date;
    let dateFormat;
    for (
      let abscisseTimeStamp = interaction.guild.createdTimestamp;
      abscisseTimeStamp < interaction.createdTimestamp;
      abscisseTimeStamp += constanteTemps
    ) {
      dateFormat = new Date(abscisseTimeStamp);
      date =
        dateFormat.getDate() +
        "/" +
        (dateFormat.getMonth() + 1) +
        "/" +
        dateFormat.getFullYear();
      abscisse.push(date);
      ordonnee.push(
        userMessages.filter(
          (element) =>
            element.timestamp < abscisseTimeStamp + constanteTemps &&
            element.timestamp > abscisseTimeStamp
        ).length
      );
      let debug = {
        test: abscisseTimeStamp,
        temoin: interaction.createdTimestamp,
      };
      //console.log(debug)
    }
    //console.log("Date finie")

    // =================================== Message du nombre de messages par channel =============================================
    let contentMessage = `**Channels dans lesquels ${pseudo} est le plus actif :** \n >>> `;
    //console.log("Début du message")
    let messageParChannels = [];
    for (let i = 0; i < listNomChannels.length; i++) {
      let nomChannelId = listNomChannels[i].id;
      let channelMessage = userMessages.filter(
        (message) => message.channelId == nomChannelId
      );
      let elemt = {
        name: listNomChannels[i].name,
        count: channelMessage.length,
      };

      messageParChannels.push(elemt);
    }
    messageParChannels.sort(function (a, b) {
      return b.count - a.count;
    });
    for (let i = 0; i < 3; i++) {
      contentMessage = `${contentMessage}**${i + 1}.** ${
        messageParChannels[i].name
      } : ${messageParChannels[i].count}\n`;
    }

    // ============================== Graphe =======================================
    const chart = new QuickChart();
    chart
      .setConfig({
        type: "bar",
        data: {
          labels: abscisse,
          datasets: [{ label: "Messages", data: ordonnee }],
        },
      })
      .setWidth(800)
      .setHeight(400);
    const descriptionEmbed = `Graphe du nombre de messages en fonction du temps de ${pseudo}`;
    const Embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Graphe de message de " + pseudo)
      .setImage(chart.getUrl())
      .setDescription(contentMessage);
    let channel = interaction.client.channels.cache.find(
      (channel) => channel.id == channelIdToSend
    );
    channel.send({
      embeds: [Embed],
    });
    //console.log("Graphe terminée")
  });
}

export const category = 'utils'