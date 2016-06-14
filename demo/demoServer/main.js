/* eslint-env node */
const moment = require('moment');

const dbStartDate = moment().add(-300, 'days');
const dbEndDate = moment().add(300, 'days');
const dbRecordCount = 200;
const db = require('./dbCreator')(dbRecordCount, dbStartDate, dbEndDate);

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  const beforeAfter = req.params.beforeAfter;
  const extraSubjects = req.params.extraSubjects;
  const referenceId = req.params.referenceId;

  let ids = req.params.ids;
  if (typeof beforeAfter === 'string') {
    const extraIds = db.getIds(beforeAfter, referenceId, extraSubjects);
    ids = ids.concat(extraIds);
  }
  const fromDate = req.params.fromDate;
  const toDate = req.params.toDate;
  const events = db.get(ids, fromDate, toDate);
  res.json(events);
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});
