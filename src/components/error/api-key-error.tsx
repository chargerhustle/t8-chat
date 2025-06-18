"use client";

import { useNavigate } from "react-router";

export function ApiKeyError() {
  const navigate = useNavigate();

  const handleConfigureApiKeys = () => {
    navigate("/settings/api-keys");
  };

  return (
    <div
      className="flex items-start gap-3 rounded-lg bg-red-500/15 px-4 py-3 text-sm text-red-900 dark:text-red-400"
      role="alert"
    >
      <div className="leading-relaxed">
        <span>Please configure your API keys to receive a message.</span>
        <button
          onClick={handleConfigureApiKeys}
          className="ml-1 inline-flex items-center gap-1 text-red-700 underline hover:text-red-800 dark:text-red-200 dark:decoration-red-200 dark:hover:text-red-50"
        >
          Configure API Keys
        </button>
      </div>
    </div>
  );
}
