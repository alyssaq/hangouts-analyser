/*global App, Backbone, JST*/

App.Views = App.Views || {};

(function () {
  'use strict';

  App.Views.Summary = Backbone.View.extend({
    template: JST['app/scripts/templates/summary.ejs'],
    id: '',
    className: '',
    events: {},

    initialize: function () {
      console.log(this.$el)
      //this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      this.$el.html(this.template({hello: 'there'}));
      return this;
    }
  });
})();
