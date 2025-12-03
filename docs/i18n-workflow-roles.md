# i18n Workflow Roles & Responsibilities

This document defines the roles, responsibilities, and processes for managing translations in this project.

## Roles

### 1. Developer
**Who:** Any engineer adding or modifying user-facing text

**Responsibilities:**
- Add new translation keys following the [style guide](./i18n-style-guide.md)
- Write clear descriptions for every new key
- Run `npm run i18n:check` before committing
- Never hardcode user-facing strings in components
- Use ICU MessageFormat for plurals/dates/numbers

**Checklist for new keys:**
- [ ] Key follows naming convention (`section.component.element`)
- [ ] Description added with `@` prefix in locale file
- [ ] Used `FormattedMessage` or `intl.formatMessage()`
- [ ] Ran `npm run lint` to verify syntax

### 2. Translation Coordinator
**Who:** Project owner or designated team member

**Responsibilities:**
- Export messages for translators (from `locales/en.json`)
- Review and import completed translations
- Maintain the [glossary](./cloud-glossary.md)
- Coordinate with external translation services
- Ensure consistency across languages
- Schedule translation updates with releases

**Workflow:**
1. Before translation round: Run `npm run i18n:unused` to clean up
2. Export: Provide `en.json` to translators with glossary
3. Import: Add new locale files (e.g., `fr.json`)
4. Verify: Run `npm run i18n:compile` on all locales
5. Test: Review UI with pseudo-localization

### 3. Translator
**Who:** Native speakers or professional translation service

**Responsibilities:**
- Translate all message values accurately
- Preserve placeholders exactly as written (e.g., `{name}`, `{count, plural, ...}`)
- Consult glossary for technical terms
- Flag unclear descriptions or context issues
- Keep translations concise for UI elements

**Guidelines:**
- Read the `@` description entries for context
- Do not translate keys, only values
- Preserve ICU syntax exactly
- Note character limits for buttons/labels
- Ask coordinator if context is unclear

### 4. QA / Reviewer
**Who:** Native speaker reviewer or dedicated QA

**Responsibilities:**
- Review translations in context (in the running app)
- Check text fits within UI containers
- Verify RTL layout for applicable languages
- Test with pseudo-localization to spot hardcoded strings
- Report truncation or layout issues

**Testing checklist:**
- [ ] All UI text is translated (no English showing through)
- [ ] Buttons/labels fit their containers
- [ ] Pluralization works correctly
- [ ] Dates/numbers format correctly for locale
- [ ] RTL layout mirrors correctly (for ar, he, etc.)

---

## Workflows

### Adding New Features with Text

```
Developer                    Translation Coordinator
    │                                │
    ├── Add keys to en.json          │
    ├── Write descriptions           │
    ├── Run i18n:check               │
    ├── Commit & merge               │
    │                                │
    │ ────────────────────────────►  │
    │     "New keys ready"           │
    │                                ├── Export to translators
    │                                ├── Receive translations
    │                                ├── Import new locales
    │                                ├── Run i18n:compile
    │ ◄────────────────────────────  │
    │     "Translations ready"       │
    │                                │
    ├── Pull & verify                │
    └── Deploy                       │
```

### Urgent Hotfix with Text Changes

1. Developer adds keys to `en.json` only
2. Deploy with English fallback
3. Translation Coordinator schedules translation
4. Deploy translations in follow-up release

### Adding a New Language

1. **Coordinator:** Copy `en.json` to `{locale}.json`
2. **Coordinator:** Send to translator with glossary
3. **Translator:** Translate all values, preserve keys
4. **Coordinator:** Import translated file
5. **Coordinator:** Add locale to `SUPPORTED_LOCALES` in IntlProvider
6. **QA:** Full review of new language in app
7. **Developer:** Deploy

---

## Communication Channels

| Purpose | Channel |
|---------|---------|
| New key requests | GitHub PR comments |
| Translation questions | Dedicated Slack/Teams channel |
| Bug reports (translation) | GitHub Issues with `i18n` label |
| Glossary updates | PR to docs/cloud-glossary.md |

---

## Release Checklist

Before each release with translation changes:

- [ ] All new keys have descriptions
- [ ] `npm run i18n:check` passes
- [ ] `npm run i18n:unused` shows no unexpected unused keys
- [ ] All target locales have been updated
- [ ] RTL languages tested if applicable
- [ ] Pseudo-localization reviewed for hardcoded strings

---

## Escalation

If a translation issue blocks release:

1. **Option A:** Ship with English fallback, fix in follow-up
2. **Option B:** Use machine translation as placeholder, mark for review
3. **Option C:** Delay release if translation is critical

Decision authority: Translation Coordinator + Project Owner
