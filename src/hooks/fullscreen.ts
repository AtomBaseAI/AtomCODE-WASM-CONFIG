export const fullscreenCheck = (): boolean => {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    return !!(
      document.fullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    );
  }
  return false;
};


export const enterFullscreen = (element: HTMLElement) => {
  if (element.requestFullscreen) {
    element.requestFullscreen().catch(console.error);
  } else if ((element as any).mozRequestFullScreen) {
    (element as any).mozRequestFullScreen().catch(console.error);
  } else if ((element as any).webkitRequestFullscreen) {
    (element as any).webkitRequestFullscreen().catch(console.error);
  } else if ((element as any).msRequestFullscreen) {
    (element as any).msRequestFullscreen().catch(console.error);
  }
};

export const exitFullscreen = () => {
  if (document.fullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(console.error);
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen().catch(console.error);
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen().catch(console.error);
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen().catch(console.error);
    }
  }
};