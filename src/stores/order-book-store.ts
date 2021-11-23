import { configureStore } from '@reduxjs/toolkit';

const initialState: OrderBookStoreStateType = {
  connection: null,
  id: null,
  asks: {},
  bids: {}
};

const mapEntries = (entries: Array<[number, number]>): OrderBookMapType => {
  const orderBookMap: OrderBookMapType = {};

  entries.forEach((entry: Array<number>, index): void => {
      const [price, size] = entry;

      orderBookMap[price] = { price, size };
  });

  return orderBookMap;
};

const updateEntries = (orderBookMap: OrderBookMapType, updates: Array<[number, number]>) => {
  const newOrderBookMap: OrderBookMapType = { ...orderBookMap };

  updates.forEach(([price, size]) => {
    if (newOrderBookMap[price] == null) {
      if (size === 0) {
        return;
      }

      newOrderBookMap[price] = {
        price,
        size
      };

      return;
    }

    if (size === 0) {
      delete newOrderBookMap[price];

      return;
    }

    newOrderBookMap[price] = {
      ...newOrderBookMap[price],
      size
    }
  });

  return newOrderBookMap;
};

const reducer = (state: OrderBookStoreStateType = initialState, action: OrderBookStoreActionType): OrderBookStoreStateType => {
  switch(action.type) {
    case 'SNAPSHOT':
      return {
        ...state,
        id: action.payload.id,
        asks: mapEntries(action.payload.asks),
        bids: mapEntries(action.payload.bids)
      };
    case 'UPDATE':
      return {
        ...state,
        asks: updateEntries(state.asks, action.payload.asks),
        bids: updateEntries(state.bids, action.payload.bids)
      };
    case 'CLEAR':
      return {
        ...state,
        id: null,
        asks: [],
        bids: []
      };
    default:
      return state;
  };
};
  
const orderBookStore = configureStore({ reducer });

export default orderBookStore;