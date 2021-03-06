(function() {
  'use strict';

  angular
    .module('source._shared')
    /**
     * @namespace $toolsProvider
     * @memberof source._shared
     *
     * @requires globalConstantsProvider
     *
     * @description
     * Provider statement for several useful tools.
     */
    .provider('$tools', $tools);

  $tools.$inject = ['globalConstantsProvider'];

  function $tools(globalConstantsProvider) {
    var $ = globalConstantsProvider.get();
    var _deviceInfo = null;

    return {
      /* Global constants */
      $: $,
      /* Config methods */
      setDeviceInfo: setDeviceInfoProvider,
      getDeviceInfo: getDeviceInfoProvider,
      /* String tools */
      readStringList: readStringListProvider,
      readStringListUnique: readStringListUniqueProvider,
      /* Array tools */
      arrayMerge: arrayMergeProvider,
      /* Object tools */
      setObjectUsingSchema: setObjectUsingSchemaProvider,
      getCheckedObject: getCheckedObjectProvider,
      /* $tools factory */
      $get: ['$filter', $get]
    };

    /**
     * @name _setDeviceInfo
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Method that set device info object.
     *
     * @param {Object} deviceObject
     * @return {Object}
     * @throws TypeError
     * @private
     */
    function _setDeviceInfo(deviceObject) {
      var _isObject = angular.isObject(deviceObject);
      var _hasOs = deviceObject.hasOwnProperty($.DEVICE_INFO_OS);
      var _hasBrowser = deviceObject.hasOwnProperty($.DEVICE_INFO_BROWSER);
      var _hasDevice = deviceObject.hasOwnProperty($.DEVICE_INFO_DEVICE);
      var _hasOsVersion = deviceObject.hasOwnProperty($.DEVICE_INFO_OS_VERSION);
      var _hasBrowserVersion = deviceObject.hasOwnProperty($.DEVICE_INFO_BROWSER_VERSION);
      if (_isObject && _hasOs && _hasBrowser && _hasDevice && _hasOsVersion && _hasBrowserVersion) {
        _deviceInfo = deviceObject;
      } else {
        throw new TypeError('Parameter received to set device info is not valid.');
      }
      return _deviceInfo;
    }

    /**
     * @name _convertString
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Function that encoding camelCase, or decoding camelCase, a given string.
     * TODO: Remove url not allowed chars using $.URL_NOT_ALLOWED_CHARS array
     *
     * @param {String} string
     * @param {String} char
     * @param {Boolean} conversionType
     * @returns {String}
     * @private
     */
    function _convertString(string, char, conversionType) {
      if (string !== undefined && conversionType !== undefined) {
        var defaultChar = (char) ? char : '-' ;
        if (conversionType === $.FROM_CAMELCASE_TO_OTHER) {
          return string.replace(/([A-Z])/g, function($1) {
            return defaultChar + $1.toLowerCase();
          });
        } else {
          var output = string.split(defaultChar).map(function(item) {
            return item.charAt(0).toUpperCase() + item.slice(1);
          }).join('');
          return output.charAt(0).toLowerCase() + output.slice(1);
        }
      } else {
        throw new ReferenceError('Function parameters missing.');
      }
    }

    /**
     * @name _ucWords
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Returns given string with first letter in uppercase.
     *
     * @param {String} string
     * @returns {string}
     * @private
     */
    function _ucWords(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    /**
     * @name _getRandomString
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Returns random string with given number of chars.
     *
     * @param {Number} stringLength --> Number of chars for random string
     * @returns {string}
     * @private
     */
    function _getRandomString(stringLength) {
      var output = '';
      var possibilities = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      for (var i = 0; i < stringLength; i++) {
        output += possibilities.charAt(Math.floor(Math.random() * possibilities.length));
      }
      return output;
    }

    /**
     * @name _readStringListStrict
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * This method catch a list of elements as string separated comma or array of strings
     * and returns clean array only with string type elements.
     * If variable "uniqueElements" is defined as "true", de returned array will contain only
     * unique elements, no repeated elements.
     *
     * @param {String|Array} list
     * @param {Boolean} uniqueElements
     * @returns {Array}
     * @throws ReferenceError
     * @throws TypeError
     * @private
     */
    function _readStringListStrict(list, uniqueElements) {
      if (angular.isArray(list) || typeof list === 'string') {
        if (list.length) {
          list = (typeof list === 'string') ? list.split(',') : list ;
          var output = [];
          angular.forEach(list, function(element) {
            if (typeof element === 'string') {
              var _parsedElement = element.trim();
              var _conditionUnique = (uniqueElements && output.indexOf(_parsedElement) < 0);
              if (_conditionUnique || !uniqueElements) {
                output.push(_parsedElement);
              }
            }
          });
          if (output.length) {
            return output;
          } else {
            throw new ReferenceError('If given list is array type it must contain some string element.');
          }
        } else {
          throw new ReferenceError('Given variable "list" must be defined. Not void content.');
        }
      } else {
        throw new TypeError('Given list must be string type or array type. Received: "' + typeof list + '".');
      }
    }

    /**
     * @name _readStringList
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * This method catch a list of elements as string separated comma, array of strings,
     * object or array of objects and returns clean array only with string type elements.
     * In case of object or array of objects given list, It's mandatory to send
     * the variable: "objectProperties" that is a list of object properties.
     * If variable "uniqueElements" is defined as "true", de returned array will contain only
     * unique elements, no repeated elements.
     *
     * @param {String|Array|Object} list
     * @param {String|Array} objectProperties
     * @param {Boolean} uniqueElements
     * @returns {Array}
     * @throws Error
     * @private
     */
    function _readStringList(list, objectProperties, uniqueElements) {
      objectProperties = (objectProperties) ? _readStringListStrict(objectProperties, uniqueElements) : undefined ;
      var output = list;
      var _error = '';
      if (angular.isObject(list) && !angular.isArray(list)) {
        if (objectProperties) {
          output = [];
          angular.forEach(objectProperties, function(value) {
            if (list.hasOwnProperty(value)) {
              output.push(list[value]);
            }
          });
        } else {
          _error = [
            'If given list is object type or array of objects, is mandatory',
            'to send properties list variable ("objectProperties").'
          ];
          throw new Error(_error.join(' '));
        }
      } else if (angular.isArray(list)) {
        var _arrayOfObjects = list.filter(angular.isObject);
        if (objectProperties) {
          output = [];
          angular.forEach(_arrayOfObjects, function(element) {
            angular.forEach(objectProperties, function(value) {
              if (element.hasOwnProperty(value)) {
                output.push(element[value]);
              }
            });
          });
        } else if (list.length === _arrayOfObjects.length) {
          _error = [
            'If given list is object type or array of objects, is mandatory',
            'to send properties list variable ("objectProperties").'
          ];
          throw new Error(_error.join(' '));
        }
      }
      return _readStringListStrict(output, uniqueElements);
    }

    /**
     * @name _doFriendlyUrl
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * This method transform string separated width "separator" param (white space default)
     * and returns kebab-case string for use as friendly url.
     * TODO: Introduce errors control.
     *
     * @param {String} string
     * @param {String} separator
     * @returns {String}
     * @private
     */
    function _doFriendlyUrl(string, separator) {
      separator = separator || ' ';
      var _toCamelCase = _convertString(string, separator, $.FROM_OTHER_TO_CAMELCASE);
      var _re = new RegExp('(' + $.URL_NOT_ALLOWED_CHARS.join('|') + ')', 'g');
      return _convertString(_toCamelCase, '-', $.FROM_CAMELCASE_TO_OTHER).replace(_re, '');
    }

    /**
     * @name _removeFromArray
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Removes an element from an array from a given value or from a given key. Returns given array without the
     * element we want to remove.
     *
     * @param {Array} arrayVar
     * @param {Number|String|Object} givenVar
     * @param {Boolean} mode
     * @returns {Array}
     * @private
     */
    function _removeFromArray(arrayVar, givenVar, mode) {
      var key = givenVar;
      if (mode === $.MODE_VALUE) {
        key = arrayVar.indexOf(givenVar);
      }
      if ((key) && (key > -1)) {
        arrayVar.splice(key, 1);
      }
      return arrayVar;
    }

    /**
     * @name _arrayMerge
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Merges two arrays avoiding duplicate items.
     *
     * @param {Array} array1
     * @param {Array} array2
     * @returns {Array}
     * @private
     */
    function _arrayMerge(array1, array2) {
      if (angular.isArray(array1) && angular.isArray(array2)) {
        var _mergedArray = angular.copy(array1);
        array2.reduce(function(array, value) {
          if (array.indexOf(value) < 0) {
            array.push(value);
          }
          return array;
        }, _mergedArray);
        return _mergedArray;
      } else {
        var error = 'The "_arrayMerge" method expects two array arguments and at least one of them is not array.';
        throw new TypeError(error);
      }
    }

    /**
     * @name _twoFromOne
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Divide an array in two from a given array length.
     *
     * @param {Number} lengthToDivide
     * @param {Array} array
     * @return {Object}
     * @private
     */
    function _twoFromOne(lengthToDivide, array) {
      var output = {
        first: null,
        second: null
      };
      if (typeof lengthToDivide === 'number') {
        if (angular.isArray(array)) {
          output.first = array;
          var totalItems = array.length;
          if (totalItems > lengthToDivide) {
            var itemsFirst = Math.ceil(totalItems / 2);
            var itemsSecond = (totalItems - itemsFirst);
            output.first = array.slice(0, itemsFirst);
            output.second = array.slice(-itemsSecond);
          }
        } else {
          throw new TypeError('Expected array as second param typeof and received: "' + typeof array + '"');
        }
      } else {
        throw new TypeError('Expected number as first param typeof and received: "' + typeof lengthToDivide + '"');
      }
      return output;
    }

    /**
     * @name _index
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Auxiliary function used for reduction in getValueFromDotedKey.
     *
     * @param {Object} object
     * @param {String} index
     * @returns {*}
     * @private
     */
    function _index(object, index) {
      if (angular.isArray(object)) {
        return angular.copy(object).shift()[index];
      } else {
        return object[index];
      }
    }

    /**
     * @name _getValueFromDotedKey
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Allows dot notation traversing (Example: object["a.b.c"] in object["a"]["b"]["c"]).
     * Returns undefined value instead of exception if no key in object.
     *
     * @param {Object} object
     * @param {String} dotedKey
     * @returns {*|Undefined}
     * @private
     */
    function _getValueFromDotedKey(object, dotedKey) {
      if (object[dotedKey] !== undefined) {
        return object[dotedKey];
      }
      try {
        return dotedKey.split('.').reduce(_index, object);
      } catch (e) {
        if (e instanceof TypeError) {
          return undefined;
        } else {
          throw e;
        }
      }
    }

    /**
     * @name _parseObjectValues
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Parses keysObject to assign correct values from collection valuesObject.
     *
     * @param {Object} keysObject
     * @param {Object} valuesObject
     * @returns {Object}
     */
    function _parseObjectValues(keysObject, valuesObject) {
      var output = {};
      if (typeof keysObject === 'object') {
        output = angular.copy(keysObject);
        for (var index in keysObject) {
          if (keysObject.hasOwnProperty(index) && valuesObject.hasOwnProperty(keysObject[index])) {
            output[index] = valuesObject[keysObject[index]];
          }
        }
      }
      return output;
    }

    /**
     * @name _setObjectUsingSchema
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Returns an object with values given in "objectSettings" following the pattern given by "objectSchema".
     * Throws an exception error if "objectSettings" does not fit "objectSchema".
     * Settings Object will be merged depending on variable "mergeOption".
     *
     * @param {Object} objectSchema
     * @param {Object} objectSettings
     * @param {Boolean|Object} mergeOption --> If Boolean: true to merge with schema, false no merge with schema.
     *                                     --> If Object, merge with given object.
     * @param {Array} options --> "noExceptions": to prevent exceptions.
     * @returns {Object}
     * @private
     */
    function _setObjectUsingSchema(objectSchema, objectSettings, mergeOption, options) {
      var output = {};
      angular.forEach(objectSettings, function(item, key) {
        if (objectSchema.hasOwnProperty(key)) {
          output[key] = item;
        } else if (options.indexOf($.NO_EXCEPTIONS) < 0) {
          throw new Error('Trying to set an unknown property ("' + key + '") in target object.');
        }
      });
      if (mergeOption) {
        var mergeCondition = (typeof mergeOption === 'object');
        return (mergeCondition) ? angular.extend({}, mergeOption, output) : angular.extend({}, objectSchema, output) ;
      } else {
        return output;
      }
    }

    /**
     * @name _getCheckedObject
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * General function with error control to get an object or one of its properties.
     *
     * @param {Object} objectToGet
     * @param {String} [propertyToGet]
     * @return {*}
     * @throws ReferenceError
     * @throws TypeError
     * @private
     */
    function _getCheckedObject(objectToGet, propertyToGet) {
      var _output = null;
      if (angular.isObject(objectToGet)) {
        propertyToGet = propertyToGet || null;
        if (propertyToGet) {
          if (typeof propertyToGet === 'string') {
            if (objectToGet.hasOwnProperty(propertyToGet)) {
              _output = objectToGet[propertyToGet];
            } else {
              var _propertyReferenceError = [
                'Requested property (' + propertyToGet + ')',
                'does not exist on object received.'
              ];
              throw new ReferenceError(_propertyReferenceError.join(' '));
            }
          } else {
            var _propertyTypeError = [
              'Invalid type of param property received in _getCheckedObject method.',
              'It must be string and type received is: "' + typeof objectToGet + '".'
            ];
            throw new TypeError(_propertyTypeError.join(' '));
          }
        } else {
          _output = objectToGet;
        }
      } else {
        var _objectTypeError = [
          'Invalid type of param object received in _getCheckedObject method.',
          'It must be object and type received is: "' + typeof objectToGet + '".'
        ];
        throw new TypeError(_objectTypeError.join(' '));
      }
      return _output;
    }

    /**
     * @name _dateToIso
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Method to transform any format date to ISO date.
     *
     * @param {*} date
     * @return {String}
     * @private
     */
    function _dateToIso(date) {
      return moment(date).toISOString();
    }

    /**
     * @name _cleanUrl
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * This method cuts an URL string in separator string given and returns only first part.
     *
     * @param {String} url
     * @param {String} separator
     * @return {String}
     * @private
     */
    function _cleanUrl(url, separator) {
      var _arrayUrl = url.split(separator);
      if (_arrayUrl.length > 1) {
        _arrayUrl.pop();
      }
      return _arrayUrl.join('');
    }

    /**
     * @name setDeviceInfoProvider
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Provider exposed methods to set device info object.
     *
     * @param {Object} deviceObject
     * @return {Object}
     */
    function setDeviceInfoProvider(deviceObject) {
      return _setDeviceInfo(deviceObject);
    }

    /**
     * @name getDeviceInfoProvider
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Provider function that returns device info object.
     *
     * @param {String} [property]
     * @return {*}
     */
    function getDeviceInfoProvider(property) {
      return _getCheckedObject(_deviceInfo, property);
    }

    /**
     * @name readStringListProvider
     * @memberof source._shared.$toolsProvider.$tools
     *
     * @description
     * Public provider method for _readStringList returning repeated elements array.
     *
     * @param {String|Array|Object} list
     * @param {String|Array} [objectProperties]
     * @returns {Array}
     */
    function readStringListProvider(list, objectProperties) {
      objectProperties = objectProperties || null;
      return _readStringList(list, objectProperties, $.REPEATED_ELEMENTS);
    }

    /**
     * @name readStringListUniqueProvider
     * @memberof source._shared.$toolsProvider.$tools
     *
     * @description
     * Public provider method for _readStringList returning unique elements array.
     *
     * @param {String|Array|Object} list
     * @param {String|Array} [objectProperties]
     * @returns {Array}
     */
    function readStringListUniqueProvider(list, objectProperties) {
      objectProperties = objectProperties || null;
      return _readStringList(list, objectProperties, $.UNIQUE_ELEMENTS);
    }

    /**
     * @name arrayMergeProvider
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Exposed provider method for using _arrayMerge. Merges two arrays avoiding duplicate items.
     *
     * @param {Array} array1
     * @param {Array} array2
     * @returns {Array}
     */
    function arrayMergeProvider(array1, array2) {
      return _arrayMerge(array1, array2);
    }

    /**
     * @name setObjectUsingSchemaProvider
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Returns an object with values given in "objectSettings" following the pattern given by "objectSchema".
     * Settings Object will be merged depending on optional variable "mergeOption".
     * Provider function.
     *
     * @param {Object} objectSchema
     * @param {Object} objectSettings
     * @param {Boolean|Object} [mergeOption = false] --> If Boolean: true to merge schema, false no merge with schema.
     *                                               --> If Object, merge with given object.
     * @param {Array} [options = []] --> "noExceptions": to prevent exceptions.
     * @returns {Object}
     */
    function setObjectUsingSchemaProvider(objectSchema, objectSettings, mergeOption, options) {
      mergeOption = mergeOption || $.NO_MERGE;
      options = options || [];
      return _setObjectUsingSchema(objectSchema, objectSettings, mergeOption, options);
    }

    /**
     * @name getCheckedObjectProvider
     * @memberof source._shared.$toolsProvider
     *
     * @description
     * Provider exposed function for _getCheckedObject.
     *
     * @param {Object} objectToGet
     * @param {String} [propertyToGet]
     * @return {*}
     */
    function getCheckedObjectProvider(objectToGet, propertyToGet) {
      return _getCheckedObject(objectToGet, propertyToGet);
    }

    /**
     * @namespace $tools
     * @memberof source._shared.$toolsProvider
     *
     * @requires $filter
     *
     * @description
     * Factory statement for several useful tools.
     *
     * @param {Object} $filter
     * @returns {Object}
     */
    function $get($filter) {
      return {
        /* Global Constants */
        $: $,
        /* Config methods */
        setDeviceInfo: setDeviceInfo,
        getDeviceInfo: getDeviceInfo,
        /* String tools */
        camelCaseTo: camelCaseTo,
        toCamelCase: toCamelCase,
        ucWords: ucWords,
        getRandomString: getRandomString,
        readStringList: readStringList,
        readStringListUnique: readStringListUnique,
        doFriendlyUrl: doFriendlyUrl,
        /* Array tools */
        removeArrayItem: removeArrayItem,
        removeArrayKey: removeArrayKey,
        arrayMerge: arrayMerge,
        twoFromOne: twoFromOne,
        objectsArrayIndexOf: objectsArrayIndexOf,
        /* Object tools */
        getValueFromDotedKey: getValueFromDotedKey,
        parseObjectValues: parseObjectValues,
        setObjectUsingSchema: setObjectUsingSchema,
        getCheckedObject: getCheckedObject,
        /* Date tools */
        dateToIso: dateToIso,
        /* URL tools */
        cleanApiUrlForLocalUse: cleanApiUrlForLocalUse
      };

      /**
       * @name _objectsArrayIndexOf
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Returns array index for an array of objects.
       *
       * @param {Array} array
       * @param {Object} matchProperties
       * @return {Number}
       * @private
       */
      function _objectsArrayIndexOf(array, matchProperties) {
        var _output = null;
        if (angular.isArray(array) && angular.isObject(matchProperties)) {
          var _matchedObjectList = $filter('filter')(array, matchProperties);
          if (angular.isArray(_matchedObjectList) && _matchedObjectList.length === 1) {
            _output = array.indexOf(_matchedObjectList[0]);
          } else {
            throw new Error('Multiple array matching.');
          }
        } else {
          throw new TypeError('Expected array of objects like first method param and object like second param.');
        }
        return _output;
      }

      /**
       * @name setDeviceInfoProvider
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Factory exposed methods to set device info object.
       *
       * @param {Object} deviceObject
       * @return {Object}
       */
      function setDeviceInfo(deviceObject) {
        return _setDeviceInfo(deviceObject);
      }

      /**
       * @name getDeviceInfo
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Factory function that returns device info object.
       *
       * @param {String} [property]
       * @return {*}
       */
      function getDeviceInfo(property) {
        return _getCheckedObject(_deviceInfo, property);
      }

      /**
       * @name camelCaseTo
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Returns a string decoded from camelCase to a char separator way.
       *
       * @param {String} string
       * @param {String} char
       * @returns {String}
       */
      function camelCaseTo(string, char) {
        return _convertString(string, char, $.FROM_CAMELCASE_TO_OTHER);
      }

      /**
       * @name toCamelCase
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Returns a string encoded in camelCase way from any string with char separator.
       *
       * @param {String} string
       * @param {String} char
       * @returns {String}
       */
      function toCamelCase(string, char) {
        return _convertString(string, char, $.FROM_OTHER_TO_CAMELCASE);
      }

      /**
       * @name ucWords
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for using _ucWords. Returns given string with first letter in uppercase.
       *
       * @param {String} string
       * @returns {string}
       */
      function ucWords(string) {
        return _ucWords(string);
      }

      /**
       * @name getRandomString
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Returns random string with given number of chars.
       *
       * @param {Number} stringLength --> Number of chars for random string
       * @returns {string}
       */
      function getRandomString(stringLength) {
        return _getRandomString(stringLength);
      }

      /**
       * @name readStringList
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for _readStringList returning repeated elements array.
       *
       * @param {String|Array|Object} list
       * @param {String|Array} [objectProperties]
       * @returns {Array}
       */
      function readStringList(list, objectProperties) {
        objectProperties = objectProperties || null;
        return _readStringList(list, objectProperties, $.REPEATED_ELEMENTS);
      }

      /**
       * @name readStringListUnique
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for _readStringList returning unique elements array.
       *
       * @param {String|Array|Object} list
       * @param {String|Array} [objectProperties]
       * @returns {Array}
       */
      function readStringListUnique(list, objectProperties) {
        objectProperties = objectProperties || null;
        return _readStringList(list, objectProperties, $.UNIQUE_ELEMENTS);
      }

      /**
       * @name doFriendlyUrl
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for _doFriendlyUrl.
       *
       * @param {String} string
       * @param {String} separator
       * @returns {String}
       */
      function doFriendlyUrl(string, separator) {
        return _doFriendlyUrl(string, separator);
      }

      /**
       * @name removeArrayItem
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Removes a value given from an array. Returns modified array.
       *
       * @param {Array} arrayVar
       * @param {String|Object} item
       * @returns {Array}
       */
      function removeArrayItem(arrayVar, item) {
        return _removeFromArray(arrayVar, item, $.MODE_VALUE);
      }

      /**
       * @name removeArrayKey
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Removes a key given from an array. Returns modified array.
       *
       * @param {Array} arrayVar
       * @param {Number} key
       * @returns {Array}
       */
      function removeArrayKey(arrayVar, key) {
        return _removeFromArray(arrayVar, key, $.MODE_KEY);
      }

      /**
       * @name arrayMerge
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for using _arrayMerge. Merges two arrays avoiding duplicate items.
       *
       * @param {Array} array1
       * @param {Array} array2
       * @returns {Array}
       */
      function arrayMerge(array1, array2) {
        return _arrayMerge(array1, array2);
      }

      /**
       * @name twoFromOne
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for using _twoFromOne. Divide an array in two from a given array length.
       *
       * @param {Number} lengthToDivide
       * @param {Array} array
       * @return {Object}
       */
      function twoFromOne(lengthToDivide, array) {
        return _twoFromOne(lengthToDivide, array);
      }

      /**
       * @name objectsArrayIndexOf
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Public factory method for using _objectsArrayIndexOf.
       *
       * @param {Array} array
       * @param {Object} matchProperties
       * @return {Number}
       */
      function objectsArrayIndexOf(array, matchProperties) {
        return _objectsArrayIndexOf(array, matchProperties);
      }

      /**
       * @name getValueFromDotedKey
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Allows dot notation traversing (Example: object["a.b.c"] in object["a"]["b"]["c"]).
       * Returns undefined value instead of exception if no key in object.
       *
       * @param {Object} object
       * @param {String} dotedKey
       * @returns {*|Undefined}
       */
      function getValueFromDotedKey(object, dotedKey) {
        return _getValueFromDotedKey(object, dotedKey);
      }

      /**
       * @name parseObjectValues
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Parses keysObject to assign correct values from collection valuesObject.
       *
       * @param {Object} keysObject
       * @param {Object} valuesObject
       * @returns {Object}
       */
      function parseObjectValues(keysObject, valuesObject) {
        return _parseObjectValues(keysObject, valuesObject);
      }

      /**
       * @name setObjectUsingSchema
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Returns an object with values given in "objectSettings" following the pattern given by "objectSchema".
       * Settings Object will be merged depending on optional variable "mergeOption".
       *
       * @param {Object} objectSchema
       * @param {Object} objectSettings
       * @param {Boolean|Object} [mergeOption = true] --> If Boolean: true to merge schema, false no merge with schema.
       *                                              --> If Object, merge with given object.
       * @param {Array} [options = []] --> "noExceptions": to prevent exceptions.
       * @returns {Object}
       */
      function setObjectUsingSchema(objectSchema, objectSettings, mergeOption, options) {
        mergeOption = mergeOption || $.NO_MERGE;
        options = options || [];
        return _setObjectUsingSchema(objectSchema, objectSettings, mergeOption, options);
      }

      /**
       * @name getCheckedObject
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Factory exposed function for _getCheckedObject.
       *
       * @param {Object} objectToGet
       * @param {String} [propertyToGet]
       * @return {*}
       */
      function getCheckedObject(objectToGet, propertyToGet) {
        return _getCheckedObject(objectToGet, propertyToGet);
      }

      /**
       * @name dateToIso
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Factory exposed function to _dateToIso
       *
       * @param {*} date
       * @return {String}
       */
      function dateToIso(date) {
        return _dateToIso(date);
      }

      /**
       * @name cleanApiUrlForLocalUse
       * @memberof source._shared.$toolsProvider.$tools
       *
       * @description
       * Removes all API URL string part starting with "?" chart.
       *
       * @param {String} url
       * @return {String}
       */
      function cleanApiUrlForLocalUse(url) {
        return _cleanUrl(url, '?');
      }
    }
  }
})();
