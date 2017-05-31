(function() {
  'use strict';

  angular
    .module('source.api')
    /**
     * @namespace apiModelProvider
     * @memberof source.api
     *
     * @requires $toolsProvider
     *
     * @description
     * Provider that gets constants for API services.
     */
    .provider('apiModel', apiModel);

  apiModel.$inject = ['$toolsProvider'];

  function apiModel($toolsProvider) {
    var _constants = {
      AUTHENTICATED: true,
      PUBLIC: false,

      API_SERVER: 'SERVER',
      API_LOCAL: 'LOCAL',

      QUERY: 'QUERY',
      NEW: 'NEW',
      UPDATE: 'UPDATE',
      DELETE: 'DELETE',
      ASSIGN: 'ASSIGN'
    };
    var $ = angular.extend({}, _constants, $toolsProvider.$);

    var _providerModel = {
      schemas: {
        /* API general configuration schema */
        apiGeneralConfig: {
          localJson: null,
          apiBaseUrl: null,
          apiToken: null,
          apiLanguage: null,
          isSuperAdmin: null
        },

        /* Connection object schema */
        connectionObject: {
          source: null,
          access: null,
          mode: null,
          entityObject: null,
          checkSuperAdmin: null
        },

        /* Entity object schema */
        entityObject: {
          entityName: null,
          entityId: null,
          objectSent: null,
          headers: null,
          params: null
        },

        /* API promise schema */
        apiPromise: {
          data: null,
          _cursor: null,
          error: null
        },

        /* Partial request param object schema */
        paramObject: {
          queryFilter: [],
          order: [],
          top: 30,
          skip: 30,
          lastPage: 0
        },
        /* BPM request param object schema */
        bpmParamObject: {
          bpmFilter: null
        },
        /* API param object Schema */
        apiParams: {
          $filter: null,
          $orderby: null,
          $top: null,
          $skip: null
        }
      }
    };

    return {
      $: $,
      get: getProvider,
      $get: ['Restangular', $get]
    };

    /**
     * @name _getModelSource
     * @memberof source.api.apiModelProvider
     *
     * @description
     * Returns API model depending on the applicant: Provider or Service.
     *
     * @param {Boolean} source
     * @param {Object} [serviceObject = null]
     * @returns {Object}
     * @private
     */
    function _getModelSource(source, serviceObject) {
      serviceObject = serviceObject || null;
      return (source === $.PROVIDER) ? _providerModel : angular.extend({}, _providerModel, serviceObject) ;
    }

    /**
     * @name getProvider
     * @memberof source.api.apiModelProvider
     *
     * @description
     * Returns API model for Provider.
     *
     * @returns {Object}
     */
    function getProvider() {
      return _getModelSource($.PROVIDER);
    }

    /**
     * @namespace apiModel
     * @memberof source.api.apiModelProvider
     *
     * @requires Restangular
     *
     * @description
     * Factory that gets constants for API services.
     */
    function $get(Restangular) {
      var _defaults = {
        defaultHeaders: {
          'Content-Type': 'application/json'
        },
        defaultParams: {}
      };

      var _serviceModel = {
        service: {
          QUERY: {
            SERVER: {
              defaults: {
                defaultHeaders: _defaults.defaultHeaders,
                defaultParams: {
                  $top: 30
                }
              },
              subProcess: function(requestObject) {
                var e = requestObject.entity;
                if (!e.entityId) {
                  return Restangular.all(e.entityName).getList(requestObject.params, requestObject.headers);
                } else {
                  return Restangular.one(e.entityName, e.entityId).get(requestObject.params, requestObject.headers);
                }
              }
            },
            LOCAL: {
              defaults: {
                defaultHeaders: _defaults.defaultHeaders,
                defaultParams: _defaults.defaultParams
              },
              subProcess: function(requestObject) {
                var e = requestObject.entity;
                var eUrl = requestObject.json + '/' + e.entityName + '.json';
                return Restangular.allUrl(e.entityName, eUrl).getList(requestObject.params, requestObject.headers);
              }
            },
            /**
             * @name QUERY.process
             * @memberof source.api.apiModelProvider
             *
             * @description
             * It makes "GET" API call through Restangular.
             *
             * @param {Object} requestObject
             * @returns {Promise}
             */
            process: function(requestObject) {
              return requestObject.source.subProcess(requestObject);
            }
          },
          NEW: {
            SERVER: {
              defaults: {
                defaultHeaders: _defaults.defaultHeaders,
                defaultParams: _defaults.defaultParams
              }
            },
            /**
             * @name NEW.process
             * @memberof source.api.apiModelProvider
             *
             * @description
             * It makes "POST" API call through Restangular.
             *
             * @param {Object} requestObject
             * @returns {Promise}
             */
            process: function(requestObject) {
              var e = requestObject.entity;
              return Restangular.all(e.entityName).post(e.objectSent, requestObject.params, requestObject.headers);
            }
          },
          UPDATE: {
            SERVER: {
              defaults: {
                defaultHeaders: _defaults.defaultHeaders,
                defaultParams: _defaults.defaultParams
              }
            },
            /**
             * @name UPDATE.process
             * @memberof source.api.apiModelProvider
             *
             * @description
             * It makes "PUT" API call through Restangular.
             *
             * @param {Object} rO --> Request Object
             * @returns {Promise}
             */
            process: function(rO) {
              var e = rO.entity;
              return Restangular.one(e.entityName, e.entityId).customPUT(e.objectSent, '', rO.params, rO.headers);
            }
          },
          DELETE: {
            SERVER: {
              defaults: {
                defaultHeaders: _defaults.defaultHeaders,
                defaultParams: _defaults.defaultParams
              }
            }
          },
          ASSIGN: {
            SERVER: {
              defaults: {
                defaultHeaders: _defaults.defaultHeaders,
                defaultParams: _defaults.defaultParams
              }
            }
          }
        }
      };

      return {
        $: $,
        get: getFactory
      };

      /**
       * @name getFactory
       * @memberof source.api.apiModelProvider.apiModel
       *
       * @description
       * Returns API model for Factory service.
       *
       * @returns {Object}
       */
      function getFactory() {
        return _getModelSource($.SERVICE, _serviceModel);
      }
    }
  }
})();
