"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Quote,
  Code,
  Image,
  Link,
  Table,
  Undo,
  Redo,
  Type,
  Palette,
  Minus,
  Indent,
  Outdent,
  CheckSquare,
  RotateCcw,
  ChevronDown,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type EditorToolbarProps = {
  onFormatText?: (format: string, value?: any) => void
}

export default function EditorToolbar({ onFormatText }: EditorToolbarProps) {
  const [fontSize, setFontSize] = useState("16px")
  const [fontFamily, setFontFamily] = useState("default")
  const [headingLevel, setHeadingLevel] = useState("p")
  const [linkUrl, setLinkUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")

  // Handle formatting actions
  const handleFormat = (format: string, value?: any) => {
    if (onFormatText) {
      onFormatText(format, value)
    } else {
      console.log(`Format: ${format}`, value ? `Value: ${value}` : "")
    }
  }

  // Font families
  const fontFamilies = [
    { value: "default", label: "Default" },
    { value: "serif", label: "Serif" },
    { value: "sans", label: "Sans-serif" },
    { value: "mono", label: "Monospace" },
  ]

  // Font sizes
  const fontSizes = [
    { value: "12px", label: "12px" },
    { value: "14px", label: "14px" },
    { value: "16px", label: "16px" },
    { value: "18px", label: "18px" },
    { value: "20px", label: "20px" },
    { value: "24px", label: "24px" },
    { value: "30px", label: "30px" },
    { value: "36px", label: "36px" },
  ]

  // Text colors
  const textColors = [
    { value: "default", label: "Default", class: "bg-foreground" },
    { value: "primary", label: "Primary", class: "bg-primary" },
    { value: "secondary", label: "Secondary", class: "bg-secondary" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
  ]

  // Background colors
  const bgColors = [
    { value: "default", label: "Default", class: "bg-background" },
    { value: "primary", label: "Primary", class: "bg-primary/10" },
    { value: "secondary", label: "Secondary", class: "bg-secondary/10" },
    { value: "red", label: "Red", class: "bg-red-100" },
    { value: "green", label: "Green", class: "bg-green-100" },
    { value: "blue", label: "Blue", class: "bg-blue-100" },
    { value: "yellow", label: "Yellow", class: "bg-yellow-100" },
    { value: "purple", label: "Purple", class: "bg-purple-100" },
  ]

  return (
    <div className="border-b p-1 flex flex-wrap items-center gap-1 overflow-x-auto">
      {/* Undo/Redo */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat("undo")} title="Undo">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat("redo")} title="Redo">
        <Redo className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Style Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            {headingLevel === "h1" && <Heading1 className="h-4 w-4" />}
            {headingLevel === "h2" && <Heading2 className="h-4 w-4" />}
            {headingLevel === "h3" && <Heading3 className="h-4 w-4" />}
            {headingLevel === "p" && <Pilcrow className="h-4 w-4" />}
            {headingLevel === "blockquote" && <Quote className="h-4 w-4" />}
            {headingLevel === "code" && <Code className="h-4 w-4" />}
            <span className="hidden sm:inline">
              {headingLevel === "h1"
                ? "Heading 1"
                : headingLevel === "h2"
                  ? "Heading 2"
                  : headingLevel === "h3"
                    ? "Heading 3"
                    : headingLevel === "p"
                      ? "Paragraph"
                      : headingLevel === "blockquote"
                        ? "Quote"
                        : headingLevel === "code"
                          ? "Code Block"
                          : "Style"}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup
            value={headingLevel}
            onValueChange={(value) => {
              setHeadingLevel(value)
              handleFormat("heading", value)
            }}
          >
            <DropdownMenuRadioItem value="h1" className="flex items-center gap-2">
              <Heading1 className="h-4 w-4" /> Heading 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="h2" className="flex items-center gap-2">
              <Heading2 className="h-4 w-4" /> Heading 2
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="h3" className="flex items-center gap-2">
              <Heading3 className="h-4 w-4" /> Heading 3
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="p" className="flex items-center gap-2">
              <Pilcrow className="h-4 w-4" /> Paragraph
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="blockquote" className="flex items-center gap-2">
              <Quote className="h-4 w-4" /> Quote
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="code" className="flex items-center gap-2">
              <Code className="h-4 w-4" /> Code Block
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font Family Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 hidden md:flex">
            <Type className="h-4 w-4" />
            <span className="hidden lg:inline">Font</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={fontFamily}
            onValueChange={(value) => {
              setFontFamily(value)
              handleFormat("fontFamily", value)
            }}
          >
            {fontFamilies.map((font) => (
              <DropdownMenuRadioItem
                key={font.value}
                value={font.value}
                className={cn(
                  font.value === "serif" && "font-serif",
                  font.value === "sans" && "font-sans",
                  font.value === "mono" && "font-mono",
                )}
              >
                {font.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font Size Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1 hidden md:flex">
            <span className="text-xs">{fontSize}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuRadioGroup
            value={fontSize}
            onValueChange={(value) => {
              setFontSize(value)
              handleFormat("fontSize", value)
            }}
          >
            {fontSizes.map((size) => (
              <DropdownMenuRadioItem key={size.value} value={size.value}>
                {size.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Basic Formatting */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat("bold")} title="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat("italic")} title="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("underline")}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("strikethrough")}
        title="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Text Color */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Text Color">
            <Palette className="h-4 w-4" />
            <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-primary" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2">
          <Tabs defaultValue="text">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="text" className="flex-1">
                Text
              </TabsTrigger>
              <TabsTrigger value="background" className="flex-1">
                Background
              </TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="mt-0">
              <div className="grid grid-cols-4 gap-1">
                {textColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    size="sm"
                    className="h-8 p-0 relative"
                    title={color.label}
                    onClick={() => handleFormat("textColor", color.value)}
                  >
                    <div className={`absolute inset-1 rounded-sm ${color.class}`}></div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="background" className="mt-0">
              <div className="grid grid-cols-4 gap-1">
                {bgColors.map((color) => (
                  <Button
                    key={color.value}
                    variant="outline"
                    size="sm"
                    className="h-8 p-0 relative"
                    title={color.label}
                    onClick={() => handleFormat("backgroundColor", color.value)}
                  >
                    <div className={`absolute inset-1 rounded-sm ${color.class}`}></div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Lists */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("bulletList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("numberedList")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("checkList")}
        title="Check List"
      >
        <CheckSquare className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Alignment */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("align", "left")}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("align", "center")}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("align", "right")}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("align", "justify")}
        title="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Indentation */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat("indent")} title="Indent">
        <Indent className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat("outdent")} title="Outdent">
        <Outdent className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

      {/* Insert Elements */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Insert Link">
            <Link className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Insert Link</h4>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-text">Text</Label>
              <Input id="link-text" placeholder="Link text" />
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  handleFormat("link", linkUrl)
                  setLinkUrl("")
                }}
              >
                Insert Link
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Insert Image">
            <Image className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-4">
            <h4 className="font-medium">Insert Image</h4>
            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                placeholder="Image description"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  handleFormat("image", { url: imageUrl, alt: imageAlt })
                  setImageUrl("")
                  setImageAlt("")
                }}
              >
                Insert Image
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("table")}
        title="Insert Table"
      >
        <Table className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("horizontalRule")}
        title="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Clear Formatting */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => handleFormat("clearFormatting")}
        title="Clear Formatting"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      {/* More Options */}
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              More
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => handleFormat("print")}>Print</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleFormat("wordCount")}>Word Count</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleFormat("fullscreen")}>Fullscreen</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Export As</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleFormat("export", "pdf")}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFormat("export", "docx")}>Word (.docx)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFormat("export", "markdown")}>Markdown (.md)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFormat("export", "html")}>HTML</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
