/*global HangoutAnalyzer, $*/


window.App = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function () {
    'use strict';
    console.log('Hello from Alyssa!');
    var summaryView = new App.Views.Summary();
    $('#content').append(summaryView.render().el);
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
