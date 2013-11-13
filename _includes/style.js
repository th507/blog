(function() {
    /*jshint curly:false*/
    var hasBlur = false;
    var blurTitle;
    var mouseover = "mouseover";
    var resize = "resize";
    var DOMContentLoaded = "DOMContentLoaded";
    // add blurry effect for posts with longer titles
    blurTitle = function () {
        if (hasBlur) {
            try {
                window.removeEventListener(DOMContentLoaded, blurTitle);
            } catch(e) {}
            return;
        }

        try {
            var leading = document.getElementsByClassName("leading");
            leading = [].slice.call(leading);
            
            if (!leading.length) throw new Error("DOM not ready");
            
            var addBlurry;

            addBlurry = function () {
                var el = this;
                // check only once
                el.removeEventListener(mouseover, addBlurry);

                // boolean toggler for blurry effect
                var index = 0 + (el.offsetWidth + 20 > el.scrollWidth);

                // add or remove blurry effect
                var method = ["add", "remove"];

                el.classList[method[index]]("blurry");
            };

            function checkTitleHover() {
                leading.forEach(function(el) {
                    el.addEventListener(mouseover, addBlurry);
                });
            }
            // initial check
            checkTitleHover();

            // toggler for initial check
            // never run initial check twice
            hasBlur = true;

            // extra check for every resize
            window.addEventListener(resize, checkTitleHover);

        } catch (e) {}
    };

    try {
        window.addEventListener(DOMContentLoaded, blurTitle);
    } catch (e) {}

    blurTitle();
}());
