$(document).ready(function () {
  var $gallery = $('.gallery');
  var $track = $('.gallery-track');
  var $slides = $('.slide');
  var $prev = $('.prev');
  var $next = $('.next');
  var $dots = $('.pagination-dots');

  function getVisibleCount() {
    return $(window).width() <= 640 ? 1 : 3;
  }

  function getPageCount() {
    return Math.max(1, Math.ceil($slides.length / getVisibleCount()));
  }

  function getCurrentPage() {
    return Number($gallery.data('page')) || 0;
  }

  function getShiftAmount() {
    var firstSlideWidth = $slides.first().outerWidth();
    var gap = parseFloat(getComputedStyle($track[0]).gap || getComputedStyle($track[0]).columnGap || 0);
    return firstSlideWidth + gap;
  }

  function updatePager() {
    var currentPage = getCurrentPage();
    var totalPages = getPageCount();
    $prev.prop('disabled', currentPage === 0);
    $next.prop('disabled', currentPage >= totalPages - 1);
    $dots.empty();

    for (var page = 0; page < totalPages; page++) {
      $('<button>', {
        type: 'button',
        class: 'pagination-dot',
        'aria-label': 'Страница ' + (page + 1),
        'aria-current': page === currentPage ? 'true' : 'false'
      }).appendTo($dots);
    }
  }

  function updateSlider() {
    var currentPage = Math.min(getCurrentPage(), getPageCount() - 1);
    var maxStart = Math.max(0, $slides.length - getVisibleCount());
    var start = Math.min(currentPage * getVisibleCount(), maxStart);
    var shift = getShiftAmount() * start;

    $gallery.data('page', currentPage);
    $track.css('transform', 'translateX(-' + shift + 'px)');
    updatePager();
  }

  $prev.on('click', function () {
    var currentPage = getCurrentPage();
    if (currentPage > 0) {
      $gallery.data('page', currentPage - 1);
      updateSlider();
    }
  });

  $next.on('click', function () {
    var currentPage = getCurrentPage();
    var totalPages = getPageCount();
    if (currentPage < totalPages - 1) {
      $gallery.data('page', currentPage + 1);
      updateSlider();
    }
  });

  $dots.on('click', '.pagination-dot', function () {
    $gallery.data('page', $(this).index());
    updateSlider();
  });

  $(window).on('resize', function () {
    var totalPages = getPageCount();
    var currentPage = getCurrentPage();
    if (currentPage >= totalPages) {
      $gallery.data('page', totalPages - 1);
    }
    updateSlider();
  });

  $gallery.data('page', 0);
  updateSlider();
  
});
