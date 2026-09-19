import type { SampleCasePreset } from '../types/legal';

export const SAMPLE_CASES: SampleCasePreset[] = [
  {
    id: 'contract-algo-pricing',
    title: 'The Glitched Price Tag',
    subject: 'Contract Law',
    jurisdiction: 'India',
    tag: 'E-Commerce / Mistake',
    description: 'An online retailer lists a premium laptop for ₹999 instead of ₹99,900 due to an algorithmic glitch. 500 orders are placed before cancellation.',
    input: {
      subject: 'Contract Law',
      jurisdiction: 'India',
      issue: 'Whether an automated e-commerce order confirmation constitutes an irrevocable contract when the displayed price resulted from a palpable unilateral pricing error (snapping up).',
      facts: `On October 15, 2024, TechNova India listed a flagship workstation laptop valued at INR 99,900 on its website for INR 999 due to an automated database synchronization error. 

Aarav, a college student, noticed the listing, added the item to his cart, and completed payment of INR 999 via UPI. An automated email receipt with the subject "Order Confirmed #TN-8821" was generated immediately. 

Four hours later, TechNova detected the pricing anomaly, cancelled all 500 orders placed during the window, and initiated a full refund of INR 999 with a 10% promotional apology voucher. 

Aarav refuses the refund, contending that payment confirmation and the automated receipt formed a binding agreement under the Indian Contract Act, 1872, and files a consumer claim seeking specific performance to deliver the laptop.`
    }
  },
  {
    id: 'tort-autonomous-delivery',
    title: 'The Sidewalk Collision',
    subject: 'Tort / Negligence',
    jurisdiction: 'United States',
    tag: 'Autonomous Systems / Duty of Care',
    description: 'An autonomous robotic sidewalk courier swerves to avoid a cyclist and injures a pedestrian carrying fragile equipment.',
    input: {
      subject: 'Tort / Negligence',
      jurisdiction: 'United States',
      issue: 'Whether the manufacturer/operator of an autonomous delivery robot owes a heightened duty of care to pedestrians and is liable in negligence when its emergency collision avoidance algorithm causes secondary injury.',
      facts: `UrbanDash Inc. operates autonomous ground delivery rovers on municipal sidewalks in Austin, Texas. The rovers are governed by sensor fusion and a machine learning collision avoidance module.

On a crowded sidewalk, a bicyclist abruptly swerved onto the sidewalk at high speed directly in front of Rover #42. To prevent a primary impact with the cyclist, the rover executed an evasive hard right turn into an alcove. 

Elena, a pedestrian standing in the alcove examining architectural blueprints, was struck at 9 mph, causing her to fall and suffer a fractured wrist along with the destruction of a $6,000 laser surveying instrument. 

Elena alleges that UrbanDash was negligent in software design, sensor threshold calibration, and failure to provide audible warning sirens in crowded pedestrian zones.`
    }
  },
  {
    id: 'criminal-mistake-fact',
    title: 'The Midnight Studio Entry',
    subject: 'Criminal Law',
    jurisdiction: 'General / Educational',
    tag: 'Trespass / Mens Rea',
    description: 'An art student enters an adjacent identical studio loft believing it to be his leased studio and takes paint supplies.',
    input: {
      subject: 'Criminal Law',
      jurisdiction: 'General / Educational',
      issue: 'Whether the prosecution can establish the requisite mens rea (specific intent to commit larceny/burglary) where the defendant entered an unauthorized dwelling under an honest, reasonable mistake of fact.',
      facts: `In a converted warehouse building with identical studio apartments, Daniel leased Studio 4B. Late on a Friday evening after a 14-hour painting session and in a sleep-deprived state, Daniel exited the elevator on the 3rd floor instead of the 4th floor. 

Studio 3B's door latch was disengaged. Daniel pushed the door open, believing he was in his own studio (which had an identical layout and easel position). Seeing high-grade oil paints and brushes on the table, which resembled supplies he had ordered, he gathered them into his satchel intending to use them overnight.

The tenant of 3B, Maya, returned to find Daniel in the room. Daniel apologized profusely, explained his confusion, and offered his keycard which showed #4B. Maya contacted law enforcement, who charged Daniel with burglary and trespass.`
    }
  },
  {
    id: 'consti-social-media-ban',
    title: 'Campus Free Expression & Digital Policies',
    subject: 'Constitutional Law',
    jurisdiction: 'United States',
    tag: 'First Amendment / Public Forum',
    description: 'A state university bans a student-run investigative journalism account on campus networks for criticizing administration policies.',
    input: {
      subject: 'Constitutional Law',
      jurisdiction: 'United States',
      issue: 'Whether a state university network restriction and blocking of an independent student journalism portal constitutes viewpoint discrimination and violates the First Amendment in a designated public forum.',
      facts: `State University (a public institution) maintains an official campus Wi-Fi network and designated digital bulletin board system for student discourse. 

The Student Tribune, an unrecognized independent investigative student collective, published a series of verified articles alleging financial mismanagement and conflicts of interest within the university board of regents.

Following the third publication, the university IT administration blocked access to the Student Tribune website across all campus Wi-Fi networks and dormitories, citing a policy against "content disrupting institutional harmony and campus morale."

The editors of the Student Tribune filed suit claiming unconstitutional prior restraint, viewpoint discrimination, and infringement of protected speech under the First and Fourteenth Amendments.`
    }
  }
];
