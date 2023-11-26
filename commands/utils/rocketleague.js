import { ActionRowBuilder, SlashCommandBuilder } from "discord.js";
import fetch from "node-fetch";

export const data = new SlashCommandBuilder()
  .setName("rocketleague")
  .setDescription("Donne des informations sur un compte Rocket League")
  .addStringOption((option) =>
    option
      .setName("pseudo")
      .setDescription("Pseudo Epic de la personne")
      .setRequired(true)
  );

export const category = "utils";

export async function execute(interaction) {
  console.log(interaction.options._hoistedOptions[0].value);
  const url = `https://rocket-league1.p.rapidapi.com/ranks/${interaction.options._hoistedOptions[0].value}`;
  const options = {
    method: "GET",
    headers: {
      "User-Agent": "RapidAPI Playground",
      "Accept-Encoding": "identity",
      "X-RapidAPI-Key": "d4f5e5d152msh219ea7df45d0800p16e951jsn80817e8903c4",
      "X-RapidAPI-Host": "rocket-league1.p.rapidapi.com",
    },
  };

  try {
    const result = await fetch(url, options);
    //const result = await response.text();
    console.log(result);
    if (typeof result != "string") return;
    const buttons = new ActionRowBuilder();
    const object = JSON.parse(result);
    //const object = Object.assign({}, result);

    for (let option of object)
      buttons.addComponents(
        new ButtonBuilder()
          .setCustomId(option)
          .setStyle("Secondary")
          .setLabel(option)
      );
  } catch (error) {
    console.error(error);
  }
  interaction.reply({
    content: `Option : ${interaction.options.pseudo}`,
    components: [buttons],
  });
}
