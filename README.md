# tracker (from Meteor)

[![Build Status](https://semaphoreci.com/api/v1/hoda5/tracker/branches/master/badge.svg)](https://semaphoreci.com/hoda5/tracker)
[![codecov](https://codecov.io/gh/hoda5/tracker/branch/master/graph/badge.svg)](https://codecov.io/gh/hoda5/tracker)

This package is an adaptation from 
- http://docs.meteor.com/#tracker
- https://github.com/meteor/meteor/blob/master/packages/tracker/tracker.js

```bash
npm install @hoda5/tracker
```

```typescript
import { autorun, Dependency } from '@hoda5/tracker'

let weather = 'sunny';
const weatherDep = new Dependency;

function getWeather() {
  weatherDep.depend();
  return weather;
}

function setWeather(newWeather) {
  weather = newWeather;
  weatherDep.changed();
}
```

### tracking with console.log

```typescript
autorun( ()=> {
  const weather = getWeather();
  console.log("Weather: " + weather);
});

setTimeout( () => setWeather("rainy"), 1000);
setTimeout( () => setWeather("cloudy"), 2000);
``` 

### tracking with ReactJS

[![Edit mynz7nlmwj](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/mynz7nlmwj)

```typescript

const ReactiveComponent = weatherDep.rx(() => {
  const weather = getWeather();
  return (
    <span>
      Weather: <b>{weather}</b>
    </span>
  );
});

const rootElement = document.getElementById("root");
ReactDOM.render(<ReactiveComponent />, rootElement);

setTimeout( () => setWeather("rainy"), 1000);
setTimeout( () => setWeather("cloudy"), 2000);

``` 
