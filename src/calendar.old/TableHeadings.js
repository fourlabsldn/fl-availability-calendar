/*globals moment*/

export default function TableHeadings(title, tableEl) {
  'use strict';

  //Make sure it is called as a constructor
  if (!(this instanceof TableHeadings)) {
    return new TableHeadings(title);
  }

  var headingWrapper;
  var monthRow = (function () {
    var el;

    function lastCellOnSide(side) {
      var cell;

      if (el.children[1]) {
        cell = (side === 'left') ?
          el.children[1] : el.children[el.children.length - 1];
      }

      return cell;
    }

    function decideColor(side, lastCell) {
      if (!lastCell || !(lastCell.classList)) {
        return 'month0';
      }

      var val = (side === 'left') ? +1 : -1;
      var idx = lastCell.className.indexOf('month');

      //'num' holds the number in 'month1'
      var numStr = lastCell.className.charAt(idx + 'month'.length);
      var num = parseInt(numStr);
      var MONTHCLASSES = 3;

      //This complicated modulo is needed to deal well with negative numbers.

      var newNum = (((num + val) % MONTHCLASSES) + MONTHCLASSES) % MONTHCLASSES;
      var result = !isNaN(newNum) ? 'month' + newNum : 'month0';

      return result;
    }

    function addColumn(side, date) {
      var dateShift = (side === 'left') ? -1 : 1;
      var lastCell = lastCellOnSide(side);
      var toFrom = (side === 'left') ? 'from' : 'to';
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
        newCell.classList.add('fl-msc-header-date');

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
      el.classList.add('fl-msc-header-date');

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
      removeColumn: removeColumn,
    };
  }());

  var dayRow = (function () {
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
      newCell.classList.add('fl-msc-header-date');
      var lastDate = lastDateOnSide(side) || moment();
      var dateShift = (side === 'left') ? -1 : 1;
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
      el.classList.add('fl-msc-header-date');

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
      lastDateOnSide: lastDateOnSide,
    };
  }());

  this._init = function _init() {
    headingWrapper = document.createElement('thead');
    headingWrapper.classList.add('fl-msc-header');

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
