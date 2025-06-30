import React from "react";
import { Globe, ChevronDown } from "lucide-react";
import { ResultItem, type ResultData } from "./result-item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
    return <div className="text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <Accordion type="single" collapsible className="not-prose">
      <AccordionItem value="search-results">
        <AccordionTrigger className="py-0 hover:no-underline justify-start [&>svg:last-child]:hidden [&[data-state=open]_.chevron]:rotate-180">
          <div className="flex items-center gap-2">
            <Globe className="size-4" />
            <span className="text-sm">{title}</span>
            <ChevronDown className="chevron text-muted-foreground pointer-events-none size-4 shrink-0 transition-transform duration-200" />
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col pl-6">
            {results.map((result, index) => (
              <ResultItem
                key={`${result.url}-${index}`}
                result={result}
                index={index}
                linkText={linkText}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
