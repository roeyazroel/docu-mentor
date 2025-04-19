"use client";

import AiSuggestionDiff from "@/components/ai-suggestion-diff";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Link from "next/link";

/**
 * Demo examples to showcase different diff scenarios
 */
const EXAMPLES = {
  wordReplacement: {
    original: "The automobile industry has undergone a remarkable transformation since the invention of the first car.",
    suggested: "The automobile industry has undergone a great transformation since the invention of the first car."
  },
  multipleChanges: {
    original: "The journey of the automobile began in the late 19th century with the transition from horse-drawn carriages to motorized vehicles.",
    suggested: "The evolution of the automobile began in the late 19th century with the shift from horse-drawn carriages to engine-powered vehicles."
  },
  paragraphChanges: {
    original: "This is a sample document.\nIt contains multiple paragraphs.\n\nThe goal is to demonstrate our new GitHub-like inline diff experience for document editing.\n\nUsers can accept or reject changes individually.\n\nThis will make the editing process more intuitive.",
    suggested: "This is a sample document with an improved introduction.\nIt contains multiple paragraphs with examples.\n\nThe primary goal is to demonstrate our new GitHub-like inline diff experience for document editing and reviewing.\n\nUsers can accept or reject changes individually or all at once.\n\nThis will make the editing process more intuitive and efficient."
  },
  partialDocument: {
    original: "# The Evolution of Cars: A Journey Through Time\n\nCars have been an integral part of modern society, revolutionizing the way we travel and connect with the world. From their humble beginnings in the late 19th century to the advanced, technology-driven vehicles of today, cars have undergone significant transformations. This article explores the evolution of cars, highlighting key milestones and innovations that have shaped the automotive industry.\n\n## Introduction\n\nThe automobile has become more than just a mode of transportation; it is a symbol of freedom, innovation, and progress. Over the years, cars have evolved from simple machines to complex systems that integrate cutting-edge technology and design. This journey through time not only reflects advancements in engineering and manufacturing but also mirrors societal changes and environmental considerations. Understanding the history of cars provides insight into how they have influenced and been influenced by the world around them.",
    suggested: "CARS HAVE BEEN AN INTEGRAL PART OF MODERN SOCIETY, REVOLUTIONIZING THE WAY WE TRAVEL AND CONNECT WITH THE WORLD. FROM THEIR HUMBLE BEGINNINGS IN THE LATE 19TH CENTURY TO THE ADVANCED, TECHNOLOGY-DRIVEN VEHICLES OF TODAY, CARS HAVE UNDERGONE SIGNIFICANT TRANSFORMATIONS. THIS ARTICLE EXPLORES THE EVOLUTION OF CARS, HIGHLIGHTING KEY MILESTONES AND INNOVATIONS THAT HAVE SHAPED THE AUTOMOTIVE INDUSTRY."
  },
  firstSentenceChange: {
    original: "# Document Title\n\nThis is the first sentence of the first paragraph. This is the second sentence. This is the third sentence.\n\nThis is the second paragraph. It has multiple sentences too. The content continues here.",
    suggested: "This is the MODIFIED first sentence of the first paragraph."
  }
};

/**
 * Demo page to showcase the inline diff functionality
 */
export default function DiffDemoPage() {
  const [activeTab, setActiveTab] = useState<string>("partialDocument");
  const [finalText, setFinalText] = useState<string>("");
  const [showFinal, setShowFinal] = useState<boolean>(false);

  // Handler for finalizing changes
  const handleFinalizeChanges = (text: string) => {
    setFinalText(text);
    setShowFinal(true);
  };

  // Reset the demo
  const resetDemo = () => {
    setShowFinal(false);
    setFinalText("");
  };

  const currentExample = EXAMPLES[activeTab as keyof typeof EXAMPLES];

  const getExampleDescription = () => {
    switch (activeTab) {
      case "wordReplacement":
        return "This example demonstrates a simple word replacement where 'remarkable' is changed to 'great'.";
      case "multipleChanges":
        return "This example shows multiple word changes in a single sentence.";
      case "paragraphChanges":
        return "This example shows changes across multiple paragraphs to demonstrate how the diff works with larger texts.";
      case "partialDocument":
        return "This example simulates what happens when the AI only returns a modified first paragraph in ALL CAPS, without the rest of the document. Our smart diff system should detect this is a partial change and only replace the first paragraph.";
      case "firstSentenceChange":
        return "This example tests changing just the first sentence of a paragraph, showing how our system can handle very targeted changes.";
      default:
        return "";
    }
  };

  const getExampleTitle = () => {
    switch (activeTab) {
      case "wordReplacement":
        return "Replacing 'remarkable' with 'great'";
      case "multipleChanges":
        return "Multiple word replacements";
      case "paragraphChanges":
        return "Multiple paragraph changes";
      case "partialDocument":
        return "Partial document change - First paragraph to ALL CAPS";
      case "firstSentenceChange":
        return "Changing only the first sentence";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">GitHub-like Inline Diff Demo</h1>
        <Link href="/diff-demo/design-options">
          <Button variant="outline">View Design Options</Button>
        </Link>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-5">
          <TabsTrigger value="wordReplacement">Word Replacement</TabsTrigger>
          <TabsTrigger value="multipleChanges">Multiple Changes</TabsTrigger>
          <TabsTrigger value="paragraphChanges">Paragraph Changes</TabsTrigger>
          <TabsTrigger value="partialDocument">Partial Document</TabsTrigger>
          <TabsTrigger value="firstSentenceChange">First Sentence</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {!showFinal ? (
        <>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Example: {getExampleTitle()}</h2>
            <p className="mb-4 text-muted-foreground">
              {getExampleDescription()}
            </p>
          </Card>
          
          <AiSuggestionDiff
            originalText={currentExample.original}
            suggestedText={currentExample.suggested}
            onAcceptAll={() => {}}
            onRejectAll={() => {}}
            onFinalizeChanges={handleFinalizeChanges}
          />
        </>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Final Document</h2>
            <div className="whitespace-pre-wrap p-4 border rounded-md bg-background">
              {finalText}
            </div>
          </Card>
          
          <div className="flex justify-center">
            <Button onClick={resetDemo}>Reset Demo</Button>
          </div>
        </div>
      )}
    </div>
  );
} 