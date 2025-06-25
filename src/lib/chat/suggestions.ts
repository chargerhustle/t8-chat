export interface SuggestionCategory {
  id: string;
  suggestions: string[];
}

export const CHAT_SUGGESTIONS: Record<string, string[]> = {
  default: [
    "How does AI work? ",
    "Are black holes real? ",
    'How many Rs are in the word "strawberry"? ',
    "What is the meaning of life? ",
  ],
  temporary: [
    "I accidentally sent a text to the wrong person ",
    "What should I do in this awkward situation? ",
    "I hate my job but need the money ",
    "My roommate is driving me insane ",
  ],
  create: [
    "Write a short story about a robot discovering emotions ",
    "Help me outline a sci-fi novel set in a post-apocalyptic world ",
    "Create a character profile for a complex villain with sympathetic motives ",
    "Give me 5 creative writing prompts for flash fiction ",
  ],
  explore: [
    "What are the most fascinating unsolved mysteries in science? ",
    "Explain the concept of parallel universes in simple terms ",
    "What would happen if gravity suddenly stopped working? ",
    "Tell me about the strangest animals that actually exist ",
  ],
  code: [
    "Write code to invert a binary search tree in Python ",
    "What's the difference between Promise.all and Promise.allSettled? ",
    "Explain React's useEffect cleanup function ",
    "Best practices for error handling in async/await ",
  ],
  learn: [
    "Teach me the basics of quantum physics in 5 minutes ",
    "What's the most effective way to learn a new language? ",
    "Explain machine learning like I'm 10 years old ",
    "How can I improve my critical thinking skills? ",
  ],
};

export function getSuggestions(categoryId: string): string[] {
  return CHAT_SUGGESTIONS[categoryId] || CHAT_SUGGESTIONS.default;
}
