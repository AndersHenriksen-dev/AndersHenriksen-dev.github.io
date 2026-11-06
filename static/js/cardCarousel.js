// The arrows on a card carousel. Swiping and the keyboard use the browser's own scrolling, so they need no code here.
document.querySelectorAll('[data-card-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('.card-track');
    var prev = carousel.querySelector('.card-carousel-prev');
    var next = carousel.querySelector('.card-carousel-next');
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function cardStep() {
        return track.children[1].offsetLeft - track.children[0].offsetLeft;
    }

    function move(direction) {
        track.scrollBy({
            left: direction * cardStep(),
            behavior: reducedMotion.matches ? 'auto' : 'smooth',
        });
    }

    // Arrows only show when the cards do not all fit. One pixel of slack covers fractional scroll positions.
    function update() {
        var furthest = track.scrollWidth - track.clientWidth;
        prev.hidden = next.hidden = furthest <= 1;
        prev.disabled = track.scrollLeft <= 1;
        next.disabled = track.scrollLeft >= furthest - 1;
    }

    prev.addEventListener('click', function () { move(-1); });
    next.addEventListener('click', function () { move(1); });
    track.addEventListener('scroll', update, { passive: true });
    new ResizeObserver(update).observe(track);
    update();
});
