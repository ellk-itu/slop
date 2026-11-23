import Anthropic from "@anthropic-ai/sdk";

export interface LectureResponse {
  title: string;
  content: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface EvaluationResponse {
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

export type ProgressCallback = (data: {
  type: "thinking" | "text" | "complete";
  content: string;
}) => void;

export async function generateLecture(
  apiKey: string,
  topic: string,
  onProgress?: ProgressCallback,
): Promise<LectureResponse> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  let responseText = "";

  const stream = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 3500,
    thinking: {
      type: "adaptive",
    },
    output_config: {
      effort: "medium",
    },
    stream: true,
    messages: [
      {
        role: "user",
        content: `Create a concise educational lecture on "${topic}".

Include:
- A clear title
- Main concepts with brief explanations
- Key information sources and why it matters
- Explanation of why these topics are important and worth learning - what understanding they enable and how they connect to broader knowledge

Format as JSON:
{"title": "...", "content": "..."}

Be concise and informative.`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_start" &&
      event.content_block.type === "thinking"
    ) {
      onProgress?.({ type: "thinking", content: "" });
    } else if (event.type === "content_block_delta") {
      if (event.delta.type === "thinking_delta") {
        onProgress?.({ type: "thinking", content: event.delta.thinking });
      } else if (event.delta.type === "text_delta") {
        responseText += event.delta.text;
        onProgress?.({ type: "text", content: event.delta.text });
      }
    } else if (event.type === "message_stop") {
      onProgress?.({ type: "complete", content: "" });
    }
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Response text:", responseText);
    throw new Error(
      `Could not parse lecture response. Response: ${responseText.substring(0, 500)}`,
    );
  }

  return JSON.parse(jsonMatch[0]);
}

export async function generateQuiz(
  apiKey: string,
  topic: string,
  lectureContent: string,
  onProgress?: ProgressCallback,
): Promise<QuizResponse> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  let responseText = "";

  const stream = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 2500,
    thinking: {
      type: "adaptive",
    },
    output_config: {
      effort: "medium",
    },
    stream: true,
    messages: [
      {
        role: "user",
        content: `Create a 5-question quiz on "${topic}" based on this lecture:

${lectureContent}

Format as JSON:
{"questions": [{"question": "?", "options": ["A", "B", "C", "D"], "correctAnswer": 0}]}

Each correctAnswer is 0-3. Test key concepts.`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_start" &&
      event.content_block.type === "thinking"
    ) {
      onProgress?.({ type: "thinking", content: "" });
    } else if (event.type === "content_block_delta") {
      if (event.delta.type === "thinking_delta") {
        onProgress?.({ type: "thinking", content: event.delta.thinking });
      } else if (event.delta.type === "text_delta") {
        responseText += event.delta.text;
        onProgress?.({ type: "text", content: event.delta.text });
      }
    } else if (event.type === "message_stop") {
      onProgress?.({ type: "complete", content: "" });
    }
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Response text:", responseText);
    throw new Error(
      `Could not parse quiz response. Response: ${responseText.substring(0, 500)}`,
    );
  }

  return JSON.parse(jsonMatch[0]);
}

export async function evaluateAnswers(
  apiKey: string,
  topic: string,
  lectureContent: string,
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    correctAnswer: number;
  }[],
  onProgress?: ProgressCallback,
): Promise<EvaluationResponse> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const correctCount = answers.filter(
    (a) => a.selectedAnswer === a.correctAnswer,
  ).length;
  const score = Math.round((correctCount / answers.length) * 100);

  let responseText = "";

  const stream = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 1500,
    thinking: {
      type: "adaptive",
    },
    output_config: {
      effort: "medium",
    },
    stream: true,
    messages: [
      {
        role: "user",
        content: `Student scored ${score}% on a quiz on "${topic}".

Lecture: ${lectureContent}

Provide brief feedback as JSON:
{"feedback": "...", "strengths": ["..."], "areasForImprovement": ["..."]}

Be concise and encouraging.`,
      },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_start" &&
      event.content_block.type === "thinking"
    ) {
      onProgress?.({ type: "thinking", content: "" });
    } else if (event.type === "content_block_delta") {
      if (event.delta.type === "thinking_delta") {
        onProgress?.({ type: "thinking", content: event.delta.thinking });
      } else if (event.delta.type === "text_delta") {
        responseText += event.delta.text;
        onProgress?.({ type: "text", content: event.delta.text });
      }
    } else if (event.type === "message_stop") {
      onProgress?.({ type: "complete", content: "" });
    }
  }

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.error("Response text:", responseText);
    console.warn("Could not parse evaluation response, returning default feedback");
    return {
      score,
      feedback: `Great job! You scored ${score}% on the quiz.`,
      strengths: ["Completed the quiz", "Engaged with the material"],
      areasForImprovement: [
        "Review key concepts",
        "Practice with more examples",
      ],
    };
  }

  const evaluation = JSON.parse(jsonMatch[0]);
  return {
    score,
    ...evaluation,
  };
}
