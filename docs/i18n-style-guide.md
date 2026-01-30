# Internationalization (i18n) Style Guide

This guide establishes conventions for internationalization in this project using react-intl.

## Message ID Naming Conventions

### Structure

Use dot-separated hierarchical IDs following this pattern:

```
<section>.<component>.<element>
```

### Examples

```
part1.button.fact           # Part 1, button element, "fact" action
part2.feedback.correct      # Part 2, feedback component, correct state
introduction.title          # Introduction section title
```

### Rules

1. **Lowercase only** - Use lowercase letters and dots
2. **Descriptive hierarchy** - From general to specific
3. **No redundancy** - Don't repeat information (`button.button.click` is bad)
4. **Action-oriented for buttons** - `part1.button.next` not `part1.button.nextButton`

## Description Requirements

Every message MUST have a description in the locale file to help translators understand context.
Descriptions are stored with `@` prefix keys (not inline in components):

```json
{
  "part1.button.fact": "Fact",
  "@part1.button.fact": {
    "description": "Button label for selecting that a statement is true/factual"
  }
}
```

**Note**: This project stores descriptions in the JSON file rather than inline in components.
This keeps component code cleaner while ensuring translators have context.

### Good Descriptions

- Explain WHERE the text appears
- Explain the USER ACTION or context
- Note any character limits if applicable
- Mention if it's a title, button, label, etc.

### Bad Descriptions

- "The fact button" (too vague)
- "Button" (no context)
- Empty or missing descriptions

## ICU MessageFormat Patterns

### Pluralization

Use ICU plural syntax for countable items:

```json
"items.count": "{count, plural, one {# item} other {# items}}"
```

Full plural categories (use when needed):

- `zero` - 0 items
- `one` - 1 item
- `two` - 2 items (some languages need this)
- `few` - 3-10 items (some languages)
- `many` - 11+ items (some languages)
- `other` - fallback (REQUIRED)

### Select (Gender/Variants)

Use select for categorical choices:

```json
"greeting": "{gender, select, male {He} female {She} other {They}} said hello"
```

### Number Formatting

Use `{value, number}` for locale-aware numbers:

```json
"users.count": "Active users: {count, number}"
"price": "Cost: {amount, number, ::currency/USD}"
```

### Date Formatting

```json
"event.date": "Event on {date, date, medium}"
"event.time": "Starting at {time, time, short}"
```

## What NOT to Do

### No String Concatenation

```jsx
// BAD - breaks translation
<span>{firstName} {lastName}</span>

// GOOD - single translatable unit
<FormattedMessage
  id="user.fullName"
  values={{ firstName, lastName }}
/>
// With message: "{firstName} {lastName}"
```

### No Text in Images/SVGs

All visible text must go through the i18n layer, including:

- SVG text elements
- Image alt text
- Canvas text
- Placeholder text

### No Hard-coded Strings in JSX

```jsx
// BAD
<button>Submit</button>

// GOOD
<button><FormattedMessage id="form.button.submit" /></button>
```

### No Dynamic Key Construction

```jsx
// BAD - keys should be static for extraction
const key = `error.${errorType}`;
<FormattedMessage id={key} />

// GOOD - use select pattern or explicit keys
<FormattedMessage
  id="error.message"
  values={{
    type: errorType,
    message: intl.formatMessage({ id: `error.${errorType}` })
  }}
/>
```

## Workflow Commands

### Extract Messages

Scans codebase and extracts all messages to `locales/extracted.json`:

```bash
npm run i18n:extract
```

### Compile Messages

Validates ICU syntax and compiles messages to optimized AST format:

```bash
npm run i18n:compile
```

This command:

- Validates all ICU MessageFormat syntax (catches errors early)
- Generates optimized AST bundles for faster runtime parsing
- Fails with clear errors if any message has invalid syntax

### Lint for i18n Issues

Checks for ICU syntax errors and missing descriptions:

```bash
npm run lint
```

## File Organization

```
locales/
├── en.json           # English translations (source)
├── extracted.json    # Auto-generated extraction output
└── en.compiled.json  # Compiled production format
```

## Adding a New Language

1. Copy `locales/en.json` to `locales/{locale}.json`
2. Translate all values (keep keys unchanged)
3. Keep all `@` description entries
4. Add locale to `SUPPORTED_LOCALES` in `i18n/IntlProvider.tsx`

See [Workflow Roles](./i18n-workflow-roles.md) for the full process and responsibilities.

## Related Documentation

- [Cloud Computing Glossary](./cloud-glossary.md) - Technical terms for translators
- [Workflow Roles](./i18n-workflow-roles.md) - Team responsibilities and processes

## Quick Reference

| Pattern       | Example                                                          |
| ------------- | ---------------------------------------------------------------- |
| Simple text   | `"button.save": "Save"`                                          |
| With variable | `"greeting": "Hello, {name}"`                                    |
| Plural        | `"{count, plural, one {# item} other {# items}}"`                |
| Select        | `"{type, select, error {Error} warning {Warning} other {Info}}"` |
| Number        | `"{value, number}"`                                              |
| Currency      | `"{amount, number, ::currency/USD}"`                             |
| Date          | `"{date, date, medium}"`                                         |
