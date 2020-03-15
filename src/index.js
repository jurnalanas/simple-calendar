import "./styles.scss";
import calendar from "./calendar";

window.addEventListener("load", function () {
  const now = new Date(),
    nowMth = now.getMonth(),
    nowYear = parseInt(now.getFullYear()),
    month = document.getElementById("cal-mth"),
    monthsCount = 12,
    yearsRange = 10, // Set to 10 years range. Change this as you like.
    calSet = document.getElementById("cal-set");


  calendar.appendMonths(monthsCount, nowMth, month);
  calendar.appendYearsSelector(nowYear, yearsRange);

  // START - DRAW CALENDAR
  calSet.addEventListener("click", calendar.list);
  calendar.list();
});
