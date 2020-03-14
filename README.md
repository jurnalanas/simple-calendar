# simple-calendar

Simple Calendar built with Vanilla JavaScript. No frameworks or libraries. User's data stored in browser's localstorage.

Live: https://jurnalanas.github.io/simple-calendar/

### Prerequisites

- [Node](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/)

## Building and running on localhost

First install dependencies:

```sh
yarn
```

To run in hot module reloading mode:

```sh
yarn start
```

To create a production build:

```sh
yarn build-prod
```

Run e2e test:

- make sure the app already run at http://localhost:1234 (default port)

```sh
yarn start
```

- run cycpress

```sh
cy:run
```

- or open cycpress client

```sh
cy:open
```
## Screenshots

![Calendar](/static/calendar.png)
![Add new event](/static/event.png)
