import React, { Component } from "react";
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Table from '@material-ui/core/Table';
import { Button, TextField, Slider, Typography } from '@material-ui/core';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import HueLightsAppHeader from "./HueLightsAppHeader";

const BrightnessSlider = withStyles({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 48,
    width: 36,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 30,
    borderRadius: 10,
  },
  rail: {
    height: 30,
    borderRadius: 10,
  },
})(Slider);

const Brightness = (props) => {
  return <div>
    <Typography id={"brightness_" + props.group_id} gutterBottom style={ {textAlign: 'center'} }>
      Brightness
    </Typography>
    <BrightnessSlider
      aria-labelledby={"brightness_" + props.group_id}
      min={0}
      max={254}
      value={parseInt(props.brightness)}
      onChangeCommitted={(event, value) => {props.adjustBrightness(props.group_id, value)}}
    >
    </BrightnessSlider>
  </div>;
}

const TurnOn = (props) => {
  return <Button variant="contained" color="primary" 
           onClick={() => {props.turnOn(props.group_id)}} fullWidth
           style={ {height: '75px'} }
         >
    Turn On
  </Button>;
}

const TurnOff = (props) => {
  return <Button variant="contained" color="secondary"
           onClick={() => {props.turnOff(props.group_id)}} fullWidth
           style={ {height: '75px'} }
         >
    Turn Off
  </Button>;
}

const HueGroup = (props) => {
  return <>
    <TableRow>
      <TableCell style={ {textAlign: 'center'} }><h4>{props.name} - {Math.floor(props.brightness / 2.55)}%</h4></TableCell>
      <TableCell style={ {textAlign: 'center'} }>{props.on == 1 ? <TurnOff {...props} /> : <TurnOn {...props} />}</TableCell>
    </TableRow>
    <TableRow>
      <TableCell colSpan={2}><Brightness {...props} /></TableCell>
    </TableRow>
    <TableRow>
      <TableCell colSpan={2}>&nbsp;</TableCell>
    </TableRow>
  </>;
}

class HueGroupList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bridge: props.bridge,
      groups: [ 
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

    if(window.Pusher !== undefined) {
      window.Pusher.subscribe('Hue')
        .bind('MetaverseSystems\\HuePHPBackend\\Events\\HueChangeState', (data) => {
          let groups = Object.assign([], this.state.groups);
          data.changes.forEach((group) => {
            groups.forEach((g, i) => {
              if(g.group_id != group.group_id) return;
              if(group.brightness !== undefined) groups[i].brightness = group.brightness;
              if(group.on !== undefined) groups[i].on = group.on.toString();
            });
          });
          this.setState({ groups: groups });
        });
    }
  }

  componentDidMount = () => {
    this.fetchList();
//    setInterval(() => {this.fetchList()}, 5000);
  }

  fetchList = () => {
    const url = "/api/huebridge/" + this.state.bridge + "/groups";

    fetch(url)
    .then((response) => response.json())
    .then((data) => {
      this.setState({
        groups: data 
      });
    });
  }

  turnOn = (group) => {
    const url = "/api/huebridge/" + this.state.bridge + "/groups/" + group;
    const opts = { on: 1 };
    fetch(url, { 
        method: 'post',
        body: JSON.stringify(opts),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
    });
    setTimeout(this.fetchList, 500);
  }

  turnOff = (group) => {
    const url = "/api/huebridge/" + this.state.bridge + "/groups/" + group;
console.log("turning off: " + url);
    const opts = { on: 'false' };
    fetch(url, { 
        method: 'post', 
        body: JSON.stringify(opts),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
    });
    setTimeout(this.fetchList, 500);
  }

  adjustBrightness = (group, bri) => {
    let groups = Object.assign([], this.state.groups);
    groups.forEach((g, i) => {
      if(g.group_id != group) return;
      groups[i].brightness = bri;
    });
    this.setState({ groups: groups });
    const url = "/api/huebridge/" + this.state.bridge + "/groups/" + group;
    const opts = { bri: bri };
    fetch(url, {
        method: 'post',
        body: JSON.stringify(opts),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]').getAttribute('content')
      },
    });
    setTimeout(this.fetchList, 500);
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
    return <div>
      <HueLightsAppHeader />
      <TableContainer>
        <Table aria-label="table">
          <TableHead>
            <TableRow key={"title"}>
              <TableCell colSpan={4} style={ {textAlign: 'center'} }>
                <h4>Hue Groups</h4>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {this.state.groups.map((group, index) => 
            <HueGroup {...group} key={index} turnOn={this.turnOn} turnOff={this.turnOff} adjustBrightness={this.adjustBrightness} />
          )}
          </TableBody>
        </Table>
      </TableContainer>
      <div id="message" style={this.state.messageStyle}>
        {this.state.message}
      </div>
    </div>
  }
};

export default HueGroupList;
