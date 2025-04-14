
import * as React from "react"
import { App } from '@capacitor/app';

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isNativeMobile, setIsNativeMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Check if running in a Capacitor native app
    const checkPlatform = async () => {
      try {
        // This will fail with an error if not running in a Capacitor app
        await App.getInfo();
        setIsNativeMobile(true);
      } catch (error) {
        setIsNativeMobile(false);
      }
    }
    
    checkPlatform();
    
    // Regular browser responsive check
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return just the boolean value to match the type expected by sidebar.tsx
  return isMobile || isNativeMobile;
}
