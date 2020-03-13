import "./styles.scss";
import datePicker from './date.js'

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
    loadData();

    // DRAWING CALCULATIONS
    // Determine the number of blank squares before start of month
    let squares = setUpCalendar(startDay, daysInMth, endDay);

    // DRAW Calendar
    drawCalendar(squares);

    // REMOVE ANY ADD/EDIT EVENT DOCKET
    cal.close();
  },

  show: function (el) {
    // cal.show() : show edit event docket for selected day
    // PARAM el : Reference back to cell clicked

    // FETCH EXISTING DATA
    cal.sDay = el.getElementsByClassName("dd")[0].innerHTML;
    // DRAW FORM
    let tForm = ''

    if (this.data[this.sDay]) {
      // const remaining = 3 - this.data[this.sDay].length;
      tForm = `<h3> ${this.data[this.sDay] ? "EDIT" : "ADD"} EVENTS</h3>
          <div class="event-container">
            <div id='evt-date' class="date-text">${this.sDay} ${this.mName[this.sMth]} ${this.sYear}</div>
            ${
              this.data[this.sDay].length < 3 ?
              this.data[this.sDay].map(item => buildEventItem(item)) : ''
            }
            <div>
              <input type='button' id='close' class="button" value='Close'/>
              <input type='button' id='delete' class="button" value='Delete'/>
              <input type='submit' class="button blue" value='Save'/>
            </div>
          </div>
      `;
    } else {
      tForm = `<h3> ${this.data[this.sDay] ? "EDIT" : "ADD"} EVENTS</h3>
          <div class="event-container">
            <div id='evt-date' class="date-text">${this.sDay} ${this.mName[this.sMth]} ${this.sYear}</div>
            <div class="event-item">
              <h3>Time range:</h3>
              <input type="text" id="start-time" placeholder="Start Date" class="date time start-time"/> -
              <input type="text" id="end-time" placeholder="End Date" class="date time end-time"/>
              <textarea id='evt-details' placeholder='description' required></textarea>
              <textarea id='evt-emails' placeholder='email invitations'></textarea>
            </div>
            <div>
              <input type='button' id='close' class="button" value='Close'/>
              <input type='button' id='delete' class="button" value='Delete'/>
              <input type='submit' class="button blue" value='Save'/>
            </div>
          </div>
      `;
    }


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
    datePicker(".start-time", "time");
    datePicker(".end-time", "time");
  },

  close: function () {
    let el = document.getElementById("cal-event");
    el.innerHTML = "";
    el.classList.add('hidden');
  },

  save: function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    if (!cal.data[cal.sDay]) {
      cal.data[cal.sDay] = []
    }
    let eventData = {
      id: 0,
      description: document.getElementById("evt-details").value,
      start: document.getElementById("start-time").value,
      end: document.getElementById("end-time").value,
      emails: document.getElementById("evt-emails").value
    };
    cal.data[cal.sDay].push(eventData);
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
    cal.list();
  },

  del: function () {
    // cal.del() : Delete event for selected date
    if (confirm("Remove event?")) {
      delete cal.data[cal.sDay];
      localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, JSON.stringify(cal.data));
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

function drawCalendar(squares) {
  let container = document.getElementById("cal-container"), cTable = document.createElement("div");
  cTable.id = "calendar";
  cTable.classList = "calendar";
  container.innerHTML = "";
  container.appendChild(cTable);
  // First row - Days
  let cCell = null, days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
  if (cal.sMon) {
    days.push(days.shift());
  }
  for (let d of days) {
    cCell = document.createElement("span");
    cCell.classList = "day-name";
    cCell.innerHTML = d;
    cTable.appendChild(cCell);
  }

  // Days in Month
  let total = squares.length;
  for (let i = 0; i < total; i++) {
    cCell = document.createElement("div");
    cCell.classList = "day";
    if (squares[i] == "b") {
      cCell.classList.add("day--disabled");
    }
    else {
      cCell.innerHTML = "<div class='dd'>" + squares[i] + "</div>";
      if (cal.data[squares[i]]) {
        const items = cal.data[squares[i]];
        let eventItems = items.map(item => {
          return `<div class="evt-item evt-item--primary">${item.description}</div>`;
        })

        cCell.innerHTML += eventItems;
      }
      cCell.addEventListener("click", function () {
        cal.show(this);
      });
    }
    cTable.appendChild(cCell);
  }
}

function setUpCalendar(startDay, daysInMth, endDay) {
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
  return squares;
}

function loadData() {
  cal.data = localStorage.getItem(`cal-${cal.sMth}-${cal.sYear}`);
  if (cal.data == null) {
    localStorage.setItem(`cal-${cal.sMth}-${cal.sYear}`, "{}");
    cal.data = {};
  }
  else {
    cal.data = JSON.parse(cal.data);
  }
}

function buildEventItem(item) {
  return `
    <div class="event-item">
      <h3>Time range:</h3>
      <input type="text" id="start-time" placeholder="Start Date" class="date time start-time" value="${item.start ? item.start : '00:00 AM'}"/> -
      <input type="text" id="end-time" placeholder="End Date" class="date time end-time" value="${item.start ? item.end : '01:00 AM'}"/>
      <textarea id='evt-details' placeholder='description' required>${item.description ? item.description : ''}</textarea>
      <textarea id='evt-emails' placeholder='email invitations'>${item.emails ? item.emails : ''}</textarea>
    </div>
  `;
}
