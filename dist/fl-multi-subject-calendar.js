function debounce(callback, FuncDelay) {
  'use strict';

  var delay = FuncDelay;
  var params;
  var _this = this;
  var timeoutObj;

  function timeoutFunc() {
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }

    callback.apply(_this, params); //Call function with latest parameters
  }

  return function () {
    params = arguments;
    if (timeoutObj) {
      clearTimeout(timeoutObj);
    }

    timeoutObj = setTimeout(timeoutFunc, delay);

    //Now we return a function that allows the user to call the
    //method immediately and cancel any timeouts.
    //use it like myDebouncedFunc(arg1, arg2)("now!");
    return function (now) {
      if (now) {
        timeoutFunc();
      }
    };
  };
}

function PopUp(xDivEl) {

  //Make sure it is called as a constructor
  if (!(this instanceof PopUp)) {
    return new PopUp();
  }

  var inDOM = false;
  var locked = false;
  var freeToHideTimer;

  this.el = document.createElement('p');
  this.el.classList.add('cal-popup');

  this.el.addEventListener('mouseover', function () {
    locked = true;
  }, true);

  this.el.addEventListener('mouseout', function () {
    locked = false;
  }, true);

  this.setText = function setText(text) {
    this.el.innerText = text;
  };

  function getOffset(element) {
    var xPosition = 0;
    var yPosition = 0;

    while (element) {
      xPosition += element.offsetLeft + element.clientLeft;
      yPosition += element.offsetTop + element.clientTop;
      element = element.offsetParent;
    }

    return {
      left: xPosition,
      top: yPosition
    };
  }

  this.goTo = function goTo(x, y) {
    var xDivX = getOffset(xDivEl).left;
    var xDivY = getOffset(xDivEl).top;
    var transX = x - xDivX;
    var transY = y - xDivY;

    this.el.style.webkitTransform = 'translate3d(' + transX + 'px ,' + transY + 'px ,0)';
    this.el.style.transform = 'translate3d(' + transX + 'px ,' + transY + 'px ,0)';

    if (!inDOM) {
      xDivEl.appendChild(this.el);
      inDOM = true;
    }
  };

  this.show = function show() {
    this.el.style.opacity = 1;
    this.el.style.visibility = 'visible';
  };

  this.showAt = function showAt(text, x, y) {
    this.setText(text);
    this.goTo(x, y);
    this.show();
    clearInterval(freeToHideTimer);
  };

  this.freeToHide = function freeToHide() {
    // Will wait for a second and then check whether the
    //popup can be hidden. If someone asks for it to be shown
    //somewhere else this timer is cancelled.
    var _this = this;
    freeToHideTimer = setInterval(function () {
      if (!locked) {
        clearInterval(freeToHideTimer);
        _this.hide();
      }
    }, 1000);
  };

  this.hide = function hide() {
    this.el.style.opacity = 0;
    this.el.style.visibility = 'hidden';
  };

  return this;
}

/*globals moment*/

function TableHeadings(title, tableEl) {
  'use strict';

  //Make sure it is called as a constructor

  if (!(this instanceof TableHeadings)) {
    return new TableHeadings(title);
  }

  var headingWrapper;
  var monthRow = function () {
    var el;

    function lastCellOnSide(side) {
      var cell;

      if (el.children[1]) {
        cell = side === 'left' ? el.children[1] : el.children[el.children.length - 1];
      }

      return cell;
    }

    function decideColor(side, lastCell) {
      if (!lastCell || !lastCell.classList) {
        return 'month0';
      }

      var val = side === 'left' ? +1 : -1;
      var idx = lastCell.className.indexOf('month');

      //'num' holds the number in 'month1'
      var numStr = lastCell.className.charAt(idx + 'month'.length);
      var num = parseInt(numStr);
      var MONTHCLASSES = 3;

      //This complicated modulo is needed to deal well with negative numbers.

      var newNum = ((num + val) % MONTHCLASSES + MONTHCLASSES) % MONTHCLASSES;
      var result = !isNaN(newNum) ? 'month' + newNum : 'month0';

      return result;
    }

    function addColumn(side, date) {
      var dateShift = side === 'left' ? -1 : 1;
      var lastCell = lastCellOnSide(side);
      var toFrom = side === 'left' ? 'from' : 'to';
      var lastDate = lastCell ? lastCell[toFrom] : moment();
      var newDate = moment(lastDate).clone().add(dateShift, 'days');

      // If there are columns there already we cannot add a new column
      // with a disconnected date.
      if (date && lastCell) {
        console.error('Error: Attempt to add a column with an incompatible date');
        return false;
      } else if (date) {
        newDate = moment(date);
      }

      // If both dates are in the same month
      if (lastCell && lastCell[toFrom].format('MMM') === newDate.format('MMM')) {
        lastCell[toFrom] = newDate.clone();
        var colspan = parseInt(lastCell.getAttribute('colspan'));
        lastCell.setAttribute('colspan', colspan + 1);
      } else {
        var newCell = document.createElement('th');

        newCell.to = newDate;
        newCell.from = newDate.clone();
        newCell.innerText = newDate.format('MMMM');
        newCell.setAttribute('colspan', 1);
        newCell.classList.add(decideColor(side, lastCell));

        if (side === 'left' && el.children[1]) {
          el.insertBefore(newCell, el.children[1]);
        } else {
          el.appendChild(newCell);
        }
      }

      return newDate;
    }

    function removeColumn(side) {
      //Remove or decrease the colspan of cells on the opposite side
      var cell = lastCellOnSide(side);
      var colRemoved;
      if (cell) {
        var colspan = parseInt(cell.getAttribute('colspan'));

        if (colspan > 1) {
          cell.setAttribute('colspan', colspan - 1);
          if (side === 'left') {
            cell.from.add(1, 'day');
          } else {
            cell.to.add(-1, 'day');
          }
        } else {
          cell.remove();
        }

        colRemoved = true;
      } else {
        colRemoved = false;
      }

      return colRemoved;
    }

    function createAt(table, date) {
      var firstCell = document.createElement('th');

      el = document.createElement('tr');
      el.classList.add('th');

      firstCell.innerText = title;
      firstCell.setAttribute('rowspan', '2');
      el.appendChild(firstCell);

      if (table.children[0]) {
        table.insertBefore(el, table.children[0]);
      } else {
        table.appendChild(el);
      }

      if (date) {
        addColumn('right', date);
      }
    }

    return {
      createAt: createAt,
      addColumn: addColumn,
      removeColumn: removeColumn
    };
  }();

  var dayRow = function () {
    var el;

    function lastDateOnSide(side) {
      var cell;

      if (side === 'left') {
        cell = el.children[0] || {};
      } else {
        cell = el.children[el.children.length - 1] || {};
      }

      return cell.date ? cell.date.clone() : undefined;
    }

    function addColumn(side, date) {
      var newCell = document.createElement('th');
      var lastDate = lastDateOnSide(side) || moment();
      var dateShift = side === 'left' ? -1 : 1;
      var newDate = moment(lastDate).add(dateShift, 'days');

      // If there are columns there already we cannot add a new column
      // with a disconnected date.
      if (date && el.children[0]) {
        console.error('Error: Attempt to add a column with an incompatible date');
        return false;
      } else if (date) {
        newDate = moment(date);
      }

      newCell.date = newDate;
      newCell.innerText = newCell.date.format('D');

      if (side === 'left' && el.children[1]) {
        el.insertBefore(newCell, el.children[0]);
      } else {
        el.appendChild(newCell);
      }

      return newCell.date;
    }

    function removeColumn(side) {
      var colRemoved;

      if (el.children[0]) {
        if (side === 'left') {
          el.children[0].remove();
        } else {
          el.children[el.children.length - 1].remove();
        }

        colRemoved = true;
      } else {
        colRemoved = false;
      }

      return colRemoved;
    }

    function createAt(table, date) {
      el = document.createElement('tr');
      el.classList.add('th');

      if (table.children[1]) {
        table.insertBefore(el, table.children[1]);
      } else {
        table.appendChild(el);
      }

      if (date) {
        addColumn('right', date);
      }
    }

    return {
      createAt: createAt,
      addColumn: addColumn,
      removeColumn: removeColumn,
      lastDateOnSide: lastDateOnSide
    };
  }();

  this._init = function _init() {
    headingWrapper = document.createElement('thead');
    headingWrapper.classList.add('cal-heading-wrapper');

    monthRow.createAt(headingWrapper);
    dayRow.createAt(headingWrapper);

    tableEl.appendChild(headingWrapper);
    return this;
  };

  this.rowsUsed = function rowsUsed() {
    return 2;
  };

  this.addDay = function addDay(side, date) {
    var newDay = monthRow.addColumn(side, date);
    dayRow.addColumn(side, date);
    return newDay;
  };

  this.removeDay = function removeDay(side) {
    var removed = monthRow.removeColumn(side);
    dayRow.removeColumn(side);
    return removed;
  };

  this.lastDateOnSide = function lastDateOnSide(side) {
    return dayRow.lastDateOnSide(side);
  };

  return this._init();
}

// Create content to use as example.
function createCalendarContent() {
  'use strict';

  function daysFromNow(days) {
    return new Date(Date.now() + days * 86400000);
  }

  // Random number from 1 to 10
  function rand() {
    return parseInt(Math.random() * 10);
  }

  var properties = [];
  var propNo = 10000;
  var eventNo;
  var lastDate;

  for (var i = 0; i < propNo; i++) {
    properties[i] = {};
    properties[i].title = 'Property - asdf asd fasdf asdfasd' + (i + 1);
    properties[i].events = [];
    eventNo = rand() * 5;
    lastDate = rand();

    for (var j = 0; j < eventNo; j++) {
      properties[i].events[j] = {};
      properties[i].events[j].desc = 'Event' + i + j;

      // Random true or false
      properties[i].events[j].visitable = !!rand();

      lastDate += rand();
      properties[i].events[j].start = daysFromNow(lastDate).getTime();
      lastDate += rand();
      properties[i].events[j].end = daysFromNow(lastDate).getTime();
    }
  }

  return {
    subjects: properties
  };
}

var CSS_PREFIX = 'fl-msc';

// Some weid problem with moment-range.js is not creating the
// right object. this if statement will fix it.
if (!moment.range) {
  moment.range = function (start, end) {
    return new DateRange(start, end);
  };
}

//TODO:
// - Fix column number in date selection
// - Sinthesyse all event listeners in one big event listener

function Calendar(el) {

  //Make sure it is called as a constructor
  if (!(this instanceof Calendar)) {
    return new Calendar(el);
  }

  var ROWSNUMBER = 15;
  var COLSMAX = 50;
  var COLSMIN = 5;
  var calendar;
  var tableEl;
  var headings;
  var popUp;
  var topIndex;
  var bottomIndex;
  var rowsWrapper;

  //A phantom element is going to be maintained to regulate the size of the
  //table.
  var phantomEl;

  this.createControlButtons = function createControlButtons() {
    var container = document.createElement('div');
    var btn1 = document.createElement('button');
    var btn2 = document.createElement('button');
    var datepicker = document.createElement('input');
    var _this = this;

    btn1.innerText = '<';
    btn2.innerText = '>';
    btn1.classList.add(CSS_PREFIX + '-btn-bar-btn');
    btn2.classList.add(CSS_PREFIX + '-btn-bar-btn');

    btn1.addEventListener('mousedown', function () {
      var addLeft = setInterval(function () {
        _this.addColumn('left');
        _this.removeColumn('right');
      }, 10);

      var docMouseUp = document.addEventListener('mouseup', function () {
        clearInterval(addLeft);
        document.removeEventListener('mouseup', docMouseUp);
      });
    });

    btn2.addEventListener('mousedown', function () {
      var right = setInterval(function () {
        _this.addColumn('right');
        _this.removeColumn('left');
      }, 10);

      var docMouseUp = document.addEventListener('mouseup', function () {
        clearInterval(right);
        document.removeEventListener('mouseup', docMouseUp);
      });
    });

    var btn3 = document.createElement('button');
    btn3.innerText = 'Scroll up';
    btn3.classList.add(CSS_PREFIX + '-btn-bar-btn');
    btn3.addEventListener('mousedown', function () {
      var interval = setInterval(function () {
        _this.scroll('up');
      }, 10);

      var docMouseUp = document.addEventListener('mouseup', function () {
        clearInterval(interval);
        document.removeEventListener('mouseup', docMouseUp);
      });
    });

    var btn4 = document.createElement('button');
    btn4.innerText = 'Scroll down';
    btn4.classList.add(CSS_PREFIX + '-btn-bar-btn');
    btn4.addEventListener('mousedown', function () {
      var interval = setInterval(function () {
        _this.scroll('down');
      }, 10);

      var docMouseUp = document.addEventListener('mouseup', function () {
        clearInterval(interval);
        document.removeEventListener('mouseup', docMouseUp);
      });
    });

    datepicker.setAttribute('type', 'month');
    datepicker.classList.add(CSS_PREFIX + '-btn-bar-datepicker');
    datepicker.classList.add('glyphicon');
    datepicker.classList.add('glyphicon-calendar');
    datepicker.classList.add(CSS_PREFIX + '-btn-bar-btn');

    datepicker.addEventListener('change', function (e) {
      _this.setStartDate(moment(e.target.value));
    });

    container.classList.add(CSS_PREFIX + '-btn-bar');
    container.appendChild(btn1);
    container.appendChild(btn2);
    container.appendChild(btn3);
    container.appendChild(btn4);
    container.appendChild(datepicker);

    el.appendChild(container);
  };

  function loadData() {
    return createCalendarContent();
  }

  function initSubject(sub) {

    //If already initialised then just return.
    if (!sub || sub.eventOnDate) return;

    var events = sub.events;
    var i;

    //Convert the date of all events to a date and a range object
    if (events && events.length) {
      for (i = 0; i < events.length; i++) {
        events[i].start = moment(events[i].start);
        events[i].end = moment(events[i].end);
        events[i].range = moment.range(events[i].start, events[i].end);
      }
    }

    //Check if there is any event happening on a date.
    sub.eventOnDate = function eventOnDate(date) {
      if (!this.events || !this.events.length) {
        return;
      }

      for (var i = 0; i < this.events.length; i++) {
        if (this.events[i].range.contains(date)) {
          return this.events[i];
        }
      }

      return false;
    };
  }

  function createCell(subj, date) {
    var event = subj.eventOnDate(date);
    var slot = document.createElement('td');

    //Add event data to table cell
    if (event) {
      (function () {
        var timer;
        var timerRunning = false;
        slot.addEventListener('mouseover', function (e) {
          timer = setTimeout(function () {
            popUp.showAt(event.desc, e.pageX, e.pageY);
            timerRunning = false;
          }, 50);

          timerRunning = true;
        }, true);

        slot.addEventListener('mouseout', function () {
          if (timerRunning) {
            clearTimeout(timer);
          } else {
            popUp.freeToHide();
          }
        }, true);
      })();

      if (event.visitable) {
        slot.classList.add('half-busy');
      } else {
        slot.classList.add('busy');
      }
    }

    return slot;
  }

  this.addRow = function addRow(subjData, topBottom) {
    initSubject(subjData);

    var cellDate = headings.lastDateOnSide('left');
    var endDate = headings.lastDateOnSide('right');

    //Create a row for the subject and insert its name in it.
    var row = document.createElement('tr');
    var rowName = document.createElement('td');
    rowName.innerText = subjData.title;
    row.subj = subjData;
    row.appendChild(rowName);

    if (cellDate) {
      while (endDate.diff(cellDate, 'days') >= 0) {
        var slot = createCell(subjData, cellDate);
        row.appendChild(slot);
        cellDate.add(1, 'day');
      }
    }

    if (topBottom === 'top' && rowsWrapper.childElementCount > 0) {
      rowsWrapper.insertBefore(row, rowsWrapper.children[0]);
    } else {
      rowsWrapper.appendChild(row);
    }

    return true;
  };

  this.removeRow = function removeRow(topBottom) {
    var rows = rowsWrapper.children;
    if (rows.length > 0) {
      if (topBottom === 'top') {
        rows[0].remove();

        //Update index
        topIndex = topIndex + bottomIndex === 0 ? undefined : topIndex + 1;
      } else {
        rows[rows.length - 1].remove();
        bottomIndex = bottomIndex === 0 ? undefined : bottomIndex - 1;
      }
    }

    return true;
  };

  this.addColumn = function addColumn(side, date) {
    //Check if initialised
    if (!tableEl || !headings) {
      this._init();
    }

    // Add a column in the heading
    var newDay = headings.addDay(side, date);
    if (!newDay) return false;

    //Now let's add a cell to each row.
    var rows = rowsWrapper.children;
    var i;
    var row;

    for (i = 0; i < rows.length; i++) {
      row = rows[i];
      var slot = createCell(row.subj, newDay);

      if (side === 'left' && row.childElementCount > 1) {
        // Insert as first after subject name row.
        row.insertBefore(slot, row.children[1]);
      } else {
        row.appendChild(slot);
      }
    }

    return true;
  };

  this.removeColumn = function removeColumn(side) {
    var colRemoved = headings.removeDay(side);
    var rows = rowsWrapper.children;
    var colIndex;
    var i;

    if (!colRemoved) return false;

    // If there is only the first column or only
    // the first row then do nothing.
    if (rows.length === 0 || rows[0].childElementCount <= 1) {
      return;
    }

    if (side === 'left') {
      colIndex = 1;
    } else {
      colIndex = rows[0].childElementCount - 1;
    }

    for (i = 0; i < rows.length; i++) {
      rows[i].children[colIndex].remove();
    }

    return true;
  };

  this.addSubject = function addSubject(topBottom) {
    var idx;

    //topIndex is the lowest and bottomIndex is the highest.

    //If not initialised, initialise the index count
    if (topIndex === undefined || bottomIndex === undefined) {
      idx = topIndex = bottomIndex = 0;
    } else if (topBottom === 'top' && topIndex - 1 >= 0) {
      idx = topIndex = topIndex - 1;
    } else if (topBottom === 'bottom' && calendar.subjects[bottomIndex + 1]) {
      idx = bottomIndex = bottomIndex + 1;
    } else {
      return false;
    }

    return this.addRow(calendar.subjects[idx], topBottom);
  };

  this.setStartDate = function setStartDate(date) {
    //Remove all columns
    while (this.removeColumn('right')) {}

    this.addColumn('right', date);

    this.adjustSize();
  };

  this.scroll = function scroll(upDown) {
    var topBottom = upDown === 'up' ? 'top' : 'bottom';
    var opposite = topBottom === 'top' ? 'bottom' : 'top';
    var added = this.addSubject(topBottom);

    if (added) {
      this.removeRow(opposite);
    }
  };

  function adjustSize() {
    var containerWidth = el.offsetWidth;
    var tableWidth = tableEl.offsetWidth;
    var cellWidth = 0;
    var colCount = 0;

    // Let's get the width of a cell in the right hand side of the
    //table (so we don't get a label cell) and then get it's width
    //so we can then know what is the size of each column we will add.
    var firstRow = rowsWrapper.children[0];

    if (firstRow && firstRow.children && firstRow.children.length > 1) {
      var lastCell = firstRow.children[firstRow.children.length - 1];
      cellWidth = lastCell.offsetWidth;
      colCount = firstRow.childElementCount;
    }

    //Let's check if the phantom element was initialised
    if (!phantomEl) {
      phantomEl = document.createElement('div');
      phantomEl.classList.add('cal-phantom-el');
      el.appendChild(phantomEl);
    }

    // // While there is space for another column, add columns
    while (containerWidth > tableWidth + cellWidth && colCount < COLSMAX) {
      this.addColumn('right');
      tableWidth = tableEl.offsetWidth;
      phantomEl.style.width = tableWidth + 'px';
      colCount++;
    }

    // While the table is bigger than the container remove columns.
    while (containerWidth < tableWidth && colCount > COLSMIN) {
      this.removeColumn('right');
      tableWidth = tableEl.offsetWidth;
      phantomEl.style.width = tableWidth + 'px';
      colCount--;
    }

    phantomEl.style.height = tableEl.offsetHeight + 'px';
  }

  this.adjustSize = debounce.apply(this, [adjustSize, 50]);

  this._init = function _init() {
    var i;

    calendar = loadData() || { subjects: [] };

    tableEl = document.createElement('table');
    headings = new TableHeadings('Properties', tableEl);
    popUp = new PopUp(el);
    rowsWrapper = document.createElement('tbody');

    tableEl.setAttribute('draggable', true);
    el.classList.add('multi-sub-cal-container');
    tableEl.classList.add('multi-sub-calendar');
    rowsWrapper.classList.add('cal-rows-wrapper');

    for (i = 0; i < ROWSNUMBER; i++) {
      this.addSubject('bottom');
    }

    this.addColumn('right');

    this.createControlButtons();

    tableEl.appendChild(rowsWrapper);
    el.appendChild(tableEl);

    var _this = this;
    window.addEventListener('resize', function () {
      _this.adjustSize();
    }, true);

    window.addEventListener('load', function () {
      _this.adjustSize();
    }, true);

    this.adjustSize();

    var dragstartX;
    var dragstartY;
    var cellSide = rowsWrapper.children[0].children[1].offsetWidth;

    tableEl.addEventListener('drag', function (e) {
      e.preventDefault();

      if (e.pageX === 0 && e.pageY === 0) {
        return;
      }

      if (e.pageY > dragstartY + cellSide) {
        _this.scroll('up');
        dragstartY += cellSide;
      }

      if (e.pageY < dragstartY - cellSide) {
        _this.scroll('down');
        dragstartY -= cellSide;
      }

      if (e.pageX > dragstartX + cellSide) {
        _this.addColumn('left');
        _this.removeColumn('right');
        dragstartX += cellSide;
      }

      if (e.pageX < dragstartX - cellSide) {
        _this.addColumn('right');
        _this.removeColumn('left');
        dragstartX -= cellSide;
      }
    }, false);

    tableEl.addEventListener('dragstart', function (e) {
      var anImg = document.createElement('img');
      anImg.style.opacity = 0;
      e.dataTransfer.setDragImage(anImg, 0, 0);
      dragstartX = e.pageX - cellSide;
      dragstartY = e.pageY - cellSide;
    }, false);

    tableEl.addEventListener('dragend', function (e) {
      e.preventDefault();
    });
  };

  this._init();
  return this;
}

xController(function (xdiv) {
  return new Calendar(xdiv);
});
//# sourceMappingURL=fl-multi-subject-calendar.js.map
