$(document).ready(function () {
    headerHeight = $("header").height();
    html = '<ul class="row"><li class="col-xs-12"><a href="javascript:showMenu();">MENU<b id="arrow" class="animate"></b></a></li></ul><ul class="row" id="menu-items">';
    colLength = Math.round(12 / $('.article-title').length);
    if (colLength < 3) {
        colLength = 3
    }
    if (colLength > 6) {
        colLength = 6;
    }
    $('.article-title').each(function () {
        $me = $(this);
        name = $me.text().trim();
        id = $me.attr("id")
        html += '<li class="menu-item col-xs-6 col-md-' + colLength + ' text-center"><a href="#' + id + '">' + name + '</a></li>'
    })
    $("nav").html(html + "</ul>")
}).scroll(function () {
    if ($(document).scrollTop() > headerHeight) {
        if ($("nav").css("display") == "none") {
            $("nav").slideDown("fast");
        }
    } else {
        if ($("nav").css("display") != "none") {
            $("nav").slideUp("fast");
        }
    }
}).on("click", "li.menu-item a", function() {
    showMenu();
}).on("click","a",function(e){
    $href = $(this).attr("href")
    if($href.substr(0,1) == "#"){
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $($href).offset().top - headerHeight + 20
        }, 1000);
    }
});
function showMenu() {
    if ($("#menu-items").css("display") == "none") {
        $("#menu-items").slideDown("fast");
        $("#arrow").addClass("rotate-90")
    } else {
        $("#menu-items").slideUp("fast");
        $("#arrow").removeClass("rotate-90")
    }
}