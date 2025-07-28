import { PathProvider } from "./context/path-provider";
import Wrapper from "./components/wrapper";

function App() {
  return (
    <PathProvider>
      <main className="bg-[#13171B] h-dvh">
        <Wrapper />
      </main>
    </PathProvider>
  );
}

export default App;
