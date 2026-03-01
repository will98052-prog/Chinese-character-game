# Chinese Character Meaning Game - Design

## Scope and Intent

This design translates `PDD.md` into an implementation-ready V1 for a fast, no-account quiz loop focused on beginner Mandarin vocabulary.

Locked V1 decisions from brainstorming:

- Stack: vanilla HTML/CSS/JS
- Quiz progression: manual `Next`
- Pinyin visibility: user toggle, preference persisted in `localStorage`
- Answer policy: normalized exact match (trim, case-insensitive, punctuation/article normalization, no typo fuzziness)
- Session stats: persisted in `localStorage`

## V1 Architecture

Client-only static web app with local data.

Planned files:

- `index.html`: app shell and semantic UI structure
- `styles.css`: mobile-first visual system and responsive layout
- `app.js`: app bootstrap, state transitions, validation, rendering, and persistence
- `data/vocab.easy.json`: easy vocabulary dataset (50-100 items)

No backend is required for V1. The app is deployable on any static host.

## App State Model

Primary interaction states:

- `ready`: prompt visible, awaiting user input
- `answered-correct`: judged correct, feedback visible
- `answered-incorrect`: judged incorrect, accepted answer visible
- `awaiting-next`: input locked until `Next` is clicked

Session model:

- `totalAnswered`: number
- `correctCount`: number
- `incorrectCount`: number
- `accuracyPct`: derived integer
- `showPinyin`: boolean preference persisted in `localStorage`

Prompt queue stays in memory for the current runtime; stats and preferences persist in `localStorage`.

## Data Contract

Vocabulary item shape:

```json
{
  "id": "ni-001",
  "hanzi": "你",
  "pinyin": "ni3",
  "meanings": ["you"],
  "difficulty": "easy"
}
```

Validation constraints:

- Required: `id`, `hanzi`, non-empty `meanings`
- Optional: `pinyin`
- Required for V1 filter: `difficulty: "easy"`

Malformed records are skipped with non-fatal handling.

## Quiz Flow and Data Flow

1. On startup, load and parse `data/vocab.easy.json`.
2. Filter/validate easy items and normalize accepted meanings for matching.
3. Select initial prompt.
4. User submits answer via button or Enter.
5. If empty input, show inline validation and do not advance.
6. Normalize user answer and compare with normalized accepted meanings.
7. Show `Correct` or `Incorrect` feedback immediately.
8. Update and persist session stats.
9. Enable `Next`.
10. On `Next`, choose a new prompt with no immediate repeat when possible.
11. Reset feedback/input state and return to `ready`.

## Answer Normalization Rules

Applied to both accepted meanings and user input:

- Trim leading/trailing whitespace
- Convert to lowercase
- Collapse multiple spaces to one
- Remove surrounding punctuation
- Drop leading article tokens `a`, `an`, `the`

Out of scope in V1:

- Fuzzy spelling and typo tolerance
- Semantic synonym inference beyond explicit accepted meanings

## Prompt Selection Rule

Use random selection from the easy pool while avoiding immediate back-to-back repeats when pool size > 1.

Fallback behavior:

- If pool size == 1, repeat is unavoidable and allowed.

## UX and Accessibility

Single-page, one-prompt focus with these controls:

- Hanzi prompt (primary)
- Optional pinyin display controlled by `Show/Hide Pinyin`
- Answer input with label and Enter submit
- `Submit` button
- `Next` button (disabled until an answer is judged)
- Visible stats strip (`Answered`, `Correct`, `Incorrect`, `Accuracy`)

Accessibility baseline:

- Proper input labeling
- Keyboard-operable controls with visible focus states
- `aria-live="polite"` feedback region for judged outcomes

## Error Handling

- JSON load failure: show recoverable error panel with retry affordance.
- Empty validated pool: show clear empty-state message.
- Malformed item: skip and continue processing remaining items.
- Storage errors (rare/private mode constraints): continue in-memory and degrade gracefully.

## Test Strategy (V1)

Functional checks:

- Correct/incorrect judging across representative samples
- Empty input validation
- Manual `Next` gating behavior
- No immediate repeat behavior when possible

Logic checks:

- Normalization function behavior for casing, spaces, punctuation, and leading articles
- Accuracy calculation and zero-safe handling
- Local storage read/write and initialization defaults

Experience checks:

- 20+ uninterrupted prompt cycles on desktop and mobile
- Keyboard-only flow: type -> Enter submit -> Next

## PDD Refinements to Apply

Update `PDD.md` to make these explicit:

- V1 implementation stack is vanilla HTML/CSS/JS.
- Progression is manual `Next` after feedback.
- Pinyin is user-toggleable and preference is persisted.
- Answer checking uses normalized exact matching only.
- Session stats persist via `localStorage`.

## Acceptance Criteria

- App runs as a static site with no backend dependency.
- User can complete at least 20 prompt cycles without flow breaks.
- Feedback is immediate and visibly distinct for correct/incorrect.
- Stats update correctly after each judged answer and persist after reload.
- Prompt selection avoids immediate repeats whenever item pool permits.
