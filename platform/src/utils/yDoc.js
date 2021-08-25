import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";

// const YJS_HOST = process.env.NODE_ENV === "production"? "wss://ryanyen2.tech/yjs/": "ws://localhost:3001";

export const initYDoc = (room) => {
    const ydoc = new Y.Doc();
    const yDocProvider = new WebsocketProvider(
        process.env.VUE_APP_WS_URL,
        room,
        ydoc
    )

    window.ydoc = ydoc;
    const indexdb = new IndexeddbPersistence(
        room,
        ydoc
    );

    return [ indexdb, ydoc, yDocProvider ];
}
