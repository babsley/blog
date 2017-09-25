import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Route, Redirect, BrowserRouter } from 'react-router-dom';
import * as loginActions from 'actions/LoginActions'
import Login from 'containers/Login';
import Blog from 'containers/Blog';

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => (
    rest.conditional ? (
      <Component {...props}/>
    ) : (
      <Redirect to={{
        pathname: rest.redirect,
        state: { from: props.location }
      }}/>
    )
  )}/>
);

class Routes extends Component {
  render() {
    return (
      <BrowserRouter>
        <div>
          <PrivateRoute exact path="/" redirect="/login" conditional={this.props.isLogged} component={Blog}/>
          <Route path="/login" component={Login}/>
        </div>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return { isLogged: state.isLogged };
}

function mapDispatchToProps(dispatch) {
  return {
    loginActions: bindActionCreators(loginActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes);
