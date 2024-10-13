import { createContext, useContext, useMemo } from "react";
import useSocket from "./hooks/useSocket";
import Canvas from "./components/Canvas";
import CanvasUtils from "./components/CanvasUtils";
import { Socket } from "socket.io-client";
interface AppContextProps {
  sendMsg?: (event: string, msg: any) => void;
  socket?: Socket;
}
const AppContext = createContext<AppContextProps>({
  sendMsg: () => {},
  socket: undefined,
});

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("(!) AppContext를 호출할 수 없는 범위입니다.");
  }
  return context;
};
function App() {
  const [sendMsg, socket] = useSocket();

  const contextValue: AppContextProps = useMemo(
    () => ({
      sendMsg,
      socket,
    }),
    [sendMsg]
  );
  return (
    <AppContext.Provider value={contextValue}>
      <div className="draw-wrapper">
        <CanvasUtils />
        <Canvas />
      </div>
    </AppContext.Provider>
  );
}

export default App;
