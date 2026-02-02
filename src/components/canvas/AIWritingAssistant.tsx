import { useState, useCallback } from "react";
import { Sparkles, Wand2, Expand, FileText, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type AIAction = "write" | "improve" | "expand" | "summarize" | "fix";

interface AIWritingAssistantProps {
  currentContent: string;
  blockType: string;
  onApplyContent: (content: string) => void;
  className?: string;
}

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/canvas-ai`;

export function AIWritingAssistant({
  currentContent,
  blockType,
  onApplyContent,
  className,
}: AIWritingAssistantProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [currentAction, setCurrentAction] = useState<AIAction | null>(null);

  const streamAIResponse = useCallback(
    async (action: AIAction, customPrompt?: string) => {
      setIsLoading(true);
      setCurrentAction(action);
      setGeneratedContent("");

      try {
        const response = await fetch(EDGE_FUNCTION_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action,
            content: currentContent,
            prompt: customPrompt,
            blockType,
          }),
        });

        if (!response.ok) {
          if (response.status === 429) {
            toast.error("Rate limit exceeded. Please try again later.");
            return;
          }
          if (response.status === 402) {
            toast.error("AI credits exhausted. Please add funds to continue.");
            return;
          }
          throw new Error("AI request failed");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                fullContent += content;
                setGeneratedContent(fullContent);
              }
            } catch {
              // Incomplete JSON, put back and wait
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (error) {
        console.error("AI error:", error);
        toast.error("Failed to generate content. Please try again.");
      } finally {
        setIsLoading(false);
        setCurrentAction(null);
      }
    },
    [currentContent, blockType]
  );

  const handleWriteWithAI = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    streamAIResponse("write", prompt);
  };

  const handleQuickAction = (action: AIAction) => {
    if (!currentContent.trim() && action !== "write") {
      toast.error("Please add some content first");
      return;
    }
    streamAIResponse(action);
  };

  const handleApply = () => {
    if (generatedContent) {
      onApplyContent(generatedContent);
      setGeneratedContent("");
      setPrompt("");
      toast.success("Content applied!");
    }
  };

  const quickActions: { action: AIAction; label: string; icon: typeof Wand2 }[] = [
    { action: "improve", label: "Improve", icon: Wand2 },
    { action: "expand", label: "Expand", icon: Expand },
    { action: "summarize", label: "Summarize", icon: FileText },
    { action: "fix", label: "Fix Grammar", icon: Check },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("border-t", className)}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto rounded-none hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">AI Writing Assistant</span>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="p-4 space-y-4 bg-muted/20">
        {/* Write with AI */}
        <div className="flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to write..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleWriteWithAI();
              }
            }}
          />
          <Button
            onClick={handleWriteWithAI}
            disabled={isLoading || !prompt.trim()}
            className="shrink-0"
          >
            {isLoading && currentAction === "write" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Write
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {quickActions.map((qa) => (
            <Button
              key={qa.action}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(qa.action)}
              disabled={isLoading || (!currentContent.trim() && qa.action !== "write")}
              className="text-xs"
            >
              {isLoading && currentAction === qa.action ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <qa.icon className="h-3 w-3 mr-1" />
              )}
              {qa.label}
            </Button>
          ))}
        </div>

        {/* Generated Content Preview */}
        {generatedContent && (
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">Generated Content:</div>
            <div className="bg-background border rounded-lg p-3 max-h-40 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-sans">{generatedContent}</pre>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setGeneratedContent("")}>
                Discard
              </Button>
              <Button size="sm" onClick={handleApply}>
                <Check className="h-3 w-3 mr-1" />
                Apply
              </Button>
            </div>
          </div>
        )}

        {isLoading && !generatedContent && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating content...</span>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
