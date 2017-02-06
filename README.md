# HTML

Each event has a class which is set based in the `status` property of the
event.

# Testing

Run `gulp demo` to have the default example in the `examples` page running in the browser. Make sure to run `gulp build` before starting the demo.

The demo starts a fake server whose code is at `examples/default/demoServer`.
The server exposes a simple api where the responses follow this model:

``` javascript
{"subjects":[
  {"id":0,"name":"Property - Lorem Ipsum Dolor 0","events": [
    {"desc":"Event 37","status":"maintenance","start":"2017-02-12T14:55:06.598Z","end":"2017-02-16T14:55:06.598Z"},
    {"desc":"Event 38","status":"wifi","start":"2017-02-21T14:55:06.598Z","end":"2017-02-27T14:55:06.598Z"},
  ]},
  {"id":1,"name":"Property - Lorem Ipsum Dolor 1","events":[
    {"desc":"Event 31","status":"cleaning","start":"2017-02-10T14:55:06.598Z","end":"2017-02-18T14:55:06.598Z"},
    {"desc":"Event 32","status":"half-busy","start":"2017-02-24T14:55:06.598Z","end":"2017-03-03T14:55:06.598Z"},
  ]},
]}
```
