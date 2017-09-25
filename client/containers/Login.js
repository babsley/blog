import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as loginActions from 'actions/LoginActions'
import Form from 'components/login/Form';
import Errors from 'components/login/Errors';
import Preloader from 'components/shared/Preloader';
import { Redirect } from 'react-router-dom';

class Login extends Component {
  render() {
    const { login } = this.props.loginActions;
    const { isLogged } = this.props.state;
    const { from } = this.props.location.state || { from: { pathname: '/' } };

    if (isLogged) {
      return (
        <Redirect to={from}/>
      )
    }

    return (
      <div className="login">
        <Preloader pending={this.props.state.pending}/>
        <h1>Welcome</h1>
        <Form login={login}/>
        <Errors/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return { state };
}

function mapDispatchToProps(dispatch) {
  return {
    loginActions: bindActionCreators(loginActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
