type OrderBookEntryType = {
    price: number,
    size: number
};

type OrderBookMapType = {
    [price: number]: OrderBookEntryType
};
  
type OrderBookStoreStateType = {
    connection: WebSocket | null,
    id: string | null,
    asks: OrderBookMapType,
    bids: OrderBookMapType
};
  
type OrderBookStoreActionType = {
    type: 'SET_CONNECTION' | 'SNAPSHOT' | 'UPDATE' | 'CLEAR',
    payload: {
        id: string,
        asks: Array<[number, number]>,
        bids: Array<[number, number]>
    }
};

type DeltaType = {
    asks: Array<[number, number]>,
    bids: Array<[number, number]>
};