import React from 'react';

export default class Textarea extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  render() {
    return (
      <div className="input-container">
        <label htmlFor={this.props.fieldId}>{this.props.fieldLabel}</label>
        <textarea className="form-control" id={this.props.fieldId} onChange={this.props.validate.bind(this)} cols={this.props.fieldCols} rows={this.props.fieldRows} required></textarea>
        {this.state.error ? <span className="error-message">{this.props.errorMessage}</span> : ''}
      </div>
    );
  }
}