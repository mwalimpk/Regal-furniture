import { useEffect } from "react";

const PROTECTED_IMAGE_EVENTS = ["contextmenu", "copy", "cut", "dragstart", "selectstart"] as const;

const hasImageBackground = (element: Element) => {
  if (!(element instanceof HTMLElement)) return false;
  return window.getComputedStyle(element).backgroundImage.includes("url(");
};

const isProtectedImage = (target: EventTarget | null) => {
  let element = target instanceof Element ? target : null;

  while (element) {
    if (element.matches("img, picture, [data-protected-image]") || hasImageBackground(element)) {
      return true;
    }
    element = element.parentElement;
  }

  return false;
};

const disableNativeImageDragging = (root: ParentNode) => {
  if (root instanceof HTMLImageElement) {
    root.draggable = false;
  }

  root.querySelectorAll?.("img").forEach((image) => {
    image.draggable = false;
  });
};

const ImageProtection = () => {
  useEffect(() => {
    const preventImageAction = (event: Event) => {
      if (isProtectedImage(event.target)) {
        event.preventDefault();
      }
    };

    disableNativeImageDragging(document);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            disableNativeImageDragging(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    PROTECTED_IMAGE_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, preventImageAction, true);
    });

    return () => {
      observer.disconnect();
      PROTECTED_IMAGE_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, preventImageAction, true);
      });
    };
  }, []);

  return null;
};

export default ImageProtection;
