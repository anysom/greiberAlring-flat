(function() {
    'use strict';

    window.$ = window.jQuery = require('../vendor/jquery-1.11.3.min.js');
    require('../vendor/jquery.easing.min.js');
    require('../vendor/jquery.fancybox.js');
    var Bootstrap = require('../vendor/bootstrap.min.js');
    var Gallery = require('./gallery.js');


    $(document).ready(function () {
        $('body').scrollspy({ target: '#navbar' });

        //gallery stuff
        $('.fancybox').fancybox();

        Gallery($('#gallery'));

        //jQuery for page scrolling feature - requires jQuery Easing plugin
        $(function() {
            $('a.page-scroll').bind('click', function(event) {
                var $anchor = $(this);
                $('html, body').stop().animate({
                    scrollTop: $($anchor.attr('href')).offset().top
                }, 1000, 'easeInOutExpo');
                event.preventDefault();
            });
        });


        //lock height of top section
        $('.jumbo-presentation').height($('.jumbo-presentation').height());

    });

})();
