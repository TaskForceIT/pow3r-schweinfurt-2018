const animals = [
  "Hase",
  "Tapir",
  "Adler",
  "Tiger",
  "Bär",
  "Fuchs",
  "Biber",
  "Elefant",
  "Luchs",
  "Wolf",
  "Fisch",
  "Igel",
  "Springbock",
  "Seelöwe",
];

const adjectives = [
  "Schneller",
  "Fauler",
  "Süßer",
  "Aufgeregter",
  "Schläfriger",
  "Grimmiger",
  "Schlauer",
  "Wilder",
  "Schlauer",
  "Anspruchsvoller",
  "Feiner",
  "Fröhlicher",
  "Humorvoller",
  "Lebhafter",
  "Riesiger",
  "Zuverlässiger",
  "Prachtvoller",
  "Hübscher",
  "Sympathischer",
  "Leidenschaftlicher",
  "Fieser",
  "Flinker",
];

function getId() {
  const animalId = Math.floor(Math.random() * animals.length);
  const adjectiveId = Math.floor(Math.random() * adjectives.length);

  return adjectives[adjectiveId] + " " + animals[animalId];
}

function generateRandomId(clients) {
  let customId;
  let exists = [];

  do {
    customId = getId();
    exists = clients.filter(element => element.customId === customId);
  } while (exists.length);
  return customId;
}

module.exports = generateRandomId;
