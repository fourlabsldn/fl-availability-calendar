import assert from 'fl-assert';

// // Data object example
// {
//   properties: [
//     {
//       title: "Prop number 1",
//       events: Set([
//         {
//           desc: "Rented to John",
//           start: today(),
//           end: daysFromNow(5)
//         },
//         {
//           desc: "Rented to Carl",
//           start: daysFromNow(10),
//           end: daysFromNow(20)
//         },
//         {
//           desc: "Under Maintenance",
//           visitable: true,
//           start: daysFromNow(30),
//           end: daysFromNow(50)
//         }
//       ])
//     }
//   ]
// };

export default class DataLoader {
  /**
   * @method constructor
   * @param  {String} loadUrl - Url from where to fetch data
   * @return {DataLoader}
   */
  constructor(loadUrl) {
    this.loadUrl = loadUrl;
    Object.preventExtensions(this);
  }

  /**
   * Fetches data from the server
   * @method load
   * @param  {CustomDate} fromDate
   * @param  {CustomDate} endDate
   * @param  {Array<String>} ids - Subject ids
   * @param  {Int} [idCountToLoad] - How many new ids to be loaded
   * @param  {String} [Method]
   * @return {Promise<Object>}
   */
  load(fromDate, endDate, ids, idCountToLoad = 0, topBottom, method = 'GET') {
    // return fetch(this.loadUrl, {
    //   method,
    //   credentials: 'include',
    // })
    // .then((res) => res.json())
    return new Promise((resolve) => {
      resolve(this.createCalendarContent());
    })
    .catch((err) => assert(false, err));
  }

  createCalendarContent() {
    function daysFromNow(days) {
      return new Date(Date.now() + (days * 86400000));
    }

    // Random number from 1 to 10
    function rand() {
      return parseInt(Math.random() * 10, 10);
    }

    const properties = [];
    const propNo = 10000;
    let eventNo;
    let lastDate;

    for (let i = 0; i < propNo; i++) {
      properties[i] = {};
      properties[i].title = `Property - asdf asd fasdf asdfasd ${i + 1}`;
      properties[i].events = new Set();
      eventNo = rand() * 5;
      lastDate = rand();

      for (let j = 0; j < eventNo; j++) {
        const newEvent = {};
        newEvent.desc = `Event ${i + j}`;

        // Random true or false
        newEvent.visitable = !!rand();

        lastDate += rand();
        newEvent.start = daysFromNow(lastDate).getTime();
        lastDate += rand();
        newEvent.end = daysFromNow(lastDate).getTime();
        properties[i].events.add(newEvent);
      }
    }

    return {
      subjects: properties,
    };
  }
}
