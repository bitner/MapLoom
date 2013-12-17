(function() {
  var module = angular.module('loom_config_service', []);

  var service_ = null;

  module.factory('httpRequestInterceptor', function($cookieStore) {
    return {
      request: function(config) {
        if (goog.isDefAndNotNull(config) &&
            (config.method.toLowerCase() === 'post' || config.method.toLowerCase() === 'put')) {
          config.headers['X-CSRFToken'] = service_.csrfToken;
        }
        if (goog.isDefAndNotNull(config) && goog.isDefAndNotNull(config.url) && config.url.indexOf('http') === 0) {
          var configCopy = $.extend(true, {}, config);
          var proxy = service_.configuration.proxy;
          if (goog.isDefAndNotNull(proxy)) {
            configCopy.url = proxy + encodeURIComponent(configCopy.url);
          }
          return configCopy;
        }
        return config;
      }
    };
  });

  module.config(function($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  });

  module.provider('configService', function() {
    this.configuration = {};

    this.$get = function($window, $http, $cookies, $location, $translate) {
      service_ = this;
      this.configuration = {
        about: {
          title: 'New Map',
          abstract: ''
        },
        map: {
          center: [-9707182.048613328, 1585691.7893914054],
          zoom: 14,
          layers: [
            {
              'opacity': 1,
              'selected': true,
              'group': 'background',
              'name': 'mapnik',
              'title': 'OpenStreetMap',
              'args': ['OpenStreetMap'],
              'visibility': true,
              'source': 1,
              'fixed': true,
              'type': 'OpenLayers.Layer.OSM'
            }
          ]
        },
        sources: [
          {
            'url': ('http://' + $location.host() + '/geoserver/wms'),
            'restUrl': '/gs/rest',
            'ptype': 'gxp_wmscsource',
            'name': 'local geoserver'
          },
          {
            'ptype': 'gxp_osmsource',
            'name': 'OpenStreetMap'
          }
        ],
        currentLanguage: 'en',
        username: 'anonymous',
        userprofilename: 'Anonymous',
        userprofileemail: '',
        username: '',
        authStatus: 401,
        id: 0,
        proxy: '/proxy/?url='
      };

      if (goog.isDefAndNotNull($window.config)) {
        goog.object.extend(this.configuration, $window.config, {});
      }
      this.username = this.configuration.username;
      this.currentLanguage = this.configuration.currentLanguage;
      this.user_profile_name = this.configuration.userprofilename;
      this.user_profile_email = this.configuration.userprofileemail;
      this.user_name = this.configuration.username;
      this.proxy = this.configuration.proxy;
      this.csrfToken = $cookies.csrftoken;
      this.currentLanguage = this.configuration.currentLanguage;

      if (goog.isDefAndNotNull(this.configuration.map.zoom) && this.configuration.map.zoom === 0) {
        this.configuration.map.zoom = 1;
      }

      $translate.uses(this.currentLanguage);

      return this;
    };

    this.isAuthenticated = function() {
      return service_.configuration.authStatus == 200;
    };
  });
}());
