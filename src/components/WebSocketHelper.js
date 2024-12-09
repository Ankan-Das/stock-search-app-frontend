export const initializeWebSocket = (apiKey, symbols, onMessage, onError, onClose) => {
    const socket = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${apiKey}`);

    socket.onopen = () => {
        console.log("WebSocket connection established");
        const subscribeMessage = {
            action: "subscribe",
            params: {
                symbols: symbols.join(",")
            }
        };
        socket.send(JSON.stringify(subscribeMessage));
    };

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.event === "price") {
            onMessage(message);
        }
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        if (onError) onError(err);
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
        if (onClose) onClose();
    };

    return socket;
};