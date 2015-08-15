import db = require('../../literki/scripts/db');

var fileName = process.argv[2];
console.log(`Importowanie pliku ${fileName}`);

var repo = new db.GameRepository();
repo.open();

process.exit();