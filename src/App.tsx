import { PathProvider } from "./context/path-provider";
import Wrapper from "./components/wrapper";
import { MotionConfig } from "framer-motion";

function App() {
  return (
    <PathProvider>
      <MotionConfig reducedMotion="user">
        <main className="bg-[#13171B] h-dvh">
          <Wrapper />
        </main>
      </MotionConfig>
    </PathProvider>
  );
}

export default App;
