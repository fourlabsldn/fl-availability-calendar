/* eslint-env node */
const moment = require('moment');

const dbStartDate = moment().add(-300, 'days');
const dbEndDate = moment().add(300, 'days');
const dbRecordCount = 200;
const db = require('./dbCreator')(dbRecordCount, dbStartDate, dbEndDate);

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.dir(req.query);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');

  const beforeAfter = req.query.beforeAfter;
  const recordCount = parseInt(req.query.recordCount, 10);
  const referenceId = req.query.referenceId;

  const idStrings = req.query.ids ? req.query.ids.split(',') : [];
  let ids = idStrings.map(num => parseInt(num, 10));

  if (typeof beforeAfter === 'string') {
    const extraIds = db.getIds(beforeAfter, parseInt(referenceId, 10), recordCount);
    ids = ids.concat(extraIds);
  }
  const fromDate = req.query.fromDate;
  const toDate = req.query.toDate;

  if (fromDate && toDate && ids) {
    const subjects = db.get(ids, fromDate, toDate);
    res.json({
      subjects,
      fromDate,
      toDate,
    });
  } else {
    res.json({ fromDate, toDate, error: true, subjects: [] });
  }
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
