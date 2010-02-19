var sys = require('sys'),
    // it kind of sucks to rely on a global, and would be better not to.
    // but YUI was written to expect this global to already exist.
    YUI = global.YUI = exports.YUI = require('./yui3/build/yui/yui-debug').YUI;

YUI.config.loaderPath = 'loader/loader-debug.js';
YUI.config.base = './yui3/build/';


YUI.add('yui-log', function(Y) {
    Y.log = function(str, t, m) {
        //Needs to support what Y.log does with the excludeLog and includeLog
        if (Y.config.debug) {
            t = t || 'info';
            m = (m) ? '(' +  m+ ') ' : '';
            var o = false;
            if (Y.Lang.isObject(str) || Y.Lang.isArray(str)) {
                //Should we use this?
                str = sys.inspect(str);
            }
            // output log messages to stderr
            sys.error('[' + t.toUpperCase() + ']: ' + m + str);
        }
    };
});


YUI.add('get', function(Y) {
    Y.Get = function() {};
    Y.Get.script = function(s, cb) {
        url = s.replace(/\.js$/, '');
        Y.log('URL: ' + url, 'info', 'get');
        // doesn't need to be blocking, so don't block.
        require.async(url).addCallback(function (mod) {
            process.mixin(Y, mod);
            if (Y.Lang.isFunction(cb.onEnd)) {
                cb.onEnd.call(Y, cb.data);
            }
            if (Y.Lang.isFunction(cb.onSuccess)) {
                cb.onSuccess.call(Y, cb);
            }
            if (Y.Lang.isFunction(cb.onComplete)) {
                cb.onComplete.call(Y, cb);
            }
        }).addErrback(function (er) {
            if (Y.Lang.isFunction(cb.onFailure)) {
                cb.onFailure.call(Y, er, cb);
            }
            if (Y.Lang.isFunction(cb.onComplete)) {
                cb.onComplete.call(Y, cb);
            }
        });
    };
});

