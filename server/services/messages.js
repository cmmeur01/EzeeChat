const jwt = require("jsonwebtoken");
const key = require("../../config/keys").secretOrKey;
const User = require("../models/User");
const Message = require("../models/Message");
const pubsub = require('../schema/pubsub');
const channelService = require('./channels');

const addMessage = async (data, context) => {
  const token = context.token;
  const { body, channel } = data;

  const decoded = jwt.verify(token, key);
  const { id } = decoded;
  if (id) {
    let message = new Message({
      user_id: id,
      channel,
      body,
    });

    await message.save();
    await channelService.addChannelMessage({_id: channel, message: message}, context);
    
    await pubsub.publish('MESSAGE_SENT', { messageSent: message });

    return message;
  } else {
    throw new Error (
      "Sorry, you need to be logged in to send a message."
    );
  }
};

const updateMessage = async ({ id, body }) => {
  
  const updateObj = {};

  if (id) updateObj.id = id;
  if (body) updateObj.body = body;

  return Message.findOneAndUpdate({ _id: id }, { $set: updateObj }, { new: true }, (err, message) => {
    return message;
  });
};

module.exports = { addMessage, updateMessage };
