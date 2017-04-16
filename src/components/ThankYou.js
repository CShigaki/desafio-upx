import React from 'react';
import { Link } from 'react-router';

export default class ThankYou extends React.Component {
  render() {
    return (
      <div className="jumbotron">
        <h1>Thank you for your contribution!</h1>
        <Link to={`/`}>
          <p>Back to home</p>
        </Link>
      </div>
    );
  }
}