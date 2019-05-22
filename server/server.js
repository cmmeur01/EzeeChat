const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const db = require("../config/keys.js").MONGO_URI;
const expressGraphQL = require("express-graphql");
const cors = require('cors');
const User = require("./models/User");
const Channel = require("./models/Channel");
const Message = require("./models/Message");
const DirectMessage = require("./models/DirectMessage");
const schema = require("./schema/schema");
const app = express();

const  { ApolloServer, gql } = require('apollo-server-express');

const  { execute, subscribe } = require('graphql');
const  { createServer } = require('http');
const  { SubscriptionServer } = require('subscriptions-transport-ws');

if (!db) {
  throw new Error("You must provide a string to connect to mLab");
}

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));

app.use(bodyParser.json());
app.use(cors());

app.use(
  "/graphql",
  expressGraphQL(req => {
    return {
      schema,
      context: {
        token: req.headers.authorization
      },
      graphiql: true
    };
  })
);

// Wrap the Express server
const PORT = 4000;
const ws = createServer(app);
ws.listen(PORT, () => {
  console.log(`Web Socket Server is now running on http://localhost:${PORT}`);
  // Set up the WebSocket for handling GraphQL subscriptions
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
  }, {
      server: ws,
      path: '/subscriptions',
    });
});

module.exports = app;