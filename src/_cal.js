import "./styles.scss";

class Calendar {
  constructor(sDay = 0, sMth = 0, sYear = 0, sMon = true) {
    this.mName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    this.data = null; // Events for the selected period
    this.sDay = sDay; // Current selected day
    this.sMth = sMth; // Current selected month
    this.sYear = sYear; // Current selected year
    this.sMon = sMon; // Week start on Monday?
  }

  list() {
    this.sMth = parseInt(document.getElementById("cal-mth").value); // selected month
    this.sYear = parseInt(document.getElementById("cal-yr").value); // selected year
    let daysInMth = new Date(this.sYear, this.sMth + 1, 0).getDate(), // number of days in selected month
      startDay = new Date(this.sYear, this.sMth, 1).getDay(), // first day of the month
      endDay = new Date(this.sYear, this.sMth, daysInMth).getDay(); // last day of the month

    this.loadData();

    let squares = this.setUpCalendar(startDay, daysInMth, endDay);

    // DRAW HTML
    // Container & Table
    this.createCalendarUI(squares);

    // REMOVE ANY ADD/EDIT EVENT DOCKET
    this.close();
  }

  setUpCalendar(startDay, daysInMth, endDay) {
    let squares = [];
    if (this.sMon && startDay != 1) {
      const blanks = startDay == 0 ? 7 : startDay;
      for (let i = 1; i < blanks; i++) {
        squares.push("blank");
      }
    }
    if (!this.sMon && startDay != 0) {
      for (let i = 0; i < startDay; i++) {
        squares.push("blank");
      }
    }
    // Populate the days of the month
    for (let i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }
    // Determine the number of blank squares after end of month
    if (this.sMon && endDay != 0) {
      var blanks = endDay == 6 ? 1 : 7 - endDay;
      for (var i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!this.sMon && endDay != 6) {
      let blanks = endDay == 0 ? 6 : 6 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }
    return squares;
  }

  createCalendarUI(squares) {
    var container = document.getElementById("cal-container"), cTable = document.createElement("table");
    cTable.id = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);
    // First row - Days
    var cRow = document.createElement("tr"), cCell = null, days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (this.sMon) {
      days.push(days.shift());
    }
    for (var d of days) {
      cCell = document.createElement("td");
      cCell.innerHTML = d;
      cRow.appendChild(cCell);
    }
    cRow.classList.add("head");
    cTable.appendChild(cRow);
    // Days in Month
    var total = squares.length;
    cRow = document.createElement("tr");
    cRow.classList.add("day");
    for (let i = 0; i < total; i++) {
      cCell = document.createElement("td");
      if (squares[i] == "blank") {
        cCell.classList.add("blank");
      }
      else {
        cCell.innerHTML = "<div class='dd'>" + squares[i] + "</div>";
        if (this.data[squares[i]]) {
          cCell.innerHTML += "<div class='evt'>" + this.data[squares[i]] + "</div>";
        }
        cCell.addEventListener("click", function () {
          this.show(this);
        });
      }
      cRow.appendChild(cCell);
      if (i != 0 && (i + 1) % 7 == 0) {
        cTable.appendChild(cRow);
        cRow = document.createElement("tr");
        cRow.classList.add("day");
      }
    }
  }

  loadData() {
    this.data = localStorage.getItem("cal-" + this.sMth + "-" + this.sYear);
    if (this.data == null) {
      localStorage.setItem("cal-" + this.sMth + "-" + this.sYear, "{}");
      this.data = {};
    }
    else {
      this.data = JSON.parse(this.data);
    }
  }

  show(el) {
    // .show() : show edit event docket for selected day
    // PARAM el : Reference back to cell clicked

    // FETCH EXISTING DATA
    this.sDay = el.getElementsByClassName("dd")[0].innerHTML;

    // DRAW FORM
    // let tForm = "<h1>" + (this.data[this.sDay] ? "EDIT" : "ADD") + " EVENT</h1>";
    // tForm += "<div id='evt-date'>" + this.sDay + " " + this.mName[this.sMth] + " " + this.sYear + "</div>";
    // tForm += "<textarea id='evt-details' required>" + (this.data[this.sDay] ? this.data[this.sDay] : "") + "</textarea>";
    // tForm += "<input type='button' value='Close' onclick='this.close()'/>";
    // tForm += "<input type='button' value='Delete' onclick='this.del()'/>";
    // tForm += "<input type='submit' value='Save'/>";

    const tForm = `<h1> ${this.data[this.sDay] ? "EDIT" : "ADD"} EVENT</h1>
        <div id='evt-date'>${this.sDay} ${this.mName[this.sMth]} ${this.sYear}</div>
        <textarea id='evt-details' required>${this.data[this.sDay] ? this.data[this.sDay] : ""}</textarea>
        <input type='button' value='Close' onclick='this.close()'/>
        <input type='button' value='Delete' onclick='this.del()'/>
        <input type='submit' value='Save'/>
    `;

    // ATTACH
    let eForm = document.createElement("form");
    eForm.addEventListener("submit", this.save);
    eForm.innerHTML = tForm;
    let container = document.getElementById("cal-event");
    container.innerHTML = "";
    container.appendChild(eForm);
  }

  close() {
    // this.close() : close event docket
    document.getElementById("cal-event").innerHTML = "";
  }

  save(evt) {
    // this.save() : save event
    evt.stopPropagation();
    evt.preventDefault();
    this.data[this.sDay] = document.getElementById("evt-details").value;
    localStorage.setItem("cal-" + this.sMth + "-" + this.sYear, JSON.stringify(this.data));
    this.list();
  }

  del() {
    // this.del() : Delete event for selected date

    if (confirm("Remove event?")) {
      delete this.data[this.sDay];
      localStorage.setItem("cal-" + this.sMth + "-" + this.sYear, JSON.stringify(this.data));
      this.list();
    }
  }
}

window.addEventListener("load", function () {
  const cal = new Calendar();
  // DATE NOW
  let now = new Date(),
    nowMth = now.getMonth(),
    nowYear = parseInt(now.getFullYear());

  // APPEND MONTHS SELECTOR
  var month = document.getElementById("cal-mth");
  for (let i = 0; i < 12; i++) {
    let monthsOpt = document.createElement("option");
    monthsOpt.value = i;
    monthsOpt.innerHTML = cal.mName[i];
    if (i == nowMth) {
      monthsOpt.selected = true;
    }
    month.appendChild(monthsOpt);
  }

  // APPEND YEARS SELECTOR
  // Set to 10 years range. Change this as you like.
  var year = document.getElementById("cal-yr");
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
})
