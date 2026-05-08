/**
 * Topics to generate training conversations for.
 * Each topic produces N example user messages + ideal assistant responses.
 *
 * Categories chosen to cover the realistic distribution of what an AI wellness
 * companion gets asked. Add/remove as needed.
 */

export const TOPICS = [
  // Sleep & energy
  "trouble falling asleep due to racing thoughts",
  "waking up exhausted despite sleeping enough",
  "insomnia related to anxiety",
  "feeling tired all the time / no energy",

  // Anxiety variants
  "general anxiety with no clear cause",
  "social anxiety before an event",
  "panic attacks / sudden chest tightness",
  "anxious about the future / spiraling thoughts",
  "anxious about money or job security",
  "health anxiety / worry about being sick",

  // Depression & low mood
  "feeling numb or empty",
  "low mood with no energy to do basic things",
  "feeling worthless or like a burden",
  "loss of interest in things they used to enjoy",
  "depressed for weeks but functioning outwardly",

  // Work & purpose
  "burnout from overwork",
  "imposter syndrome at a new job",
  "hating their current job but afraid to leave",
  "lack of motivation / can't start tasks",
  "feeling directionless / unsure what to do with life",

  // Relationships
  "going through a breakup",
  "lonely despite being around people",
  "feeling unheard by their partner",
  "conflict with a parent or sibling",
  "difficulty making friends as an adult",
  "feeling resentful toward someone",

  // Grief & loss
  "recent loss of a family member",
  "grief that comes in unexpected waves",
  "anniversary of someone's death feels heavy",
  "loss of a pet",

  // Self-image & confidence
  "negative body image / dissatisfied with appearance",
  "comparing self to others on social media",
  "self-doubt when speaking up at work",
  "feeling like a failure compared to peers",

  // Trauma adjacent (general, no specifics)
  "feeling stuck after a difficult past experience",
  "intrusive memories that come up unexpectedly",
  "feeling unsafe in their own body sometimes",

  // Daily overwhelm
  "everything feeling like too much at once",
  "decision fatigue / can't choose anything",
  "snapping at people they love over small things",
  "feeling like they're always behind",

  // Specific life events
  "moving to a new city and feeling isolated",
  "becoming a parent and feeling lost",
  "academic stress / exam pressure",
  "financial stress affecting mental state",

  // Physical-mental
  "stress causing physical symptoms (headaches, stomach)",
  "chronic pain wearing them down emotionally",

  // Hopeful / mixed
  "having a good day but afraid it won't last",
  "feeling slightly better after a hard month",
  "wanting to start a self-care habit but can't keep it up",

  // Identity
  "questioning whether they're a good person",
  "feeling fake / like everyone has it figured out except them",
];

export const TONE_VARIATIONS = [
  "casual, short message (1-2 sentences)",
  "long, rambling, vulnerable",
  "matter-of-fact and detached",
  "venting with frustration",
  "trying to sound okay but underneath is heavy",
  "asking for help directly",
];
