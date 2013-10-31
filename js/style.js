(function() {
    var hasBlur = false;
    var blurTitle;
    // add blurry effect for posts with longer titles
    blurTitle = function () {
        if (hasBlur) return;
        try {
            var fourth = document.getElementsByClassName("fourth");
            var addBlurry;

            addBlurry = function (evt) {
                try {
                    var el = this;
                    if (el.offsetWidth >= el.scrollWidth) return;
                    el.nextElementSibling.firstElementChild.classList.add("blurry");
                    el.removeEventListener("mouseover", addBlurry);
                } catch (e) {}
            };

            [].forEach.call(fourth, function(el) {
                el.addEventListener("mouseover", addBlurry);
            });
            hasBlur = true;

            window.removeEventListener("DOMContentLoaded", blurTitle);
        } catch (e) {}
    };

    window.addEventListener("DOMContentLoaded", blurTitle);

    blurTitle();
}());
