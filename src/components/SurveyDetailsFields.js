import React from 'react';
import { browserHistory } from 'react-router';

export default class SurveyDetailsFields extends React.Component {
  constructor(props) {
    super(props);
    this.state = { voteErrorMessage: undefined, errorMessage: undefined };
  }

  setVote(event) {
    this.setState({
      "vote": {
        "id": this.props.surveyId,
        "choice": event.target.value,
      },
      "voteErrorMessage": undefined,
      "errorMessage": undefined,
    });
  }

  submitVote(event) {
    var self = this;
    if (self.state.vote == undefined) {
      self.setState({
        "voteErrorMessage": "Please select at least one option."
      });
    }
    else {
      var options = {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([self.state.vote]),
      };
      fetch('/api/v1/vote/', options).then(function(response) {
        return response.json().then(function (result) {
          if (result.success)
            browserHistory.push('/app/thank-you');

          self.setState({
            "voteErrorMessage": result.message
          });
        });
      });
    }
  }

  render() {
    var radioButtons = [];
    for (var option in this.props.choices) {
      radioButtons.push(
        <p className="survey-option-parent">
          <input type="radio" name="survey-option" value={this.props.choices[option].value} key={`radio-${this.props.choices[option].value}`} className="survey-option" />{this.props.choices[option].choice}
          <span className="number-of-votes" key={`span-${this.props.choices[option].value}`}>{this.props.choices[option].votes}</span>
        </p>
      );
    }

    return(
      <div className="survey-details-item-container">
        <strong><p className="survey-details-item-title">{this.props.question}</p></strong>
        <p className="survey-details-item-description">{this.props.description}</p>

        <div className="survey-options" onChange={this.setVote.bind(this)}>
          {radioButtons}
        </div>
        <input className="btn btn-primary" type="button" id="survey-submit" value="Vote!" onClick={this.submitVote.bind(this)} />
        {this.state.errorMessage != undefined ? <p className="error-message">{this.state.errorMessage}</p> : ''}
        {this.state.voteErrorMessage != undefined ? <p className="error-message">{this.state.voteErrorMessage}</p> : ''}
      </div>
    );
  }
}
