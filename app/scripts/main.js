/*global App, $*/

window.App = {
  Models: {},
  Collections: {},
  Views: {},
  init: function () {
    'use strict';
    console.log('Hello from Alyssa!');
    var summaryView = new App.Views.Summary();
    var loginView = new App.Views.Login();
    $('.jumbotron').append(loginView.render().el);
    $('#content').append(summaryView.render().el);
    this._setSession();
  },
  _setSession: function() {
    App.session = new App.Models.Session(null, {
      domain: 'bentojunk.auth0.com',
      clientID: 'Lik2v9t2lF5rHn5eNCN49z3bd6622dn7'
    });

    App.session.fetch()
    .then(function () {
      return App.session.getAuthStatus();
    })
    .catch(function (err) {
      if (location.pathname !== '/') {
        App.session.signOut();
      }
    })
    .then(function () {
      console.log(App.session.get('id_token'))
      _.defer(function () {
        Backbone.history.start({
          pushState: true
        });
      });
    });
  },
  _addAuth0Widget: function() {
    var widget = new Auth0Widget({
      domain: 'bentojunk.auth0.com',
      clientID: 'Lik2v9t2lF5rHn5eNCN49z3bd6622dn7',
      callbackURL: window.location.href,
      callbackOnLocationHash: true
    });
    widget.signin({
      chrome: true,
      container: 'login',
      connections: ['google-oauth2'],
      connection_scopes: {
        'google-oauth2':
          ['https://www.googleapis.com/auth/plus.profile.emails.read']
      }
    });
  }
};

$(document).ready(function() {
  var widget = new Auth0Widget({
    domain: 'bentojunk.auth0.com',
    clientID: 'Lik2v9t2lF5rHn5eNCN49z3bd6622dn7',
    callbackURL: window.location.href,
    callbackOnLocationHash: true
  });
  var userProfile;

  var result = widget.parseHash(location.hash);
  if (result && result.id_token) {
    widget.getProfile(result.id_token, function (err, profile) {
      window.location.hash = '';
      if (err) {
        console.error('Error fetching profile: ' + JSON.stringify(err));
      }
      localStorage.setItem('bentoProfile', profile);
    });
  }

  widget.signin({
    chrome: true,
    container: 'login',
    connections: ['google-oauth2'],
    connection_scopes: {
      'google-oauth2':['https://www.googleapis.com/auth/plus.profile.emails.read']
    }
  });
});

$(document).ready(function () {
  'use strict';
  App.init();
});
