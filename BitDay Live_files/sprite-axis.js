// Sun and Moon across an axis :)

function sun_and_moon(date = new Date()) {

    // Set the width of the orbital container to the width of the screen, and squeeze it in a little.
    var w = $('#orbital').width() / 1.2;

    // Do the same thing with the height. Responsive = Good times.
    var h = $('#orbital').height() / 1.2;

    // Get the hours and minutes.
    var hours = date.getHours();
    var mins = date.getMinutes();

    // Calculate the position of the sun and moon based on the time.
    // Adjust these numbers as you please..    |--------------|
    var pos_rad_sun = (((hours) * 60 + mins) / (24.00 * 61.00)) * Math.PI *  2;
    var pos_rad_moon = (((hours) * 60 + mins) / (24.00 * 60.00)) * Math.PI * 2;

    // Calculate the axis
    SunxCoord = (w / 2) - (w * Math.sin(pos_rad_sun)) / 2;
    SunyCoord = (h / 2) + (h * Math.cos(pos_rad_sun)) / 2;
    MoonxCoord = (w / 2) - (w * Math.sin(pos_rad_moon)) / 2;
    MoonyCoord = (h / 2) + (h * Math.cos(pos_rad_moon)) / 2;


    // Apply the sun class on the top left of the axis based on our previous calculations
    $(".sun").css({
        "top": SunyCoord,
        "left": SunxCoord
    });

    // And do the opposite for the moon, of course!
    $(".moon").css({
        "bottom": MoonyCoord,
        "right": MoonxCoord
    });
}

sun_and_moon();
const refresh_sun_and_moon = setInterval(sun_and_moon, MINUTE);