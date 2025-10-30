interface Domain {
  name: string;
  description: string;
  shortDescription: string;
  id: string;
  questions: {
    id: string;
    question: string;
    shortDescription?: string;
  }[];
}

export const domains: Record<string, Domain> = {
  innerCompass: {
    name: 'The Inner Compass',
    description: `Values are not abstract ideals to be listed on a worksheet; they are the active, orienting principles of a life. They function as an inner compass, providing direction in times of uncertainty and a standard against which decisions can be measured. Our core beliefs, in turn, are the lenses through which we interpret reality, shaping our perceptions and expectations. When actions are aligned with these foundational values and beliefs, the result is a sense of integrity and authenticity. When they are misaligned, the result is often frustration, cognitive dissonance, and a feeling of being adrift. A clear sense of purpose, which often arises from the application of one's core values to a meaningful goal, provides the motivational fuel for resilience and persistence, especially in the face of obstacles.
Clarity in this domain is the bedrock of a well-examined life. However, this clarity is rarely achieved by asking about values directly. A more effective method is to reverse-engineer them from lived experience. Our strongest emotions often act as powerful signals, flagging moments when a core value has been either honored or violated. A moment of intense pride after a difficult project points to underlying values like perseverance or excellence. A surge of anger in response to an injustice reveals a deep commitment to fairness. By examining these emotionally resonant moments, one can uncover the "moral DNA" embedded within personal stories. The following prompts are designed as investigative tools to explore this value space through the lens of specific decisions, sacrifices, moments of admiration, and sources of deep satisfaction.`,
    shortDescription: 'Values, Beliefs, and Purpose',
    id: 'innerCompass',
    questions: [
      {
        id: 'difficult-decision',
        shortDescription: 'Difficult decision',
        question:
          'Describe a decision you made that was difficult and unpopular with others, but which you knew in your gut was the right thing to do. What specific principle or value were you honoring that made it feel so correct?',
      },
      {
        id: 'angry-moment',
        shortDescription: 'Angry moment',
        question:
          'Recall a time you felt a profound sense of anger or indignation about a situation you witnessed or experienced. What unspoken "rule" about how the world should work was being violated?',
      },
      {
        id: 'admired-person',
        shortDescription: 'Admired person',
        question:
          'Think of a person you deeply admire, either personally or publicly. List three specific actions or qualities they possess that earn your admiration. What do these admired traits reveal about the values you hold most dear?',
      },
      {
        id: 'purposeful-project',
        shortDescription: 'Purposeful project',
        question:
          'If you knew you could not fail and all practical constraints were removed, what is the one project or cause you would dedicate your time to achieving? What does your answer reveal about what you believe your purpose is?',
      },
      {
        id: 'significant-sacrifice',
        shortDescription: 'Significant sacrifice',
        question:
          'Reflect on a time you made a significant sacrifice (of time, money, or opportunity) for someone or something else. What made that person or cause worthy of your sacrifice? What value does this point to?',
      },
      {
        id: 'most-alive-moment',
        shortDescription: 'Most alive moment',
        question:
          'When in your life have you felt most alive and true to yourself? Describe the circumstances in detail. What were you doing, who were you with, and what core part of your identity was being expressed?',
      },
      {
        id: 'belief-shift',
        shortDescription: 'Belief shift',
        question:
          'What is a belief you held strongly five years ago that you have since changed your mind about? Describe the process or experience that led to this shift in your worldview.',
      },
      {
        id: 'flow-activity',
        shortDescription: 'Flow activity',
        question:
          'Consider the activities that make you lose track of time—the ones that put you in a state of "flow." What is the inherent nature of these activities (e.g., problem-solving, creating, organizing, nurturing) that you find so engaging?',
      },
      {
        id: 'recurring-topic',
        shortDescription: 'Recurring topic',
        question:
          'What recurring topic or idea do you find yourself consistently bringing up in conversations or thinking about in your spare time? What deep-seated interest or passion does this point to?',
      },
      {
        id: 'proud-creation',
        shortDescription: 'Proud creation',
        question:
          'Describe something you have created or built that you are proud of (this could be anything from a piece of art to a well-organized spreadsheet to a strong relationship). What aspect of its creation gives you the most satisfaction?',
      },
      {
        id: 'injustice-problem',
        shortDescription: 'Injustice problem',
        question:
          'What is one injustice or problem in the world that, if you could, you would solve immediately? What does your choice say about your fundamental beliefs regarding responsibility and community?',
      },
      {
        id: 'desired-legacy',
        shortDescription: 'Desired legacy',
        question:
          'How do you want to be remembered by the people who matter most to you? Write down five adjectives you hope they would use to describe you. Which of these are you actively embodying now, and which require more focus?',
      },
    ],
  },
  emotionalLandscape: {
    name: 'The Emotional Landscape',
    description: `Emotions are not random, inconvenient interruptions to rational thought. They are vital streams of data, providing critical information about our internal state and our relationship to the world. An emotion like fear signals a potential threat, sadness indicates a loss, and joy points toward an experience that meets a deep need. Emotional intelligence, therefore, is the skill of accurately interpreting this data and using it to guide thought and action. This domain focuses on three core competencies: awareness (the ability to recognize and name one's own emotions), regulation (the ability to manage the intensity and expression of those emotions), and resilience (the ability to navigate and bounce back from emotional challenges).
 Effective reflection in this domain moves beyond analyzing single emotional events, or "storms," to identifying the recurring "weather patterns" of one's life. A single instance of anxiety is one data point; a consistent pattern of anxiety every Sunday evening is a trend that points to a systemic cause, such as unresolved stress about the upcoming work week. By acting as a meteorologist of the inner world, one can begin to map these recurring emotional states to specific contexts—people, places, and times—and analyze the underlying atmospheric conditions, such as unmet needs, limiting beliefs, or defensive coping mechanisms. The following prompts are designed to enhance this emotional literacy, helping to identify patterns, understand triggers, and develop healthier, more conscious responses.`,
    shortDescription: 'Awareness, Regulation, and Resilience',
    id: 'emotionalLandscape',
    questions: [
      {
        id: 'emotionalLandscape-1',
        shortDescription: 'Strong emotional reaction',
        question:
          'Recall a recent situation where you had a strong emotional reaction that felt disproportionate to the event. Trace the feeling backward in time. What was the initial trigger, and what earlier thoughts or events might have sensitized you to it?',
      },
      {
        id: 'emotionalLandscape-2',
        shortDescription: 'Recurring low-grade mood',
        question:
          'Identify a recurring, low-grade mood you often experience (e.g., irritability, melancholy, restlessness). For one week, keep a log of when this mood appears. Note the time, location, and what you were doing or thinking just before it emerged. What patterns do you notice?',
      },
      {
        id: 'emotionalLandscape-3',
        shortDescription: 'Primary coping mechanism',
        question:
          'Think about your primary coping mechanism when faced with high stress or emotional pain. Do you tend to analyze, withdraw, seek distraction, or confront the issue directly? How effective is this default strategy in the long term?',
      },
      {
        id: 'emotionalLandscape-4',
        shortDescription: 'Envy or jealousy',
        question:
          'Describe a time you felt envy or jealousy. What specific quality, possession, or circumstance in the other person triggered this feeling? What does this emotion reveal about an unmet desire or insecurity within yourself?',
      },
      {
        id: 'emotionalLandscape-5',
        shortDescription: 'Overshadowing anger',
        question:
          'Often, a "presenting emotion" like anger masks a more vulnerable underlying emotion like hurt or fear. Think of a recent time you felt angry. Can you identify a softer, more vulnerable feeling that might have been underneath it?',
      },
      {
        id: 'emotionalLandscape-6',
        shortDescription: 'Physical sensation',
        question:
          'What is a physical sensation in your body that consistently correlates with a specific emotion (e.g., a tight chest with anxiety, a hot face with embarrassment)? How can you use these bodily signals as an early warning system?',
      },
      {
        id: 'emotionalLandscape-7',
        shortDescription: 'Calm or contentment',
        question:
          'Describe a situation that consistently brings you a feeling of calm or contentment. Deconstruct the elements of that situation. What specific sensory inputs, activities, or mental states contribute to this feeling of peace?',
      },
      {
        id: 'emotionalLandscape-8',
        shortDescription: 'Reaction to criticism',
        question:
          'How do you typically react to receiving criticism or negative feedback? Describe your internal monologue and emotional response. What does this reveal about your relationship with self-worth and perfectionism?',
      },
      {
        id: 'emotionalLandscape-9',
        shortDescription: 'Pure, simple joy',
        question:
          'Reflect on a recent moment of pure, simple joy. What were you doing? Who were you with? How can you intentionally create more opportunities for this specific kind of experience in your life?',
      },
      {
        id: 'emotionalLandscape-10',
        shortDescription: 'Limiting belief',
        question:
          'What is one limiting belief you hold about your own emotional capacity (e.g., "I\'m not good at handling conflict," "I\'m too sensitive")? Where did this belief originate, and what evidence exists that might challenge it?',
      },
      {
        id: 'emotionalLandscape-11',
        shortDescription: 'Managing difficult emotions',
        question:
          'Think of a time you successfully managed a difficult emotion instead of letting it control you. What specific thought or action allowed you to regulate your response? What did you learn from this experience of emotional self-control?',
      },
      {
        id: 'emotionalLandscape-12',
        shortDescription: 'Difficult emotion to express',
        question:
          'What emotion do you find most difficult to express? What are your fears or beliefs about what would happen if you were to express it more openly and honestly?',
      },
    ],
  },
  tapestryOfConnections: {
    name: 'The Tapestry of Connections',
    description: `Human beings are fundamentally social creatures, defined and shaped by the intricate tapestry of their connections. Our sense of self is not forged in isolation but is continuously co-created through our interactions with others. This domain extends beyond romantic partners and family to encompass friendships, professional collaborations, and community ties. Reflection here focuses on the quality of these connections, the roles we habitually play within them, the balance of giving and receiving support, and the impact these relationships have on our well-being and personal growth.
 A powerful shift in perspective occurs when one ceases to view relationships as static entities and instead sees them as dynamic, interconnected systems. Within this frame, our relationships act as powerful mirrors, reflecting back our own patterns, attachment styles, and unresolved issues. A recurring conflict is often not just about a "problem person" but about a "problem dynamic" that we unconsciously help maintain. This reframes the challenge from one of blame to one of shared responsibility and empowerment; if a dynamic is co-created, one holds the power to change their contribution to it. This systemic view encourages an analysis of one's own role in maintaining the status quo, fostering empathy and a greater capacity for constructive change. The following prompts guide an exploration of these relational systems, the roles played within them, and the ways in which our connections both challenge and support our growth.`,
    shortDescription: 'Relationships and Social Self',
    id: 'tapestryOfConnections',
    questions: [
      {
        id: 'tapestryOfConnections-1',
        shortDescription: 'Primary constellation of relationships',
        question:
          'Map out your primary "constellation" of relationships (e.g., inner circle, secondary circle). For each key relationship, assess the flow of energy. Does this connection generally energize you or drain you? What factors contribute to this dynamic?',
      },
      {
        id: 'tapestryOfConnections-2',
        shortDescription: 'Conflict or misunderstanding',
        question:
          "Consider a recent conflict or misunderstanding. Without defending your own position, write the story of what happened from the other person's perspective, using what you know about their values, fears, and pressures. What new understanding does this exercise offer?",
      },
      {
        id: 'tapestryOfConnections-3',
        shortDescription: 'Most authentic relationship',
        question:
          'In which relationship do you feel most able to be your authentic self? What specific behaviors and attitudes from the other person (and yourself) create this sense of psychological safety?',
      },
      {
        id: 'tapestryOfConnections-4',
        shortDescription: 'Recurring pattern in relationships',
        question:
          'Identify a recurring pattern in your relationships (e.g., playing the caregiver, avoiding conflict, seeking validation). Where else in your life, past or present, has this pattern appeared? What core need or fear might be driving this behavior?',
      },
      {
        id: 'tapestryOfConnections-5',
        shortDescription: 'Stimulus value',
        question:
          'Reflect on your "stimulus value"—the impression you believe you make on people when they first meet you. What behaviors or aspects of your personality contribute to this first impression? How accurately does it reflect who you truly are?',
      },
      {
        id: 'tapestryOfConnections-6',
        shortDescription: 'Genuinely helpful support',
        question:
          'Think of a time you received support that was genuinely helpful. What did the other person do or say that made it so effective? Conversely, think of a time support was offered but missed the mark. What was the difference?',
      },
      {
        id: 'tapestryOfConnections-7',
        shortDescription: 'Unspoken rules',
        question:
          'Are there any unspoken "rules" that govern your most important relationships (e.g., "We don\'t talk about money," "It\'s not okay to express anger")? How do these rules serve or hinder the health of the connection?',
      },
      {
        id: 'tapestryOfConnections-8',
        shortDescription: 'Successfully repaired relationship',
        question:
          'Describe a time you successfully repaired a relationship after a conflict. What specific actions or words were crucial to the reconciliation process? What did you learn about forgiveness, either giving or receiving it?',
      },
      {
        id: 'tapestryOfConnections-9',
        shortDescription: 'Support for personal growth',
        question:
          'In what ways do the people closest to you support your personal growth? In what ways might they, consciously or unconsciously, hinder it?',
      },
      {
        id: 'tapestryOfConnections-10',
        shortDescription: 'Communication skills',
        question:
          'Evaluate your communication skills in a recent important conversation. Did you listen more than you spoke? Did you seek to understand before seeking to be understood? What is one aspect of your communication you could improve?',
      },
      {
        id: 'tapestryOfConnections-11',
        shortDescription: 'Relationship in need of attention',
        question:
          'Which relationship in your life currently requires more of your positive attention and effort? What is one specific, small action you can take this week to invest in that connection?',
      },
      {
        id: 'tapestryOfConnections-12',
        shortDescription: 'Contribution to community well-being',
        question:
          'How do you contribute to the well-being of the communities you are a part of (e.g., your family, workplace, neighborhood)? Where could your contribution be more intentional or impactful?',
      },
    ],
  },
  narrativeArc: {
    name: 'The Narrative Arc',
    description: `We make sense of our lives by weaving disparate events into an ongoing story. This "narrative identity" is the internal, evolving tale of who we are, where we have come from, and where we are going. This domain focuses on the conscious authorship of that story. While the facts of the past cannot be changed, our relationship to them can be. Through reflection, painful events can be reframed as sources of wisdom, and failures can be reinterpreted as crucial turning points. This process connects the lessons of the past to the deliberate creation of a compelling and meaningful future.
 A key element of a healthy narrative identity is the ability to construct a "redemptive narrative." This is not a story devoid of hardship, but one in which suffering and setbacks are ultimately redeemed by the growth, meaning, or positive outcomes they produce. A painful job loss, for example, can be narrated as the necessary catalyst that led to a more fulfilling career path. This is not an exercise in toxic positivity but an act of profound personal agency—the power to find meaning and benefit even in adversity. It is a practical application of a positive outlook, which is the ability to see opportunity in situations where others might only see a devastating setback. The following prompts are designed to help you act as the author of your life story, prompting you to revisit key "chapters," find the through-line of growth, and intentionally script the chapters yet to come.`,
    shortDescription: 'Past Experiences and Future Aspirations',
    id: 'narrativeArc',
    questions: [
      {
        id: 'narrativeArc-1',
        shortDescription: 'Major plot twist',
        question:
          'Identify a major "plot twist" or turning point in your life—an event that fundamentally altered your trajectory. How did this event change the story you were living? What new identity or path did it set you on?',
      },
      {
        id: 'narrativeArc-2',
        shortDescription: 'Significant failure or accomplishment',
        question:
          'Reflect on a significant failure or accomplishment from your past. What was the story you told yourself about this event at the time? From your current perspective, what is a wiser or more compassionate story you can tell about it now?',
      },
      {
        id: 'narrativeArc-3',
        shortDescription: 'Letter of advice to self',
        question:
          'If you were to write a letter of advice to your self from ten years ago, what are the three most important things you would tell them? What does this advice reveal about the most significant lessons you have learned?',
      },
      {
        id: 'narrativeArc-4',
        shortDescription: 'Challenge overcome',
        question:
          'Describe a challenge you overcame that you are particularly proud of. Detail the specific internal resources (e.g., courage, creativity, discipline) and external supports you drew upon to succeed.',
      },
      {
        id: 'narrativeArc-5',
        shortDescription: 'Painful memory',
        question:
          'What is a painful memory you tend to avoid thinking about? Without dwelling on the trauma, what is one strength you developed or one crucial lesson you learned as a direct result of navigating that experience?',
      },
      {
        id: 'narrativeArc-6',
        shortDescription: 'Future life',
        question:
          'Envision yourself five years from now, living a life that is deeply satisfying to you. Describe a typical day in that future life in vivid detail. What is the biggest difference between that life and your life today?',
      },
      {
        id: 'narrativeArc-7',
        shortDescription: 'Most important milestone',
        question:
          'Working backward from that five-year vision, what is the most important milestone you need to achieve in the next twelve months to make it a reality? What is the very first step?',
      },
      {
        id: 'narrativeArc-8',
        shortDescription: 'Story from family history',
        question:
          'What is a story from your family history or upbringing that has had a profound impact on shaping who you are today? How has this story influenced your beliefs about yourself and the world?',
      },
      {
        id: 'narrativeArc-9',
        shortDescription: 'Area of life stuck',
        question:
          'Consider an area of your life where you feel "stuck." What is the narrative you are telling yourself about this situation (e.g., "I\'m not good enough," "It\'s too late," "The circumstances are impossible")? What is an alternative, more empowering story you could choose to believe?',
      },
      {
        id: 'narrativeArc-10',
        shortDescription: 'Ambition or dream',
        question:
          'What was an ambition or dream you had when you were younger that you have since let go of? What did you learn from the process of pursuing it and eventually releasing it?',
      },
      {
        id: 'narrativeArc-11',
        shortDescription: 'Legacy',
        question:
          'What legacy do you want to leave? When your story is finished, what impact do you want to have had on the people and world around you?',
      },
      {
        id: 'narrativeArc-12',
        shortDescription: 'Most important lesson',
        question:
          'Look back at the last year. What was the most important lesson you learned, and how has it changed the way you approach your life today?',
      },
    ],
  },
  engineOfGrowth: {
    name: 'The Engine of Growth',
    description: `This domain focuses on the dynamic interplay between capability and application. It involves a clear-eyed assessment of one's personal assets and a strategic consideration of how they can be deployed to create value in the world. It is useful to differentiate between strengths and skills. Strengths are innate talents and patterns of thought, feeling, and behavior that are authentic, energizing, and lead to effective performance. Skills, by contrast, are competencies that are learned and developed through practice. While both are crucial, growth is often most profound and sustainable when it is built around the cultivation and application of natural strengths.
 The ultimate aim of developing these capabilities is contribution. A sense of fulfillment and purpose often arises not from merely possessing strengths and skills, but from applying them to meet a genuine need—whether in one's career, family, or community. The most impactful and satisfying work often lies at the intersection of what one is uniquely good at and what the world truly needs. This moves the focus from a self-centered inventory of "what am I good at?" to a more service-oriented question: "What problems am I uniquely equipped to solve?" This framework provides a powerful formula for personal and professional development: Contribution = (Strengths + Skills) x (Addressing a Need). The following prompts are designed to help you identify your unique capabilities, understand how to develop them, and align them with opportunities for meaningful contribution.`,
    shortDescription: 'Strengths, Skills, and Contributions',
    id: 'engineOfGrowth',
    questions: [
      {
        id: 'engineOfGrowth-1',
        shortDescription: 'In the zone',
        question:
          'Describe a time you felt "in the zone" or completely absorbed and effective in an activity. Deconstruct that experience: what specific strengths (e.g., strategic thinking, empathy, focus) and skills (e.g., public speaking, data analysis) were you using?',
      },
      {
        id: 'engineOfGrowth-2',
        shortDescription: 'Problems or challenges',
        question:
          'What kinds of problems or challenges do friends, family, or colleagues consistently bring to you for help or advice? What does this pattern reveal about the strengths others perceive in you?',
      },
      {
        id: 'engineOfGrowth-3',
        shortDescription: 'Skill to develop',
        question:
          'Identify one skill that, if you developed it over the next year, would have the greatest positive impact on your personal or professional life. What is the first concrete step you can take to begin learning it?',
      },
      {
        id: 'engineOfGrowth-4',
        shortDescription: 'Biggest professional accomplishment',
        question:
          'Reflect on your biggest professional accomplishment. What personal qualities were just as important to that success as your technical skills?',
      },
      {
        id: 'engineOfGrowth-5',
        shortDescription: 'Weakness or growth edge',
        question:
          'What is a weakness or "growth edge" that you have consciously decided is not a priority to fix? Explain your reasoning for choosing to focus on your strengths instead.',
      },
      {
        id: 'engineOfGrowth-6',
        shortDescription: 'Job craft',
        question:
          'Consider your current job or primary role. How could you "job craft" or reshape your responsibilities to spend 10% more of your time using your greatest strengths?',
      },
      {
        id: 'engineOfGrowth-7',
        shortDescription: 'Talent to develop',
        question:
          'What is a talent you possess that you currently underutilize? Brainstorm three new ways you could apply this talent in your life or work.',
      },
      {
        id: 'engineOfGrowth-8',
        shortDescription: 'Teaching',
        question:
          'Think about a time you taught someone else how to do something effectively. What did the act of teaching reveal to you about your own level of mastery and your way of thinking about the subject?',
      },
      {
        id: 'engineOfGrowth-9',
        shortDescription: 'Most constructive piece of feedback',
        question:
          'What is the most constructive piece of feedback you have ever received? How did you incorporate it, and how did it contribute to your growth?',
      },
      {
        id: 'engineOfGrowth-10',
        shortDescription: 'Unique contribution',
        question:
          'Beyond your job description, what is your unique contribution to your team or organization? What is the value that you, specifically, bring to the table?',
      },
      {
        id: 'engineOfGrowth-11',
        shortDescription: 'Area of life playing small',
        question:
          'In what area of your life are you currently "playing small" when you know you have the potential to do more? What fear or limiting belief is holding you back from stepping into your full capability?',
      },
      {
        id: 'engineOfGrowth-12',
        shortDescription: 'Wisdom to share',
        question:
          'What is one thing you know now that you wish you had known at the beginning of your career? How can you share that wisdom to contribute to the growth of someone who is just starting out?',
      },
    ],
  },
};
