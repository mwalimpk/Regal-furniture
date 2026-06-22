import { useEffect } from "react";

const isProtectedImage = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest("img"));

const ImageProtection = () => {
  useEffect(() => {
    const preventImageAction = (event: Event) => {
      if (isProtectedImage(event.target)) {
        event.preventDefault();
      }
    };

    document.addEventListener("contextmenu", preventImageAction, true);
    document.addEventListener("dragstart", preventImageAction, true);

    return () => {
      document.removeEventListener("contextmenu", preventImageAction, true);
      document.removeEventListener("dragstart", preventImageAction, true);
    };
  }, []);

  return null;
};

export default ImageProtection;
