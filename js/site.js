(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "Menu";
    document.body.classList.remove("nav-open");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Close" : "Menu";
      document.body.classList.toggle("nav-open", open);
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeNav();
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduce && "IntersectionObserver" in window) {
    var nodes = document.querySelectorAll(".reveal");
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px 120px 0px", threshold: 0.01 }
    );
    nodes.forEach(function (node) {
      observer.observe(node);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (node) {
      node.classList.add("is-in");
    });
  }

  var sky = document.querySelector(".hero-sky");
  if (sky && !reduce && window.matchMedia("(min-width: 980px)").matches) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, 500);
          sky.style.transform = "translateY(" + y * 0.08 + "px)";
          ticking = false;
        });
      },
      { passive: true }
    );
  }

  var video = document.querySelector("#run-clip");
  if (video) {
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || saveData) {
      video.removeAttribute("autoplay");
      video.pause();
    } else {
      video.muted = true;
      var playPromise = video.play();
      if (playPromise && playPromise.catch) playPromise.catch(function () {});
    }
  }

  var pins = document.querySelectorAll(".pin");
  pins.forEach(function (pin) {
    pin.addEventListener("click", function () {
      var id = pin.getAttribute("data-target");
      var item = id && document.getElementById(id);
      pins.forEach(function (other) {
        other.setAttribute("aria-pressed", "false");
        other.classList.remove("is-on");
      });
      pin.setAttribute("aria-pressed", "true");
      pin.classList.add("is-on");
      document.querySelectorAll(".marker-list li").forEach(function (li) {
        li.classList.remove("is-on");
      });
      if (item) {
        item.classList.add("is-on");
        item.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      }
    });
  });

  var filterButtons = document.querySelectorAll(".filters button");
  var figures = document.querySelectorAll(".gallery figure");
  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter");
      filterButtons.forEach(function (other) {
        other.setAttribute("aria-pressed", other === button ? "true" : "false");
      });
      figures.forEach(function (figure) {
        var who = figure.getAttribute("data-who");
        var show = filter === "all" || who === filter;
        figure.hidden = !show;
      });
    });
  });

  var dialog = document.querySelector("#lightbox");
  var lightboxImg = document.querySelector("#lightbox-img");
  var lightboxCap = document.querySelector("#lightbox-cap");
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot"));
  var current = 0;
  var opener = null;

  function visibleShots() {
    return shots.filter(function (shot) {
      return !shot.closest("figure").hidden;
    });
  }

  function showShot(shot) {
    var img = shot.querySelector("img");
    var full = shot.getAttribute("data-full");
    lightboxImg.src = full;
    lightboxImg.alt = img ? img.alt : "";
    lightboxCap.textContent = img ? img.alt : "";
  }

  function openAt(shot) {
    if (!dialog || !dialog.showModal) return;
    var list = visibleShots();
    current = list.indexOf(shot);
    opener = shot;
    showShot(shot);
    dialog.showModal();
  }

  shots.forEach(function (shot) {
    shot.addEventListener("click", function () {
      openAt(shot);
    });
  });

  if (dialog) {
    dialog.addEventListener("click", function (event) {
      var dir = event.target.getAttribute && event.target.getAttribute("data-dir");
      if (event.target.hasAttribute("data-close")) {
        dialog.close();
        return;
      }
      if (!dir) return;
      var list = visibleShots();
      if (!list.length) return;
      current = (current + Number(dir) + list.length) % list.length;
      showShot(list[current]);
    });

    dialog.addEventListener("close", function () {
      if (opener) opener.focus();
      lightboxImg.removeAttribute("src");
    });

    dialog.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      var list = visibleShots();
      if (!list.length) return;
      var delta = event.key === "ArrowRight" ? 1 : -1;
      current = (current + delta + list.length) % list.length;
      showShot(list[current]);
    });
  }
})();
