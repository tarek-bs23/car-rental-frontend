**Cursor Rules for Car Rental Frontend**

### General

- Keep responses concise and to the point.
- Avoid speculative code or APIs; prefer patterns and endpoints documented in `docs/api-technical-reference.md`.
- If feature requirements are ambiguous, ask short clarifying questions before making large or irreversible changes.

### Code style

- Use TypeScript and React functional components with hooks.
- Keep components focused; extract reusable pieces into separate files when they grow too large.
- Use clear, descriptive names and keep inline comments to a minimum; code should be mostly self-explanatory.

### UI / UX

- Reuse existing global styles from `src/index.css` before introducing new patterns.
- Ensure layouts are responsive; prefer flexbox and CSS grid over absolute positioning.
- Keep forms and flows simple and intuitive, with clear primary actions.

### Auth & API

- Use shared API utilities if they exist instead of scattering `fetch`/`axios` logic across components.
- Follow request/response contracts from `docs/api-technical-reference.md` when calling backend endpoints.
- Always handle loading, empty, and error states for network calls.

### Quality

- Avoid introducing new `any` types unless strictly necessary.
- Fix linter and TypeScript errors introduced by new changes.
- Prefer small, focused changes that are easy to review and test.

<!--

System Guidelines

Use this file to provide the AI with rules and guidelines you want it to follow.
This template outlines a few examples of things you can add. You can add your own sections and format it to suit your needs

TIP: More context isn't always better. It can confuse the LLM. Try and add the most important rules you need

# General guidelines

Any general rules you want the AI to follow.
For example:

* Only use absolute positioning when necessary. Opt for responsive and well structured layouts that use flexbox and grid by default
* Refactor code as you go to keep code clean
* Keep file sizes small and put helper functions and components in their own files.

--------------

# Design system guidelines
Rules for how the AI should make generations look like your company's design system

Additionally, if you select a design system to use in the prompt box, you can reference
your design system's components, tokens, variables and components.
For example:

* Use a base font-size of 14px
* Date formats should always be in the format “Jun 10”
* The bottom toolbar should only ever have a maximum of 4 items
* Never use the floating action button with the bottom toolbar
* Chips should always come in sets of 3 or more
* Don't use a dropdown if there are 2 or fewer options

You can also create sub sections and add more specific details
For example:


## Button
The Button component is a fundamental interactive element in our design system, designed to trigger actions or navigate
users through the application. It provides visual feedback and clear affordances to enhance user experience.

### Usage
Buttons should be used for important actions that users need to take, such as form submissions, confirming choices,
or initiating processes. They communicate interactivity and should have clear, action-oriented labels.

### Variants
* Primary Button
  * Purpose : Used for the main action in a section or page
  * Visual Style : Bold, filled with the primary brand color
  * Usage : One primary button per section to guide users toward the most important action
* Secondary Button
  * Purpose : Used for alternative or supporting actions
  * Visual Style : Outlined with the primary color, transparent background
  * Usage : Can appear alongside a primary button for less important actions
* Tertiary Button
  * Purpose : Used for the least important actions
  * Visual Style : Text-only with no border, using primary color
  * Usage : For actions that should be available but not emphasized
-->
