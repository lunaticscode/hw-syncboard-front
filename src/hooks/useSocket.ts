import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
const wsUrl = import.meta.env.VITE_WS_SERVER_URL;

const useSocket = (): [
  (event: string, msg: any) => void,
  Socket | undefined
] => {
  const [socket, setSocket] = useState<Socket>();
  const [isOwner, setIsOwner] = useState<boolean>(
    localStorage.getItem("isOwner") ? true : false
  );

  console.log(localStorage.getItem("isOwner"));
  //   const [receiveMessage, setReceiveMessage] = useState<any>();
  useEffect(() => {
    const wsClient = io(wsUrl, {
      extraHeaders: { role: isOwner ? "owner" : "viewer" },
    }).connect();

    wsClient.on("connect", () => {
      console.log("[WS Connect]", wsClient.id);
      setSocket(wsClient);
      wsClient.emit("client-connect", { id: wsClient.id, isOwner });
    });

    wsClient.on("disconnect", () => {
      console.log("[WS Disconnect]");
    });

    // wsClient.on("paint-offset", (msg) => {
    //   receiveMsg("paint-offset", msg);
    // });

    if (localStorage.getItem("isOwner")) {
      setIsOwner(true);
    }

    return () => {
      if (wsClient) {
        wsClient.disconnect();
      }
    };
  }, []);

  const sendMessage = (event: string, msg: any) => {
    if (!socket) return;
    socket.emit(event, { data: msg });
  };

  return [sendMessage, socket];
};

export default useSocket;
