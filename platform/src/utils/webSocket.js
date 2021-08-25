import io from "socket.io-client";

// const HOST = process.env.NODE_ENV === "production"? "https://ryanyen2.tech/": "http://localhost:3000/";
export const initSocket = (room) => {
  return io(process.env.BASE_URL + room);
}
