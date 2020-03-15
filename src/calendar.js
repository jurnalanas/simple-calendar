import datePicker from './date';

const calendar = (function () {
  const mName = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let data = null;
  let sDay = 0;
  let sMth = 0;
  let sYear = 0;
  const sMon = true;
  const maxEvents = 3;
  const publicAPIs = {};

  function loadData() {
    data = localStorage.getItem(`cal-${sMth}-${sYear}`);
    if (data == null) {
      localStorage.setItem(`cal-${sMth}-${sYear}`, "{}");
      data = {};
    } else {
      data = JSON.parse(data);
    }
  }

  function drawCalendar(squares) {
    const container = document.getElementById("cal-container"),
      cTable = document.createElement("div");
    cTable.id = "calendar";
    cTable.classList = "calendar";
    container.innerHTML = "";
    container.appendChild(cTable);
    // First row - Days
    let cCell = null;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    if (sMon) {
      days.push(days.shift());
    }
    for (const d of days) {
      cCell = document.createElement("span");
      cCell.classList = "day-name";
      cCell.innerHTML = d;
      cTable.appendChild(cCell);
    }

    // Days in Month
    const total = squares.length;
    for (let i = 0; i < total; i++) {
      cCell = document.createElement("div");
      cCell.classList = "day";
      if (squares[i] == "b") {
        cCell.classList.add("day--disabled");
      } else {
        cCell.innerHTML = `<div class='dd'>${squares[i]}</div>`;
        if (data[squares[i]]) {
          const items = data[squares[i]];
          const eventItems = items.map(item => {
            return `<div class="evt-item"
              style="background-color: #${item.theme}"
              data-id="${item.id}">${item.description}</div>`;
          })
          cCell.innerHTML += eventItems.join('');
        }
        cCell.addEventListener("click", function (el) {
          const id = el.target.dataset.id;
          if (id) {
            publicAPIs.showEdit(this, id);
          } else {
            publicAPIs.show(this);
          }
        });

      }
      cTable.appendChild(cCell);
    }
  }

  function getRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }

  function attachEventBoxListeners(tForm, times = {}, deleteFunc = true) {
    const eForm = document.createElement("form");
    eForm.addEventListener("submit", publicAPIs.save);
    eForm.innerHTML = tForm;
    const closeButton = eForm.querySelector('#close');
    closeButton.addEventListener('click', publicAPIs.closeDocket);
    if (deleteFunc) {
      const deleteButton = eForm.querySelector('#delete');
      deleteButton.addEventListener('click', publicAPIs.deleteEvent);
    }
    const container = document.getElementById("cal-event");


    container.classList.remove('hidden');
    container.innerHTML = "";
    container.appendChild(eForm);


    datePicker(".start-time", "time");
    datePicker(".end-time", "time");
    if (times['start'] || times['end']) {
      const startTime = document.getElementById("start-time");
      const endTime = document.getElementById("end-time");
      startTime.value = times.start;
      endTime.value = times.end;
    }
  }

  function setUpCalendar(startDay, daysInMth, endDay) {
    const squares = [];
    if (sMon && startDay != 1) {
      const blanks = startDay == 0 ? 7 : startDay;
      for (let i = 1; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!sMon && startDay != 0) {
      for (let i = 0; i < startDay; i++) {
        squares.push("b");
      }
    }
    // Populate the days of the month
    for (let i = 1; i <= daysInMth; i++) {
      squares.push(i);
    }
    // Determine the number of blank squares after end of month
    if (sMon && endDay != 0) {
      const blanks = endDay == 6 ? 1 : 7 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }
    if (!sMon && endDay != 6) {
      const blanks = endDay == 0 ? 6 : 6 - endDay;
      for (let i = 0; i < blanks; i++) {
        squares.push("b");
      }
    }
    return squares;
  }

  publicAPIs.appendYearsSelector = (nowYear, yearsRange) => {
    const year = document.getElementById("cal-yr");
    for (let i = nowYear - yearsRange; i <= nowYear + yearsRange; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = i;
      if (i == nowYear) {
        opt.selected = true;
      }
      year.appendChild(opt);
    }
  }

  publicAPIs.appendMonths = (monthsCount, nowMth, month) => {
    for (let i = 0; i < monthsCount; i++) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.innerHTML = mName[i];
      if (i == nowMth) {
        opt.selected = true;
      }
      month.appendChild(opt);
    }
  }

  publicAPIs.list = () => {
    sMth = parseInt(document.getElementById("cal-mth").value);
    sYear = parseInt(document.getElementById("cal-yr").value);
    const daysInMth = new Date(sYear, sMth + 1, 0).getDate(),
      startDay = new Date(sYear, sMth, 1).getDay(),
      endDay = new Date(sYear, sMth, daysInMth).getDay();

    loadData();

    const squares = setUpCalendar(startDay, daysInMth, endDay);
    drawCalendar(squares);

    publicAPIs.closeDocket();
  }

  publicAPIs.closeDocket = () => {
    const el = document.getElementById("cal-event");
    el.innerHTML = "";
    el.classList.add('hidden');
  }

  publicAPIs.showEdit = (el, id) => {
    sDay = el.getElementsByClassName("dd")[0].innerHTML;
    let tForm = "";
    const currentData = data[sDay];
    const temp = currentData[id];

    const eventItemsForm = `
      <div class="event-item">
        <h3>Time range:</h3>
        <input type="hidden" id="event-id" value="${temp.id}">
        <input type="hidden" id="event-theme" value="${temp.theme}">
        <input type="text" id="start-time" placeholder="Start Date" class="date time start-time"/> -
        <input type="text" id="end-time" placeholder="End Date" class="date time end-time"/>
        <textarea id='evt-details' placeholder='description' required>${temp.description}</textarea>
        <textarea id='evt-emails' placeholder='email invitations'>${temp.emails}</textarea>
      </div>
    `;
    tForm = `<h3>EDIT EVENT</h3>
        <div class="event-container">
          <div id='evt-date' class="date-text" data-testid="date">${sDay} ${
      mName[sMth]
    } ${sYear}</div>
          ${eventItemsForm}
          <div>
            <input type='button' id='close' class="button" value='Close'/>
            <input type='button' id='delete' class="button" value='Delete'/>
            <input type='submit' class="button blue" value='Save'/>
          </div>
        </div>
    `;
    const times = {
      start: temp.start,
      end: temp.end
    };
    attachEventBoxListeners(tForm, times);
  }

  publicAPIs.show = (el) => {
    sDay = el.getElementsByClassName("dd")[0].innerHTML;
    const length = data[sDay] ? data[sDay].length : 0;

    const tForm = `<h3>ADD EVENT</h3>
        <div class="event-container">
          <div id='evt-date' class="date-text" data-testid="date">${
            sDay
          } ${mName[sMth]} ${sYear}</div>
          <div class="event-item">
            <h3>Time range:</h3>
            <input type="hidden" id="event-id" value="${length}">
            <input type="hidden" id="event-theme" value="">
            <input type="text" id="start-time" placeholder="Start Date" class="date time start-time"/> -
            <input type="text" id="end-time" placeholder="End Date" class="date time end-time"/>
            <textarea id='evt-details' placeholder='description' required></textarea>
            <textarea id='evt-emails' placeholder='email invitations'></textarea>
          </div>
          <div>
            <input type='button' id='close' class="button" value='Close'/>
            <input type='submit' class="button blue" value='Save'/>
          </div>
        </div>
    `;
    const deleteFunc = false;
    if (length >= maxEvents) {
      alert('Only three events allowed per day')
    } else {
      attachEventBoxListeners(tForm, {}, deleteFunc);
    }
  }

  publicAPIs.save = (evt) => {
    const eventId = parseInt(document.getElementById("event-id").value);
    const eventTheme = document.getElementById("event-theme").value;
    evt.stopPropagation();
    evt.preventDefault();
    if (!data[sDay]) {
      data[sDay] = []
    }
    const color = eventTheme || getRandomColor();

    const currentData = {
      id: eventId,
      theme: color,
      description: document.getElementById("evt-details").value,
      start: document.getElementById("start-time").value,
      end: document.getElementById("end-time").value,
      emails: document.getElementById("evt-emails").value
    };
    data[sDay][eventId] = currentData;
    localStorage.setItem(`cal-${sMth}-${sYear}`, JSON.stringify(data));
    publicAPIs.list();
  }

  publicAPIs.deleteEvent = () => {
    const eventId = parseInt(document.getElementById("event-id").value);
    if (confirm("Remove event?")) {
      data[sDay].splice(eventId, 1);
      localStorage.setItem(`cal-${sMth}-${sYear}`, JSON.stringify(data));
      publicAPIs.list();
    }
  }

  return publicAPIs;
})();

export default calendar;
