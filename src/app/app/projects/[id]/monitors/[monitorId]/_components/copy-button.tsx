"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface CopyButtonProps {
  value: string;
  label: string;
}

export default function CopyButton({ value, label }: CopyButtonProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleCopy}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}