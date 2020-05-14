// this function defines if app is installed on homescreen as PWA
export function isPWA() {
  return window && window.matchMedia("(display-mode: standalone)").matches
}