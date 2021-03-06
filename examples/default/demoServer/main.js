/* eslint-env node */
const moment = require('moment');

const dbStartDate = moment().add(-300, 'days');
const dbEndDate = moment().add(300, 'days');
const dbRecordCount = 200;
const db = require('./dbCreator')(dbRecordCount, dbStartDate, dbEndDate);

const express = require('express');
const app = express();

module.exports = () => {
  return new Promise((resolve) => {
    // serve static files
    app.use('/demo', (req, res, next) => {
      if (req.url.indexOf('demoServer') !== -1) {
        return res.status(403).end('403 Forbidden')
      }
      next();
    });
    app.use(express.static('.'));

    app.get('/finish', () => {
      resolve();
    });

    app.get('/', (req, res) => {
      console.dir(req.query);
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With');

      const beforeAfter = req.query.beforeAfter;
      const recordCount = parseInt(req.query.recordCount, 10);
      const referenceId = req.query.referenceId ? parseInt(req.query.referenceId, 10) : null;

      let ids;
      if (!isNaN(recordCount) && typeof beforeAfter === 'string') {
        ids = db.getIds(beforeAfter, referenceId, recordCount);
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

    app.listen(3005, () => {
      console.log('Example app listening on port 3005!');
    });
  });
};
