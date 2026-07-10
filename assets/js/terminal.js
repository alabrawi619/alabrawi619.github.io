/**
 * CYBER DARK TERMINAL — terminal.js
 * Boot sequence animation & interactive terminal effects
 */

(function () {
  "use strict";

  // ── Boot Sequence ──────────────────────────────────────────
  var BOOT_LINES = [
    { text: "CYBER::TERMINAL OS v3.1.4 — BIOS POST…", cls: "boot-hi",   delay: 0 },
    { text: "Memory Check: 640K OK ................................ [ <span class='boot-ok'>OK</span> ]",  cls: "boot-line", delay: 120 },
    { text: "CPU: Intel 8088 @ 4.77 MHz .......................... [ <span class='boot-ok'>OK</span> ]",  cls: "boot-line", delay: 240 },
    { text: "Video Subsystem: CRT MONO GREEN ...................... [ <span class='boot-ok'>OK</span> ]",  cls: "boot-line", delay: 360 },
    { text: "Loading KERNEL.SYS ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ [ <span class='boot-ok'>OK</span> ]",  cls: "boot-line", delay: 520 },
    { text: "Mounting /dev/blog ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ [ <span class='boot-ok'>OK</span> ]",  cls: "boot-line", delay: 700 },
    { text: "Initializing STDIN/STDOUT ............................ [ <span class='boot-ok'>OK</span> ]",  cls: "boot-line", delay: 880 },
    { text: "Checking filesystem integrity ........................ [ <span class='boot-warn'>WARN</span> ]", cls: "boot-warn", delay: 1050 },
    { text: "Starting network services ............................ [ <span class='boot-ok'>OK</span> ]",   cls: "boot-line", delay: 1230 },
    { text: "BOOT COMPLETE. Welcome, Operator.", cls: "boot-info", delay: 1500 },
    { text: "Type HELP for available commands.", cls: "boot-line", delay: 1700 },
  ];

  function runBootSequence() {
    var container = document.getElementById("boot-sequence");
    if (!container) return;

    BOOT_LINES.forEach(function (item) {
      setTimeout(function () {
        var span = document.createElement("span");
        span.className = "boot-line " + (item.cls || "");
        span.innerHTML = item.text;
        container.appendChild(span);
        // Trigger transition
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            span.classList.add("visible");
          });
        });
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
      }, item.delay);
    });
  }

  // ── Typing Effect for prompt ───────────────────────────────
  function typePrompt(el, text, speed, callback) {
    if (!el) return;
    var i = 0;
    el.textContent = "";
    var timer = setInterval(function () {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, speed || 45);
  }

  // ── Post menu row hover: add > prefix ─────────────────────
  function initMenuInteraction() {
    var rows = document.querySelectorAll(".mainframe-menu tbody tr");
    rows.forEach(function (row) {
      row.addEventListener("click", function () {
        var link = row.querySelector("a");
        if (link) window.location.href = link.href;
      });
    });
  }

  // ── Glitch effect on the ASCII art (occasional flicker) ───
  function initGlitch() {
    var art = document.querySelector(".ascii-art");
    if (!art) return;
    var original = art.textContent;

    function glitch() {
      var chars = "!@#$%^&*<>?/\\|~`";
      var arr = original.split("");
      var numGlitch = Math.floor(Math.random() * 4) + 1;
      for (var i = 0; i < numGlitch; i++) {
        var idx = Math.floor(Math.random() * arr.length);
        if (arr[idx] !== "\n" && arr[idx] !== " ") {
          arr[idx] = chars[Math.floor(Math.random() * chars.length)];
        }
      }
      art.textContent = arr.join("");
      setTimeout(function () {
        art.textContent = original;
      }, 80);
    }

    setInterval(function () {
      if (Math.random() < 0.25) glitch();
    }, 3500);
  }

  // ── Typing prompt on index ─────────────────────────────────
  function initIndexPrompt() {
    var el = document.getElementById("live-prompt-text");
    if (!el) return;
    var commands = [
      "LIST POSTS --all",
      "GREP 'interesting' /dev/blog",
      "TAIL -f /var/log/thoughts.log",
      "CAT README.md",
      "SSH root@ideas -p 1337",
    ];
    var idx = 0;
    function next() {
      typePrompt(el, commands[idx % commands.length], 55, function () {
        setTimeout(function () {
          idx++;
          next();
        }, 2400);
      });
    }
    setTimeout(next, 2200);
  }

  // ── DOMContentLoaded ──────────────────────────────────────
  document.addEventListener("DOMContentLoaded", function () {
    runBootSequence();
    initMenuInteraction();
    initGlitch();
    initIndexPrompt();
  });
})();
