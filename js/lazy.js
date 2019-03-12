jQuery(document).ready(function ($) {
    // The $ variable is needed by datalets
    window.$ = $

    $('.rtpa-lazy.rtpa-hide').click(function() {
        if ($(this).hasClass('rtpa-hide')) {
            var datalet = $(decodeURIComponent($(this).data('datalet')));
            $(this)
                .removeClass('rtpa-hide')
                .removeData('datalet')
                .html(datalet);
            HTMLImports.loadImports(document.body)
        }
    });

    $(document).scroll(function() {
        var y = $(this).scrollTop() + $(window).height();

        $('.rtpa-lazy.rtpa-hide').each(function() {
            if ( $(this).position().top <= y + 100 ) {
                $(this).click();
            }
        });
    });

    $(document).scroll();
})
