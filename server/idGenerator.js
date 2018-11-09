let animals = [
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
  "Seelöwe"
];

let adjectives = [
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
  "Flinker"
];

function getId() {
  let animalId = Math.floor(Math.random() * animals.length);
  let adjectiveId = Math.floor(Math.random() * adjectives.length);

  return adjectives[adjectiveId] + " " + animals[animalId];
}

function generateRandomId() {
  let customId;
  let exists = [];

  do {
    customId = getId();
    exists = clients.filter(element => element.customId === customId);
  } while (exists.length);
  return customId;
}

module.exports = generateRandomId;
