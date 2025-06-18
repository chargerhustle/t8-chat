"use client";

import { useNavigate } from "react-router";

interface SidebarHeaderProps {
  onNewChat: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export function SidebarHeader({
  onNewChat,
  searchQuery,
  onSearchQueryChange,
}: SidebarHeaderProps) {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate("/");
    onNewChat();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchQueryChange(e.target.value);
  };

  const handleSearchClear = () => {
    onSearchQueryChange("");
  };

  return (
    <div className="flex flex-col gap-2 relative m-1 mb-0 space-y-1 p-0 !pt-safe">
      {/* Logo Section */}
      <h1 className="flex h-8 shrink-0 items-center justify-center text-lg text-muted-foreground transition-opacity delay-75 duration-75">
        <button
          onClick={() => navigate("/")}
          className="relative flex h-8 w-24 items-center justify-center text-sm font-semibold text-foreground"
          data-discover="true"
        >
          <div className="h-3.5 select-none text-foreground font-bold">
            T8 Chat
          </div>
        </button>
      </h1>

      {/* New Chat Button */}
      <div className="px-2">
        <button
          onClick={handleNewChat}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-reflect button-reflect rounded-lg bg-[rgb(162,59,103)] p-2 font-semibold text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20 h-9 px-4 py-2 w-full select-none text-sm"
          data-discover="true"
        >
          <span className="w-full select-none text-center" data-state="closed">
            New Chat
          </span>
        </button>
      </div>

      {/* Search Section */}
      <div className="border-b border-chat-border px-3">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-search -ml-[3px] mr-3 !size-4 text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <div className="relative flex-1">
            <input
              id="sidebar-search-input"
              name="sidebarSearch"
              role="searchbox"
              aria-label="Search threads"
              placeholder="Search your threads..."
              className="w-full bg-transparent py-2 text-sm text-foreground placeholder-muted-foreground/50 placeholder:select-none focus:outline-none pr-6"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button
                onClick={handleSearchClear}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-x"
                >
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
