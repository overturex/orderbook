import flyd from 'flyd';

const API_URL = 'wss://www.cryptofacilities.com/ws/v1';

// let socket = new WebSocket("wss://javascript.info/article/websocket/demo/hello");

// socket.onopen = function(e) {
//   alert("[open] Connection established");
//   alert("Sending to server");
//   socket.send("My name is John");
// };

// socket.onmessage = function(event) {
//   alert(`[message] Data received from server: ${event.data}`);
// };

// socket.onclose = function(event) {
//   if (event.wasClean) {
//     alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
//   } else {
//     // e.g. server process killed or network down
//     // event.code is usually 1006 in this case
//     alert('[close] Connection died');
//   }
// };

class ConversationService {
    static openConversation(request, subscriberId) {
        const promise = new Promise((resolve) => {
            const socket = new WebSocket(API_URL);

            const messages = flyd.stream();

            const conversation = {
                onUpdate: (data) => {}
            };

            socket.onopen = () => {
                socket.send(JSON.stringify(request));

                resolve()
            };

            socket.onmessage = (event) => {
                //console.log(event);

                //messages(event.data)

                conversation.onUpdate(event.data);
            };

            resolve(conversation);
        });

        promise.catch((error) => {

        });

        return promise;
    }
}

export default ConversationService;