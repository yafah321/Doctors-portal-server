const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const bodyParser = require('body-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
const serviceAccount = require("./ema-john-b64e1-firebase-adminsdk-1zald-4fc6b84b83.json");
const { getAuth } = require('firebase-admin/auth');
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mycluster.lsbjo.mongodb.net/Oricadb?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(cors())
app.use(bodyParser.json())




admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


client.connect(err => {
  const collection = client.db("DoctorsPortalDB").collection("Appointments");
  console.log("database connected");
  app.post("/addBooking", (req, res) => {
    const book = req.body;
    console.log(book);
    res.send({ status: 200 });
    collection.insertOne(book);
  });

  app.get('/appointments', (req, res) => {
    const bearer = req.headers.authorization;

    const idToken = bearer.split(' ')[1];

    getAuth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;

        collection.find({ user: uid })
          .toArray((err, document) => {
            res.send(document);
          })


        // ...
      })
      .catch((error) => {
        console.log(error);
        res.status(401).send("Unothorized");
      });


  })
  app.delete('/delete/:id', (req,res)=> {
    const id = req.params.id;
    console.log(id, "trying to delete");
    collection.deleteOne({_id: ObjectId(id)})
    .then(result => {
        console.log(result);
    } )

  })


});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen( process.env.PORT || port, () => {
  console.log(`Example app listening on port ${port}`)
})