# Product Design Document (PDD): Chinese Character Meaning Game

## 1) Product Overview

Build a simple web application for practicing beginner Chinese vocabulary using a quiz loop.

The app shows one easy Chinese character or short word at a time. The player types the meaning in English. The app immediately checks the answer, tells the player if it is correct or incorrect, then presents the next prompt.

## 2) Goals

- Help beginners quickly recognize and remember common Chinese characters.
- Keep interaction fast: prompt -> answer -> feedback -> next prompt.
- Make the game playable without account setup.

## 3) Non-Goals (V1)

- No advanced grammar lessons.
- No handwriting recognition.
- No multiplayer mode.
- No spaced-repetition algorithm in first release.

## 4) Target Users

- Beginner Mandarin learners.
- Casual learners who want short practice sessions (1-5 minutes).

## 5) Core User Story

As a beginner learner, I want to see a simple Chinese character and type its meaning so that I can check my understanding and practice repeatedly.

## 6) Functional Requirements

### 6.1 Quiz Loop

- The system shows one Chinese prompt at a time (character or short word).
- The user submits an English meaning.
- The system evaluates correctness using accepted answers for that prompt.
- The system returns immediate feedback:
  - `Correct` when answer matches.
  - `Incorrect` when answer does not match.
- The system uses a manual Next interaction: it does not auto-advance after feedback.

### 6.2 Input and Validation

- Accept typed text input.
- Trim whitespace before checking answers.
- Match answers case-insensitively.
- Use a normalized exact policy: normalize whitespace, punctuation, and leading articles before exact comparison.
- Support multiple accepted English meanings per Chinese prompt.
- On incorrect answers, display at least one accepted meaning.

### 6.3 Content Set (V1)

- Start with an "easy" set of 50-100 beginner items.
- Each item includes:
  - Chinese text (e.g., `你`)
  - Pinyin (optional display in V1, recommended)
  - One or more accepted English meanings (e.g., `you`)

### 6.4 Session Behavior

- Do not repeat the exact same prompt back-to-back when possible.
- Track simple session stats:
  - Total answered
  - Correct count
  - Incorrect count
  - Accuracy percentage
- Persist session stats and preferences in localStorage.

## 7) UX Requirements

- Single-page experience optimized for desktop and mobile.
- Keep UI minimal and focused on one action per screen.
- Show visible feedback state after each submission.
- Provide a clear manual Next action via button.
- Include optional pinyin hint toggle and persist this preference between reloads.

## 8) Technical Requirements

- Implement as a web application.
- Stack is locked to vanilla HTML/CSS/JS for v1.
- Store vocabulary data in a local JSON file for V1.
- No backend required for V1 (client-side logic is acceptable).

## 9) Data Model (V1)

Example structure:

```json
{
  "id": "ni-001",
  "hanzi": "你",
  "pinyin": "ni3",
  "meanings": ["you"],
  "difficulty": "easy"
}
```

## 10) Success Metrics

- User can complete at least 20 prompt cycles without friction.
- Average answer-to-feedback time stays under 300 ms on local device.
- At least 90% of test prompts return expected correct/incorrect behavior in QA tests.

## 11) Edge Cases

- Empty answer submission -> show validation message and keep current prompt.
- Synonym handling (e.g., `hello` vs `hi`) -> include both in accepted meanings when needed.
- Duplicate meanings across different prompts -> ensure each prompt still validates independently.

## 12) Future Enhancements

- Add spaced repetition and weak-item resurfacing.
- Add difficulty levels and categories (greetings, numbers, family).
- Add audio pronunciation playback.
- Add user accounts and progress history.
