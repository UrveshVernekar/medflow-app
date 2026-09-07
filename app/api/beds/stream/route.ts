import { getAllWardsWithBeds } from "@/features/beds/bed.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = async () => {
        try {
          const wards = await getAllWardsWithBeds();
          const data = `data: ${JSON.stringify(wards)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch (err) {
          console.error("Error streaming bed updates:", err);
        }
      };

      // Send initial data immediately
      await sendUpdate();

      // Interval stream every 4 seconds
      const intervalId = setInterval(async () => {
        try {
          await sendUpdate();
        } catch {
          clearInterval(intervalId);
          controller.close();
        }
      }, 4000);

      // Clean up on cancel
      return () => clearInterval(intervalId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
