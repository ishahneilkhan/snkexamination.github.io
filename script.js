/* =========================================================
   SNK AI ACADEMY — STUDENT PORTAL
   Step 1.19.1
   FULL script.js
========================================================= */

"use strict";


/* =========================================================
   1. GLOBAL CONFIG
========================================================= */

const SNKPortal = {

  storage: {
    theme: "snkTheme",
    language: "snkLanguage",

    studentLoggedIn: "snkStudentLoggedIn",
    studentId: "snkStudentId",
    studentName: "snkStudentName",
    studentCourse: "snkStudentCourse",

    studentProfile: "snkStudentProfile",
    classReady: "snkClassReady"
  },

  student: {
    defaultId: "SNK-1001",
    defaultName: "Student",
    defaultCourse: "Computer Office Application",
    batch: "Batch 01"
  },

  course: {
    name: "Computer Office Application",
    duration: "6 Months",
    mode: "Offline",
    days: "Saturday – Monday",
    time: "4:00 PM – 6:00 PM",

    /*
      Course start date
      08 September 2026
    */
    startDate: "2026-09-08T16:00:00"
  },

  pages: {
    home: "index.html",
    dashboard: "student-dashboard.html",
    course: "courses.html",
    assignment: "assignments.html",
    quiz: "quiz.html",
    result: "results.html",
    attendance: "student-attendance.html",
    resources: "student-resources.html",
    notifications: "student-notifications.html",
    support: "student-support.html",
    settings: "student-settings.html",
    contact: "student-contact.html",
    profile: "student-profiles.html",
    class: "student-class.html",
    timetable: "student-timetable.html",
    certificates: "student-certificates.html",
    idCard: "student-id-cards.html",
    login: "login.html"
  }

};


/* =========================================================
   2. SHORT SELECTOR HELPERS
========================================================= */

function $(selector, parent = document) {
  return parent.querySelector(selector);
}


function $$(selector, parent = document) {
  return Array.from(
    parent.querySelectorAll(selector)
  );
}


/* =========================================================
   3. STORAGE HELPERS
========================================================= */

function getStorageValue(key) {

  try {

    return (
      sessionStorage.getItem(key) ||
      localStorage.getItem(key)
    );

  } catch (error) {

    console.warn(
      "Storage read error:",
      error
    );

    return null;
  }

}


function setLocalValue(key, value) {

  try {

    localStorage.setItem(
      key,
      value
    );

    return true;

  } catch (error) {

    console.warn(
      "LocalStorage write error:",
      error
    );

    return false;
  }

}


function setSessionValue(key, value) {

  try {

    sessionStorage.setItem(
      key,
      value
    );

    return true;

  } catch (error) {

    console.warn(
      "SessionStorage write error:",
      error
    );

    return false;
  }

}


function removeStorageValue(key) {

  try {

    localStorage.removeItem(key);
    sessionStorage.removeItem(key);

  } catch (error) {

    console.warn(
      "Storage remove error:",
      error
    );

  }

}


/* =========================================================
   4. STUDENT SESSION
========================================================= */

function isStudentLoggedIn() {

  const sessionLogin =
    sessionStorage.getItem(
      SNKPortal.storage.studentLoggedIn
    );

  const localLogin =
    localStorage.getItem(
      SNKPortal.storage.studentLoggedIn
    );

  return (
    sessionLogin === "true" ||
    localLogin === "true"
  );

}


function getStudentData() {

  const studentId =
    getStorageValue(
      SNKPortal.storage.studentId
    ) ||
    SNKPortal.student.defaultId;


  const studentName =
    getStorageValue(
      SNKPortal.storage.studentName
    ) ||
    SNKPortal.student.defaultName;


  const studentCourse =
    getStorageValue(
      SNKPortal.storage.studentCourse
    ) ||
    SNKPortal.student.defaultCourse;


  return {

    id: studentId,

    name: studentName,

    course: studentCourse,

    batch: SNKPortal.student.batch

  };

}


/* =========================================================
   5. UPDATE STUDENT UI
========================================================= */

function updateStudentUI() {

  const student =
    getStudentData();


  const studentNameElements = $$(
    "[data-student-name]"
  );

  studentNameElements.forEach(
    element => {
      element.textContent =
        student.name;
    }
  );


  const studentIdElements = $$(
    "[data-student-id]"
  );

  studentIdElements.forEach(
    element => {
      element.textContent =
        student.id;
    }
  );


  const studentCourseElements = $$(
    "[data-student-course]"
  );

  studentCourseElements.forEach(
    element => {
      element.textContent =
        student.course;
    }
  );


  const heroName =
    $("#heroStudentName");

  if (heroName) {
    heroName.textContent =
      student.name;
  }


  const heroId =
    $("#heroStudentId");

  if (heroId) {

    heroId.textContent =
      "Student ID: " +
      student.id;

  }


  const heroCourse =
    $("#heroCourseName");

  if (heroCourse) {

    heroCourse.textContent =
      student.course;

  }


  updateProfileFromStorage();

}


/* =========================================================
   6. PROFILE DATA CONNECTION
========================================================= */

function updateProfileFromStorage() {

  let profile = null;


  try {

    const raw =
      localStorage.getItem(
        SNKPortal.storage.studentProfile
      );

    if (raw) {
      profile = JSON.parse(raw);
    }

  } catch (error) {

    console.warn(
      "Profile data error:",
      error
    );

  }


  if (!profile) {
    return;
  }


  const profileName =
    profile.name ||
    profile.studentName;


  if (profileName) {

    const elements =
      $$("[data-profile-name]");

    elements.forEach(
      element => {
        element.textContent =
          profileName;
      }
    );

  }


  if (profile.mobile) {

    $$("[data-profile-mobile]")
      .forEach(element => {

        element.textContent =
          profile.mobile;

      });

  }


  if (profile.email) {

    $$("[data-profile-email]")
      .forEach(element => {

        element.textContent =
          profile.email;

      });

  }


  if (profile.address) {

    $$("[data-profile-address]")
      .forEach(element => {

        element.textContent =
          profile.address;

      });

  }

}


/* =========================================================
   7. THEME SYSTEM
========================================================= */

function getPreferredTheme() {

  const savedTheme =
    localStorage.getItem(
      SNKPortal.storage.theme
    );


  if (
    savedTheme === "dark" ||
    savedTheme === "light"
  ) {

    return savedTheme;

  }


  return "dark";

}


function applyTheme(theme) {

  const body =
    document.body;


  if (!body) {
    return;
  }


  if (theme === "light") {

    body.classList.add(
      "light-theme"
    );

  } else {

    body.classList.remove(
      "light-theme"
    );

  }


  setLocalValue(
    SNKPortal.storage.theme,
    theme
  );


  updateThemeButton(theme);

}


function updateThemeButton(theme) {

  const buttons = [
    $("#themeToggle"),
    $("#themeButton"),
    $("[data-theme-toggle]")
  ].filter(Boolean);


  buttons.forEach(button => {

    const icon =
      button.querySelector("i");


    if (icon) {

      icon.className =
        theme === "light"
          ? "fa-solid fa-sun"
          : "fa-solid fa-moon";

    }


    button.setAttribute(
      "aria-label",
      theme === "light"
        ? "Switch to Dark Theme"
        : "Switch to Light Theme"
    );


    button.setAttribute(
      "title",
      theme === "light"
        ? "Switch to Dark Theme"
        : "Switch to Light Theme"
    );

  });

}


function toggleTheme() {

  const currentTheme =
    getPreferredTheme();


  const nextTheme =
    currentTheme === "dark"
      ? "light"
      : "dark";


  applyTheme(
    nextTheme
  );


  showToast(
    nextTheme === "dark"
      ? "Dark theme enabled"
      : "Light theme enabled",
    "success"
  );

}


/* =========================================================
   8. LANGUAGE SYSTEM
========================================================= */

function getLanguage() {

  return (
    localStorage.getItem(
      SNKPortal.storage.language
    ) ||
    "en"
  );

}


function setLanguage(language) {

  if (
    language !== "en" &&
    language !== "bn"
  ) {

    language = "en";

  }


  setLocalValue(
    SNKPortal.storage.language,
    language
  );


  updateLanguageButton(
    language
  );


  /*
    Full bilingual translation will be
    connected in a future portal version.

    Current navigation remains English
    as requested.
  */

}


function toggleLanguage() {

  const current =
    getLanguage();


  const next =
    current === "en"
      ? "bn"
      : "en";


  setLanguage(
    next
  );


  showToast(
    next === "bn"
      ? "Bangla mode selected"
      : "English mode selected",
    "success"
  );

}


function updateLanguageButton(
  language
) {

  const button =
    $("#languageToggle");


  if (!button) {
    return;
  }


  const span =
    button.querySelector("span");


  if (span) {

    /*
      Keep button label English.
      User specifically requested
      Home to remain English.
    */

    span.textContent =
      language === "bn"
        ? "Bangla"
        : "English";

  }

}


/* =========================================================
   9. MOBILE NAVIGATION
========================================================= */

function initMobileNavigation() {

  const menuButton =
    $("#mobileMenuBtn");

  const nav =
    $("#mainNav");


  if (!menuButton || !nav) {
    return;
  }


  menuButton.addEventListener(
    "click",
    function () {

      const opened =
        nav.classList.toggle(
          "mobile-open"
        );


      menuButton.setAttribute(
        "aria-expanded",
        opened
          ? "true"
          : "false"
      );


      menuButton.innerHTML =
        opened
          ? '<i class="fa-solid fa-xmark"></i>'
          : '<i class="fa-solid fa-bars"></i>';

    }
  );


  $$(".nav-link", nav)
    .forEach(link => {

      link.addEventListener(
        "click",
        function () {

          nav.classList.remove(
            "mobile-open"
          );


          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );


          menuButton.innerHTML =
            '<i class="fa-solid fa-bars"></i>';

        }
      );

    });


  document.addEventListener(
    "click",
    function (event) {

      if (
        nav.classList.contains(
          "mobile-open"
        ) &&
        !nav.contains(event.target) &&
        !menuButton.contains(event.target)
      ) {

        nav.classList.remove(
          "mobile-open"
        );


        menuButton.setAttribute(
          "aria-expanded",
          "false"
        );


        menuButton.innerHTML =
          '<i class="fa-solid fa-bars"></i>';

      }

    }
  );

}


/* =========================================================
   10. LOGIN REQUIRED SYSTEM
========================================================= */

function initProtectedLinks() {

  const protectedLinks =
    $$("[data-login-required='true']");


  protectedLinks.forEach(
    link => {

      link.addEventListener(
        "click",
        function (event) {

          if (
            !isStudentLoggedIn()
          ) {

            event.preventDefault();

            showLoginRequiredModal();

          }

        }
      );

    }
  );

}


function showLoginRequiredModal() {

  const modal =
    $("#loginRequiredModal");


  if (!modal) {

    /*
      Fallback if modal is not
      available on another page.
    */

    const confirmed =
      window.confirm(
        "Please login first to access your student portal."
      );


    if (confirmed) {
      window.location.href =
        SNKPortal.pages.login;
    }


    return;
  }


  modal.classList.add(
    "show"
  );


  modal.setAttribute(
    "aria-hidden",
    "false"
  );


  document.body.classList.add(
    "no-scroll"
  );

}


function closeLoginRequiredModal() {

  const modal =
    $("#loginRequiredModal");


  if (!modal) {
    return;
  }


  modal.classList.remove(
    "show"
  );


  modal.setAttribute(
    "aria-hidden",
    "true"
  );


  document.body.classList.remove(
    "no-scroll"
  );

}


function initLoginModal() {

  const modal =
    $("#loginRequiredModal");


  const closeButton =
    $("#closeLoginModal");


  const cancelButton =
    $("#cancelLoginModal");


  if (closeButton) {

    closeButton.addEventListener(
      "click",
      closeLoginRequiredModal
    );

  }


  if (cancelButton) {

    cancelButton.addEventListener(
      "click",
      closeLoginRequiredModal
    );

  }


  if (modal) {

    modal.addEventListener(
      "click",
      function (event) {

        if (
          event.target === modal
        ) {

          closeLoginRequiredModal();

        }

      }
    );

  }

}


/* =========================================================
   11. LOGOUT
========================================================= */

function logoutStudent() {

  removeStorageValue(
    SNKPortal.storage.studentLoggedIn
  );

  removeStorageValue(
    SNKPortal.storage.studentId
  );

  removeStorageValue(
    SNKPortal.storage.studentName
  );

  removeStorageValue(
    SNKPortal.storage.studentCourse
  );


  sessionStorage.removeItem(
    SNKPortal.storage.studentLoggedIn
  );

  sessionStorage.removeItem(
    SNKPortal.storage.studentId
  );

  sessionStorage.removeItem(
    SNKPortal.storage.studentName
  );

  sessionStorage.removeItem(
    SNKPortal.storage.studentCourse
  );


  showToast(
    "Logged out successfully",
    "success"
  );


  setTimeout(
    function () {

      window.location.href =
        SNKPortal.pages.login;

    },
    500
  );

}


/* =========================================================
   12. LOGOUT BUTTON CONNECTION
========================================================= */

function initLogoutButtons() {

  const buttons = $$(
    "[data-logout]"
  );


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          logoutStudent();

        }
      );

    }
  );

}


/* =========================================================
   13. COUNTDOWN / COURSE STATUS
========================================================= */

let countdownTimer = null;


function updateCountdown() {

  const startDate =
    new Date(
      SNKPortal.course.startDate
    );


  const now =
    new Date();


  const difference =
    startDate.getTime() -
    now.getTime();


  const daysElement =
    $("#countDays");

  const hoursElement =
    $("#countHours");

  const minutesElement =
    $("#countMinutes");

  const secondsElement =
    $("#countSeconds");

  const titleElement =
    $("#countdownTitle");

  const boxElement =
    $("#classCountdownBox");


  if (
    difference <= 0
  ) {

    if (titleElement) {

      titleElement.textContent =
        "Course Started";

    }


    if (boxElement) {

      boxElement.classList.add(
        "course-started"
      );

    }


    if (daysElement) {
      daysElement.textContent =
        "✓";
    }

    if (hoursElement) {
      hoursElement.textContent =
        "✓";
    }

    if (minutesElement) {
      minutesElement.textContent =
        "✓";
    }

    if (secondsElement) {
      secondsElement.textContent =
        "✓";
    }


    return;

  }


  if (boxElement) {

    boxElement.classList.remove(
      "course-started"
    );

  }


  const totalSeconds =
    Math.floor(
      difference / 1000
    );


  const days =
    Math.floor(
      totalSeconds / 86400
    );


  const hours =
    Math.floor(
      (totalSeconds % 86400) / 3600
    );


  const minutes =
    Math.floor(
      (totalSeconds % 3600) / 60
    );


  const seconds =
    totalSeconds % 60;


  if (daysElement) {

    daysElement.textContent =
      String(days);

  }


  if (hoursElement) {

    hoursElement.textContent =
      String(hours).padStart(
        2,
        "0"
      );

  }


  if (minutesElement) {

    minutesElement.textContent =
      String(minutes).padStart(
        2,
        "0"
      );

  }


  if (secondsElement) {

    secondsElement.textContent =
      String(seconds).padStart(
        2,
        "0"
      );

  }

}


function initCountdown() {

  updateCountdown();


  if (countdownTimer) {

    clearInterval(
      countdownTimer
    );

  }


  countdownTimer =
    setInterval(
      updateCountdown,
      1000
    );

}


/* =========================================================
   14. HEADER SCROLL
========================================================= */

function initHeaderScroll() {

  const header =
    $("#siteHeader");


  if (!header) {
    return;
  }


  function checkScroll() {

    if (
      window.scrollY > 15
    ) {

      header.classList.add(
        "scrolled"
      );

    } else {

      header.classList.remove(
        "scrolled"
      );

    }

  }


  checkScroll();


  window.addEventListener(
    "scroll",
    checkScroll,
    {
      passive: true
    }
  );

}


/* =========================================================
   15. ACTIVE NAVIGATION
========================================================= */

function initActiveNavigation() {

  const currentPage =
    window.location.pathname
      .split("/")
      .pop()
      .toLowerCase() ||
    "index.html";


  $$(".nav-link")
    .forEach(link => {

      const href =
        link.getAttribute(
          "href"
        );


      if (!href) {
        return;
      }


      const cleanHref =
        href
          .split("#")[0]
          .split("?")[0]
          .toLowerCase();


      if (
        cleanHref === currentPage
      ) {

        link.classList.add(
          "active"
        );

      } else {

        link.classList.remove(
          "active"
        );

      }

    });

}


/* =========================================================
   16. SMOOTH INTERNAL LINKS
========================================================= */

function initSmoothLinks() {

  $$(
    'a[href^="#"]'
  ).forEach(link => {

    link.addEventListener(
      "click",
      function (event) {

        const targetId =
          this.getAttribute(
            "href"
          );


        if (
          !targetId ||
          targetId === "#"
        ) {

          return;

        }


        const target =
          document.querySelector(
            targetId
          );


        if (!target) {
          return;
        }


        event.preventDefault();


        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }
    );

  });

}


/* =========================================================
   17. SCROLL REVEAL
========================================================= */

function initScrollReveal() {

  const elements =
    $$(".reveal");


  if (
    !elements.length
  ) {

    return;

  }


  if (
    !("IntersectionObserver" in window)
  ) {

    elements.forEach(
      element => {
        element.classList.add(
          "visible"
        );
      }
    );

    return;

  }


  const observer =
    new IntersectionObserver(
      function (entries) {

        entries.forEach(
          entry => {

            if (
              entry.isIntersecting
            ) {

              entry.target.classList.add(
                "visible"
              );


              observer.unobserve(
                entry.target
              );

            }

          }
        );

      },
      {
        threshold: 0.12
      }
    );


  elements.forEach(
    element => {

      observer.observe(
        element
      );

    }
  );

}


/* =========================================================
   18. TOAST SYSTEM
========================================================= */

function showToast(
  message,
  type = "info"
) {

  let container =
    $("#toastContainer");


  if (!container) {

    container =
      document.createElement(
        "div"
      );

    container.id =
      "toastContainer";

    container.className =
      "toast-container";

    document.body.appendChild(
      container
    );

  }


  const toast =
    document.createElement(
      "div"
    );


  toast.className =
    "toast " + type;


  let icon =
    "fa-circle-info";


  if (type === "success") {

    icon =
      "fa-circle-check";

  }


  if (type === "error") {

    icon =
      "fa-circle-exclamation";

  }


  if (type === "warning") {

    icon =
      "fa-triangle-exclamation";

  }


  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHTML(message)}</span>
  `;


  container.appendChild(
    toast
  );


  setTimeout(
    function () {

      toast.style.opacity =
        "0";

      toast.style.transform =
        "translateY(10px)";


      setTimeout(
        function () {

          toast.remove();

        },
        250
      );

    },
    2800
  );

}


/* =========================================================
   19. HTML ESCAPE
========================================================= */

function escapeHTML(value) {

  const div =
    document.createElement(
      "div"
    );


  div.textContent =
    String(value ?? "");


  return div.innerHTML;

}


/* =========================================================
   20. CLASS READY SYSTEM
========================================================= */

function setClassReady() {

  const student =
    getStudentData();


  const readyData = {

    studentId:
      student.id,

    studentName:
      student.name,

    course:
      student.course,

    batch:
      student.batch,

    ready:
      true,

    updatedAt:
      new Date().toISOString()

  };


  try {

    localStorage.setItem(
      SNKPortal.storage.classReady,
      JSON.stringify(
        readyData
      )
    );

  } catch (error) {

    console.warn(
      "Class ready storage error:",
      error
    );

  }


  showToast(
    "You are ready for class!",
    "success"
  );

}


function getClassReadyData() {

  try {

    const raw =
      localStorage.getItem(
        SNKPortal.storage.classReady
      );


    if (!raw) {
      return null;
    }


    return JSON.parse(
      raw
    );

  } catch (error) {

    return null;

  }

}


function initClassReadyButtons() {

  $$(
    "[data-class-ready]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      function () {

        setClassReady();

      }
    );

  });

}


/* =========================================================
   21. DEMO ACTIONS
========================================================= */

function initDemoActions() {

  $$(
    "[data-demo-action]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();


        const message =
          this.getAttribute(
            "data-demo-message"
          ) ||
          "This feature is available in the student portal.";


        showToast(
          message,
          "info"
        );

      }
    );

  });

}


/* =========================================================
   22. PRINT
========================================================= */

function initPrintButtons() {

  $$(
    "[data-print]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      function (event) {

        event.preventDefault();

        window.print();

      }
    );

  });

}


/* =========================================================
   23. BACK TO TOP
========================================================= */

function initBackToTop() {

  const button =
    $("#backToTop");


  if (!button) {
    return;
  }


  function updateButton() {

    if (
      window.scrollY > 450
    ) {

      button.classList.add(
        "show"
      );

    } else {

      button.classList.remove(
        "show"
      );

    }

  }


  updateButton();


  window.addEventListener(
    "scroll",
    updateButton,
    {
      passive: true
    }
  );


  button.addEventListener(
    "click",
    function () {

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


/* =========================================================
   24. STORAGE SYNC
========================================================= */

function initStorageSync() {

  window.addEventListener(
    "storage",
    function (event) {

      if (
        [
          SNKPortal.storage.studentId,
          SNKPortal.storage.studentName,
          SNKPortal.storage.studentCourse,
          SNKPortal.storage.studentLoggedIn,
          SNKPortal.storage.theme,
          SNKPortal.storage.studentProfile
        ].includes(event.key)
      ) {

        updateStudentUI();

        applyTheme(
          getPreferredTheme()
        );

      }

    }
  );


  document.addEventListener(
    "visibilitychange",
    function () {

      if (
        !document.hidden
      ) {

        updateStudentUI();

        applyTheme(
          getPreferredTheme()
        );

      }

    }
  );

}


/* =========================================================
   25. SYSTEM THEME DETECTION
========================================================= */

function initSystemTheme() {

  if (
    !window.matchMedia
  ) {

    return;

  }


  const media =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );


  media.addEventListener?.(
    "change",
    function () {

      /*
        User-selected theme always wins.
      */

      const savedTheme =
        localStorage.getItem(
          SNKPortal.storage.theme
        );


      if (
        savedTheme === "dark" ||
        savedTheme === "light"
      ) {

        return;

      }


      applyTheme(
        media.matches
          ? "dark"
          : "light"
      );

    }
  );

}


/* =========================================================
   26. THEME BUTTON EVENTS
========================================================= */

function initThemeButtons() {

  const buttons = [
    $("#themeToggle"),
    $("#themeButton"),
    $("[data-theme-toggle]")
  ].filter(Boolean);


  buttons.forEach(
    button => {

      button.addEventListener(
        "click",
        toggleTheme
      );

    }
  );

}


/* =========================================================
   27. LANGUAGE BUTTON EVENTS
========================================================= */

function initLanguageButton() {

  const button =
    $("#languageToggle");


  if (!button) {
    return;
  }


  button.addEventListener(
    "click",
    toggleLanguage
  );


  updateLanguageButton(
    getLanguage()
  );

}


/* =========================================================
   28. KEYBOARD ESCAPE
========================================================= */

function initKeyboardEvents() {

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Escape"
      ) {

        closeLoginRequiredModal();


        const nav =
          $("#mainNav");

        const menuButton =
          $("#mobileMenuBtn");


        if (nav) {

          nav.classList.remove(
            "mobile-open"
          );

        }


        if (menuButton) {

          menuButton.setAttribute(
            "aria-expanded",
            "false"
          );


          menuButton.innerHTML =
            '<i class="fa-solid fa-bars"></i>';

        }

      }

    }
  );

}


/* =========================================================
   29. CURRENT YEAR
========================================================= */

function updateCurrentYear() {

  const year =
    new Date()
      .getFullYear();


  $$("#currentYear")
    .forEach(element => {

      element.textContent =
        year;

    });

}


/* =========================================================
   30. COURSE PROGRESS
========================================================= */

function updateCourseProgress() {

  const progress =
    0;


  const progressElements = [
    $("#courseProgressPercent"),
    $("#courseProgressValue")
  ].filter(Boolean);


  progressElements.forEach(
    element => {

      element.textContent =
        progress + "%";

    }
  );


  const bars = [
    $("#courseProgressBar"),
    $("#courseProgressFill")
  ].filter(Boolean);


  bars.forEach(
    bar => {

      bar.style.width =
        progress + "%";

    }
  );


  $$("[data-course-progress]")
    .forEach(element => {

      element.textContent =
        progress + "%";

    });

}


/* =========================================================
   31. PAGE DATA ATTRIBUTES
========================================================= */

function initDataAttributes() {

  const student =
    getStudentData();


  $$("[data-student-name]")
    .forEach(element => {

      element.textContent =
        student.name;

    });


  $$("[data-student-id]")
    .forEach(element => {

      element.textContent =
        student.id;

    });


  $$("[data-student-course]")
    .forEach(element => {

      element.textContent =
        student.course;

    });


  $$("[data-student-batch]")
    .forEach(element => {

      element.textContent =
        student.batch;

    });


  $$("[data-course-name]")
    .forEach(element => {

      element.textContent =
        SNKPortal.course.name;

    });


  $$("[data-course-duration]")
    .forEach(element => {

      element.textContent =
        SNKPortal.course.duration;

    });


  $$("[data-course-mode]")
    .forEach(element => {

      element.textContent =
        SNKPortal.course.mode;

    });


  $$("[data-course-days]")
    .forEach(element => {

      element.textContent =
        SNKPortal.course.days;

    });


  $$("[data-course-time]")
    .forEach(element => {

      element.textContent =
        SNKPortal.course.time;

    });

}


/* =========================================================
   32. IMAGE FALLBACK
========================================================= */

function initImageFallback() {

  $$("img").forEach(
    image => {

      image.addEventListener(
        "error",
        function () {

          this.classList.add(
            "image-error"
          );

        }
      );

    }
  );

}


/* =========================================================
   33. FOCUS ACCESSIBILITY
========================================================= */

function initAccessibility() {

  document.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Tab"
      ) {

        document.body.classList.add(
          "keyboard-navigation"
        );

      }

    }
  );


  document.addEventListener(
    "mousedown",
    function () {

      document.body.classList.remove(
        "keyboard-navigation"
      );

    }
  );

}


/* =========================================================
   34. PAGE LOAD
========================================================= */

function initializeSNKPortal() {

  /*
    1. Theme
  */
  applyTheme(
    getPreferredTheme()
  );


  /*
    2. Language
  */
  setLanguage(
    getLanguage()
  );


  /*
    3. Student
  */
  updateStudentUI();


  initDataAttributes();


  /*
    4. Navigation
  */
  initMobileNavigation();

  initActiveNavigation();

  initProtectedLinks();

  initLogoutButtons();


  /*
    5. Header
  */
  initHeaderScroll();


  /*
    6. Course
  */
  initCountdown();

  updateCourseProgress();


  /*
    7. UI
  */
  initThemeButtons();

  initLanguageButton();

  initLoginModal();

  initSmoothLinks();

  initScrollReveal();

  initClassReadyButtons();

  initDemoActions();

  initPrintButtons();

  initBackToTop();


  /*
    8. Storage
  */
  initStorageSync();

  initSystemTheme();


  /*
    9. Accessibility
  */
  initKeyboardEvents();

  initAccessibility();


  /*
    10. Misc
  */
  updateCurrentYear();

  initImageFallback();


  /*
    Global ready flag
  */
  window.SNKPortalReady =
    true;


  /*
    Developer / debugging info
  */
  console.log(
    "SNK AI Student Portal initialized — Step 1.19.1"
  );

}


/* =========================================================
   35. DOM READY
========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeSNKPortal
  );

} else {

  initializeSNKPortal();

}


/* =========================================================
   36. GLOBAL API
   Other Student Portal pages can use these.
========================================================= */

window.SNKPortalAPI = {

  config:
    SNKPortal,

  isLoggedIn:
    isStudentLoggedIn,

  getStudent:
    getStudentData,

  logout:
    logoutStudent,

  showToast:
    showToast,

  showLoginRequired:
    showLoginRequiredModal,

  closeLoginRequired:
    closeLoginRequiredModal,

  setTheme:
    applyTheme,

  getTheme:
    getPreferredTheme,

  toggleTheme:
    toggleTheme,

  getLanguage:
    getLanguage,

  setLanguage:
    setLanguage,

  setClassReady:
    setClassReady,

  getClassReady:
    getClassReadyData

};
