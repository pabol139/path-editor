import Image from "next/image";
import MainSvg from "./components/MainSvg";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <main className="bg-[#13171B] h-dvh">
      <MainSvg />
      <Sidebar />
    </main>
  );
}
