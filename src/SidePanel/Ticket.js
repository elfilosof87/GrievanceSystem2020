import React, { Fragment } from "react";
import firebase from "../firebase";
import moment from "moment";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Dropdown,
  TextArea,
} from "semantic-ui-react";
import Spinner from "../Spinner";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

const options = [
  { key: 1, text: "Category 1", value: "category 1" },
  { key: 2, text: "Category 2", value: "category 2" },
  { key: 3, text: "Category 3", value: "category 3" },
];

class Ticket extends React.Component {
  state = {
    user: this.props.currentUser,
    tickets: [],
    ticketName: "",
    ticketDetails: "",
    ticketSubject: "",
    status: "pending",
    loading: "false",
    ticketsRef: firebase.database().ref("tickets"),
    modalT: false,
    modal: false,
    value: "",
    colorValues: [
      "primary",
      "secondary",
      "success",
      "danger",
      "warning",
      "info",
      "dark",
    ],
    selectColor: "",
    postId: "",
    uploadTask: null,
    uploadState: "",
    percentUploaded: 0,
  };

  componentDidMount() {
    this.addListeners();
    this.getRandomColor();
  }

  getRandomColor() {
    let colors = ["primary", "success", "danger", "warning", "info", "dark"];

    var color = colors[Math.floor(Math.random() * colors.length)];
    return color;
  }

  addListeners = () => {
    let loadedTickets = [];
    this.setState({ loading: true });
    let user = this.state.user;
    this.state.ticketsRef.on("child_added", (snap) => {
      if (user.email === snap.val().createdBy.email) {
        loadedTickets.push(snap.val());
      }
      this.setState({ tickets: loadedTickets, loading: false });
    });
  };

  addTicket = () => {
    const {
      ticketsRef,
      ticketName,
      ticketDetails,
      ticketSubject,
      value,
      status,
      user,
    } = this.state;

    const key = ticketsRef.push().key;

    const newTicket = {
      id: key,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      name: ticketName,
      status: status,
      details: ticketDetails,
      subject: ticketSubject,
      category: value,
      createdBy: {
        name: user.displayName,
        email: user.email,
      },
    };

    ticketsRef
      .child(key)
      .update(newTicket)
      .then(() => {
        this.setState({
          ticketName: "",
          ticketDetails: "",
          ticketSubject: "",
          value: "",
        });
        this.closeModalT();
        console.log("ticket added");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addTicket();
    }
  };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleChangeDrop = (e, { value }) => this.setState({ value });

  displayTickets = (tickets) =>
    tickets.length > 0 &&
    tickets.map((ticket) => (
      <div
        className="col-md-auto col-lg-12"
        id="card-width-min"
        style={{ color: "white" }}
      >
        <Card
          style={{ minWidth: "18rem", margin: "10px" }}
          key={ticket.id}
          bg={this.getRandomColor()}
        >
          <Card.Body>
            <Card.Title id="font-size-card">{ticket.name}</Card.Title>
            <Card.Subtitle className="mb-2 ">
              <strong>Subject: </strong>
              {ticket.subject}
            </Card.Subtitle>
            <Card.Subtitle className="mb-2 ">
              <strong>Category: </strong>
              {ticket.category}
            </Card.Subtitle>
            <Card.Subtitle className="mb-2 ">
              <strong>Status: </strong>
              {ticket.status}
            </Card.Subtitle>
            <Card.Text>{ticket.details}</Card.Text>
            <Button
              variant="outline-light"
              onClick={() => this.setState({ postId: ticket.id, modal: true })}
            >
              Upload file
            </Button>
            <FileModal
              modal={this.state.modal}
              closeModal={this.closeModal}
              uploadFile={this.uploadFile}
            />
            <ProgressBar
              uploadState={this.state.uploadState}
              percentUploaded={this.state.percentUploaded}
            />
          </Card.Body>
          <Card.Footer>
            <small className="text-muted" id="whiteColor">
              Posted {moment(ticket.timestamp).fromNow()}
            </small>
          </Card.Footer>
        </Card>
      </div>
    ));

  isFormValid = ({ ticketName, ticketDetails, ticketSubject, value }) =>
    ticketName && ticketDetails && ticketSubject && value;

  openModalT = () => this.setState({ modalT: true });

  closeModalT = () => this.setState({ modalT: false });

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  render() {
    const { tickets, modalT, value, loading } = this.state;

    return (
      <Container className="white-back">
        <h2>Tickets</h2>
        <Menu.Menu style={{ paddingBottom: "2em" }}>
          <Menu.Item>
            <span>
              <Icon name="exchange" /> Create a Ticket
            </span>{" "}
            <Icon name="add" onClick={this.openModalT} />
          </Menu.Item>
        </Menu.Menu>
        <Modal basic open={modalT} onClose={this.closeModalT}>
          <Modal.Header>Create Ticket</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Ticket Name"
                  name="ticketName"
                  onChange={this.handleChange}
                />
              </Form.Field>

              <Form.Field>
                <Input
                  fluid
                  label="Ticket Subject"
                  name="ticketSubject"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Dropdown
                  onChange={this.handleChangeDrop}
                  options={options}
                  placeholder="Select a category"
                  selection
                  value={value}
                />
              </Form.Field>

              <Form.Field>
                <TextArea
                  name="ticketDetails"
                  placeholder="Tell us more"
                  style={{ minHeight: 100, maxHeight: 320 }}
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Submit
            </Button>
            <Button color="red" inverted onClick={this.closeModalT}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
        <div className="row justify-content-lg-center">
          {loading ? (
            <Spinner />
          ) : (
            <Fragment>{this.displayTickets(tickets)}</Fragment>
          )}
        </div>
      </Container>
    );
  }
}

export default Ticket;
