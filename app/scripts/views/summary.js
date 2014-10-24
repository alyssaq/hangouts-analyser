/*global App, Backbone, JST*/

App.Views = App.Views || {};

(function () {
  'use strict';

  App.Views.Login = Backbone.View.extend({
    template: JST['app/scripts/templates/sign-in.html'],
    events: {
      'submit': 'signIn'
    },
    signIn: function (event) {
      console.log('submit');
      event.preventDefault();
      App.session.signIn({
        connection: 'google-oauth2',
        connection_scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'],
        offline_mode: true,
        state: '/' + Backbone.history.fragment
      });
    },
    render: function() {
      this.$el.html(this.template());
      return this;
    }
  });

  App.Views.Summary = Backbone.View.extend({
    template: JST['app/scripts/templates/summary.html'],
    id: '',
    className: '',
    events: {},

    initialize: function () {
      //this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      this.$el.html(this.template({hello: 'there'}));
      return this;
    }
  });
})();
