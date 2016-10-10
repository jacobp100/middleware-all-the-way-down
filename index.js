const combineMiddlewares = middlewares => (store) => {
  const invokeMiddlewareChain = middlewares.reduceRight((nextFn, middleware) => {
    const propagationFunction = middleware(store);
    return propagationFunction(nextFn);
  }, null);
  return invokeMiddlewareChain;
};

const reducerMiddleware = (initialState, reducer) => (store) => {
  let state = initialState;

  store.getState = () => state;

  return () => (action) => { state = reducer(state, action); };
};

const subscribeMiddleware = () => (store) => {
  let handlers = [];

  store.subscribe = (cb) => {
    handlers = handlers.concat(cb);
    return () => { handlers = handlers.filter(fn => fn !== cb); };
  };

  return next => (action) => {
    const previousState = store.getState();
    next(action);
    const nextState = store.getState();

    if (previousState !== nextState) handlers.forEach(cb => cb());
  };
};

const createStore = ({
  reducer = state => state,
  middlewares = [],
  initialState = undefined,
}) => {
  let dispatchFunction = () => {
    throw new Error('Cannot call dispatch before store is ready');
  };

  const store = {
    dispatch: action => dispatchFunction(action),
  };

  dispatchFunction = combineMiddlewares([
    ...middlewares,
    subscribeMiddleware(),
    reducerMiddleware(initialState, reducer),
  ])(store);

  store.dispatch({ type: '@@redux/INIT' });

  return store;
};

module.exports.createStore = createStore;
