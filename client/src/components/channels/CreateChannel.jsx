import React, { Component } from "react";
import { Mutation } from "react-apollo";
import { Link } from 'react-router-dom';
import Mutations from "../../graphql/mutations";
import Queries from "../../graphql/queries";
const { CREATE_CHANNEL } = Mutations;
const { CREATE_CHANNELS, FETCH_CHANNELS } = Queries;

class CreateChannel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      name: ""
    };
  }

  update(field) {
    return e => this.setState({ [field]: e.target.value });
  }

  updateCache(cache, { data }) {
    let channels;
    try {
      channels = cache.readQuery({ query: CREATE_CHANNELS });
    } catch (err) {
      return;
    }
    
    if (channels) {
      let channelArray = channels.channels;
      let newChannel = data.createChannel;
      cache.writeQuery({
        query: CREATE_CHANNELS,
        data: { channels: channelArray.concat(newChannel) }
      });
    }
  }

  handleSubmit(e, createChannel) {
    e.preventDefault();
    let name = this.state.name;
    createChannel({
      variables: {
        name: name,
      }
    });
  }

  render() {
    return (
      <Mutation
        mutation={CREATE_CHANNEL}
        onError={err => this.setState({ message: err.message })}
        update={(cache, data) => this.updateCache(cache, data)}
        onCompleted={data => {
          this.setState({
            message: `made channel`
          });
        }}
        refetchQueries={() => [{ query: FETCH_CHANNELS }]}
      >
        {(createChannel, { data }) => (
          <div className="channel-index-create-container">
            <div className="channel-index-create">
              <div className="exit-div">
                <div className="exit-box">
                  <a className="channel-index-exit" href={`/#/mainchat/`}>&#215;</a><br />
                  <p className="esc" >esc</p>
                </div>
              </div>  
              <h3 className="channel-index-header">Create a new channel</h3>
              <p>Give your new channel a descriptive name related to the topic of conversation. </p>
              <form className="channel-button-box channel-new-name-container" onSubmit={e => this.handleSubmit(e, createChannel)}>
                <input
                  className="channel-detail-box channel-new-name"
                  onChange={this.update("name")}
                  value={this.state.name}
                  placeholder="Name"
                />
                <button className="create-channel-button" type="submit">Create Channel</button>
              </form>
              {this.state.message ? <p>New channel {this.state.name} was created successfully, go back to the <Link to="/channels/">channels index</Link> to join the channel.</p>: null}
            </div>
          </div>
        )}
      </Mutation>
    );
  }
}

export default CreateChannel;
