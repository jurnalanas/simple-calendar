import "./styles.scss";

const cal = {
  /* [PROPERTIES] */
  mName: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], // Month Names
  data: null, // Events for the selected period
  sDay: 0, // Current selected day
  sMth: 0, // Current selected month
  sYear: 0, // Current selected year
  sMon: true, // Week start on Monday?

  /* [FUNCTIONS] */
  list: function () {
    // cal.list() : draw the calendar for the given month

    // BASIC CALCULATIONS
    // Note - Jan is 0 & Dec is 11 in JS.
    // Note - Sun is 0 & Sat is 6
    cal.sMth = parseInt(document.getElementById("cal-mth").value); // selected month
    cal.sYear = parseInt(document.getElementById("cal-yr").value); // selected year
    let daysInMth = new Date(cal.sYear, cal.sMth + 1, 0).getDate(), // number of days in selected month
      startDay = new Date(cal.sYear, cal.sMth, 1).getDay(), // first day of the month
      endDay = new Date(cal.sYear, cal.sMth, daysInMth).getDay(); // last day of the month

    // LOAD DATA FROM LOCALSTORAGE
    cal.data = localStorage.getItem("cal-" + cal.sMth + "-" + cal.sYear);
    if (cal.data == null) {
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, "{}");
      cal.data = {};
    } else {
      cal.data = JSON.parse(cal.data);
    }

    // DRAWING CALCULATIONS
    // Determine the number of blank squares before start of month
    let squares = [];
    if (cal.sMon && startDay != 1) {
      let blanks = startDay == 0 ? 7 : startDay;
      for (let i = 1; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!cal.sMon && startDay != 0) {
      for (let i = 0; i < startDay; i++) {
        squares.push("b");
      }
    }

    // Populate the days of the month
    for (let i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }

    // Determine the number of blank squares after end of month
    if (cal.sMon && endDay != 0) {
      let blanks = endDay == 6 ? 1 : 7 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!cal.sMon && endDay != 6) {
      let blanks = endDay == 0 ? 6 : 6 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }

    // DRAW HTML
    // Container & Table
    let container = document.getElementById("cal-container"),
      cTable = document.createElement("div");
    cTable.id = "calendar";
    cTable.classList = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);

    // First row - Days
    // let cRow = document.createElement("tr"),
      let cCell = null,
      days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (cal.sMon) {
      days.push(days.shift());
    }
    for (let d of days) {
      cCell = document.createElement("span");
      cCell.classList = "day-name";
      cCell.innerHTML = d;
      cTable.appendChild(cCell);
    }
    // cRow.classList.add("head");
    // cTable.appendChild(cRow);

    // Days in Month
    let total = squares.length;
    // cRow = document.createElement("tr");
    // cRow.classList.add("day2");
    for (let i = 0; i < total; i++) {
      cCell = document.createElement("div");
      cCell.classList = "day";
      if (squares[i] == "b") {
        cCell.classList.add("day--disabled");
      } else {
        cCell.innerHTML = "<div class='dd'>" + squares[i] + "</div>";
        if (cal.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + cal.data[squares[i]] + "</div>";
        }
        cCell.addEventListener("click", function () {
          console.log('hmm')
          cal.show(this);
        });
      }
      cTable.appendChild(cCell);
      // if (i != 0 && (i + 1) % 7 == 0) {
      //   cTable.appendChild(cRow);
      //   cRow = document.createElement("div");
      //   cRow.classList.add("day");
      // }
    }

    // REMOVE ANY ADD/EDIT EVENT DOCKET
    cal.close();
  },

  show: function (el) {
    // cal.show() : show edit event docket for selected day
    // PARAM el : Reference back to cell clicked

    // FETCH EXISTING DATA
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;

    // DRAW FORM
    const tForm = `<h3> ${this.data[this.sDay] ? "EDIT" : "ADD"} EVENT</h3>
        <div class="event-container">
          <div id='evt-date' class="date">${this.sDay} ${this.mName[this.sMth]} ${this.sYear}</div>
          <textarea id='evt-details' required>${this.data[this.sDay] ? this.data[this.sDay] : ""}</textarea>
          <div>
            <input type='button' id='close' class="button" value='Close'/>
            <input type='button' id='delete' class="button" value='Delete'/>
            <input type='submit' class="button blue" value='Save'/>
          </div>
        </div>
    `;

    // ATTACH
    let eForm = document.createElement("form");
    eForm.addEventListener("submit", cal.save);
    eForm.innerHTML = tForm;
    let closeButton = eForm.querySelector('#close');
    closeButton.addEventListener('click', cal.close)
    let deleteButton = eForm.querySelector('#delete');
    deleteButton.addEventListener('click', cal.del);
    let container = document.getElementById("cal-event");
    container.classList.remove('hidden');
    container.innerHTML = "";
    container.appendChild(eForm);
  },

  close: function () {
    let el = document.getElementById("cal-event");
    el.innerHTML = "";
    el.classList.add('hidden');
  },

  save: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    cal.data[cal.sDay] = document.getElementById("evt-details").value;
    localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
    cal.list();
  },

  del: function () {
    // cal.del() : Delete event for selected date
    if (confirm("Remove event?")) {
      delete cal.data[cal.sDay];
      localStorage.setItem("cal-" + cal.sMth + "-" + cal.sYear, JSON.stringify(cal.data));
      cal.list();
    }
  }
};

// INIT - DRAW MONTH & YEAR SELECTOR
window.addEventListener("load", function () {
  // DATE NOW
  let now = new Date(),
    nowMth = now.getMonth(),
    nowYear = parseInt(now.getFullYear());

  // APPEND MONTHS SELECTOR
  let month = document.getElementById("cal-mth");
  for (let i = 0; i < 12; i++) {
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = cal.mName[i];
    if (i == nowMth) {
      opt.selected = true;
    }
    month.appendChild(opt);
  }

  // APPEND YEARS SELECTOR
  // Set to 10 years range. Change this as you like.
  let year = document.getElementById("cal-yr");
  for (let i = nowYear - 10; i <= nowYear + 10; i++) {
    let opt = document.createElement("option");
    opt.value = i;
    opt.innerHTML = i;
    if (i == nowYear) {
      opt.selected = true;
    }
    year.appendChild(opt);
  }

  // START - DRAW CALENDAR
  document.getElementById("cal-set").addEventListener("click", cal.list);
  cal.list();
});
