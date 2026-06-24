import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import ImageProtection from "@/components/ImageProtection";

describe("ImageProtection", () => {
  let container: HTMLDivElement;
  let root: Root;
  const reactTestEnvironment = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };

  beforeAll(() => {
    reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterAll(() => {
    delete reactTestEnvironment.IS_REACT_ACT_ENVIRONMENT;
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("disables native dragging for current and dynamically added images", async () => {
    act(() => {
      root.render(
        <>
          <ImageProtection />
          <img src="/existing.png" alt="Existing" />
        </>,
      );
    });

    expect(container.querySelector("img")?.draggable).toBe(false);

    const addedImage = document.createElement("img");
    addedImage.src = "/added.png";

    await act(async () => {
      container.appendChild(addedImage);
      await new Promise((resolve) => window.setTimeout(resolve, 0));
    });

    expect(addedImage.draggable).toBe(false);
  });

  it("blocks context menus, dragging, and selection on images", () => {
    act(() => {
      root.render(
        <>
          <ImageProtection />
          <img src="/protected.png" alt="Protected" />
        </>,
      );
    });
    const image = container.querySelector("img");
    expect(image).not.toBeNull();

    ["contextmenu", "dragstart", "selectstart"].forEach((eventName) => {
      const event = new Event(eventName, { bubbles: true, cancelable: true });
      image?.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  it("protects CSS background images without blocking ordinary controls", () => {
    act(() => {
      root.render(
        <>
          <ImageProtection />
          <div data-testid="background" style={{ backgroundImage: 'url("/protected.png")' }}>
            Protected background
          </div>
          <button type="button">Ordinary control</button>
        </>,
      );
    });

    const background = container.querySelector('[data-testid="background"]');
    const button = container.querySelector("button");
    const backgroundEvent = new Event("contextmenu", { bubbles: true, cancelable: true });
    const buttonEvent = new Event("contextmenu", { bubbles: true, cancelable: true });

    background?.dispatchEvent(backgroundEvent);
    button?.dispatchEvent(buttonEvent);

    expect(backgroundEvent.defaultPrevented).toBe(true);
    expect(buttonEvent.defaultPrevented).toBe(false);
  });
});
