import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(
    localStorage.getItem("pwa_install_dismissed") === "true"
  );

  useEffect(() => {
    // Check if the app is already installed natively
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Only show the prompt if they haven't dismissed it
      if (!isDismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      // Log install to analytics if desired
      console.log("PWA was installed");
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-[9999] pointer-events-none fade-in">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-center gap-4 pointer-events-auto transform transition-transform duration-300 translate-y-0">
        
        {/* App Logo */}
        <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
          <img src="/logo.png" alt="App Logo" className="w-10 h-10 object-contain" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            Install Anikethana App
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 whitespace-normal">
            Get instant access and a better experience on your home screen.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
          
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-200 transition-all"
          >
            <Download size={16} />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
