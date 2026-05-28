"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface FeedbackEntry {
  id: string;
  rating: number;
  easiness: number;
  flavor: number;
  timeSpent: string;
  comment: string;
  timestamp: Date;
}

interface RecipeFeedbackFormProps {
  recipeId: string;
  submitAction?: (formData: FormData) => Promise<void>;
}

export default function RecipeFeedbackForm({
  recipeId,
  submitAction,
}: RecipeFeedbackFormProps) {
  const [rating, setRating] = useState<string>("");
  const [easiness, setEasiness] = useState<string>("");
  const [flavor, setFlavor] = useState<string>("");
  const [timeSpent, setTimeSpent] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rating || !easiness || !flavor || !timeSpent) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const newEntry: FeedbackEntry = {
        id: Date.now().toString(),
        rating: parseInt(rating),
        easiness: parseInt(easiness),
        flavor: parseInt(flavor),
        timeSpent,
        comment,
        timestamp: new Date(),
      };

      setFeedbackEntries([newEntry, ...feedbackEntries]);

      // Optionally send to backend if action is provided
      if (submitAction) {
        const formData = new FormData();
        formData.append("recipeId", recipeId);
        formData.append("rating", rating);
        formData.append("easiness", easiness);
        formData.append("flavor", flavor);
        formData.append("comment", comment);
        await submitAction(formData);
      }

      toast.success("Feedback saved!");
      setRating("");
      setEasiness("");
      setFlavor("");
      setTimeSpent("");
      setComment("");
    } catch (error) {
      toast.error("Failed to save feedback");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFeedbackEntry = (id: string) => {
    setFeedbackEntries(feedbackEntries.filter((entry) => entry.id !== id));
    toast.success("Feedback entry removed");
  };

  return (
    <Card className="p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Recipe Feedback & Notes</h2>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <Select value={rating} onValueChange={setRating}>
            <SelectTrigger id="rating">
              <SelectValue placeholder="Select a rating (1-5)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Poor</SelectItem>
              <SelectItem value="2">2 - Fair</SelectItem>
              <SelectItem value="3">3 - Good</SelectItem>
              <SelectItem value="4">4 - Very Good</SelectItem>
              <SelectItem value="5">5 - Excellent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="easiness" className="block text-sm font-medium mb-2">
            Easiness <span className="text-red-500">*</span>
          </label>
          <Select value={easiness} onValueChange={setEasiness}>
            <SelectTrigger id="easiness">
              <SelectValue placeholder="Select easiness level (1-5)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Very Difficult</SelectItem>
              <SelectItem value="2">2 - Difficult</SelectItem>
              <SelectItem value="3">3 - Moderate</SelectItem>
              <SelectItem value="4">4 - Easy</SelectItem>
              <SelectItem value="5">5 - Very Easy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="flavor" className="block text-sm font-medium mb-2">
            Flavor <span className="text-red-500">*</span>
          </label>
          <Select value={flavor} onValueChange={setFlavor}>
            <SelectTrigger id="flavor">
              <SelectValue placeholder="Select flavor rating (1-5)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 - Bland</SelectItem>
              <SelectItem value="2">2 - Below Average</SelectItem>
              <SelectItem value="3">3 - Average</SelectItem>
              <SelectItem value="4">4 - Tasty</SelectItem>
              <SelectItem value="5">5 - Delicious</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="timeSpent" className="block text-sm font-medium mb-2">
            Time Spent <span className="text-red-500">*</span>
          </label>
          <Input
            id="timeSpent"
            type="text"
            placeholder="e.g., 30 mins, 1.5 hours"
            value={timeSpent}
            onChange={(e) => setTimeSpent(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">
            Comment (Optional)
          </label>
          <Textarea
            id="comment"
            placeholder="Add any additional comments about this recipe..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="resize-none"
            rows={3}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Feedback"}
        </Button>
      </form>

      {feedbackEntries.length > 0 && (
        <div className="space-y-3 border-t pt-6">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Your Feedback Notes ({feedbackEntries.length})
          </h3>
          <div className="space-y-3">
            {feedbackEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-muted/50 rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-3 text-sm flex-wrap">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      Rating: {entry.rating}/5
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Easiness: {entry.easiness}/5
                    </span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-medium">
                      Flavor: {entry.flavor}/5
                    </span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      ⏱ {entry.timeSpent}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFeedbackEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove feedback entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {entry.comment && (
                  <p className="text-sm text-muted-foreground italic">
                    &quot;{entry.comment}&quot;
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {entry.timestamp.toLocaleDateString()} at{" "}
                  {entry.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
