import { useEffect } from "react";

export default function InstallPrompt() {
  useEffect(() => {
    // Check if the app is already installed natively
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = async (e) => {
      // Prevent the mini-infobar from appearing automatically on mobile (Optional)
      // e.preventDefault();
      
      // Some browsers (like desktop Chrome) show an icon in the URL bar natively.
      // On mobile, if we don't call preventDefault(), Chrome usually shows a native, small bottom-sheet prompt automatically!
      
      // If you'd like to force the prompt programmatically instead of a custom UI, you can uncomment below:
      /*
      e.prompt();
      const { outcome } = await e.userChoice;
      console.log(`User response to the native install prompt: ${outcome}`);
      */
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Return nothing, we rely entirely on the native browser UI.
  return null;
}
