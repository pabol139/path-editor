import { PathProvider } from "./context/PathProvider";
import SvgWrapper from "./components/SvgWrapper";

function App() {
  return (
    <PathProvider>
      <main className="bg-[#13171B] h-dvh">
        <SvgWrapper />
      </main>
    </PathProvider>
  );
}

export default App;
