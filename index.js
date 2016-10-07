const combineMiddlewares = middlewares => (store) => {
  const propagationFunction = middlewares.map(middleware => (
    middleware(store)
  ));
  const invokeMiddlewareChain = propagationFunction.reduceRight((nextFn, middleware) => (
    middleware(nextFn)
  ), null);
  return invokeMiddlewareChain;
};

const reducerMiddleware = (reducer, initialState) => store => {
  let state = initialState;

  store.getState = () => state;

  return () => (action) => { state = reducer(state, action); };
};

const subscribeMiddleware = () => store => {
  let handlers = [];

  store.subscribe = (cb) => {
    handlers = handlers.concat(cb);
    return () => { handlers = handlers.filter(fn => fn !== cb) };
  };

  return next => (action) => {
    const previousState = store.getState();
    next(action);
    const nextState = store.getState();

    if (previousState !== nextState) handlers.forEach(cb => cb());
  }
};

const createStore = ({
  reducer = state => state,
  middlewares = [],
  initialState = undefined,
}) => {
  const store = {};

  store.dispatch = combineMiddlewares([
    ...middlewares,
    subscribeMiddleware(),
    reducerMiddleware(reducer, initialState)
  ])(store);

  store.dispatch({ type: '@@redux/INIT' });

  return store;
};

// DEMO

const reducer = (state = 0, action) => {
  if (action.type === 'INCREMENT') {
    return state + 1
  } else if (action.type === 'DECREMENT') {
    return state - 1;
  }
  return state;
}
const store = createStore({ reducer });

store.subscribe(() => {
  console.log('NEW STATE');
});
console.log('state:', store.getState());
store.dispatch({ type: 'INCREMENT' });
console.log('state:', store.getState());
store.dispatch({ type: 'INCREMENT' });
console.log('state:', store.getState());
store.dispatch({ type: 'DECREMENT' });
console.log('state:', store.getState());
