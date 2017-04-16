import React from 'react';

export default class SurveyTitle extends React.Component {
  render() {
    return (
      <p className="field-result-title">{this.props.title}</p>
    );
  }
}