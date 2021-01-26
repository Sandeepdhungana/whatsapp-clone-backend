// importing all the stuffs
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import Messages from "./dbMessages.js";
import cors from 'cors';

import bodyParser from "body-parser";
// app config
const app = express();
const port = process.env.PORT || 9000;
 
const pusher = new Pusher({
  appId: "1144413",
  key: "6043636d27d17345afc8",
  secret: "abc0d15da2aae48afe48",
  cluster: "eu",
  useTLS: true,
});

// middleware
app.use(bodyParser.json());
// for setting headers.
app.use(cors());

// DB config
const connection_url =
  "mongodb+srv://sandeepdhungana:sandeep@cluster0.2gxq6.mongodb.net/whatsappdb?retryWrites=true&w=majority";
mongoose.connect(connection_url, {
  useNewUrlParser: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Db is connected");

  const msgCollection = db.collection("messagecontents");
  const changeStream = msgCollection.watch();
  changeStream.on("change", (change) => {
    console.log(change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      console.log(messageDetails);
      pusher.trigger("message", "inserted", {
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp:messageDetails.timestamp,
        received: messageDetails.received,
      });
    } else {
      console.log("Error in pusher.");
    }
  });
});

// ????

// api routes
app.get("/", (req, res) => res.status(200).send("Hello world!"));

app.get("/messages/sync", (req, res) => {
  Messages.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.post("/messages/new", (req, res) => {
  const dbMessage = req.body;

  Messages.create(dbMessage, (err, data) => {
    if (err) {
      console.log("error in creating data.");
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

// listen
app.listen(port, () => console.log(`Listening on local host ${port}`));

// patthar k sanam
