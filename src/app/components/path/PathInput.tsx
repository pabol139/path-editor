import { useRef } from "react";
import { usePath, useSetPath } from "../../context/PathContext";
import { Copy } from "react-feather";

export default function PathInput() {
  const path = usePath();
  const setPath = useSetPath();
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setPath(value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(path).then(
      () => {
        if (!buttonRef.current) return;
        const textElement = buttonRef.current.querySelector("span");

        buttonRef.current.classList.add("copied");
        if (textElement) textElement.innerText = "Copied!";

        setTimeout(() => {
          if (!buttonRef.current) return;
          const textElement = buttonRef.current.querySelector("span");

          buttonRef.current.classList.remove("copied");
          if (textElement) textElement.innerText = "Copy";
        }, 4000);

        /* clipboard successfully set */
      },
      () => {
        /* clipboard write failed */
      }
    );
  };

  return (
    <>
      <textarea
        className="mt-2 w-full bg-secondary text-base"
        name=""
        id=""
        cols={30}
        rows={3}
        onChange={handleChange}
        value={path}
      ></textarea>
      <button
        ref={buttonRef}
        onClick={handleCopy}
        className="bg-[#2A2A2A] [&.copied]:bg-purple px-2 py-1 flex gap-2 text-sm items-center border border-tertiary rounded-md"
      >
        <Copy size={16}></Copy>
        <span>Copy</span>
      </button>
    </>
  );
}
