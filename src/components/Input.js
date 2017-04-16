import React from 'react';

export default class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  render() {
    return (
      <div className="input-container">
        <label htmlFor={this.props.fieldId}>{this.props.fieldLabel}</label>
        <input className="form-control" value={this.props.fieldValue} type={this.props.fieldType} id={this.props.fieldId} onChange={this.props.validate.bind(this)} required></input>
        {this.state.error ? <span className="error-message">{this.props.errorMessage}</span> : ''}
      </div>
    );
  }
}