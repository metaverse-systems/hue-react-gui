import React, { Component } from "react";
import { Link } from 'react-router-dom';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Table from '@material-ui/core/Table';
import { Button, TextField } from '@material-ui/core';

const HueLightsAppHeader = (props) => {
    return <div>
      <TableContainer>
        <Table aria-label="table">
          <TableHead>
            <TableRow key={"title"}>
              <TableCell colSpan={4} style={ {textAlign: 'center'} }>
                <h4>Hue Lights</h4>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2} style={ {textAlign: 'center'} }>
                <a href="/huelights/bridges"><Button color="primary" variant="contained">Bridges</Button></a>
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>
    </div>;
}

export default HueLightsAppHeader;
