import React from 'react';
import { browserHistory } from 'react-router';

export default class SurveyDetailsFieldsOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = { "errorMessage": undefined };
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
      <div className="survey-options" onChange={this.setVote.bind(this)}>
        {radioButtons}
        <input className="btn btn-primary" type="button" id="survey-submit" value="Vote!" onClick={this.submitVote.bind(this)} />
        {this.state.errorMessage != undefined ? <p className="error-message">{this.state.errorMessage}</p> : ''}
        {this.state.voteMessage != undefined ? <p className="error-message">{this.state.voteMessage}</p> : ''}
      </div>
    );
  }

  setVote(event) {
    this.setState({
      "vote": {
        "id": this.props.surveyId,
        "choice": event.target.value,
      },
      "errorMessage": undefined,
    });
  }

  submitVote(event) {
    var self = this;
    if (self.state.vote == undefined) {
      self.setState({
        "errorMessage": "Please select at least one option."
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
      fetch('/api/v1/vote/', options)
      .then(function (response) {
        return response.json();
      })
      .then(function (result) {
        self.setState({
          "voteMessage": result.message
        });
        if (result.success)
          browserHistory.push('/app/thank-you');
      });
    }
  }
}