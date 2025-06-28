import React from "react";
import { ResultItem, type ResultData } from "./result-item";

interface ResultsListProps {
  results: ResultData[];
  title: string;
  emptyMessage: string;
  linkText?: string;
}

export const ResultsList: React.FC<ResultsListProps> = ({
  results,
  title,
  emptyMessage,
  linkText,
}) => {
  if (!results.length) {
    return <div className="text-gray-500">{emptyMessage}</div>;
  }

  return (
    <div className="">
      <h1 className="text-muted-foreground text-sm font-medium">{title}</h1>
      <div className="flex flex-col">
        {results.map((result, index) => (
          <ResultItem
            key={index}
            result={result}
            index={index}
            linkText={linkText}
          />
        ))}
      </div>
    </div>
  );
};
