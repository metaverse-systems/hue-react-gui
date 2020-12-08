import React, { Component } from "react";
import { BrowserRouter as Router, Link } from 'react-router-dom';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Table from '@material-ui/core/Table';
import { Button, TextField } from '@material-ui/core';
import HueLightsAppHeader from "./HueLightsAppHeader";

const HueBridge = (props) => {
  return <TableRow>
    <TableCell>{props.ip}</TableCell>
    <TableCell>{props.model}</TableCell>
    <TableCell><a href={"/huelights/bridge/" + props.id}>{props.id}</a></TableCell>
    <TableCell>{props.connected ? "Connected" : <Button variant="contained" color="primary" onClick={() => { props.connect(props.ip, props.model) }}>Connect</Button>}</TableCell>
    <TableCell>{props.visible ? "Visible" : "Searching..."}</TableCell>
  </TableRow>;
}

class HueBridgeList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bridges: [ 
      ],
      message: "",
      messageStyle: {
        border: 'thin dotted red',
        textAlign: 'center',
        verticalAlign: 'middle',
        width: '200px',
        height: '100px',
        marginLeft: '-100px',
        marginTop: '-50px',
        left: '50%',
        top: '50%',
        paddingTop: '30px',
        display: 'none',
        backgroundColor: '#FFFFFF',
        position: 'absolute'
      }
    };
  }

  componentDidMount = () => {
    this.fetchList();
  }

  fetchList = () => {
    const url = "/api/huebridge";

    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let bridges = [];
      data.forEach((bridge) => {
        bridges.push({
          ip: bridge.ipv4,
          model: bridge.model,
          connected:  true,
          visible:  false,
          id: bridge.id
        });
      });
      this.setState({
        bridges: bridges
      });
    });

    this.scan();
  }

  scan = () => {
    const url = "/api/huebridge/scan";

    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      let bridges = Object.assign([], this.state.bridges);
      data.forEach((bridge) => {
        let exists = false;
        bridges.forEach((b) => {
          if(b.ip == bridge.ip) {
            b.visible = true;
            exists = true;
          }
        });
        if(!exists) {
          bridge.connected = false;
          bridge.visible = true;
          bridges.push(bridge);
        }
      });
      this.setState({ bridges: bridges });
    })
    .catch(function(error) {
      console.log(error);
      setTimeout(this.scan, 1000);
    });
  }

  saveBridge(ip, model, username) {
    const url = "/api/huebridge";
    const body = {
      ip: ip,
      model: model,
      username: username
    };

    fetch(url, {
      method: 'post',
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
      body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((res) => {
    });
  }

  connect = (ip, model) => {
    const url = "http://" + ip + "/api";
    const body = {
      devicetype: "Clarion#clarion"
    };
    
    fetch(url, {
      method: "post",
      body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((res) => {
      res.forEach((result) => {
        if(result.success !== undefined) {
          this.saveBridge(ip, model, result.success.username);
          this.clearMessage();
          this.fetchList();
        }
        if(result.error !== undefined) {
          if(result.error.description == "link button not pressed") {
            this.flashMessage("Press button on Philips Hue");
            setTimeout(() => { console.log('hi'); this.connect(ip, model); }, 1000);
          }
        }
      });
    });
  }

  flashMessage = (message) => {
    this.setState({ message: message });

    let style = Object.assign({}, this.state.messageStyle);
    style.display = "block";
    this.setState({ messageStyle: style });
  }

  clearMessage = () => {
    this.setState({ message: "" });

    let style = Object.assign({}, this.state.messageStyle);
    style.display = "none";
    this.setState({ messageStyle: style });
  }

  render() {
    return <div style={ {width: '100%'} }>
      <HueLightsAppHeader />
      <TableContainer>
        <Table aria-label="table">
          <TableHead>
            <TableRow key={"title"}>
              <TableCell colSpan={4} style={ {textAlign: 'center'} }>
                <h4>Hue Bridges</h4>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.bridges.map((bridge, index) => <HueBridge {...bridge} key={index} connect={this.connect} />)}
          </TableBody>
        </Table>
      </TableContainer>
      <div id="message" style={this.state.messageStyle}>
        {this.state.message}
      </div>
    </div>
  }
};

export default HueBridgeList;
