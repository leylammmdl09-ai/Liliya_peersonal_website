(function () {
  "use strict";

  var storageKey = "leyla-space-mission-v1";
  var avatarImages = {
    green: "assets/images/avatar-green.jpeg",
    white: "assets/images/avatar-white.jpeg",
    blue: "assets/images/avatar-blue.jpeg"
  };
  var state = {
    avatar: null,
    score: 0,
    discovered: [],
    started: false,
    unlocked: false,
    landed: false
  };

  try {
    var saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    if (saved && typeof saved === "object") {
      if (avatarImages[saved.avatar]) state.avatar = saved.avatar;
      if (Number.isFinite(saved.score) && saved.score >= 0) state.score = saved.score;
      if (Array.isArray(saved.discovered)) state.discovered = saved.discovered.filter(function (id) {
        return ["origin", "code", "robotics", "beyond"].indexOf(id) !== -1;
      }).filter(function (id, index, discovered) { return discovered.indexOf(id) === index; });
      state.started = saved.started === true;
      state.score = Math.min(400, Math.max(state.score, state.discovered.length * 100));
      state.unlocked = state.discovered.length === 4 && state.score >= 400;
      state.landed = state.unlocked && saved.landed === true;
    }
  } catch (error) {
    console.warn("Mission progress could not be loaded from this browser.", error);
  }

  function save() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      console.warn("Mission progress could not be saved in this browser.", error);
    }
  }

  function updateHeader() {
    var status = document.getElementById("player-status");
    var avatar = document.getElementById("player-avatar");
    var name = document.getElementById("player-name");
    var score = document.getElementById("score");
    if (status && state.avatar) {
      status.hidden = false;
      avatar.src = avatarImages[state.avatar];
      avatar.alt = state.avatar + " astronaut avatar";
      name.textContent = state.avatar.toUpperCase();
    }
    if (score) score.textContent = String(state.score);
  }

  window.MissionState = {
    get: function () { return state; },
    save: save,
    setAvatar: function (avatar) {
      if (avatarImages[avatar]) state.avatar = avatar;
      save();
      updateHeader();
    },
    discover: function (id) {
      if (["origin", "code", "robotics", "beyond"].indexOf(id) === -1) return false;
      if (state.discovered.indexOf(id) !== -1) return false;
      state.discovered.push(id);
      state.score = Math.min(400, state.score + 100);
      if (state.discovered.length === 4 && state.score >= 400) state.unlocked = true;
      save();
      updateHeader();
      return true;
    },
    markLanded: function () {
      if (!state.unlocked || state.landed) return;
      state.landed = true;
      save();
    },
    start: function () {
      state.started = true;
      save();
    },
    reset: function () {
      state.score = 0;
      state.discovered = [];
      state.started = false;
      state.unlocked = false;
      state.landed = false;
      save();
      updateHeader();
    },
    imageFor: function (avatar) { return avatarImages[avatar]; },
    refresh: updateHeader
  };

  document.addEventListener("DOMContentLoaded", function () {
    updateHeader();
  });
}());
