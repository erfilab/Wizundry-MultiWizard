const firebaseAdmin = require('firebase-admin');

const serviceAccount = require("./wizardofoz-b2c61-firebase-adminsdk-ltw9w-910969f592.json")
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
})

module.exports = firebaseAdmin