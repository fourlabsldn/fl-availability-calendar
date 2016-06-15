/* eslint-env node */
const moment = require('moment');

const dbStartDate = moment().add(-300, 'days');
const dbEndDate = moment().add(300, 'days');
const dbRecordCount = 200;
const db = require('./dbCreator')(dbRecordCount, dbStartDate, dbEndDate);

const express = require('express');
const app = express();

module.exports = () => {
  app.get('/', (req, res) => {
    console.dir(req.query);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');

    const beforeAfter = req.query.beforeAfter;
    const recordCount = parseInt(req.query.recordCount, 10);
    const referenceId = req.query.referenceId ? parseInt(req.query.referenceId, 10) : null;

    let ids;
    if (!isNaN(recordCount) && typeof beforeAfter === 'string') {
      ids = db.getIds(beforeAfter, parseInt(referenceId, 10), recordCount);
    } else {
      const idStrings = req.query.ids ? req.query.ids.split(',') : [];
      ids = idStrings.map(num => parseInt(num, 10));
    }

    const fromDate = moment(req.query.fromDate);
    const toDate = moment(req.query.toDate);
    if (fromDate.isValid() && toDate.isValid() && ids) {
      const subjects = db.get(ids, fromDate, toDate);
      res.json({
        subjects,
        fromDate,
        toDate,
      });
    } else {
      res.json({
        fromDate,
        toDate,
        error: true,
        subjects: [],
      });
    }
  });

  app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
  });
}
