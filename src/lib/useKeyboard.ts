import { useEffect } from "react";

export const useKeyboard = (
  callback: () => void = () => console.log("test"),
  key: string = "Shift"
) => {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };
    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [callback, key]);
};
