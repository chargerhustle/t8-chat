function MessageLoading() {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.3s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40 [animation-delay:-0.15s]" />
      <div className="h-2 w-2 animate-bounce rounded-full bg-secondary-foreground/40" />
    </div>
  );
}

export { MessageLoading };
