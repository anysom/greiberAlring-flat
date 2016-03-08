(function () {
    'use strict';

    var util = require('./util.js');

    var Gallery = function (elem) {
        var galleryItems = elem.find('.gallery__item');
        var cols;

        var initialize = function () {
            //determine cols pr row
            var width = $(window).width();
            cols = 3;

            if (width < 768) {
                cols = 1;
            } else if (width < 992) {
                cols = 2;
            }
        }

        initialize();
        window.addEventListener('resize', util.throttle(initialize, 50, { 'leading': true }));

        var openSubgallery = function (clickedItem) {

            //index diff to item that should append container
            var thisIndex = clickedItem.index();

            clickedItem.addClass('gallery__item--open');

            //if index is less than cols, calculate diff, else to modulus
            var modulus = (thisIndex + 1) % cols;
            var indexDiff = 0;
            if (modulus > 0) { //if modulus is 0, then it means that the clicked element is in the end of a row
                indexDiff = cols - modulus;
            }

            var targetIndex = thisIndex + indexDiff;

            if (targetIndex >= galleryItems.length) {
                targetIndex = galleryItems.length - 1;
            }

            var appendOnItem = $(galleryItems[targetIndex]);

            var subGallery = clickedItem.find('.gallery__sub-gallery').clone();

            //generate arrow position class
            var side = 'left';
            if (modulus === 2 || cols === 1) {
                side = 'center';
            } else if (modulus === 0) {
                side = 'right';
            }
            var arrowPositionClass = 'arrow-pos-' + side;

            var galleryDisplaySection = $('<div class="gallery__sub-gallery-display col-sm-12"></div>');
            galleryDisplaySection.append($('<div class="arrow-container ' + arrowPositionClass + '"></div>'));
            galleryDisplaySection.append(subGallery);

            setTimeout(function () {
                galleryDisplaySection.height(subGallery.outerHeight() + 20); //20 for bottom margin
                galleryDisplaySection.addClass('open');

            }, 1);

            appendOnItem.after(galleryDisplaySection);
        };

        galleryItems.click(function () {
            //if the clicked item is already active, do nothing
            var $this = $(this);
            var galleryDisplaySection = $('.gallery__sub-gallery-display');
            if (galleryDisplaySection.length > 0) {

                galleryDisplaySection.removeClass('open');
                galleryDisplaySection.height(0);

                //if the clicked item was not the one already open, open it.
                if (!$this.hasClass('gallery__item--open')) {
                  setTimeout(function () {
                    galleryDisplaySection.remove();
                    openSubgallery($this);
                  },600);
                }

                $this.removeClass('gallery__item--open');
            } else {
                openSubgallery($this);
            }


        });
    };

    module.exports = Gallery;
})();
