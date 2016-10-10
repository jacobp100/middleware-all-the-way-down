const { createStore } = require('./index');

const reducer = (state = 0, action) => {
  if (action.type === 'INCREMENT') {
    return state + 1;
  } else if (action.type === 'DECREMENT') {
    return state - 1;
  }
  return state;
};
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
