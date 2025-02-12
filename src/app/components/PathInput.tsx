import { usePath, useSetPath } from "../context/PathContext";

export default function PathInput() {
  const path = usePath();
  const setPath = useSetPath();

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setPath(value);
  };

  return (
    <textarea
      className="mt-2 w-full bg-secondary text-base"
      name=""
      id=""
      cols={30}
      rows={3}
      onChange={handleChange}
      value={path}
    ></textarea>
  );
}
