"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const STORAGE_KEY = "t8-chat-prompt-customization";

interface PromptCustomizationData {
  name: string;
  occupation: string;
  traits: string;
  additionalInfo: string;
}

export function PromptCustomization() {
  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [traits, setTraits] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Get data from Convex
  const convexCustomization = useQuery(api.auth.getUserCustomization);
  const saveCustomization = useMutation(api.auth.saveUserCustomization);

  // Load data from localStorage first, then fallback to Convex
  useEffect(() => {
    // First, try to load from localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    let loadedFromLocalStorage = false;

    if (savedData) {
      try {
        const parsedData: PromptCustomizationData = JSON.parse(savedData);
        setName(parsedData.name || "");
        setOccupation(parsedData.occupation || "");
        setTraits(parsedData.traits || "");
        setAdditionalInfo(parsedData.additionalInfo || "");
        loadedFromLocalStorage = true;
      } catch (error) {
        console.error(
          "Failed to parse saved prompt customization data from localStorage:",
          error
        );
      }
    }

    // Only use Convex data as fallback if localStorage didn't provide valid data
    if (!loadedFromLocalStorage && convexCustomization !== undefined) {
      if (convexCustomization) {
        setName(convexCustomization.name || "");
        setOccupation(convexCustomization.occupation || "");
        setTraits(convexCustomization.traits || "");
        setAdditionalInfo(convexCustomization.additionalInfo || "");
      }
    }
  }, [convexCustomization]);

  // Track changes to enable/disable save button
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const currentData: PromptCustomizationData = {
      name,
      occupation,
      traits,
      additionalInfo,
    };

    if (savedData) {
      try {
        const parsedData: PromptCustomizationData = JSON.parse(savedData);
        const hasDataChanged =
          parsedData.name !== currentData.name ||
          parsedData.occupation !== currentData.occupation ||
          parsedData.traits !== currentData.traits ||
          parsedData.additionalInfo !== currentData.additionalInfo;
        setHasChanges(hasDataChanged);
      } catch (error) {
        setHasChanges(true); // If there's an error parsing, assume there are changes
      }
    } else {
      // If no saved data exists, check if any field has content
      const hasContent = !!(name || occupation || traits || additionalInfo);
      setHasChanges(hasContent);
    }
  }, [name, occupation, traits, additionalInfo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSave: PromptCustomizationData = {
      name,
      occupation,
      traits,
      additionalInfo,
    };

    try {
      // Save to localStorage first (for immediate feedback)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

      // Save to Convex
      await saveCustomization({
        name,
        occupation,
        traits,
        additionalInfo,
      });

      setHasChanges(false);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      console.error("Failed to save prompt customization preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Customize T8 Chat</h2>
      <form className="grid gap-6 py-2" onSubmit={handleSave}>
        {/* Name Input */}
        <div className="relative grid gap-2">
          <Label className="text-base font-medium">
            What should T8 Chat call you?
          </Label>
          <Input
            className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            placeholder="Enter your name"
            maxLength={50}
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {name.length}/50
          </span>
        </div>

        {/* Occupation Input */}
        <div className="relative grid gap-2">
          <Label className="text-base font-medium">What do you do?</Label>
          <Input
            className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            placeholder="Engineer, student, etc."
            maxLength={100}
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            name="occupation"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {occupation.length}/100
          </span>
        </div>

        {/* Traits Input */}
        <div className="relative grid gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">
              What traits should T8 Chat have?
            </Label>
          </div>
          <Textarea
            className="min-h-[100px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            name="traits"
            placeholder="Friendly, witty, concise, curious, empathetic, creative, patient..."
            maxLength={500}
            value={traits}
            onChange={(e) => setTraits(e.target.value)}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {traits.length}/500
          </span>
        </div>

        {/* Additional Info */}
        <div className="relative grid gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium">
              Anything else T8 Chat should know about you?
            </Label>
          </div>
          <Textarea
            className="min-h-[100px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            name="additionalInfo"
            placeholder="Interests, values, or preferences to keep in mind"
            maxLength={3000}
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {additionalInfo.length}/3000
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row items-center gap-2 justify-end">
          <Button type="submit" disabled={!hasChanges}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
