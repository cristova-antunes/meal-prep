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
import { toast } from "sonner";

interface RecipeFeedbackFormProps {
  recipeId: string;
  submitAction: (formData: FormData) => Promise<void>;
}

export default function RecipeFeedbackForm({
  recipeId,
  submitAction,
}: RecipeFeedbackFormProps) {
  const [rating, setRating] = useState<string>("");
  const [easiness, setEasiness] = useState<string>("");
  const [flavor, setFlavor] = useState<string>("");
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rating || !easiness || !flavor) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("recipeId", recipeId);
      formData.append("rating", rating);
      formData.append("easiness", easiness);
      formData.append("flavor", flavor);
      formData.append("comment", comment);

      await submitAction(formData);

      toast.success("Feedback submitted successfully!");
      setRating("");
      setEasiness("");
      setFlavor("");
      setComment("");
    } catch (error) {
      toast.error("Failed to submit feedback");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Recipe Feedback</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Card>
  );
}
