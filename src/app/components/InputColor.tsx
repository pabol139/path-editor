"use client";
import { useState } from "react";

export default function InputColor() {
  const [color, setColor] = useState("#000000");
  const [colorText, setColorText] = useState("#000000");

  function isHexColor(color: string) {
    return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
  }

  function handleColorChange(event: React.ChangeEvent<HTMLInputElement>) {
    const colorValue = event.target.value || "#";
    console.log(colorValue);

    if (isHexColor(colorValue)) setColor(colorValue);
    else setColor("#000000");

    setColorText(colorValue);
  }

  return (
    <div className="relative leading-normal text-sm w-fit flex bg-secondary rounded-md py-2">
      <div className="px-2 border-r border-gray300 flex items-center">
        <input
          type="color"
          id="colorhex"
          value={color}
          onChange={handleColorChange}
          className="block"
        />
      </div>
      <input
        type="text"
        value={colorText}
        onChange={handleColorChange}
        className="bg-transparent w-20 px-2 border-r border-gray300"
      ></input>
      <div className="px-2 ">
        <input type="text" className="h-5 w-10 block bg-transparent " />
      </div>
    </div>
  );
}
