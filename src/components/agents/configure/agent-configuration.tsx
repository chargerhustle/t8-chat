"use client";

import { useState } from "react";
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TagsInput,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@/components/ui/tags-input";
import { AgentKnowledge } from "./agent-knowledge";
import { agentCategories } from "../agent-categories";
import { RefreshCcw, Camera } from "lucide-react";
import { toast } from "sonner";
import { Agent } from "../types";

interface AgentConfigurationProps {
  mode: "create" | "edit";
  agentId?: string;
  agent?: Agent | null;
}

function AgentConfigurationComponent({
  mode,
  agentId,
  agent,
}: AgentConfigurationProps) {
  const [name, setName] = useState(agent?.name || "");
  const [description, setDescription] = useState(agent?.description || "");
  const [instructions, setInstructions] = useState(agent?.systemPrompt || "");
  const [category, setCategory] = useState(agent?.category || "");
  const [tags, setTags] = useState<string[]>(agent?.tags || []);
  const [isPublic, setIsPublic] = useState(agent?.isPublic || false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    agent?.avatarUrl || null
  );

  const isEditing = mode === "edit";

  const validateTag = (value: string) => {
    // Reasonable character length (3-20 characters)
    return value.length >= 3 && value.length <= 20;
  };

  const handleTagInvalid = (value: string) => {
    if (tags.length >= 5) {
      toast.error("Maximum 5 tags allowed.");
    } else if (tags.includes(value)) {
      toast.error(`"${value}" already exists.`);
    } else if (value.length < 3) {
      toast.error("Tags must be at least 3 characters long.");
    } else if (value.length > 20) {
      toast.error("Tags cannot exceed 20 characters.");
    } else {
      toast.error(`"${value}" is not a valid tag.`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error("Avatar image must be smaller than 5MB");
        event.target.value = "";
        return;
      }

      // Create a URL for preview
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
    // Reset the input
    event.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <div className="space-y-6">
        {/* Agent Avatar */}
        <div className="flex justify-center">
          <div
            className="relative w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer overflow-hidden bg-muted/20 group"
            onClick={() => document.getElementById("avatar-upload")?.click()}
          >
            {avatarUrl ? (
              <>
                <img
                  src={avatarUrl}
                  alt="Agent avatar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Camera className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>

        {/* Agent Metadata - Only show in edit mode */}
        {isEditing && agent && (
          <div className="grid gap-2">
            <Label className="text-base font-medium">Agent Information</Label>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>
                  {formatDate(new Date(agent.createdAt).toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Updated</span>
                <span>
                  {formatDate(new Date(agent.updatedAt).toISOString())}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span>{agent.usageCount} conversations</span>
              </div>
            </div>
          </div>
        )}

        {/* Agent Name */}
        <div className="relative grid gap-2">
          <Label className="text-base font-medium">Agent Name</Label>
          <Input
            className="focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            placeholder={isEditing ? "Edit agent name" : "Create agent name"}
            maxLength={25}
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {name?.length}/25
          </span>
        </div>

        {/* Agent Description */}
        <div className="relative grid gap-2">
          <Label className="text-base font-medium">Description</Label>
          <Textarea
            className="min-h-[80px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            placeholder={
              isEditing
                ? "Edit description"
                : "Create brief description of what this agent does"
            }
            maxLength={300}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            name="description"
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {description.length}/300
          </span>
        </div>

        {/* Agent Instructions */}
        <div className="relative grid gap-2">
          <Label className="text-base font-medium">Instructions</Label>
          <Textarea
            className="min-h-[100px] custom-scrollbar focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-ring"
            name="instructions"
            placeholder={
              isEditing
                ? "Edit agent instructions"
                : "Create detailed instructions for how this agent should behave..."
            }
            maxLength={2000}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <span className="pointer-events-none absolute bottom-2 right-2 text-xs font-normal text-muted-foreground">
            {instructions.length}/2000
          </span>
        </div>

        {/* Knowledge Base */}
        <AgentKnowledge mode={mode} agentId={agentId} />

        {/* Category Selection */}
        <div className="grid gap-2">
          <Label className="text-base font-medium">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus:border-ring">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {agentCategories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <SelectItem
                    key={cat.id}
                    value={cat.id}
                    className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="relative flex h-6 w-6 items-center justify-center overflow-hidden rounded-md"
                        style={
                          { color: cat.colors.dark } as React.CSSProperties
                        }
                      >
                        <div
                          className="absolute inset-0 opacity-20 dark:opacity-15"
                          style={
                            {
                              backgroundColor: cat.colors.dark,
                            } as React.CSSProperties
                          }
                        />
                        <IconComponent
                          className="h-4 w-4 relative z-10"
                          style={
                            {
                              color: cat.colors.dark,
                              stroke: cat.colors.dark,
                            } as React.CSSProperties
                          }
                        />
                      </div>
                      <span>{cat.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Tags Input */}
        <div className="grid gap-2">
          <TagsInput
            value={tags}
            onValueChange={setTags}
            onValidate={validateTag}
            onInvalid={handleTagInvalid}
            max={5}
            addOnPaste
            className="w-full"
          >
            <TagsInputLabel className="text-base font-medium">
              Tags
            </TagsInputLabel>
            <TagsInputList>
              {tags.map((tag) => (
                <TagsInputItem key={tag} value={tag}>
                  {tag}
                </TagsInputItem>
              ))}
              <TagsInputInput placeholder="Add tag..." />
            </TagsInputList>
            <div className="flex items-center justify-between">
              <div className="text-muted-foreground text-sm">
                Add up to 5 tags with 3-20 characters each
              </div>
              <TagsInputClear asChild>
                <Button variant="outline" size="sm">
                  <RefreshCcw className="h-4 w-4" />
                  Clear
                </Button>
              </TagsInputClear>
            </div>
          </TagsInput>
        </div>

        {/* Public Toggle */}
        <div className="grid gap-2">
          <Label className="text-base font-medium">Make Public</Label>
          <div className="flex items-center justify-between rounded-lg">
            <div className="text-sm text-muted-foreground">
              Allow others to discover and use this agent
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const AgentConfiguration = React.memo(AgentConfigurationComponent);
