import OrderBookStore from "../stores/order-book-store";

const API_URL = 'wss://www.cryptofacilities.com/ws/v1';
const WAIT_TIME = 1000;

const getCurrentTimestamp = () => {
    return new Date().getTime();
};

export const connect = (): Promise<any> => {
    const promise = new Promise((resolve, reject) => {
        const socket = new WebSocket(API_URL);

        socket.onopen = () => {
            resolve(socket);
        };

        socket.onerror = (error) => {
            reject(error);
        };
    });

    return promise;
};

export const openOrderBookFeed = (connection: WebSocket, feedId: string): void => {
    const message = { event: 'subscribe', feed: 'book_ui_1', product_ids:[feedId]};

    connection.send(JSON.stringify(message));

    let lastUpdatedTimestamp: number = 0;
    let deltas: DeltaType = { asks: [], bids: []};

    connection.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if (message.event == null) {
            switch(message.feed) {
                case 'book_ui_1_snapshot':
                    OrderBookStore.dispatch({
                        type: 'SNAPSHOT',
                        payload: {
                            id: message.product_id,
                            asks: message.asks, 
                            bids: message.bids
                        }
                    });

                    lastUpdatedTimestamp = getCurrentTimestamp();

                    break;
                case 'book_ui_1':
                    deltas.asks = deltas.asks.concat(message.asks);
                    deltas.bids = deltas.bids.concat(message.bids);

                    if (getCurrentTimestamp() < lastUpdatedTimestamp + WAIT_TIME) {
                        break;
                    }
                    
                    OrderBookStore.dispatch({
                        type: 'UPDATE',
                        payload: {
                            id: message.product_id,
                            asks: deltas.asks, 
                            bids: deltas.bids
                        }
                    });

                    deltas = { asks: [], bids: []};
                    lastUpdatedTimestamp = getCurrentTimestamp();

                    break;
                default:
            }
        }
    };
};

export const closeOrderBookFeed = (connection: WebSocket, feedId: string): void => {
    const message = { event: 'unsubscribe', feed: 'book_ui_1', product_ids:[feedId]};

    connection.send(JSON.stringify(message));
};

export const disconnect = (connection: WebSocket) => {
    connection.close();
};

// export const startStream = (): WebSocket => {
//     const socket = new WebSocket(API_URL);
//     let lastUpdatedTimestamp: number = 0;
//     let deltas: DeltaType = { asks: [], bids: []};

//     socket.onopen = () => {
//         const message = {"event":"subscribe","feed":"book_ui_1","product_ids":["PI_XBTUSD"]};
        
//         socket.send(JSON.stringify(message));
//     };

//     socket.onmessage = (event) => {
//         const message = JSON.parse(event.data);

//         if (message.event == null) {
//             switch(message.feed) {
//                 case 'book_ui_1_snapshot':
//                     OrderBookStore.dispatch({
//                         type: 'SNAPSHOT',
//                         payload: {
//                             id: message.product_id,
//                             asks: message.asks, 
//                             bids: message.bids
//                         }
//                     });

//                     lastUpdatedTimestamp = getCurrentTimestamp();

//                     break;
//                 case 'book_ui_1':
//                     deltas.asks = deltas.asks.concat(message.asks);
//                     deltas.bids = deltas.bids.concat(message.bids);

//                     if (getCurrentTimestamp() < lastUpdatedTimestamp + WAIT_TIME) {
//                         break;
//                     }
                    
//                     OrderBookStore.dispatch({
//                         type: 'UPDATE',
//                         payload: {
//                             id: message.product_id,
//                             asks: deltas.asks, 
//                             bids: deltas.bids
//                         }
//                     });

//                     deltas = { asks: [], bids: []};
//                     lastUpdatedTimestamp = getCurrentTimestamp();

//                     break;
//                 default:
//             }
//         }
//     };

//     return socket;
// };

// export const setSnapshot = () => {
//     OrderBookStore.dispatch({
//         type: 'SNAPSHOT'
//     });
// };

// export const update = () => {
//     OrderBookStore.dispatch({
//         type: 'UPDATE'
//     });
// };

// export const stopStream = (socket: WebSocket) => {
//     socket.close();
// };