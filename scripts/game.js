(function () {
  "use strict";

  var clues = {
    origin: {
      title: "From Agstafa to Baku.",
      kicker: "SIGNAL 01 · ORIGIN",
      content: '<p>Born and raised primarily in the scenic town of Agstafa, Azerbaijan, Leyla is a proud Azerbaijani who now lives and studies in Baku as she embarks on her university journey.</p>'
    },
    code: {
      title: "A journey shaped by learning.",
      kicker: "SIGNAL 02 · ACADEMIA PRIME · EDUCATION",
      content: '<p>Leyla studied in Agstafa up to the 5th grade. After that, she got accepted to the Shamkir \'Chemistry and Biology Oriented Lyceum\' and studied there for a year. Following that, she returned to Agstafa and completed her high school education there. In 2026, she collected 657 points in DIM and entered ADA University majoring in Computer Engineering.</p>'
    },
    robotics: {
      title: "⚡ Cyber-Core: Skill Matrix",
      kicker: "SIGNAL 03 · CYBER-CORE · ABILITIES & SKILLS",
      content: '<div class="clue-project skill-matrix"><div class="skill-entry"><div class="skill-heading"><strong>Digital Logic &amp; Hardware</strong><span class="skill-stars" role="img" aria-label="5 out of 5 stars">⭐⭐⭐⭐⭐</span></div><p>Building circuits, breadboards, transistors, and logic gates (NOT, AND, OR, XOR).</p></div><div class="skill-entry"><div class="skill-heading"><strong>Programming &amp; Code</strong><span class="skill-stars" role="img" aria-label="4 out of 5 stars">⭐⭐⭐⭐☆</span></div><p>Foundation in software development, JavaScript, HTML, and Git/GitHub version control.</p></div><div class="skill-entry"><div class="skill-heading"><strong>Computer Systems</strong><span class="skill-stars" role="img" aria-label="5 out of 5 stars">⭐⭐⭐⭐⭐</span></div><p>Binary math, two\'s complement arithmetic, and hardware architecture fundamentals.</p></div><div class="skill-entry"><div class="skill-heading"><strong>System Troubleshooting</strong><span class="skill-stars" role="img" aria-label="5 out of 5 stars">⭐⭐⭐⭐⭐</span></div><p>Analytical, first-principles approach to debugging code and diagnosing circuit wiring.</p></div></div>'
    },
    beyond: {
      title: "A universe beyond the classroom.",
      kicker: "SIGNAL 04 · NEBULA-INTERESTS · INTERESTS",
      content: '<p>Outside her studies, Leyla enjoys literature, drawing, coding, and learning new things. These interests and activities give her fresh ideas and ways to express her creativity.</p>'
    }
  };

  function byId(id) { return document.getElementById(id); }
  function openDialog(dialog) {
    if (dialog && !dialog.open) dialog.showModal();
  }
  function closeDialog(dialog) {
    if (dialog && dialog.open) dialog.close();
  }
  function updateMap() {
    var state = window.MissionState.get();
    var count = state.discovered.length;
    var counter = byId("clue-count");
    var fill = byId("progress-fill");
    if (counter) counter.textContent = String(count);
    if (fill) fill.style.width = (count * 25) + "%";
    var message = byId("mission-message");
    if (message) {
      message.textContent = state.landed
        ? "You made it to Earth! Use the joystick to explore the map."
        : state.unlocked
          ? "All 400 credits collected! Autopilot is plotting a course to Earth."
          : state.score + " / 400 credits. Drag your spaceship over a planet to open its signal; first visits earn 100 credits.";
    }
    var earthStatus = byId("earth-status");
    var earthStop = document.querySelector(".earth-stop");
    if (earthStatus) earthStatus.textContent = state.landed ? "ARRIVED" : state.unlocked ? "LANDING OPEN" : "LOCKED";
    if (earthStop) earthStop.classList.toggle("unlocked", state.unlocked);
    document.querySelectorAll(".destination").forEach(function (destination) {
      var trigger = destination.querySelector(".clue-trigger");
      if (trigger) destination.classList.toggle("visited", state.discovered.indexOf(trigger.dataset.planet) !== -1);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var avatarModal = byId("avatar-modal");
    var welcomeModal = byId("welcome-modal");
    var clueModal = byId("clue-modal");
    var victoryModal = byId("victory-modal");
    var bridge = byId("bridge-screen");
    var map = byId("map-screen");
    if (!avatarModal || !bridge || !map || !window.MissionState) return;

    var state = window.MissionState.get();
    var returnToBriefing = new URLSearchParams(window.location.search).get("briefing") === "1";
    if (!state.avatar) openDialog(avatarModal);
    bridge.hidden = state.started && !returnToBriefing;
    map.hidden = !bridge.hidden;
    updateMap();

    var planetTriggers = Array.prototype.slice.call(document.querySelectorAll(".clue-trigger"));
    var selectedPlanet = 0;
    var ship = byId("pixel-saucer");
    var shipPosition = null;
    var currentPlanetContact = null;
    var shipDragging = false;
    var shipPointerId = null;
    var dragStartPointer = null;
    var dragStartPosition = null;
    var autoLanding = false;
    var landingFrame = null;
    var victoryShown = state.landed;
    var confettiTimer = null;
    function selectPlanet(index) {
      if (!planetTriggers.length) return;
      selectedPlanet = (index + planetTriggers.length) % planetTriggers.length;
      document.querySelectorAll(".destination").forEach(function (destination, destinationIndex) {
        destination.classList.toggle("targeted", destinationIndex === selectedPlanet);
      });
      var selectedName = planetTriggers[selectedPlanet].closest(".destination").querySelector("h2").textContent;
      var targetStatus = byId("controller-status");
      if (targetStatus) targetStatus.textContent = "TARGET: " + selectedName.toUpperCase();
    }

    function findNearestPlanet() {
      if (!ship || !planetTriggers.length) return;
      var shipBounds = ship.getBoundingClientRect();
      var shipX = shipBounds.left + shipBounds.width / 2;
      var shipY = shipBounds.top + shipBounds.height / 2;
      var nearestIndex = 0;
      var nearestDistance = Infinity;
      planetTriggers.forEach(function (trigger, index) {
        var planetBounds = trigger.closest(".destination").querySelector(".planet").getBoundingClientRect();
        var dx = shipX - (planetBounds.left + planetBounds.width / 2);
        var dy = shipY - (planetBounds.top + planetBounds.height / 2);
        var distance = dx * dx + dy * dy;
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      selectPlanet(nearestIndex);
    }

    function findPlanetUnderShip() {
      if (!ship || map.hidden) return null;
      var shipBounds = ship.getBoundingClientRect();
      var shipX = shipBounds.left + shipBounds.width / 2;
      var shipY = shipBounds.top + shipBounds.height / 2;
      for (var index = 0; index < planetTriggers.length; index += 1) {
        var trigger = planetTriggers[index];
        var planetBounds = trigger.closest(".destination").querySelector(".planet").getBoundingClientRect();
        if (shipX >= planetBounds.left && shipX <= planetBounds.right && shipY >= planetBounds.top && shipY <= planetBounds.bottom) {
          return { trigger: trigger, index: index };
        }
      }
      return null;
    }

    function rememberPlanetUnderShip() {
      var planet = findPlanetUnderShip();
      currentPlanetContact = planet ? planet.trigger.dataset.planet : null;
    }

    function checkPlanetContact() {
      if (autoLanding || document.querySelector(".modal[open]")) return;
      var planet = findPlanetUnderShip();
      if (!planet) {
        currentPlanetContact = null;
        return;
      }
      var planetId = planet.trigger.dataset.planet;
      if (currentPlanetContact === planetId) return;
      currentPlanetContact = planetId;
      selectPlanet(planet.index);
      openPlanetClue(planet.trigger);
    }

    function positionShip() {
      if (!ship || map.hidden) return;
      var padding = 8;
      var maxX = Math.max(padding, map.clientWidth - ship.offsetWidth - padding);
      var maxY = Math.max(padding, map.clientHeight - ship.offsetHeight - padding);
      if (!shipPosition) {
        shipPosition = state.landed ? getEarthLandingPosition() : null;
        if (!shipPosition) {
          shipPosition = {
            x: map.clientWidth * .52 - ship.offsetWidth / 2,
            y: map.clientHeight * .42 - ship.offsetHeight / 2
          };
        }
      }
      shipPosition.x = Math.min(maxX, Math.max(padding, shipPosition.x));
      shipPosition.y = Math.min(maxY, Math.max(padding, shipPosition.y));
      ship.style.left = shipPosition.x + "px";
      ship.style.top = shipPosition.y + "px";
      if (!autoLanding) findNearestPlanet();
    }

    function hasLandedAtEarth() {
      if (!ship || map.hidden) return false;
      var earth = map.querySelector(".earth-stop .earth-planet");
      if (!earth) return false;
      var shipBounds = ship.getBoundingClientRect();
      var earthBounds = earth.getBoundingClientRect();
      var shipX = shipBounds.left + shipBounds.width / 2;
      var shipY = shipBounds.top + shipBounds.height / 2;
      var earthX = earthBounds.left + earthBounds.width / 2;
      var earthY = earthBounds.top + earthBounds.height / 2;
      var landingX = earthBounds.width / 2 + shipBounds.width / 2 + 16;
      var landingY = earthBounds.height / 2 + shipBounds.height / 2 + 22;
      return Math.abs(shipX - earthX) <= landingX && Math.abs(shipY - earthY) <= landingY;
    }

    function getEarthLandingPosition() {
      if (!ship) return null;
      var earth = map.querySelector(".earth-stop .earth-planet");
      if (!earth) return null;
      var earthBounds = earth.getBoundingClientRect();
      var mapBounds = map.getBoundingClientRect();
      return {
        x: earthBounds.left + earthBounds.width / 2 - mapBounds.left - map.clientLeft - ship.offsetWidth / 2,
        y: earthBounds.top + earthBounds.height / 2 - mapBounds.top - map.clientTop - ship.offsetHeight / 2
      };
    }

    function moveShip(direction) {
      if (autoLanding || document.querySelector(".modal[open]")) return;
      if (!shipPosition) positionShip();
      var step = 24;
      var movement = {
        up: [0, -step],
        down: [0, step],
        left: [-step, 0],
        right: [step, 0]
      }[direction];
      if (!movement || !shipPosition) return;
      shipPosition.x += movement[0];
      shipPosition.y += movement[1];
      positionShip();
      checkPlanetContact();
    }

    positionShip();
    rememberPlanetUnderShip();
    window.addEventListener("resize", positionShip);

    document.querySelectorAll(".avatar-option").forEach(function (option) {
      option.addEventListener("click", function () {
        document.querySelectorAll(".avatar-option").forEach(function (item) {
          item.setAttribute("aria-pressed", item === option ? "true" : "false");
        });
        byId("confirm-avatar").disabled = false;
      });
    });

    byId("confirm-avatar").addEventListener("click", function () {
      var selected = document.querySelector('.avatar-option[aria-pressed="true"]');
      if (!selected) return;
      window.MissionState.setAvatar(selected.dataset.avatar);
      closeDialog(avatarModal);
    });

    byId("open-welcome").addEventListener("click", function () { openDialog(welcomeModal); });
    byId("begin-mission").addEventListener("click", function () {
      window.MissionState.start();
      if (returnToBriefing) {
        var currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete("briefing");
        window.history.replaceState(null, "", currentUrl.pathname + currentUrl.search + currentUrl.hash);
      }
      closeDialog(welcomeModal);
      bridge.hidden = true;
      map.hidden = false;
      positionShip();
      rememberPlanetUnderShip();
      updateMap();
      if (window.MissionState.get().unlocked) startAutomaticLanding();
    });

    function openPlanetClue(trigger) {
      if (autoLanding) return;
      var clue = clues[trigger.dataset.planet];
      if (!clue) return;
      stopShipMovement();
      cancelShipDrag();
      var firstVisit = window.MissionState.discover(trigger.dataset.planet);
      byId("clue-kicker").textContent = clue.kicker + (firstVisit ? " · +100 CREDITS" : " · ALREADY DECODED");
      byId("clue-title").textContent = clue.title;
      byId("clue-content").innerHTML = clue.content;
      byId("clue-content").querySelectorAll('a[target="_blank"]').forEach(function (link) {
        link.rel = "noreferrer";
      });
      var reward = document.querySelector(".clue-reward");
      reward.hidden = !firstVisit;
      byId("close-clue").textContent = window.MissionState.get().unlocked
        ? "ENGAGE AUTOPILOT →"
        : firstVisit ? "BACK TO THE ATLAS →" : "CLOSE SIGNAL →";
      updateMap();
      openDialog(clueModal);
    }

    function clearConfetti() {
      var layer = byId("confetti-layer");
      if (layer) layer.replaceChildren();
      if (confettiTimer !== null) {
        window.clearTimeout(confettiTimer);
        confettiTimer = null;
      }
    }
    function launchConfetti() {
      var layer = byId("confetti-layer");
      clearConfetti();
      if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var colors = ["#ffe989", "#9af4f1", "#b9ffd8", "#c5b9ff", "#ff8f9d"];
      var pieces = document.createDocumentFragment();
      for (var index = 0; index < 72; index += 1) {
        var piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.setProperty("--confetti-color", colors[index % colors.length]);
        piece.style.setProperty("--confetti-duration", 2.4 + Math.random() * 1.2 + "s");
        piece.style.setProperty("--confetti-delay", Math.random() * .65 + "s");
        piece.style.setProperty("--confetti-drift", Math.round(Math.random() * 180 - 90) + "px");
        piece.style.setProperty("--confetti-spin", Math.round(Math.random() * 720 + 360) + "deg");
        pieces.appendChild(piece);
      }
      layer.appendChild(pieces);
      confettiTimer = window.setTimeout(clearConfetti, 4200);
    }
    function showVictoryIfReady() {
      var current = window.MissionState.get();
      if (current.unlocked && current.discovered.length === 4 && current.score >= 400 && !current.landed && !victoryShown && hasLandedAtEarth()) {
        victoryShown = true;
        window.MissionState.markLanded();
        updateMap();
        var targetStatus = byId("controller-status");
        if (targetStatus) targetStatus.textContent = "EARTH: ARRIVED";
        stopShipMovement();
        byId("final-score").textContent = current.score + " CREDITS";
        openDialog(victoryModal);
        launchConfetti();
      }
    }
    function cancelAutomaticLanding() {
      autoLanding = false;
      if (landingFrame !== null) {
        window.cancelAnimationFrame(landingFrame);
        landingFrame = null;
      }
    }
    function startAutomaticLanding() {
      var current = window.MissionState.get();
      if (map.hidden || !current.unlocked || current.discovered.length !== 4 || current.score < 400 || current.landed || victoryShown || autoLanding) return;
      if (!shipPosition) positionShip();
      var target = getEarthLandingPosition();
      if (!target || !shipPosition) return;
      stopShipMovement();
      autoLanding = true;
      var targetStatus = byId("controller-status");
      if (targetStatus) targetStatus.textContent = "AUTOPILOT: EARTH";
      var startX = shipPosition.x;
      var startY = shipPosition.y;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        shipPosition.x = target.x;
        shipPosition.y = target.y;
        autoLanding = false;
        positionShip();
        showVictoryIfReady();
        return;
      }
      var startTime = null;
      function animateLanding(timestamp) {
        if (!autoLanding || map.hidden) {
          landingFrame = null;
          return;
        }
        if (startTime === null) startTime = timestamp;
        var progress = Math.min(1, (timestamp - startTime) / 1800);
        var eased = 1 - Math.pow(1 - progress, 3);
        shipPosition.x = startX + (target.x - startX) * eased;
        shipPosition.y = startY + (target.y - startY) * eased;
        positionShip();
        if (progress < 1) {
          landingFrame = window.requestAnimationFrame(animateLanding);
        } else {
          landingFrame = null;
          autoLanding = false;
          showVictoryIfReady();
        }
      }
      landingFrame = window.requestAnimationFrame(animateLanding);
    }
    byId("close-clue").addEventListener("click", function () { closeDialog(clueModal); });
    clueModal.addEventListener("close", startAutomaticLanding);
    victoryModal.addEventListener("close", clearConfetti);

    function restartMission() {
      if (!window.confirm("Restart the mission? Credits and discovered clues will be reset.")) return;
      cancelAutomaticLanding();
      clearConfetti();
      window.MissionState.reset();
      [welcomeModal, clueModal, victoryModal].forEach(closeDialog);
      map.hidden = true;
      bridge.hidden = false;
      shipPosition = null;
      currentPlanetContact = null;
      victoryShown = false;
      selectPlanet(0);
      updateMap();
    }
    byId("restart-mission").addEventListener("click", restartMission);
    byId("restart-after-victory").addEventListener("click", restartMission);

    var movementTimer = null;
    function stopShipMovement() {
      if (movementTimer !== null) {
        window.clearInterval(movementTimer);
        movementTimer = null;
      }
    }
    function cancelShipDrag() {
      shipDragging = false;
      if (ship) ship.classList.remove("dragging");
      if (ship && shipPointerId !== null && ship.hasPointerCapture(shipPointerId)) {
        ship.releasePointerCapture(shipPointerId);
      }
      shipPointerId = null;
      dragStartPointer = null;
      dragStartPosition = null;
    }
    ship.addEventListener("pointerdown", function (event) {
      if (map.hidden || autoLanding || document.querySelector(".modal[open]")) return;
      event.preventDefault();
      stopShipMovement();
      if (!shipPosition) positionShip();
      shipDragging = true;
      shipPointerId = event.pointerId;
      dragStartPointer = { x: event.clientX, y: event.clientY };
      dragStartPosition = { x: shipPosition.x, y: shipPosition.y };
      ship.classList.add("dragging");
      ship.setPointerCapture(event.pointerId);
    });
    ship.addEventListener("pointermove", function (event) {
      if (!shipDragging || event.pointerId !== shipPointerId || autoLanding) return;
      shipPosition.x = dragStartPosition.x + event.clientX - dragStartPointer.x;
      shipPosition.y = dragStartPosition.y + event.clientY - dragStartPointer.y;
      positionShip();
      checkPlanetContact();
    });
    ship.addEventListener("pointerup", function (event) {
      if (event.pointerId === shipPointerId) cancelShipDrag();
    });
    ship.addEventListener("pointercancel", cancelShipDrag);
    ship.addEventListener("lostpointercapture", cancelShipDrag);
    document.querySelectorAll("[data-move]").forEach(function (button) {
      button.addEventListener("pointerdown", function (event) {
        if (autoLanding || shipDragging || document.querySelector(".modal[open]")) return;
        event.preventDefault();
        stopShipMovement();
        moveShip(button.dataset.move);
        if (!document.querySelector(".modal[open]")) {
          movementTimer = window.setInterval(function () { moveShip(button.dataset.move); }, 110);
        }
        if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
      });
      button.addEventListener("pointerup", stopShipMovement);
      button.addEventListener("pointercancel", stopShipMovement);
      button.addEventListener("click", function (event) {
        if (event.detail === 0) moveShip(button.dataset.move);
      });
    });
    window.addEventListener("pointerup", stopShipMovement);
    window.addEventListener("blur", stopShipMovement);
    document.addEventListener("keydown", function (event) {
      if (map.hidden || autoLanding || document.querySelector(".modal[open]")) return;
      var directions = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down"
      };
      if (directions[event.key]) {
        event.preventDefault();
        moveShip(directions[event.key]);
      }
    });

    document.querySelectorAll("[data-close]").forEach(function (button) {
      button.addEventListener("click", function () { closeDialog(byId(button.dataset.close)); });
    });
    [welcomeModal, clueModal, victoryModal].forEach(function (dialog) {
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeDialog(dialog);
      });
    });
    if (!map.hidden && state.unlocked) startAutomaticLanding();
  });
}());
