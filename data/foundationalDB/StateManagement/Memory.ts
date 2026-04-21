import { FoundationalKnowledge } from '../../types';

export const STATE_MANAGEMENT_MEMORY_KNOWLEDGE: FoundationalKnowledge = [
  // --- Memory Triggers ---
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureUserName", "importance": 1.0,
    "input_pattern_regex": "(?:my name is|you can call me|i'm called|call me)\\s+([a-zA-Z\\s]+)",
    "memory_key": "user_name",
    "output_template": "It's a pleasure to meet you, [UserName]! I'll remember that."
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureUserFavoriteThing", "importance": 0.8,
    "input_pattern_regex": "(?:my favorite (?:\\w+\\s)*?\\b(?:is|are)|i like|i love) (.+)",
    "memory_key": "user_favorite_thing",
    "output_template": "That's great! I'll keep in mind that you like [UserFavoriteThing]."
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureUserLocation", "importance": 1.0,
    "input_pattern_regex": "(?:i am in|i'm in|my location is) ([\\w\\s,]+)",
    "memory_key": "user_location",
    "output_template": "Got it, you're in [UserLocation]. I'll remember that in case you ask about local info!"
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureUserGoal", "importance": 0.9,
    "input_pattern_regex": "(?:my goal is to|i want to|i'm trying to) ([\\w\\s]+)",
    "memory_key": "user_goal",
    "output_template": "Okay, so your goal is to [UserGoal]. I'll keep that in mind and try to help you achieve it."
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureUserID", "importance": 1.0,
    "input_pattern_regex": "(?:user id is|my id is) (\\w+)",
    "memory_key": "user_id",
    "output_template": "Noted. I have saved your User ID."
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureUserDepartment", "importance": 1.0,
    "input_pattern_regex": "(?:i work in|i am in the) (\\w+\\s*department)",
    "memory_key": "user_department",
    "output_template": "Okay, I've noted that you work in the [UserDepartment]."
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureCalculation", "importance": 1.1,
    "input_pattern_regex": "(?:calculate|what is|what's|compute|solve|how much is)\\s+((?:[\\d\\s\\.\\+\\-\\*\\/\\(\\)]|plus|minus|times|divided by)+)",
    "memory_key": "calculation_string",
    "output_template": "[CALCULATE [CalculationString]]"
  },
  {
    "category": "Utility", "type": "MemoryTrigger", "topic": "CaptureSayCommand", "importance": 1.1,
    "input_pattern_regex": "^(?:say|repeat|echo|shout|tell me to say)\\s+(.*?)$",
    "memory_key": "say_string",
    "output_template": "[SAY [SayString]]"
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureSpendingGoal", "importance": 1.2,
    "input_pattern_regex": "i have (?:\\$(\\d+\\.?\\d*)|(\\d+\\.?\\d*)\\s*(?:dollars?|bucks?)|(\\d+\\.?\\d*).+to spend)",
    "memory_key": "user_spending_budget",
    "output_template": "[ASK_FOR_SHOPPING_ITEMS]"
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureShoppingList", "importance": 1.1,
    "input_pattern_regex": "(?:i want to buy|i need to (?:buy|get)|i'm buying|add to my list|get me|i'd like to buy|i (?:was|am|'m) thinking about|i(?:'m| am) going to buy)\\s+(?:some|new|a pair of|an|a)?\\s*(.+)",
    "memory_key": "user_shopping_list_string",
    "output_template": "[PROCESS_SHOPPING_LIST [UserShoppingListString]]"
  },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "StartShopping", "importance": 1.0,
    "input_pattern_regex": "\\b(shopping|shop for)\\b",
    "output_template": "[ASK_FOR_SHOPPING_ITEMS]"
   },
  {
    "category": "Memory", "type": "MemoryTrigger", "topic": "CaptureItemCost", "importance": 1.2,
    "input_pattern_regex": "(?:the\\s+)?([a-zA-Z\\s]+?)(?:\\s+is|\\s+are|\\s+costs?|\\s+is going to cost|\\s+are going to cost)\\s+\\$?(\\d+\\.?\\d*)",
    "memory_key": "user_message", 
    "output_template": "[CALCULATE_SPENDING [UserMessage]]",
    "memory_prerequisite": "user_spending_budget"
  },


  // --- Personalized Responses (using memory) ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "PersonalizedFarewell", "importance": 0.9,
    "input_pattern": "FAREWELL",
    "memory_prerequisite": "user_name",
    "output_template": "{3860}, [UserName]! Have a {3968} day."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserName", "importance": 1.0,
    "input_pattern": "RECALL_USER_NAME",
    "memory_prerequisite": "user_name",
    "output_template": "Your current name is [UserName]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserName_Variation2", "importance": 1.0,
    "input_pattern": "RECALL_USER_NAME",
    "memory_prerequisite": "user_name",
    "output_template": "You mentioned your name is [UserName]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserName_Variation3", "importance": 1.0,
    "input_pattern": "RECALL_USER_NAME",
    "memory_prerequisite": "user_name",
    "output_template": "I have your name down as [UserName]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserName_Variation4", "importance": 1.0,
    "input_pattern": "RECALL_USER_NAME",
    "memory_prerequisite": "user_name",
    "output_template": "If I remember correctly, your name is [UserName]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserName_Fallback", "importance": 1.0,
    "input_pattern": "RECALL_USER_NAME",
    "output_template": "You haven't told me your name yet."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallFirstUserName", "importance": 1.0,
    "input_pattern": "RECALL_FIRST_USER_NAME",
    "memory_prerequisite": "user_names",
    "output_template": "The first name you told me was [FirstUserName]. Your current name is [UserName]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallFirstUserName_Fallback", "importance": 0.9,
    "input_pattern": "RECALL_FIRST_USER_NAME",
    "output_template": "You haven't told me any previous names."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "RecallFavoriteThing", "importance": 1.0,
    "input_pattern": "RECALL_USER_FAVORITE",
    "memory_prerequisite": "user_favorite_thing",
    "output_template": "You mentioned that you like [UserFavoriteThing]."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "RecallFavoriteThing_Fallback", "importance": 1.0,
    "input_pattern": "RECALL_USER_FAVORITE",
    "output_template": "You haven't told me about your favorite things yet."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideWeatherForMemory", "importance": 0.8,
    "input_pattern": "CHECK_WEATHER",
    "memory_prerequisite": "user_location",
    "output_template": "The current weather for [UserLocation] is [Temperature] and [Condition]. The forecast for today is [Forecast]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserGoal", "importance": 1.0,
    "input_pattern": "RECALL_USER_GOAL",
    "output_template": "[RECALL_ALL_GOALS]"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserID", "importance": 1.0,
    "input_pattern": "RECALL_USER_ID",
    "memory_prerequisite": "user_id",
    "output_template": "Your user ID is [UserId]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserID_Fallback", "importance": 1.0,
    "input_pattern": "RECALL_USER_ID",
    "output_template": "I don't have a user ID stored for you."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserDepartment", "importance": 1.0,
    "input_pattern": "RECALL_USER_DEPARTMENT",
    "memory_prerequisite": "user_department",
    "output_template": "I have you down as working in the [UserDepartment]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallUserDepartment_Fallback", "importance": 1.0,
    "input_pattern": "RECALL_USER_DEPARTMENT",
    "output_template": "I don't have a department stored for you."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallAllUserInfo", "importance": 1.0,
    "input_pattern": "RECALL_ALL_USER_INFO",
    "output_template": "[AllMemoryItems]"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallShoppingList", "importance": 1.0,
    "input_pattern": "RECALL_SHOPPING_LIST",
    "memory_prerequisite": "user_shopping_list",
    "output_template": "Your shopping list includes: [FORMAT_SHOPPING_LIST]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallShoppingList_Fallback", "importance": 1.0,
    "input_pattern": "RECALL_SHOPPING_LIST",
    "output_template": "You haven't made a shopping list yet."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallSpendingBudget", "importance": 1.0,
    "input_pattern": "RECALL_SPENDING_BUDGET",
    "memory_prerequisite": "user_spending_budget",
    "output_template": "You mentioned you have a budget of $[UserSpendingBudget] to spend."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecallSpendingBudget_Fallback", "importance": 1.0,
    "input_pattern": "RECALL_SPENDING_BUDGET",
    "output_template": "You haven't set a spending budget yet."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "InquireSpendingImpact", "importance": 1.2,
    "input_pattern": "INQUIRE_SPENDING_IMPACT",
    "memory_prerequisite": "user_spending_budget",
    "output_template": "[CALCULATE_SPENDING [UserMessage]]"
  },
  {
    "category": "StateManagement", "type": "Example", "topic": "Example_RecallGoals", "importance": 1.2,
    "input_pattern": "EXAMPLE_RECALL_GOALS",
    "output_template": "Certainly. For instance, if you had previously told me your goals were to 'learn guitar' and 'organize the garage', and then you asked me to recall your goals, I would respond with a summary of those items."
  },
  {
    "category": "StateManagement", "type": "Example", "topic": "Example_CalculateSpending", "importance": 1.2,
    "input_pattern": "EXAMPLE_CALCULATE_SPENDING",
    "output_template": "Of course. If you told me your budget was $50 and then mentioned 'the book costs $15', I would calculate that you would have $35 left and ask if you'd like to confirm the purchase."
  },
  {
      "category": "StateManagement", "type": "Example", "topic": "Example_ProcessShoppingList", "importance": 1.3,
      "input_pattern": "EXAMPLE_PROCESS_SHOPPING_LIST",
      "output_template": "Certainly. For example, if you say 'I need to buy some milk, eggs, and bread', I would identify those three items and add them to a shopping list that I remember for you."
  }
];