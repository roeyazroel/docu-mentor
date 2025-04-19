"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { FC, ReactElement } from "react";

/**
 * Visual mockups for different ways to display accept/reject controls in the diff view
 */
const DiffDesignOptions: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("highlightFloating");
  
  // Example diff content - a sentence with one word replaced
  const originalWord = "remarkable";
  const suggestedWord = "great";
  const beforeText = "The automobile industry has undergone a ";
  const afterText = " transformation since the invention of the first car.";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Diff Controls Design Options</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="highlightFloating">Highlight + Floating</TabsTrigger>
          <TabsTrigger value="wordBoundary">Word Boundary</TabsTrigger>
          <TabsTrigger value="sideAnnotations">Side Annotations</TabsTrigger>
          <TabsTrigger value="tooltip">Tooltip Controls</TabsTrigger>
          <TabsTrigger value="changeBubbles">Change Bubbles</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card className="p-6 mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Option: {activeTab}</h2>
          <p className="text-gray-500 mb-4">
            {getTabDescription(activeTab)}
          </p>
        </div>
        
        <div className="border rounded-md p-4 font-mono mb-8">
          {/* Option 1: Highlight with floating controls */}
          {activeTab === "highlightFloating" && (
            <div className="whitespace-pre-wrap">
              {beforeText}
              <span className="relative group">
                <span className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through">
                  {originalWord}
                </span>
                <span className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                  {suggestedWord}
                </span>
                <span className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border rounded-md py-1 px-2 shadow-md inline-flex gap-1 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                </span>
              </span>
              {afterText}
            </div>
          )}
          
          {/* Option 2: Word-boundary indicators */}
          {activeTab === "wordBoundary" && (
            <div className="whitespace-pre-wrap">
              {beforeText}
              <span className="relative">
                <span className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through">
                  {originalWord}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -top-1 -left-2 h-4 w-4 rounded-full bg-red-100 hover:bg-red-200"
                >
                  <X className="h-2 w-2 text-red-600" />
                </Button>
              </span>
              <span className="relative ml-1">
                <span className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                  {suggestedWord}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute -top-1 -right-2 h-4 w-4 rounded-full bg-green-100 hover:bg-green-200"
                >
                  <Check className="h-2 w-2 text-green-600" />
                </Button>
              </span>
              {afterText}
            </div>
          )}
          
          {/* Option 3: Side annotations */}
          {activeTab === "sideAnnotations" && (
            <div className="flex">
              <div className="whitespace-pre-wrap flex-grow">
                {beforeText}
                <span className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through">
                  {originalWord}
                </span>
                <span className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                  {suggestedWord}
                </span>
                {afterText}
              </div>
              <div className="flex-shrink-0 ml-4 border-l pl-2">
                <div className="flex items-center space-x-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-red-100 hover:bg-red-200"
                  >
                    <X className="h-3 w-3 text-red-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-full bg-green-100 hover:bg-green-200"
                  >
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Option 4: Tooltip approach */}
          {activeTab === "tooltip" && (
            <div className="whitespace-pre-wrap">
              {beforeText}
              <span className="relative group cursor-pointer">
                <span className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through">
                  {originalWord}
                </span>
                <span className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                  {suggestedWord}
                </span>
                <span className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 border rounded-md py-2 px-3 shadow-lg min-w-[150px] z-10">
                  <div className="text-sm mb-2">Accept this change?</div>
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 px-2 mr-2"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      className="h-7 px-2"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Accept
                    </Button>
                  </div>
                </span>
                <HelpCircle className="inline ml-0.5 h-3 w-3 text-gray-400" />
              </span>
              {afterText}
            </div>
          )}
          
          {/* Option 5: Change bubbles */}
          {activeTab === "changeBubbles" && (
            <div className="whitespace-pre-wrap">
              {beforeText}
              <span className="bg-gray-100 dark:bg-gray-800 rounded-md px-1 py-0.5 border border-gray-200 dark:border-gray-700 inline-flex items-center mr-1">
                <span>
                  <span className="bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 line-through">
                    {originalWord}
                  </span>
                  <span className="bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                    {suggestedWord}
                  </span>
                </span>
                <span className="ml-2 flex">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 rounded-full bg-red-100 hover:bg-red-200"
                  >
                    <X className="h-2 w-2 text-red-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 ml-1 rounded-full bg-green-100 hover:bg-green-200"
                  >
                    <Check className="h-2 w-2 text-green-600" />
                  </Button>
                </span>
              </span>
              {afterText}
            </div>
          )}
        </div>
        
        {/* Explanation of benefits and tradeoffs */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
          <h3 className="font-medium mb-2 flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Benefits and Tradeoffs
          </h3>
          <div className="text-sm space-y-1">
            {getBenefitsAndTradeoffs(activeTab)}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DiffDesignOptions;

// Helper function to get tab descriptions
function getTabDescription(tab: string): string {
  switch (tab) {
    case "highlightFloating":
      return "Highlights changes with colored backgrounds and shows accept/reject controls that float above the text on hover. Keeps the text continuous with no interruptions.";
    case "wordBoundary":
      return "Places small accept/reject controls at the beginning and end of words instead of inserting them within the text, preserving readability.";
    case "sideAnnotations":
      return "Shows the diff inline but places accept/reject controls in a margin to the side, aligned with each change. Similar to code review UIs.";
    case "tooltip":
      return "Shows clean highlighted text and displays accept/reject controls in a tooltip that appears when hovering over changed text.";
    case "changeBubbles":
      return "Wraps each change in a distinct 'bubble' UI with controls at the end, creating clear boundaries for changes.";
    default:
      return "";
  }
}

// Helper function for benefits and tradeoffs
function getBenefitsAndTradeoffs(tab: string): ReactElement {
  switch (tab) {
    case "highlightFloating":
      return (
        <>
          <p><span className="font-medium">Benefits:</span> Clean reading experience, minimizes disruption, works well with multiple changes per line.</p>
          <p><span className="font-medium">Tradeoffs:</span> Controls only visible on hover, may be less discoverable, potentially challenging on touch devices.</p>
        </>
      );
    case "wordBoundary":
      return (
        <>
          <p><span className="font-medium">Benefits:</span> Clear visual connection between controls and text, always visible, maintains readability.</p>
          <p><span className="font-medium">Tradeoffs:</span> May get cluttered with many changes, controls might overlap for closely-spaced changes.</p>
        </>
      );
    case "sideAnnotations":
      return (
        <>
          <p><span className="font-medium">Benefits:</span> Completely uninterrupted text flow, familiar pattern from code reviews, scales well to many changes.</p>
          <p><span className="font-medium">Tradeoffs:</span> Requires margin space, may be harder to visually connect changes to controls, especially for longer lines.</p>
        </>
      );
    case "tooltip":
      return (
        <>
          <p><span className="font-medium">Benefits:</span> Very clean reading experience with minimal visual clutter, provides more space for controls and explanations.</p>
          <p><span className="font-medium">Tradeoffs:</span> Requires explicit interaction to see controls, less efficient for reviewing many changes quickly.</p>
        </>
      );
    case "changeBubbles":
      return (
        <>
          <p><span className="font-medium">Benefits:</span> Creates clear visual boundaries for changes, groups related additions/deletions, visually distinctive.</p>
          <p><span className="font-medium">Tradeoffs:</span> Disrupts text flow more than other options, takes up more horizontal space, may break natural reading.</p>
        </>
      );
    default:
      return <></>;
  }
} 