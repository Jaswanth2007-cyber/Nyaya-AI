const BASE_RULES = `You are Nyaya-AI, an educational legal-reasoning coach for law students practicing moot court and legal writing.

Hard rules (never break these):
1. This is a practice sandbox, not real legal advice and not for a real pending case.
2. You may only reference GENERAL legal principles, doctrines, and standards (e.g. "offer-acceptance-consideration", "the reasonable person standard", "mens rea"). NEVER invent, name, or cite a case, judgment, or reporter citation — even a plausible-sounding one. The ONLY exception is a statute or article reference that appears verbatim in a "Verified reference doctrines" block below, which you may quote exactly as given — never alter it, extend it, or add a statute reference of your own that wasn't provided to you.
3. Write for a first-year law student: precise, but not needlessly dense.
4. Always respond with a single valid JSON object matching the exact schema given in the user message — no markdown fences, no commentary outside the JSON.`;

export function buildGeneratePrompt({ facts, issue, subject, jurisdiction, retrievedPrinciples = [] }) {
  const system = `${BASE_RULES}

Task: produce a structured IRAC (Issue, Rule, Application, Conclusion) practice argument for the student's hypothetical.`;

  const groundingBlock = retrievedPrinciples.length
    ? `\nVerified reference doctrines retrieved for this subject (from a curated knowledge base — general principles only, never case law). Prefer these exact names in "general_principles" when they are actually relevant to the facts; ignore any that aren't. Where a statute reference is given, you may quote it verbatim — do not invent a different one:\n${retrievedPrinciples
        .map(p => {
          const statute = p.statutes?.[jurisdiction] || p.statutes?.General;
          return `- ${p.principle}: ${p.description}${statute ? ` [Statute: ${statute}]` : ''}`;
        })
        .join('\n')}\n`
    : '';

  const user = `Subject: ${subject}
Jurisdiction: ${jurisdiction}
Legal issue: ${issue}
Facts: ${facts}
${groundingBlock}
Return JSON exactly in this shape:
{
  "issue": "restated, precise legal question",
  "rule": "the general legal rule(s)/doctrine(s) that govern this issue, described conversationally, no fabricated citations",
  "application": "apply the rule to these specific facts, reasoning through both sides where relevant",
  "conclusion": "a reasoned practice conclusion, hedged appropriately for an educational exercise",
  "general_principles": ["short named doctrine or standard", "..."],
  "assumptions": ["any factual or legal assumptions made to fill gaps in the hypothetical"],
  "limitations": ["ways this analysis is simplified or would need real research/counsel in practice"],
  "educational_notice": "one sentence reminding the student this is practice material only"
}`;

  return { system, user };
}

export function buildCounterargumentPrompt({ facts, issue, subject, jurisdiction, argument }) {
  const system = `${BASE_RULES}

Task: role-play the opposing counsel in a moot court. Find the strongest good-faith arguments against the student's position, and help them prepare rebuttals.`;

  const argumentContext = argument
    ? `\nThe student's existing IRAC argument:\n${JSON.stringify(argument, null, 2)}`
    : '';

  const user = `Subject: ${subject}
Jurisdiction: ${jurisdiction}
Legal issue: ${issue}
Facts: ${facts}${argumentContext}

Return JSON exactly in this shape:
{
  "opposition_position": "one paragraph stating the opposing side's overall position",
  "opposing_arguments": ["strongest opposing argument 1", "argument 2", "argument 3"],
  "student_weaknesses": ["a specific weakness or gap in the student's likely position", "..."],
  "rebuttal_directions": ["a concrete direction the student could use to rebut the opposition", "..."]
}`;

  return { system, user };
}

export function buildScorePrompt({ facts, issue, subject, jurisdiction, argument }) {
  const system = `${BASE_RULES}

Task: give informal, encouraging-but-honest feedback on how well-structured and persuasive the student's IRAC argument is, as a moot-court coach would.`;

  const user = `Subject: ${subject}
Jurisdiction: ${jurisdiction}
Legal issue: ${issue}
Facts: ${facts}

The student's IRAC argument:
${JSON.stringify(argument, null, 2)}

Return JSON exactly in this shape:
{
  "score": <integer 1-10, overall structure and persuasiveness>,
  "score_label": "one short phrase summarizing the score (e.g. 'Solid foundation, needs sharper application')",
  "strengths": ["specific thing the argument does well", "..."],
  "improvements": ["specific, actionable suggestion to strengthen the argument", "..."]
}`;

  return { system, user };
}

export function buildExplainPrompt({ reasoning_text, subject, jurisdiction }) {
  const system = `${BASE_RULES}

Task: rewrite dense legal reasoning in plain, jargon-reduced language for a smart first-year law student — clear, but without stripping out the legally important nuance.`;

  const user = `Subject: ${subject || 'General'}
Jurisdiction: ${jurisdiction || 'General / Educational'}
Legal reasoning to explain:
${reasoning_text}

Return JSON exactly in this shape:
{
  "plain_explanation": "the reasoning rewritten in clear, plain language, still legally accurate",
  "key_legal_terms": [
    { "term": "legal term used above", "meaning": "plain-language definition", "simple_example": "short everyday example" }
  ],
  "reasoning_breakdown": ["the reasoning broken into short, ordered plain-language steps"],
  "nuances_limitations": ["important nuance or caveat that a full simplification might otherwise lose"]
}`;

  return { system, user };
}
