"use client";
import { useState } from "react";

type SessionDuration =
  | "30 mins"
  | "1 hour"
  | "1.5 hours"
  | "2 hours"
  | "2.5 hours"
  | "3 hours"
  | "3+ hours";

const sessionDurations: Record<SessionDuration, number> = {
  "30 mins": 30,
  "1 hour": 60,
  "1.5 hours": 90,
  "2 hours": 120,
  "2.5 hours": 150,
  "3 hours": 180,
  "3+ hours": 200,
};

const sessionTypes = [
  "Therapy",
  "Counseling",
  "Assessment",
  "Group Session",
  "Other",
];

export default function Page() {
  const [draftNote, setDraftNote] = useState<string>("");
  const [sessionDuration, setSessionDuration] =
    useState<SessionDuration>("30 mins");
  const [sessionType, setSessionType] = useState<string>(sessionTypes[0]);
  const [generatedNote, setGeneratedNote] = useState<string | null>(null);
  const [finalNote, setFinalNote] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    setLoading(true);
    const numericDuration = sessionDurations[sessionDuration];

    try {
      const response = await fetch("http://localhost:8000/session-notes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_duration: numericDuration,
          session_type: sessionType,
          notes: draftNote,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGeneratedNote(result.generated_note);
      } else {
        console.error(result.detail);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle final note submission (update the final note in the backend)
  const handleSaveFinalNote = async () => {
    if (!finalNote) return;

    try {
      // Send a PATCH request to update the session note with the final note
      const response = await fetch(`http://localhost:8000/session-notes/${1}`, {
        // Adjust `1` with the actual note ID if needed
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          final_note: finalNote,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Final note updated:", result);
      } else {
        console.error(result.detail);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Create a Clinical Note</h1>

      {/* Input for draft notes */}
      <div>
        <label className="block text-sm font-semibold">
          Observations (Bullet Points)
        </label>
        <textarea
          className="w-full p-4 mt-2 border rounded-md"
          rows={6}
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="Enter quick observations here..."
        />
      </div>

      {/* Session Duration Dropdown */}
      <div>
        <label className="block text-sm font-semibold">Session Duration</label>
        <select
          id="sessionDuration"
          className="w-full p-3 mt-2 border rounded-md"
          value={sessionDuration}
          onChange={(e) =>
            setSessionDuration(e.target.value as SessionDuration)
          }
        >
          <option value="">Select session duration</option>
          {Object.keys(sessionDurations).map((duration) => (
            <option key={duration} value={duration}>
              {duration}
            </option>
          ))}
        </select>
      </div>

      {/* Session Type Dropdown */}
      <div className="mb-4">
        <label htmlFor="sessionType" className="block text-sm font-medium">
          Session Type
        </label>
        <select
          id="sessionType"
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="mt-1 p-2 w-full border rounded"
        >
          <option value="">Select session type</option>
          {sessionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Note Button */}
      <button
        className="w-full p-3 mt-4 bg-blue-600 text-white rounded-md"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Note"}
      </button>

      {/* Display Generated Note */}
      {generatedNote && (
        <div>
          <h3 className="text-lg font-semibold mt-6">Generated Note</h3>
          <p className="mt-2">{generatedNote}</p>
        </div>
      )}

      {/* Final Note Editing */}
      {generatedNote && (
        <div>
          <h3 className="text-lg font-semibold mt-6">Edit Final Note</h3>
          <textarea
            className="w-full p-4 mt-2 border rounded-md"
            rows={6}
            value={finalNote || generatedNote}
            onChange={(e) => setFinalNote(e.target.value)}
            placeholder="Edit your final note here..."
          />
          <button
            className="w-full p-3 mt-4 bg-green-600 text-white rounded-md"
            onClick={handleSaveFinalNote}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Final Note"}
          </button>
        </div>
      )}
    </div>
  );
}
