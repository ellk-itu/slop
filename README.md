# AI Learning Assistant

An intelligent learning application built with Svelte, TypeScript, TailwindCSS, and DaisyUI. Users can select any topic and experience a complete learning journey: a personalized lecture, a quiz to test their knowledge, and comprehensive evaluation with feedback.

## Features

- 📚 **AI-Powered Lectures**: Generate detailed lectures on any topic using Claude AI
- 🧠 **Adaptive Quizzes**: Automatically generated quiz questions based on the lecture content
- 📊 **Performance Evaluation**: Detailed analysis of quiz responses with strengths and areas for improvement
- 🎨 **Beautiful UI**: Built with DaisyUI components and TailwindCSS for a modern, responsive design
- ⚡ **Fast Performance**: Built with Bun and Svelte for optimal performance

## Tech Stack

- **Framework**: Svelte 5 with TypeScript
- **Runtime**: Bun
- **Styling**: TailwindCSS + DaisyUI
- **AI Model**: Anthropic Claude 3.5 Sonnet
- **Build Tool**: Vite

## Prerequisites

- Bun 1.0+ installed
- Anthropic API key (get one at [console.anthropic.com](https://console.anthropic.com))

## Setup

### 1. Clone or Navigate to Project

```sh
cd learning-app
```

### 2. Create Environment File

Copy the example environment file and add your API key:

```sh
cp .env.example .env.local
```

Then edit `.env.local` and add your Anthropic API key:

```env
VITE_ANTHROPIC_API_KEY=your_actual_api_key_here
```

### 3. Install Dependencies

Dependencies should already be installed, but if needed:

```sh
bun install
```

## Running the Application

### Development Server

Start the development server:

```sh
bun run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

To automatically open in your browser:

```sh
bun run dev -- --open
```

### Production Build

Build for production:

```sh
bun run build
```

Preview the production build:

```sh
bun run preview
```

## How It Works

1. **Topic Input**: Enter any topic you'd like to learn about
2. **Lecture Generation**: Claude generates a comprehensive lecture on the topic
3. **Review**: Read and study the lecture material
4. **Quiz**: Answer 5 multiple-choice questions based on the lecture
5. **Evaluation**: Receive a detailed evaluation including:
   - Your quiz score
   - Personalized feedback
   - Identified strengths
   - Recommended areas for improvement

## Project Structure

```
src/
├── lib/
│   ├── api/
│   │   └── claude.ts           # Claude API integration
│   ├── components/
│   │   ├── TopicInput.svelte   # Initial topic selection
│   │   ├── Lecture.svelte      # Lecture display
│   │   ├── Quiz.svelte         # Quiz component
│   │   └── Evaluation.svelte   # Results and feedback
│   └── stores/
│       └── learning.ts         # Svelte store for session state
├── routes/
│   ├── +layout.svelte          # Main layout
│   ├── +page.svelte            # Main page with phase routing
│   └── layout.css              # Global styles
└── app.html                    # HTML template
```

## Configuration

### TailwindCSS + DaisyUI

The app uses DaisyUI themes (light and dark) configured in `tailwind.config.ts`. You can customize themes and colors there.

### Claude Model

The app uses Claude 3.5 Sonnet for all AI operations. You can change the model by updating the `model` parameter in `src/lib/api/claude.ts`.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ANTHROPIC_API_KEY` | Your Anthropic API key | Yes |

## Tips for Best Results

- Use specific, well-defined topics for better lecture generation
- Read the lecture carefully before taking the quiz
- The quiz is designed to test understanding of key concepts
- Use the feedback to identify areas where you might want to explore more

## Troubleshooting

### "API Key Missing" Error

Make sure you've created `.env.local` file with your Anthropic API key. The file should be in the project root directory.

### Questions Not Loading

This usually means there was an issue with API communication. Check:
1. Your API key is valid and has available credits
2. Your internet connection is working
3. The Anthropic API service is operational

### Styling Issues

If TailwindCSS or DaisyUI styles aren't showing:
1. Make sure all dependencies are installed: `bun install`
2. Restart the dev server
3. Clear your browser cache

## License

MIT

## Resources

- [Svelte Documentation](https://svelte.dev)
- [SvelteKit Documentation](https://svelte.dev/docs/kit)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [DaisyUI Documentation](https://daisyui.com)
- [Anthropic Claude Documentation](https://docs.anthropic.com)
