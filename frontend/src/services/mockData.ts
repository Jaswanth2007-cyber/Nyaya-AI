import type {
  IracArgument,
  Counterargument,
  LegalExplanation,
  GenerateRequest,
  CounterargumentRequest,
  ExplainRequest
} from '../types/legal';

export function getMockIracArgument(req: GenerateRequest): IracArgument {
  const isContract = req.subject.toLowerCase().includes('contract');
  const isTort = req.subject.toLowerCase().includes('tort') || req.subject.toLowerCase().includes('negligence');
  const isCriminal = req.subject.toLowerCase().includes('criminal');

  if (isContract) {
    return {
      issue: req.issue || 'Whether an automated online transaction formed an enforceable contract when the listed purchase price was a palpable, unilateral clerical mistake.',
      rule: 'Under core contract law principles (including Indian Contract Act §§ 10, 13, 20 and Common Law doctrine of mutual assent), a contract requires consensus ad idem (meeting of the minds). When an offer contains a palpable, obvious clerical error such that any reasonable buyer knew or ought to have known of the mistake (the "snapping up" doctrine), mutual assent is negated. Furthermore, automated electronic order confirmations do not override standard terms reserving the merchant’s right to cancel unfulfilled orders for manifest pricing errors.',
      application: '1. Gross Disparity: TechNova listed a ₹99,900 workstation for ₹999 (a 99% discount), an objective anomaly that signals a manifest data entry error rather than genuine commercial intent.\n\n2. Absence of Consensus: Because TechNova had no subjective or objective intention to sell at ₹999, there was no mutual agreement on price, an essential term.\n\n3. Immediate Remediation & Restitution: TechNova cancelled within 4 hours prior to dispatch and refunded the ₹999 in full along with an apology voucher, preventing detrimental reliance and returning the parties to their status quo ante.',
      conclusion: 'The claim for specific performance will likely fail because no valid contract was formed due to palpable unilateral mistake. The buyer is entitled only to restitution (full refund of ₹999), which has already been tendered.',
      general_principles: [
        'Consensus ad idem (Meeting of the minds) is essential for contract validity.',
        'Unilateral Mistake & Snapping Up: A party cannot enforce a bargain if they knew or reasonably ought to have known the counterparty was mistaken regarding price.',
        'Restitutionary Remedy: In cases of void or rescinded agreements, returning the parties to status quo ante discharges liability.',
        'Invitation to Treat vs. Offer in automated digital storefronts.'
      ],
      assumptions: [
        'Assuming TechNova’s website terms of service retained the customary right to cancel unfulfilled orders for manifest pricing errors.',
        'Assuming the buyer had not altered position irreversibly in detrimental reliance within the 4-hour window.',
        'Assuming no deceptive trade practice or bait-and-switch intention was present on the merchant’s part.'
      ],
      limitations: [
        'Educational practice simulation only; jurisdiction-specific consumer protection statutes (e.g. Consumer Protection Act 2019 / FTC guidelines) may impose administrative penalties for incorrect electronic pricing.',
        'Actual judicial outcomes depend on exact terms of service, server logs, and jurisdictional evidentiary rules.'
      ],
      educational_notice: 'Educational practice brief only. Not professional legal advice. Principles and analysis are generated strictly for moot-court training.'
    };
  }

  if (isTort) {
    return {
      issue: req.issue || 'Whether the operator of an autonomous delivery robot is liable in negligence for secondary pedestrian injury resulting from an emergency collision avoidance maneuver.',
      rule: 'Negligence requires establishing: (1) Duty of care to foreseeable plaintiffs, (2) Breach of the standard of care, (3) Causation (factual cause and proximate cause), and (4) Legally recognized Damages. Under the Sudden Peril / Emergency Doctrine, an actor confronting an unexpected hazard not of their own making is judged by what a reasonable actor would do under emergency pressure. However, designers of automated systems in public spaces retain a standard duty to calibrate fail-safe trajectory planning and pedestrian warning systems.',
      application: '1. Duty of Care: UrbanDash clearly owed a duty of care to pedestrians sharing the sidewalk, a public domain with high foreseeable pedestrian density.\n\n2. Standard & Breach: The robot faced a sudden peril created by the rogue cyclist. Swerving to avoid a high-speed collision was an evasive maneuver, but directing trajectory at 9 mph into an alcove where pedestrians stand without audible alarms suggests potential sensor threshold deficiency.\n\n3. Causation: The robot’s physical impact directly caused Elena’s fractured wrist and property loss (laser instrument). The rogue cyclist’s intrusion is an intervening concurrent cause.\n\n4. Comparative Fault: Elena bore zero comparative negligence. The cyclist bears primary third-party fault, but UrbanDash may face joint liability if sensor calibration fell below industry safety standards.',
      conclusion: 'UrbanDash is likely liable for Elena’s damages under a negligence and product liability framework, subject to potential third-party apportionment against the bicyclist under comparative fault principles.',
      general_principles: [
        'Standard of Care in Autonomous Robotics: Operators must exercise reasonable care in navigation and fail-safe calibration.',
        'Sudden Peril Doctrine: Modifies standard of care during unforeseen emergencies, but does not excuse reckless redirection into pedestrians.',
        'Proximate Cause & Intervening Actors: Foreseeability of sidewalk intrusions is a core consideration in urban robotics.',
        'Duty to Warn: Failure to sound immediate audio/visual alarms upon initiating emergency maneuvers.'
      ],
      assumptions: [
        'Assuming the sidewalk was an authorized municipal testing zone for autonomous couriers.',
        'Assuming Elena had no advance visual or auditory notice of the robot approaching the alcove.',
        'Assuming the robot operated within municipal speed caps.'
      ],
      limitations: [
        'State-specific autonomous delivery vehicle (ADV) statutory frameworks vary widely.',
        'Analysis is educational and theoretical; actual product liability requires expert engineering telemetry.'
      ],
      educational_notice: 'Educational practice brief only. Not professional legal advice. Principles and analysis are generated strictly for moot-court training.'
    };
  }

  if (isCriminal) {
    return {
      issue: req.issue || 'Whether the prosecution can establish the requisite mens rea for burglary and trespass when entry was made under an honest and reasonable mistake of fact.',
      rule: 'In criminal jurisprudence, criminal liability generally mandates both Actus Reus (the wrongful physical act) and Mens Rea (the culpable state of mind). Burglary requires an unlawful entry with the specific intent to commit a felony or theft therein. An honest, genuine mistake of fact (Ignorantia facti excusat) negates the specific intent necessary for theft/burglary, because the accused genuinely believes they have a lawful claim of right or authorization.',
      application: '1. Physical Act (Actus Reus): Daniel entered Studio 3B without actual authorization from tenant Maya and took paint supplies.\n\n2. Mental State (Mens Rea): Daniel was residing in Studio 4B, which was identical in design, furnishings, and elevator orientation. Due to extreme fatigue, he mistook the floor.\n\n3. Absence of Animus Furandi: Daniel believed the studio was his own and the paints were his delivery. He lacked the felonious intent to permanently deprive another of their property.\n\n4. Corroborating Conduct: Upon confrontation, Daniel did not flee or resist; he immediately offered his keycard showing #4B, explained the error, and attempted to rectify the situation.',
      conclusion: 'The prosecution will fail to secure a conviction for burglary or larceny due to the total absence of felonious mens rea established by a credible mistake of fact. While civil trespass or minor infraction might theoretically exist, criminal culpability is negated.',
      general_principles: [
        'Actus non facit reum nisi mens sit rea (An act does not make one guilty unless the mind is also guilty).',
        'Mistake of Fact (Ignorantia facti): Valid defense to specific intent crimes when it negates the required mental state.',
        'Claim of Right: Believing property is one’s own negates animus furandi (intent to steal).',
        'Burglary Elements: Breaking and entering must be accompanied by contemporaneous felonious intent.'
      ],
      assumptions: [
        'Assuming Daniel’s explanation and keycard #4B are verified by building access logs.',
        'Assuming Daniel had genuinely ordered similar art supplies to his own address.',
        'Assuming no prior history of unauthorized entries or deception.'
      ],
      limitations: [
        'General criminal law principles; specific jurisdictional statutory definitions of criminal trespass may differ on strict liability vs intent requirements.',
        'Credibility is ultimately a question of fact for the jury or trial judge.'
      ],
      educational_notice: 'Educational practice brief only. Not professional legal advice. Principles and analysis are generated strictly for moot-court training.'
    };
  }

  // Default / Constitutional / General fallback
  return {
    issue: req.issue || `Legal inquiry regarding rights, duties, and standard of review under ${req.subject} (${req.jurisdiction}).`,
    rule: 'Under recognized legal doctrines governing this subject, claims are evaluated through balancing tests, constitutional scrutiny standards (rational basis, intermediate, or strict scrutiny depending on fundamental rights involved), and established statutory frameworks. State actions restricting protected expression or rights in designated public forums must demonstrate a compelling government interest through narrowly tailored means.',
    application: `Applying core doctrines to the presented facts:\n\n1. Threshold Standing & State Action: The entity’s actions qualify as state action subject to judicial review.\n\n2. Substantive Analysis: Restricting access based on critical viewpoint fails strict scrutiny because suppression of criticism is an impermissible governmental purpose.\n\n3. Narrow Tailoring: Total network blocking across all campus facilities is overbroad and disproportionate relative to any legitimate administrative objective.\n\n4. Public Interest Balancing: Preserving robust debate and transparency outweighs institutional administrative convenience.`,
    conclusion: 'The petitioner has established a strong prima facie case for declaratory and injunctive relief against the enforcement of the policy.',
    general_principles: [
      'Prohibition against Viewpoint Discrimination in public or designated public forums.',
      'Strict Scrutiny standard requiring compelling interest and least restrictive means.',
      'Doctrine of Overbreadth and Prior Restraint.'
    ],
    assumptions: [
      'Assuming the facts as presented are fully substantiated by verifiable electronic records.',
      'Assuming no non-constitutional administrative exhaustion hurdles preclude review.'
    ],
    limitations: [
      'Educational moot-court training scenario; actual legal outcomes depend on localized jurisprudence and precedent.'
    ],
    educational_notice: 'Educational practice brief only. Not professional legal advice. Principles and analysis are generated strictly for moot-court training.'
  };
}

export function getMockCounterargument(req: CounterargumentRequest): Counterargument {
  const isContract = req.subject.toLowerCase().includes('contract');
  const isTort = req.subject.toLowerCase().includes('tort') || req.subject.toLowerCase().includes('negligence');
  const isCriminal = req.subject.toLowerCase().includes('criminal');

  if (isContract) {
    return {
      opposition_position: 'The Buyer contends that the transaction was fully consummated upon payment processing and automated confirmation, creating an unconditional obligation to deliver the goods as advertised.',
      opposing_arguments: [
        'Objective Theory of Contracts: A contract is judged by outward manifestations of assent, not uncommunicated subjective internal mistakes of the seller.',
        'E-Commerce Risk Allocation: High-volume commercial retailers bear the operational risk of automated pricing algorithms and should not shift the burden of their glitches onto good-faith consumers.',
        'Unconditional Acceptance: The receipt explicitly stated "Order Confirmed" and deducted funds, which in modern digital commerce signifies acceptance of the buyer’s offer.'
      ],
      student_weaknesses: [
        'The argument relies heavily on the "snapping up" doctrine without demonstrating that Aarav possessed actual subjective knowledge of the retail wholesale price.',
        'Under modern consumer protection statutes, advertising a price and taking consideration can be deemed an unfair or misleading commercial practice regardless of clerical intention.'
      ],
      rebuttal_directions: [
        'Emphasize the 99% price disparity: A ₹99,900 laptop at ₹999 is so disproportionate that constructive knowledge of mistake is legally presumed.',
        'Highlight the immediate 4-hour cancellation and refund: No detrimental reliance occurred, and equity abhors unjust enrichment.'
      ]
    };
  }

  if (isTort) {
    return {
      opposition_position: 'UrbanDash contends it acted with reasonable care under sudden emergency peril, and that fault lies exclusively with the unlawful actions of the third-party bicyclist.',
      opposing_arguments: [
        'Sudden Emergency Doctrine: When a sudden peril is created entirely by an unpredictable third party (the speeding cyclist), an actor is not negligent for making an instinctive evasive choice that proves suboptimal in hindsight.',
        'Superseding / Intervening Cause: The illegal sidewalk riding of the cyclist broke the chain of proximate causation between the robot’s operation and the plaintiff’s injuries.',
        'Utility of Innovation: Autonomous rovers operating under municipal permits provide immense public benefit, and imposing strict liability for emergency hazard avoidance will stifle municipal innovation.'
      ],
      student_weaknesses: [
        'Fails to distinguish between product defect claims (design/sensor threshold) and operational negligence.',
        'Overlooks that the cyclist was the primary initiator of physical danger.'
      ],
      rebuttal_directions: [
        'Argue foreseeable sidewalk conditions: In urban corridors, pedestrian and bicycle intrusions are not "unforeseen emergencies"—they are standard foreseeable conditions that algorithms must anticipate without targeting alcoves.',
        'Target the 9 mph speed: Operating at near maximum speed in crowded zones constituted inherent negligence in risk management.'
      ]
    };
  }

  if (isCriminal) {
    return {
      opposition_position: 'The State/Prosecution argues that unauthorized physical entry and taking of property establishes a prima facie presumption of criminal intent that cannot be excused by self-induced exhaustion or negligence.',
      opposing_arguments: [
        'Strictness of Trespass: Entry into an occupied residential dwelling without consent is inherently unlawful; subjective confusion does not eliminate the physical invasion.',
        'Objective Reasonableness Standard: For mistake of fact to serve as an exculpatory defense, the mistake must be both honest and objectively reasonable. Entering a different floor without verifying the unit number falls below reasonable care.',
        'Protection of Dwellings: The sanctity of residential peace requires deterrence against unauthorized intrusions regardless of claimed sleep deprivation.'
      ],
      student_weaknesses: [
        'Conflating the complete defense to burglary with immunity from general trespass or misdemeanor unlawful entry.',
        'Relying solely on defendant’s self-serving testimony regarding his subjective mental state.'
      ],
      rebuttal_directions: [
        'Differentiate Specific Intent from General Intent: Burglary strictly requires proof beyond a reasonable doubt of specific animus furandi at the moment of entry.',
        'Show contemporaneous corroboration: Daniel’s keycard, paint order records, and non-evasive immediate apology provide objective contemporaneous verification of mistake.'
      ]
    };
  }

  return {
    opposition_position: 'The opposing party contends that institutional authority, regulatory discretion, and administrative necessity fully justify the challenged action.',
    opposing_arguments: [
      'Institutional Prerogative: Governing authorities hold wide discretion to enforce operational policies necessary to maintain safety, decorum, and orderly execution of services.',
      'Reasonable Time, Place, and Manner Restrictions: The action was content-neutral and aimed at preserving the core institutional mission rather than suppressing specific ideologies.',
      'Non-Infringement: The subject has alternative accessible avenues of communication and remedy that mitigate any claimed prejudice.'
    ],
    student_weaknesses: [
      'May not sufficiently address the threshold jurisdictional standard of review.',
      'Assumes intent to discriminate without isolating evidence of differential treatment under identical conditions.'
    ],
    rebuttal_directions: [
      'Focus on the direct nexus between the critical viewpoint and the punitive restriction.',
      'Highlight less restrictive alternative measures that were available but ignored.'
    ]
  };
}

export function getMockLegalExplanation(_req: ExplainRequest): LegalExplanation {
  return {
    plain_explanation: 'From a foundational legal perspective: To form a binding contract, both parties must have a genuine "meeting of the minds" (consensus ad idem) on material terms like price. When a glaring clerical error occurs—such as a ₹99,900 laptop listed for ₹999—the law applies the "snapping up" doctrine. This doctrine prevents a buyer from enforcing an agreement if a reasonable person would have recognized that the seller made an obvious unilateral mistake. Because the merchant promptly cancelled the order within hours and issued a full refund, the buyer suffered no detrimental reliance, and courts will generally order restitution rather than specific performance.',
    key_legal_terms: [
      {
        term: 'Consensus Ad Idem',
        meaning: 'A foundational contract doctrine meaning "meeting of the minds"—both parties must understand and agree to the same essential terms in the same sense.',
        simple_example: 'If a buyer believes they are buying the item outright while the seller believes they are leasing it, mutual assent is lacking.'
      },
      {
        term: 'Snapping Up Doctrine',
        meaning: 'A principle where a court will not permit a party to enforce a contract if they knew, or an objective reasonable person would have known, that the other party made an obvious pricing or drafting mistake.',
        simple_example: 'Attempting to hold a jeweler to an advertisement listing an authentic diamond ring for $10 instead of $10,000 due to a catalog misprint.'
      },
      {
        term: 'Restitution',
        meaning: 'A legal remedy designed to restore an aggrieved party to the position they occupied before the transaction, preventing unjust enrichment.',
        simple_example: 'A complete refund of purchase funds after an unfulfilled or rescinded agreement.'
      },
      {
        term: 'Specific Performance',
        meaning: 'An equitable remedy compelling a defaulting party to execute their exact contractual obligation (such as delivering unique property) rather than paying compensatory damages.',
        simple_example: 'A court order requiring a seller to transfer title to a unique parcel of land.'
      }
    ],
    reasoning_breakdown: [
      '1. Material Disparity: A 99% discount creates an objective presumption of clerical error rather than bona fide promotional intent.',
      '2. Lack of Mutual Assent: Without genuine agreement on the material term of price, no enforceable contract was formed.',
      '3. Timely Cancellation: The seller cancelled promptly prior to dispatch, preventing third-party reliance or irreversible change of position.',
      '4. Sufficiency of Restitution: Refunding the full purchase consideration restores both parties to their pre-transaction positions without injustice.'
    ],
    nuances_limitations: [
      'Detrimental Reliance Exception: If the buyer had reasonably incurred non-refundable third-party expenses in reliance on prolonged seller confirmation, partial reliance damages might be arguable.',
      'Regulatory Overlay: Consumer protection authorities may impose statutory fines or administrative penalties for deceptive pricing even where specific performance is denied in civil court.'
    ]
  };
}
