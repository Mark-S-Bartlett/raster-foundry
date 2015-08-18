'use strict';

var $ = require('jquery'),
    React = require('react'),
    views = require('./views'),
    router = require('../router').router,
    Login = require('./components/login'),
    Library = require('./components/library');

// TODO: Delete (for demonstration purposes only).
var _logged_in = false;

var HomeController = {
    index: function() {
        if (!_logged_in) {
            router.go('/login');
            return;
        }

        var props = {
            handleLogout: function(e) {
                e.preventDefault();
                _logged_in = false;
                router.go('/login');
            }
        };

        var el = $('#container').get(0);
        React.render(<Library {...props} />, el);
    }
};

var UserController = {
    login: function() {
        var props = {
            handleLogin: function(e) {
                e.preventDefault();
                _logged_in = true;
                router.go('/');
            }
        };

        var el = $('#container').get(0);
        React.render(<Login {...props} />, el);
    }
};

module.exports = {
    HomeController: HomeController,
    UserController: UserController
};
