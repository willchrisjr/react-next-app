import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function AboutCard() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>React/Next.js Chat App</CardTitle>
          <CardDescription>Built with React, Next.js, Tailwind, and Groq API</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground/90 leading-normal prose"> 
          <p className="mb-3">Start a conversation by entering a message below:</p>
          
          
          
        </CardContent>
      </Card>
    </div>
  )
}
