var $window = $(window);
var windowWidth = $window.width();
var windowHeight = $window.height();
var mousePos = {x:windowWidth/2,y:windowHeight/2};

$(window).resize(function(){
  windowWidth = $window.width();
  windowHeight = $window.height();
});

clip(mousePos);

$(document).mousemove(function(e){
  mousePos = {x:e.pageX,y:e.pageY};
  clip(mousePos);
});

function clip(mousePos) {
  var pourcPos = {'x':mousePos.x * 100 / windowWidth * 2,
                  'y':mousePos.y * 100 / windowHeight};
  var gapX = pourcPos.x * 30 / 200 - 15;
  var gapY = (15 *(pourcPos.y * 30 / 100 - 15)) / 100;
  var pointTop;
  var pointBottom;
  if (pourcPos.y<50) {
    pointTop = 150 - pourcPos.x + gapY * gapX;
    pointBottom = 150 - pourcPos.x;
  } else {
    pointTop = 150 - pourcPos.x;
    pointBottom = 150 - pourcPos.x - gapY * gapX;
  }
  if (pourcPos.x<100) {
    $('.back').addClass('on');
    $('.front').removeClass('on');
  }else if (pourcPos.x>100) {
    $('.back').removeClass('on');
    $('.front').addClass('on');
  } else {
    $('.back').add('.front').removeClass('on');
  }
  $('.front').css({'clip-path':'polygon('+pointTop+'% 0%, 100% 0%, 100% 100%, '+pointBottom+'% 100%)'});
}