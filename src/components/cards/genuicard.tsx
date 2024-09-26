import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function GenUICard() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Next AI Chat</CardTitle>
          <CardDescription>Start Chatting</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground/90 leading-normal prose"> 
          <p className="mb-3">A simple prompt based way to enter into conversation./</p>
          
         
        </CardContent>
      </Card>
    </div>
  )
}
