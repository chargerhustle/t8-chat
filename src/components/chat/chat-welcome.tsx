"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Sparkles, Newspaper, Code, GraduationCap } from "lucide-react";
import { getSuggestions } from "@/lib/chat/suggestions";

interface ChatWelcomeProps {
  onSuggestionClick?: (suggestion: string) => void;
}

const categories = [
  {
    id: "create",
    label: "Create",
    icon: Sparkles,
  },
  {
    id: "explore",
    label: "Explore",
    icon: Newspaper,
  },
  {
    id: "code",
    label: "Code",
    icon: Code,
  },
  {
    id: "learn",
    label: "Learn",
    icon: GraduationCap,
  },
];

function getFirstName(fullName: string | undefined): string {
  if (!fullName || fullName.trim() === "") {
    return "there";
  }

  // Split by space and take the first part
  const firstName = fullName.trim().split(" ")[0];

  // Handle edge cases where first name might be empty or just whitespace
  if (!firstName || firstName.trim() === "") {
    return "there";
  }

  return firstName;
}

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  const [selectedCategory, setSelectedCategory] = useState("default");
  const currentUser = useQuery(api.auth.getCurrentUser);

  const userName = getFirstName(currentUser?.name);
  const suggestions = getSuggestions(selectedCategory);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory((prevSelectedCategory) =>
      prevSelectedCategory === categoryId ? "default" : categoryId
    );
  };

  return (
    <div className="flex h-[calc(100vh-20rem)] items-start justify-center">
      <div className="w-full space-y-6 px-2 pt-[calc(max(15vh,2.5rem))] duration-300 animate-in fade-in-50 zoom-in-95 sm:px-8">
        <h2 className="text-3xl font-semibold">
          How can I help you, {userName}?
        </h2>

        <div className="flex flex-row flex-wrap gap-2.5 text-sm max-sm:justify-evenly">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`justify-center whitespace-nowrap text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 flex items-center gap-1 rounded-xl px-5 py-2 font-semibold outline-1 outline-secondary/70 backdrop-blur-xl max-sm:size-16 max-sm:flex-col sm:gap-2 sm:rounded-full ${
                  isSelected
                    ? "border-reflect bg-[rgb(162,59,103)] p-2 text-primary-foreground shadow hover:bg-[#d56698] active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] disabled:active:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:hover:bg-pink-800/70 dark:active:bg-pink-800/40 disabled:dark:hover:bg-primary/20 disabled:dark:active:bg-primary/20"
                    : "bg-primary text-primary-foreground shadow hover:bg-pink-600/90 disabled:hover:bg-primary data-[selected=false]:bg-secondary/30 data-[selected=false]:text-secondary-foreground/90 data-[selected=false]:outline data-[selected=false]:hover:bg-secondary"
                }`}
                data-selected={isSelected}
              >
                <Icon className="max-sm:block" size={16} />
                <div>{category.label}</div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col text-foreground">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-2 border-t border-secondary/40 py-1 first:border-none"
            >
              <button
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full rounded-md py-2 text-left text-secondary-foreground hover:bg-secondary/50 sm:px-3"
              >
                <span>{suggestion}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
