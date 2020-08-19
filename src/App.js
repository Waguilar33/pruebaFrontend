import React from "react";
import "./App.css";
import TagsInput from "./TagsInput";
const crypto = require("crypto");
var axios = require("axios");

// function App() {
class App extends React.Component {
  state = {
    key: "will",
    secret: "prueba",
    message: "",
    selectedTags: {},
    id: "",
    messageFromServer: {},
    tag: "",
    messagesFromServer: {},

    successCredentials: false,
    successCredentialsMessage: "",
    errorCredentials: false,
    errorCredentialsMessage: "",

    successSave: false,
    successSaveMessage: "",
    errorSave: false,
    errorSaveMessage: "",
  };

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form was submitted");
  };

  handleSubmitCredentials = (e) => {
    e.preventDefault();
    var self = this;

    // simple validations
    if (!this.state.key) {
      self.setState({ errorCredentials: true });
      self.setState({ errorCredentialsMessage: "The key cannot be empty" });
      return;
    }

    // simple validations
    if (!this.state.secret) {
      self.setState({ errorCredentials: true });
      self.setState({
        errorCredentialsMessage: "The shared secret cannot be empty",
      });
      return;
    }

    // reset possible errores
    self.setState({ successCredentials: false });
    self.setState({ successCredentialsMessage: "" });
    self.setState({ errorCredentials: false });
    self.setState({ errorCredentialsMessage: "" });

    var config = {
      method: "put",
      url: "http://localhost:3333/api/credential",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        key: this.state.key,
        shared_secret: this.state.secret,
      },
    };

    axios(config)
      .then(function (response) {
        // set success message
        self.setState({ successCredentials: true });
        self.setState({
          successCredentialsMessage: "Credentials saved in the server",
        });
      })
      .catch(function (error) {
        // console.log("aqui");
        if (error.response.status === 403) {
          self.setState({ errorCredentials: true });
          self.setState({ errorCredentialsMessage: error.response.data });
        }
      });

    // console.log("Form was submitted");
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onKeyPress(event) {
    if (event.which === 13 /* Enter */) {
      event.preventDefault();
    }
  }

  selectedTags = (tags) => {
    this.setState({ selectedTags: tags });
  };

  generateSignature = (xRoute, params = null, query = null) => {
    // Data to be signed
    var data = [];
    data.push(xRoute);

    // adds they key/value when params exists
    if (params) {
      for (let key in params) {
        data.push(key);
        data.push(params[key]);
      }
    }

    // adds they key/value when query string exists
    if (query) {
      for (let key in query) {
        data.push(key);
        data.push(query[key]);
      }
    }

    var lexicographicalSorted = data.sort((a, b) => a.localeCompare(b));
    var string = lexicographicalSorted.join([";"]);

    var computedSignature = crypto
      .createHmac("sha256", this.state.secret)
      .update(string)
      .digest("hex");
    console.log(computedSignature);
    return computedSignature;
  };

  handleSendMessage = (e) => {
    e.preventDefault();
    var self = this;

    // simple validations
    if (!this.state.key) {
      self.setState({ errorSave: true });
      self.setState({
        errorSaveMessage: "The key field must be filled in order to continue",
      });
      return;
    }

    if (!this.state.secret) {
      self.setState({ errorSave: true });
      self.setState({
        errorSaveMessage:
          "The secret field must be filled in order to continue",
      });
      return;
    }

    // simple validations
    if (!this.state.message) {
      self.setState({ errorSave: true });
      self.setState({ errorSaveMessage: "The message cannot be empty" });
      return;
    }

    // simple validations
    if (Object.keys(this.state.selectedTags).length === 0) {
      self.setState({ errorSave: true });
      self.setState({ errorSaveMessage: "At least one tag must be added" });
      return;
    }

    // reset possible errores
    self.setState({ successSave: false });
    self.setState({ successSaveMessage: "" });
    self.setState({ errorSave: false });
    self.setState({ errorSaveMessage: "" });

    var signature = this.generateSignature("message");

    var config = {
      method: "post",
      url: "http://localhost:3333/api/message",
      headers: {
        "X-Key": this.state.key,
        "X-Route": "message",
        "X-Signature": signature,
        "Content-Type": "application/json",
      },
      data: {
        msg: this.state.message,
        tags: this.state.selectedTags,
        // tags: ["javascript", "react", "job"],
      },
    };

    axios(config)
      .then(function (response) {
        // set success message
        self.setState({ successSave: true });
        self.setState({
          successSaveMessage:
            "Message saved in the server with the id: " + response.data,
        });

        // clean variables
        self.setState({ message: "" });
        self.setState({ selectedTags: {} });
      })
      .catch(function (error) {
        if (error.response.status === 403) {
          self.setState({ errorSave: true });
          self.setState({ errorSaveMessage: error.response.data });
        }
      });
  };

  handleGetMessage = (e) => {
    e.preventDefault();
    var self = this;

    // simple validations
    if (!this.state.key) {
      self.setState({ errorGet: true });
      self.setState({
        errorGetMessage: "The key field must be filled in order to continue",
      });
      return;
    }

    // simple validations
    if (!this.state.secret) {
      self.setState({ errorGet: true });
      self.setState({
        errorGetMessage: "The secret field must be filled in order to continue",
      });
      return;
    }

    // simple validations
    if (!this.state.id) {
      self.setState({ errorGet: true });
      self.setState({ errorGetMessage: "The id cannot be empty" });
      return;
    }

    // reset possible errores
    self.setState({ successGet: false });
    self.setState({ successGetMessage: "" });
    self.setState({ errorGet: false });
    self.setState({ errorGetMessage: "" });

    var signature = this.generateSignature("message", { id: this.state.id });

    var config = {
      method: "get",
      url: `http://localhost:3333/api/message/${this.state.id}`,
      headers: {
        "X-Key": this.state.key,
        "X-Route": "message",
        "X-Signature": signature,
      },
    };

    axios(config)
      .then(function (response) {
        // set success message
        self.setState({ successGet: true });

        // if (response.data instanceof String) {
        //   self.setState({
        //     successGetMessage: esponse.data
        //   });
        // } else {
        self.setState({ messageFromServer: response.data });
        // }
        // console.log(response);

        // clean variables
        self.setState({ id: "" });
      })
      .catch(function (error) {
        if (error.response.status === 403) {
          self.setState({ errorGet: true });
          self.setState({ errorGetMessage: error.response.data });
        }
      });
  };

  handleGetTagMessages = (e) => {
    e.preventDefault();
    var self = this;

    // simple validations
    if (!this.state.key) {
      self.setState({ errorGet: true });
      self.setState({
        errorGetMessage: "The key field must be filled in order to continue",
      });
      return;
    }

    // simple validations
    if (!this.state.secret) {
      self.setState({ errorGet: true });
      self.setState({
        errorGetMessage: "The secret field must be filled in order to continue",
      });
      return;
    }

    // simple validations
    if (!this.state.tag) {
      self.setState({ errorGet: true });
      self.setState({ errorGetMessage: "The tag cannot be empty" });
      return;
    }

    // reset possible errores
    self.setState({ successTag: false });
    self.setState({ successTagMessage: "" });
    self.setState({ errorTag: false });
    self.setState({ errorTagMessage: "" });

    var signature = this.generateSignature("messages", { tag: this.state.tag });

    var config = {
      method: "get",
      url: `http://localhost:3333/api/messages/${this.state.tag}`,
      headers: {
        "X-Key": this.state.key,
        "X-Route": "messages",
        "X-Signature": signature,
      },
    };

    axios(config)
      .then(function (response) {
        // set success message
        self.setState({ successTag: true });

        // if (response.data instanceof String) {
        //   self.setState({
        //     successGetMessage: esponse.data
        //   });
        // } else {
        self.setState({ messagesFromServer: response.data });
        // }
        // console.log(response);

        // clean variables
        self.setState({ tag: "" });
      })
      .catch(function (error) {
        if (error.response.status === 403) {
          self.setState({ errorTag: true });
          self.setState({ errorTagMessage: error.response.data });
        }
      });
  };

  render() {
    return (
      <div className="App">
        <div className="container py-3">
          <h1>Messages Frontend</h1>

          <div className="row mb-5">
            <div className="col">
              <div className="card bg-light">
                <div className="card-header">PUT credentials</div>
                <div className="card-body">
                  <form onSubmit={this.handleSubmitCredentials}>
                    <div className="form-group">
                      <label>Key:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="key"
                        placeholder="Enter a key"
                        value={this.state.key}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Shared Secret:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="secret"
                        placeholder="Enter a secret key"
                        value={this.state.secret}
                        onChange={this.handleChange}
                      />
                    </div>
                    <button className="btn btn-primary">
                      Send credentials
                    </button>
                  </form>
                  <div
                    className="alert alert-primary mt-3"
                    style={
                      this.state.successCredentials ? {} : { display: "none" }
                    }
                    role="alert"
                  >
                    {this.state.successCredentialsMessage}
                  </div>
                  <div
                    className="alert alert-warning mt-3"
                    style={
                      this.state.errorCredentials ? {} : { display: "none" }
                    }
                    role="alert"
                  >
                    {this.state.errorCredentialsMessage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col">
              <div className="card text-white bg-primary">
                <div className="card-header">POST message</div>
                <div className="card-body">
                  <form onKeyPress={this.onKeyPress}>
                    <div className="form-group">
                      <label>Message:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="message"
                        placeholder="Enter the message"
                        value={this.state.message}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tags:</label>
                      <TagsInput selectedTags={this.selectedTags} tags={[]} />
                    </div>
                    <div
                      className="alert alert-primary mt-3"
                      style={this.state.successSave ? {} : { display: "none" }}
                      role="alert"
                    >
                      {this.state.successSaveMessage}
                    </div>
                    <div
                      className="alert alert-warning mt-3"
                      style={this.state.errorSave ? {} : { display: "none" }}
                      role="alert"
                    >
                      {this.state.errorSaveMessage}
                    </div>
                    <button
                      className="btn btn-light"
                      onClick={this.handleSendMessage}
                    >
                      Save message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="row mb-5">
            <div className="col">
              <div className="card text-white bg-success">
                <div className="card-header">GET message with ID</div>
                <div className="card-body">
                  <form onKeyPress={this.onKeyPress}>
                    <div className="form-group">
                      <label>Id of the message:</label>
                      <input
                        type="text"
                        className="form-control"
                        pattern="[0-9]*"
                        name="id"
                        placeholder="Enter the id of a message"
                        value={this.state.id}
                        // onChange={this.handleChange}
                        onChange={(event) =>
                          this.setState({
                            id: event.target.value.replace(/\D/, ""),
                          })
                        }
                      />
                    </div>
                    <div
                      className="alert alert-primary mt-3"
                      style={this.state.successGet ? {} : { display: "none" }}
                      role="alert"
                    >
                      {typeof this.state.messageFromServer === "string" ? (
                        this.state.messageFromServer
                      ) : (
                        <React.Fragment>
                          <h4>Message: {this.state.messageFromServer.msg}</h4>
                          <hr></hr>
                          <h4>Tags</h4>
                          {Object.keys(this.state.messageFromServer).length >
                            0 &&
                            this.state.messageFromServer.tags.map((number) => (
                              <li key={number}>{number}</li>
                            ))}
                        </React.Fragment>
                      )}
                    </div>
                    <div
                      className="alert alert-warning mt-3"
                      style={this.state.errorGet ? {} : { display: "none" }}
                      role="alert"
                    >
                      {this.state.errorGetMessage}
                    </div>
                    <button
                      className="btn btn-light"
                      onClick={this.handleGetMessage}
                    >
                      Get message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <div className="card text-white bg-info">
                <div className="card-header">GET messages by tag</div>
                <div className="card-body">
                  <form onKeyPress={this.onKeyPress}>
                    <div className="form-group">
                      <label>Tag:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="tag"
                        placeholder="Enter the tag to be searched"
                        value={this.state.tag}
                        onChange={this.handleChange}
                      />
                    </div>
                    <div
                      className="alert alert-primary mt-3"
                      style={this.state.successTag ? {} : { display: "none" }}
                      role="alert"
                    >
                      {typeof this.state.messagesFromServer === "string" ? (
                        this.state.messagesFromServer
                      ) : (
                        <React.Fragment>
                          
                        </React.Fragment>
                      )}
                    </div>
                    <div
                      className="alert alert-warning mt-3"
                      style={this.state.errorTag ? {} : { display: "none" }}
                      role="alert"
                    >
                      {this.state.errorTagMessage}
                    </div>
                    <button
                      className="btn btn-light"
                      onClick={this.handleGetTagMessages}
                    >
                      Get messages by tag
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
