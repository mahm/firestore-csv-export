const admin = require('firebase-admin')
const fs = require('fs')
const Json2csvParser = require('json2csv').Parser

const serviceAccount = require('./service_account_key.json')
const config = require('./config')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: config.databaseURL
});

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true })

let data  = {};
const collectionName = process.argv[2];
data[collectionName] = [];

const json2csvParser = new Json2csvParser({ fields: config.fields })

// Retrieve data from firestore
db.collection(collectionName).get()
  .then(snapshot => {
    snapshot.forEach(doc => {
      if (config.validData(doc.data())) {
        data[collectionName].push({ id: doc.id, ...doc.data() });
      }
    })
    // Convert to csv format
    const csv = json2csvParser.parse(data[collectionName])

    // Write csv to file
    fs.writeFile('firestore-export.csv', csv, (error) => {
      if (error) {
        return console.log(error);
      }
      console.log('export successed! -> firestore-export.csv')
    })
  })
  .catch(error => {
    console.log(error);
  });

