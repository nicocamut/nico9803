$.noConflict();
jQuery(document).ready(function ($) {

  "use strict";

  var LIMIT_MOBILE_INTERACTION_WIDTH = 1024,
    LIMIT_MOBILE_CONTENT = 700,
    BASE_URL = "img/";

  var $window = $(window),
    windowWidth = $window.width(),
    windowHeight = $window.height(),
    numberOfItems = 0,
    numberOfSteps = 0,
    isVertical = true,
    currentScreenIndex = 0,
    currentStepIndex = 0,
    offsetTop = 0,
    $slidesMobilePanorama,
    $progressBar = $(".progress"),


    init = function () {
      createContent();
      bindKeyboard();

      if (windowWidth <= LIMIT_MOBILE_INTERACTION_WIDTH) {
        bindMobileSwipe();
      }
    },

    createContent = function () {
      var $templateElement = $(".template .element"),
        templateButtonHTML = $(".template .up-btn")[0].outerHTML,
        htmlToInject = "";

      for (var i = 0; i < data.slides.length; i++) {
        var slide = data.slides[i],
          $templateClone = $templateElement.clone();

        // si le background est une image ou si l'on est sur mobile
        if (slide.bg.type === "img" || windowWidth < LIMIT_MOBILE_CONTENT) {
          var centringBG = slide.bg.hasOwnProperty("centering") ? slide.bg.centering : data.defaultCentering,
                  isMobilePanorama = slide.bg.hasOwnProperty("mobilePanorama");

          if (isMobilePanorama) { $templateClone.addClass("slidePanorama");}

          //Load only the 2 first images
          if (i < 2) {
            $templateClone
              .prepend('<img class="bg-img ' + centringBG + ' ' + isMobilePanorama + '" src="' + BASE_URL + slide.bg.imageSrc + '" srcSet="' + slide.bg.srcSet + '" alt="' + slide.bg.alt + '">');
          } else {
            $templateClone
              .prepend('<img class="bg-img ' + centringBG + ' ' + isMobilePanorama + '" data-src="' + BASE_URL + slide.bg.imageSrc + '" data-srcset="' + slide.bg.srcSet + '" alt="' + slide.bg.alt + '">');
          }

        //si c'est une vidéo
        } else {
          var videoSrcs = "";
          for (var j = 0; j < slide.bg.src.length; j++) {
            videoSrcs += '<source src="' + slide.bg.src[j] + '" type="video/' + slide.bg.src[j].split('.').pop() + '" />';
          }
          $templateClone
            .prepend('<video class="bg bg-video" autoplay="true" loop muted>' + videoSrcs + '</video>');
        }

        var contentHtml = "";
        for (var k = 0; k < slide.content.length; k++) {

          switch (slide.content[k].type) {
          case "longText":
            contentHtml += '<div class="text" data-visible="true"><div class="text-content">' + slide.content[k].text + templateButtonHTML + '</div></div>';
            break;

          case "smallText":
            contentHtml += '<div class="small_text-wrapper"><p class="small_text">' + slide.content[k].text + '</p></div>';
            break;

          case "legend":
            contentHtml += '<p class="legend">' + slide.content[k].text + '</p>';
            break;

          default:
            return;
          }

        }
        $templateClone
          .find(".content")
          .append(contentHtml);


          htmlToInject += $templateClone[0].outerHTML;
      }


      $(htmlToInject).insertAfter($(".introduction"));

      //chaque premier "content" est initialisé pour la navigation
      $(".content > *:first-child").attr("data-visible", "true");

      //Set vars
      numberOfItems = $(".main .element").length;
      numberOfSteps = $(".content > *").length;
      $slidesMobilePanorama = $("#n-e .element.slidePanorama");

      bindGlobalActions();
    },

    bindGlobalActions = function () {

      //reset scroll position
      $(".main").scrollLeft(0);

      //Offset recréé en Javascript pour pouvoir faire un scroll vers le haut
      offSetNegativeMarginText();

      $("[data-action='moveRight']").click(function () {
        moveRight();
        $.getScript("https://referentiel.nouvelobs.com/scripts/xiti/nouvelobs.com/xtcore.js");
      });

      $("[data-action='moveLeft']").click(function () {
        moveLeft();
        $.getScript("https://referentiel.nouvelobs.com/scripts/xiti/nouvelobs.com/xtcore.js");
      });

      $("[data-action='moveDown']").click(function () {
        moveDown();
      });

      $("[data-action='share']").click(function () {
        $(".step1").addClass("step-hidden");
        $(".step2").removeClass("step-hidden");
      });

      //Add scroll event
      $.each($(".text-content").parents(".content"), function () {
        var $this = $(this);

        offsetTop = $this.scrollTop();

        $this.scroll(function () {
          var opacityUpNav = 1 - ($this.scrollTop() / offsetTop);

          $this.find(".up-btn").css("opacity", opacityUpNav);
        });
      });

    },

    offSetNegativeMarginText = function () {
      $(".text-content").removeClass("JSoffset");

      offsetTop = $(".text-content").css("margin-top");

      $(".text-content").addClass("JSoffset");
      $(".element:not(.conclusion):not(.interstice) .content").scrollTop(-parseInt(offsetTop, 10));
    },

    moveRight = function () {
      var $currentElement = $(".main .element").eq(currentScreenIndex),
        $children = $currentElement.find(".content").children(),
        childAmount = $children.length;

      if (currentScreenIndex + 1 < numberOfItems
          && $children.last().attr("data-visible") === "true"
          || $currentElement.hasClass("interstice")
        ) {
        currentScreenIndex++;
        currentStepIndex++;

        var $imgToLoad = $(".main .element").eq(currentScreenIndex + 2).find(".bg-img");
        $imgToLoad.attr({
          src: $imgToLoad.attr("data-src"),
          srcset: $imgToLoad.attr("data-srcset"),
        });

        horizontalScrollTo();
        displayNavigation();

      } else if (childAmount > 1) {
        $currentElement
          .find("[data-visible='true']")
          .attr("data-visible", "false")
          .animate({opacity: 0, bottom: "5.7em"}, function () {
            $(this).hide();
          })
          .next()
          .show()
          .attr("data-visible", "true")
          .animate({opacity: 1, bottom: "0.8em"});

        currentStepIndex++;
        displayNavigation();
      }

    },

    moveLeft = function () {
      var $currentElement = $(".main .element").eq(currentScreenIndex),
        $children = $currentElement.find(".content").children(),
        childAmount = $children.length;

      if(currentScreenIndex > 0
        && $children.first().attr("data-visible") === "true"
        || $currentElement.hasClass("conclusion")
        || $currentElement.hasClass("interstice")
        ) {
        currentScreenIndex--;
        currentStepIndex--;
        horizontalScrollTo();
        displayNavigation();
      } else if (childAmount > 1 && $currentElement.find("[data-visible='true']").index() > 0) {
        $currentElement
          .find("[data-visible='true']")
          .attr("data-visible", "false")
          .animate({opacity: 0, bottom: "5.7em"}, function () {
            $(this).hide();
          })
          .prev()
          .show()
          .attr("data-visible", "true")
          .animate({opacity: 1, bottom: "0.8em"});

        currentStepIndex--;
        displayNavigation();
      }

    },

    moveDown = function () {
      var $currentElement = $(".element").eq(currentScreenIndex),
        $currentTextElement = $currentElement.find(".text-content"),
        scrollMax = $currentTextElement.outerHeight() + 0.8 * 17,
        destination = $currentElement.find(".content").scrollTop() + windowHeight / 2.5;


      if (destination > scrollMax) destination = scrollMax;

      TweenLite.to($currentElement.find(".content"), 0.6, {scrollTo: {y: destination}, ease: Power2.easeOut});

    },

    moveUp = function () {
      var $currentElement = $(".element").eq(currentScreenIndex),
        scrollMax = 0,
        destination = $currentElement.find(".content").scrollTop() - windowHeight / 3;

      if (destination < scrollMax) destination = scrollMax;

      TweenLite.to($currentElement.find(".content"), 0.6, {scrollTo: {y: destination}, ease: Power2.easeOut});

    },

    horizontalScrollTo = function (position) {
      var destination = arguments.length === 0 ? currentScreenIndex * windowWidth : position,
        target = ".main";

      // TweenLite.to(target, 0.3, {x: -destination});
      $(".element").slice(currentScreenIndex, numberOfItems).css("opacity",0)
      $(".element").slice(currentScreenIndex, numberOfItems).css("z-index",0);
      $(".element").eq(currentScreenIndex).css("opacity",1);
      $(".element").eq(currentScreenIndex).css("z-index",1);
    },

    displayNavigation = function () {

      //intro
      if (currentStepIndex === 0) {
        $(".nav-btn").fadeOut(100);
        $(".progress-bar").fadeOut(100);

      //slide
      } else if (currentStepIndex > 0 && currentStepIndex + 1 < numberOfSteps) {
        $(".nav-btn").fadeIn(100);
        $(".progress-bar").fadeIn(100);

      //conclusion
      } else {
        $(".next-btn").fadeOut(100);
        $(".up-btn").fadeOut(100);
        $(".prev-btn").fadeIn(100);
      }


      var $currentElement = $(".element").eq(currentScreenIndex),
        $thisContent = $(".main .element").eq(currentScreenIndex).find(".content"),
        isText = $thisContent.children().hasClass("text"),
        opacityUpNav = isText ? 1 - ($thisContent.scrollTop() / offsetTop) : 0;

      $currentElement.find(".up-btn").css("opacity", opacityUpNav);


      $progressBar.width((currentStepIndex + 1) / numberOfSteps * 100 + "%");

    },

    bindKeyboard = function () {

      $(document).keydown(function (e) {
        switch (e.which) {
        case 37: // left key
          moveLeft();
          break;

        case 38: // up key
          moveUp();
          break;

        case 39: // right key
          moveRight();
          break;

        case 40: // down key
          moveDown();
          break;

        default:
          return; // exit this handler for other keys
        }
        e.preventDefault();
      });

    },

    bindMobileSwipe = function () {

      delete Hammer.defaults.cssProps.userSelect;
      var swipeItem = new Hammer(document.body);
      swipeItem.stop_browser_behavior = false;
      swipeItem.on('swipe', function (ev) {
        if (ev.direction === 2) {
          moveRight()
        } else {
          moveLeft()
        }
      });

    };


  $(function () {
    init();
    $window.resize(function () {
      windowWidth = $window.width();
      windowHeight = $window.height();

      if(windowWidth > windowHeight) {
        isVertical = false;
        $("#n-e .element:not(.introduction) .bg-img").css({
          'transform': 'translateX(0px)'
        });
      } else {
        isVertical = true;
      }

    });


    new FastClick(document.body);

    if (window.DeviceOrientationEvent) {

      window.addEventListener("deviceorientation", function(event) {
         if(isVertical){
          $slidesMobilePanorama.each(function(){
            var $this = $(this),
              shift = Math.round(event.gamma*5);

            if( Math.abs(shift) < ($this.find("img").width() - windowWidth) / 2 ){
                if($this.find(".content").scrollTop() < 3) {
                    TweenLite.to($this.find(".bg-img"), 0.5, {x: shift});
                }
            }
          });
         }
      }, true);

    } else {
      console.log("Sorry, your browser doesn't support Device Orientation");
    }
  });

});