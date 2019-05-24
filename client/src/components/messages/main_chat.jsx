import './messages.scss';

import React from 'react';
import { Query, Subscription } from "react-apollo";
import Queries from "../../graphql/queries";
import Subscriptions from "../../graphql/subscriptions";
import CreateMessage from './create_message';
import { HeaderConsole } from './../main_page/header_console';
const { FETCH_CHANNEL } = Queries;
const { NEW_MESSAGE_SUBSCRIPTION, REMOVED_MESSAGE_SUBSCRIPTION } = Subscriptions;

class MainChat extends React.Component {
  render() {
    let channelId;
    if (!this.props.history) {
      channelId = "5ce2f5d2c902631a973f73e6";
    } else {
      channelId = this.props.history.location.pathname.split("/").slice(-1)[0];
    }

    return (
      <Query query={FETCH_CHANNEL} variables={{ id: channelId }}>
        {({ subscribeToMore, loading, error, data, refetch }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;
          if (!data) return null;
          if (!data.channel) return null;
          let channelName = data.channel.name;
          let allMessages = [].concat(data.channel.messages);
          let allMessagesIds = data.channel.messages.map(message => message._id);
          return (
            <Subscription
              subscription={NEW_MESSAGE_SUBSCRIPTION}
            >
              {({ data, loading }) => {
                const addedMessageData = data;
                return <Subscription
                  subscription={REMOVED_MESSAGE_SUBSCRIPTION}
                >{({ data, loading }) => {
                  const removedMessageData = data;

                  if (addedMessageData && !allMessagesIds.includes(addedMessageData.messageSent._id) &&
                    addedMessageData.messageSent.channel === this.props.history.location.pathname.slice(10)) {
                    allMessages.push(addedMessageData.messageSent);
                    allMessagesIds.push(addedMessageData.messageSent._id);
                  } else if (removedMessageData && allMessagesIds.includes(removedMessageData.messageRemoved._id) &&
                    removedMessageData.messageRemoved.channel === this.props.history.location.pathname.slice(10)) {
                    let removedMessageIdx = allMessagesIds.indexOf(removedMessageData.messageRemoved._id);
                    allMessages.splice(removedMessageIdx, 1);
                    allMessagesIds.splice(removedMessageIdx, 1);
                  }

                  return (
                    <div>
                      <HeaderConsole name={"#" + channelName}/>
                      <div className="main-chat-window">
                        <ul className="message-list">
                          {allMessages.map((message, idx) => (
                            <li className="message-element" key={idx}>
                              <div className="message-object">
                              <img className="message-pic" src={require('./pika.jpg')} alt="pika"/>
                                <div className="message-box">
                                  <div className="message-info">
                                    <p className="message-author">{message.author}</p>
                                    <p className="message-date">{message.date}</p>
                                  </div>
                                  <p className="message-body">{message.body}</p>
                                </div>
                              </div>

                              {/* <Mutation
                                mutation={DELETE_MESSAGE}
                                variables={{ id: message._id }}
                              >
                                {(deleteMessage, { data }) => {
                                    return <div>
                                      <form onSubmit={e => {e.preventDefault(); return deleteMessage(message._id)}}>
                                        <button type="submit">Remove Message</button>
                                      </form>
                                    </div>
                                  }
                                }
                              </Mutation> */}
                            </li>
                          ))}
                        </ul>
                        <CreateMessage />
                      </div>
                    </div>  
                  )  
                }}
                </Subscription>
              }}
            </Subscription>
          );
        }}
      </Query>
    )
  }
}


export default MainChat;