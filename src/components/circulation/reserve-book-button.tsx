"use client";

import { useState } from "react";
import { reserveBook } from "@/actions/circulation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  bookId: string;
}

export function ReserveBookButton({ userId, bookId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReserve() {
    setLoading(true);
    try {
      const result = await reserveBook(userId, bookId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch { 
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleReserve} 
      disabled={loading} 
      className="w-full"
    >
      {loading ? "Reserving..." : "Place Reservation"}
    </Button>
  );
}
