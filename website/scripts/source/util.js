(function () {
    'use strict';

    $ = require('../vendor/jquery-1.11.3.min.js');

    var util = {
        throttle: function (func, wait) {
            var timer = null;

            return function () {
                var context = this,
                    args = arguments;

                if (timer === null) {
                    timer = setTimeout(function () {
                        func.apply(context, args);
                        timer = null;
                    }, wait);
                }
            };
        }
    };

    module.exports = util;

})();