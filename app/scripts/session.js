/*global App, Backbone, JST*/

App.Models = App.Models || {};


(function () {
  'use strict';

  var saveProfile = function (err, profile,
    id_token, access_token, state, refresh_token) {
    var auth0Attributes = {};
    if (id_token !== undefined) {
      auth0Attributes.id_token = id_token;
    }
    if(access_token !== undefined) {
      auth0Attributes.access_token = access_token;
    }
    if (refresh_token !== undefined) {
      auth0Attributes.refresh_token = refresh_token;
    }
    this.save(_.extend(profile || {}, auth0Attributes));
  };

  function HTTPError (status, message) {
    this.status = status;
    this.message = message;
  }
  HTTPError.prototype = new Error();
  HTTPError.prototype.constructor = HTTPError;

  var sync = function (method, model, options) {
    var that = this;
    var promise = $.Deferred();
    var success = options.success || $.noop;
    var error = options.error || $.noop;
    var request = function () {
      if (App.session.has('id_token')) {
        options.headers = _.extend(options.headers || {}, {
          'Authorization': 'Bearer ' + App.session.get('id_token')
        });
      }
      Backbone.sync.call(that, method, model,
        _.omit(options, 'error'))
      .done(promise.resolve)
      .fail(function (xhr, textStatus, errorThrown) {
        var session = App.session;
        var refresh_token = session.get('refresh_token');
        if (xhr.status === 419 && refresh_token) {
          session.auth0.getDelegationToken({
            scope: App.env.auth0.signIn.scope,
            refresh_token: refresh_token,
            api: 'auth0'
          }, function (err, delegationResult) {
            if (err) {
              error(err);
              promise.reject(err);
              return;
            }
            saveProfile.call(session, err, undefined,
              delegationResult.id_token);
            request();
          });
          return;
        }
        if (xhr.status === 401) {
          App.session.signOut();
        }
        var httpError = new HTTPError(xhr.status, xhr.statusText);
        error(httpError);
        promise.reject(httpError);
      });
    };
    request();
    return promise;
  };

  var Model = Backbone.Model.extend({
    sync: sync
  });
  var Collection = Backbone.Collection.extend({
    sync: sync,
    model: Model
  });

  App.Models.Session = BackboneSession.extend({
    Model: Model,
    Collection: Collection,
    initialize: function (attributes, options) {
      this.auth0 = new Auth0(_.defaults(options, {

         callbackURL: document.location.protocol+ '//' +
           document.location.host,
        callbackOnLocationHash: true
      }));
      return BackboneSession.prototype.initialize.apply(this, arguments);
    },
    url: function () {
      return 'Bento.Backbone.Session';
    },
    signIn: function (options) {
      console.log(options)
      var that = this;
      return new Promise(function (resolve, reject) {
        that.auth0.login(
          options,
          function (err) {
            if (err) {
              reject();
            } else {
              saveProfile.Apply(that, arguments);
              resolve();
            }
          }
        );
      });
    },
    getAuthStatus: function (options) {
      var that = this;
      var has = function (object, key) {
        return object && Object.hasOwnProperty.call(object, key);
      };
      return new Promise(function (resolve, reject) {
        var hash = that.auth0.parseHash(window.location.hash);
        if (has(hash, 'error')) {
          reject(Error(hash.error));
          return;
        }
        var val = function (key) {
          return has(options, key) ? options[key] :
            has(hash, key) ? hash[key] :
            that.get(key);
        };
        if (!val('id_token')) {
          reject(Error('No valid tokens found'));
          return;
        }
        that.auth0.getProfile(val('id_token'), function (err, profile) {
          if (err) {
            reject(err);
          } else {
            saveProfile.apply(that, [
              err,
              profile,
              val('id_token'),
              val('access_token'),
              val('state'),
              val('refresh_token')
            ]);
            resolve();
          }
        });
      });
    }
  });

})();