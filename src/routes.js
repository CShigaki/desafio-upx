import React from 'react'
import { Route, IndexRoute } from 'react-router'
import Layout from './components/Layout';
import IndexPage from './components/IndexPage';
import SurveyListing from './components/SurveyListing';
import SurveyDetails from './components/SurveyDetails';
import SurveyCreation from './components/SurveyCreation';
import ThankYou from './components/ThankYou';

const routes = (
  <Route path="/" component={Layout}>
    <IndexRoute component={IndexPage} />
    <Route path="/app/list-surveys" component={SurveyListing} />
    <Route path="/app/survey-detail/:id" component={SurveyDetails} />
    <Route path="/app/create-survey" component={SurveyCreation} />
    <Route path="/app/thank-you" component={ThankYou} />
  </Route>
);

export default routes;