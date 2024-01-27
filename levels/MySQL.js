import mysql from "mysql";
const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "discordbot_db",
});

export async function database(action) {
  console.log("..........: Connexion à MySQL");
  if (action == "open") {
    db.connect((error) => {
      if (error) {
        console.log("Erreur au moment de la connexion avec la Database MySQL");
        console.log(error);
        return;
      }
      console.log("..........: Connexion établie");
      return;
    });
  } else if (action == "close") {
    db.end((error) => {});
    console.log("..........: Connexion fermée");
    return;
  }
}
