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
  const [editableNote, setEditableNote] = useState<string>("");
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
        setEditableNote(result.generated_note);
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
    if (!editableNote) return;

    try {
      // Send a PATCH request to update the session note with the final note
      const response = await fetch(`http://localhost:8000/session-notes/${1}`, {
        // Adjust `1` with the actual note ID if needed
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          final_note: editableNote,
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
          {generatedNote
            ? "Here's your tidied up notes! Make any edits you'd like."
            : "Write your notes here"}{" "}
        </label>
        <textarea
          className="w-full p-4 mt-2 border rounded-md"
          rows={6}
          value={generatedNote ? editableNote : draftNote} // Update value to allow editing finalNote if it's available
          onChange={(e) => {
            if (generatedNote) {
              setEditableNote(e.target.value); // Allow editing finalNote after generation
            } else {
              setDraftNote(e.target.value); // Regular editing of draftNote
            }
          }}
          placeholder="Enter quick observations here..."
        />
      </div>

      {/* Session Duration Dropdown */}
      {!generatedNote && (
        <div>
          <label className="block text-sm font-semibold">
            Session Duration
          </label>
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
      )}

      {/* Session Type Dropdown */}
      {!generatedNote && (
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
      )}

      {/* Generate or Save Final Note Button */}
      <button
        className={`w-full p-3 mt-4 ${
          generatedNote ? "bg-green-600" : "bg-blue-600"
        } text-white rounded-md`}
        onClick={generatedNote ? handleSaveFinalNote : handleSubmit}
        disabled={loading}
      >
        {loading
          ? generatedNote
            ? "Saving..."
            : "Generating..."
          : generatedNote
          ? "Save Final Note"
          : "Generate Note"}
      </button>

      {/* Display Generated Note and History */}
      {generatedNote && (
        <div>
          <h3 className="text-lg font-semibold mt-6">History</h3>
          <p className="mt-2 text-gray-500">{draftNote}</p>{" "}
          {/* Original Note */}
          <p className="mt-2">{generatedNote}</p>
          <p className="mt-2">{editableNote}</p>
        </div>
      )}
    </div>
  );
}
