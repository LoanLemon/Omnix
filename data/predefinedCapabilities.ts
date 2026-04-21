
import { Capability } from '../types';

export const predefinedCapabilities: Capability[] = [
  {
    id: 'cap_predefined_1',
    tag: 'TODAY',
    description: 'Returns the current date in a localized string format.',
    functionBody: `function() {
  // Returns today's date, e.g., "7/26/2024"
  return new Date().toLocaleDateString();
}`,
  },
  {
    id: 'cap_predefined_2',
    tag: 'SAY',
    description: 'A simple function that returns the text passed to it. Usage: [SAY "Hello World"]',
    functionBody: `function(...args) {
  const text = args.join(' ');
  if (!text) return '';
  let trimmedText = text.trim();
  
  // Remove potential surrounding quotes from the user's input before adding our own
  if ((trimmedText.startsWith('"') && trimmedText.endsWith('"')) || (trimmedText.startsWith("'") && trimmedText.endsWith("'"))) {
    trimmedText = trimmedText.slice(1, -1);
  }

  return \`Okay: "\${trimmedText}"\`;
}`,
  },
  {
    id: 'cap_predefined_3',
    tag: 'CALCULATE',
    description: 'Performs a basic math calculation. Usage: [CALCULATE 2 + 2]',
    functionBody: `function(...args) {
  // A simple and safe math evaluator
  let expression = args.join(' ');
  // Replace words with symbols
  expression = expression.replace(/\\bplus\\b/gi, '+')
                         .replace(/\\bminus\\b/gi, '-')
                         .replace(/\\btimes\\b/gi, '*')
                         .replace(/\\bdivided by\\b/gi, '/');
  // Remove anything that's not part of a safe calculation
  expression = expression.replace(/[^0-9+\\-*\\/().\\s]/g, '');

  if (!expression) return 'Invalid calculation';
  try {
    // Using Function constructor for safer evaluation than eval()
    const result = new Function('return ' + expression)();
    if (typeof result !== 'number' || !isFinite(result)) {
        return "I couldn't calculate that.";
    }
    return result;
  } catch (error) {
    console.error("Calculation error:", error);
    return "I couldn't calculate that.";
  }
}`,
  },
  {
    id: 'cap_predefined_4',
    tag: 'SOLVE_BAT_AND_BALL',
    description: 'Solves the bat and ball logic puzzle with dynamic values.',
    functionBody: `function(...args) {
      const sentence = args.join(' ');
      if (!sentence) return "I need the full puzzle to solve it.";

      // Find all numbers, including decimals, optionally prefixed with '$'
      const numbers = sentence.match(/\\$?\\d*\\.?\\d+/g);
      if (!numbers || numbers.length < 2) {
        return "I couldn't find two numbers in the puzzle. Please state the total cost and the difference clearly.";
      }
      
      const parsedNumbers = numbers.map(n => parseFloat(n.replace('$', ''))).sort((a, b) => b - a);
      
      const totalCost = parsedNumbers[0];
      const difference = parsedNumbers[1];

      if (isNaN(totalCost) || isNaN(difference) || totalCost <= difference) {
         return "That's a tricky one! The numbers in the puzzle don't seem to make sense.";
      }
      
      const ballCost = (totalCost - difference) / 2;
      
      if (ballCost < 0 || !isFinite(ballCost)) {
        return "That's a tricky one! The numbers don't seem to work out logically.";
      }

      // Helper to format currency nicely
      const formatCurrency = (value) => {
        if (value < 1 && value > 0) {
            const cents = Math.round(value * 100);
            return cents + (cents === 1 ? " cent" : " cents");
        }
        return '$' + value.toFixed(2);
      };

      const ballCostFormatted = formatCurrency(ballCost);
      
      return \`The ball costs \${ballCostFormatted}. Let me explain: if the ball's cost is X, the bat costs X + \${formatCurrency(difference)}. Together they are \${formatCurrency(totalCost)}. So, X + (X + \${formatCurrency(difference)}) = \${formatCurrency(totalCost)}. This simplifies to 2X = \${formatCurrency(totalCost - difference)}, which means X, the cost of the ball, is \${ballCostFormatted}.\`;
    }`
  },
  {
    id: 'cap_predefined_5',
    tag: 'PROCESS_SHOPPING_LIST',
    description: 'Parses a string of items and adds them to a shopping list in memory.',
    functionBody: `function(...args) {
    const text = args.join(' ');
    if (!text) return "What would you like to buy?";

    const conversationalWords = new Set(['hello', 'hi', 'hey', 'thanks', 'ok', 'okay', 'bye', 'goodbye', 'please', 'cool', 'yes', 'no']);

    // Standardize separators like "like", "or maybe", "or", and "and" to commas.
    const cleanedText = text
        .replace(/\\s+like\\s+/gi, ', ')
        .replace(/\\s+or\\s+maybe\\s+/gi, ', ')
        .replace(/\\s+or\\s+/gi, ', ')
        .replace(/\\s+and\\s+/gi, ', ');

    // Split into items and clean each one up.
    const items = cleanedText.split(',')
        .map(item => item.trim().replace(/^(some|new|a pair of|an|a)\\s+/i, '').trim())
        .filter(item => {
          const lowerItem = item.toLowerCase().replace(/[.!?]/g, '');
          return item && item.length > 1 && !conversationalWords.has(lowerItem);
        });

    if (items.length === 0) {
        return "I'm not sure what you'd like to add to the list. Could you clarify?";
    }
    
    let currentList = this._state.memory.get('user_shopping_list') || [];
    if (!Array.isArray(currentList)) {
        currentList = [currentList];
    }

    const addedItems = items.filter(item => !currentList.some(existing => existing.toLowerCase() === item.toLowerCase()));
    
    if (addedItems.length === 0) {
        const itemText = items.length > 1 ? 'Those items are' : 'That item is';
        return \`Looks like \${itemText} already on your list! Anything else?\`;
    }

    const newList = [...currentList, ...addedItems];
    this._state.memory.set('user_shopping_list', newList);
    
    if (addedItems.length === 1) {
        return \`Okay, I've added "\${addedItems[0]}" to your shopping list.\`;
    }
    
    return "Great, I've added those items to your list!";
}`
  },
  {
      id: 'cap_predefined_6',
      tag: 'FORMAT_SHOPPING_LIST',
      description: 'Formats the shopping list from memory into a nice string.',
      functionBody: `function() {
          const list = this._state.memory.get('user_shopping_list');
          if (!list || !Array.isArray(list) || list.length === 0) {
              return 'nothing yet';
          }
          if (list.length === 1) {
              return list[0];
          }
          if (list.length === 2) {
              return list.join(' and ');
          }
          const lastItem = list[list.length - 1];
          const otherItems = list.slice(0, -1);
          return otherItems.join(', ') + ', and ' + lastItem;
      }`
  },
  {
      id: 'cap_predefined_7',
      tag: 'RECALL_ALL_GOALS',
      description: 'Recalls all user goals from memory.',
      functionBody: `function() {
          const goals = [];
          const genericGoal = this._state.memory.get('user_goal');
          const budget = this._state.memory.get('user_spending_budget');
          const shoppingList = this._state.memory.get('user_shopping_list');
  
          if (genericGoal) {
              goals.push(\`your general goal is to \${genericGoal}\`);
          }
          if (budget) {
              goals.push(\`you have a budget of $\${budget} to spend\`);
          }
          if (shoppingList && Array.isArray(shoppingList) && shoppingList.length > 0) {
              const formatListCapability = this._capabilities.get('FORMAT_SHOPPING_LIST');
              if (formatListCapability && typeof formatListCapability.functionBody === 'string') {
                  const formatListFn = eval('(' + formatListCapability.functionBody + ')');
                  if (typeof formatListFn === 'function') {
                      const formattedList = formatListFn.call(this);
                      goals.push(\`you want to buy: \${formattedList}\`);
                  }
              }
          }
  
          if (goals.length === 0) {
              return "You haven't mentioned any specific goals yet. How can I help you today?";
          }
          if (goals.length === 1) {
              return \`Based on our conversation, I know that \${goals[0]}.\`;
          }
  
          return \`Based on our conversation, here are the goals I'm tracking for you: \${goals.join('; ')}.\`;
      }`
  },
  {
    id: 'cap_predefined_8',
    tag: 'LIST_ALL_CAPABILITIES',
    description: 'Lists a summary of built-in functions and all custom-defined capabilities.',
    functionBody: `function() {
    let response = "My core purpose is " + this._botPurpose + ". I can answer questions from my knowledge base, remember key details, and perform a variety of tasks. Here is a breakdown of my abilities:";
    
    const customCaps = this._capabilities ? Array.from(this._capabilities.values()) : [];
    
    const predefined = customCaps.filter(c => c.id.startsWith('cap_predefined_') && c.tag !== 'LIST_ALL_CAPABILITIES');
    const userDefined = customCaps.filter(c => !c.id.startsWith('cap_predefined_') && c.tag !== 'NEW_TAG');
    
    if (predefined.length > 0) {
        response += "\\n\\n**Built-in Capabilities:**";
        const predefinedList = predefined.map(c => "\\n- **" + c.tag + "** - " + c.description).join('');
        response += predefinedList;
    }

    if (userDefined.length > 0) {
        response += "\\n\\n**Your Custom Capabilities:**";
        const userDefinedList = userDefined.map(c => "\\n- **" + c.tag + "** - " + c.description).join('');
        response += userDefinedList;
    } else {
        response += "\\n\\nYou haven't added any custom capabilities for me yet. You can add some in Stage 6!";
    }
    
    return response;
}`
  },
  {
    id: 'cap_predefined_9',
    tag: 'CALCULATE_SPENDING',
    description: 'Calculates the remaining budget after a potential purchase and asks for confirmation.',
    functionBody: `function(...args) {
    const message = args.join(' ').toLowerCase();
    const budget = this._state.memory.get('user_spending_budget');

    if (budget === undefined) {
        return "I don't seem to know your current budget. Could you tell me how much you have to spend?";
    }

    let cost = null;
    let item = 'the item';
    
    // Regex for statements like "The shoes cost $10"
    const costStatementMatch = message.match(/(?:the\\s+)?(?<item_stmt>[a-z\\s]+?)\\s+costs?\\s+\\$?(?<cost_stmt>[\\d\\.]+)/);
    
    // Regex for questions like "How much if I buy shoes for $6"
    const buyQuestionMatch = message.match(/(?:buy|purchase|get)\\s+(?:some\\s|a\\s|an\\s|the\\s)?(?<item_buy>[a-z\\s]+?)(?:\\s+for|\\s+that cost|\\s+at)?\\s+\\$?(?<cost_buy>[\\d\\.]+)/);
    
    if (costStatementMatch && costStatementMatch.groups) {
        item = costStatementMatch.groups.item_stmt.trim();
        cost = parseFloat(costStatementMatch.groups.cost_stmt);
    } else if (buyQuestionMatch && buyQuestionMatch.groups) {
        item = buyQuestionMatch.groups.item_buy.trim();
        cost = parseFloat(buyQuestionMatch.groups.cost_buy);
    }

    if (cost === null) {
        // If cost is still not found, set pending action
        const potentialItemMatch = message.match(/(?:for|buy|get)\\s+(?:the\\s)?(?<item_name>[a-z\\s]+)/);
        item = potentialItemMatch?.groups?.item_name?.trim() || 'the item';
        this._state.pendingAction = { type: 'ASK_FOR_COST', item: item };
        return \`I couldn't figure out the cost of the \${item} from your question. How much is it?\`;
    }
    
    if (isNaN(cost)) {
        return "I'm not sure how much that costs. Can you clarify the price?";
    }

    if (cost > budget) {
        return \`You don't have enough for that. Your budget is $\${budget.toFixed(2)}, but the \${item} costs $\${cost.toFixed(2)}.\`;
    }

    const remaining = budget - cost;
    
    this._state.pendingAction = {
        type: 'CONFIRM_PURCHASE',
        item: item,
        cost: cost,
        newBudget: remaining
    };

    return \`Since you have $\${budget.toFixed(2)}, and the \${item} costs $\${cost.toFixed(2)}, you would be left with $\${remaining.toFixed(2)}. Are you going to buy the \${item}?\`;
}`
  },
  {
    id: 'cap_predefined_10',
    tag: 'ASK_FOR_SHOPPING_ITEMS',
    description: 'Asks the user what they want to buy and sets a pending action to process the list.',
    functionBody: `function() {
      this._state.pendingAction = { type: 'AWAITING_SHOPPING_LIST' };
      return "Shopping spree it sounds like! Any ideas on what you want to buy?";
    }`
  },
  {
    id: 'cap_predefined_11',
    tag: 'DRAW_PROCESS_MAP',
    description: 'Renders a predefined process map to an SVG string.',
    functionBody: `function(processName) {
      if (!processName) {
        const availableMaps = this._processDefinitionMap ? Array.from(this._processDefinitionMap.keys()).join(', ') : 'none';
        return \`Please specify which process map to draw. For example: 'Draw the auto loan process map'. Available maps: \${availableMaps}.\`;
      }
      if (!this._processDefinitionMap) {
        return '[Error: Process map definitions not available in this context.]';
      }
      const processData = this._processDefinitionMap.get(processName);
      if (!processData) {
          return \`[Error: Process map "\${processName}" not found]\`;
      }
      // This capability relies on renderProcessMapToSvg being available in the execution scope.
      // The main app and export scripts ensure this.
      return renderProcessMapToSvg(processData.svgData);
    }`
  },
  {
    id: 'cap_predefined_12',
    tag: 'GENERATE_GRAPH',
    description: 'Dynamically generates an SVG bar chart from a natural language prompt.',
    functionBody: `function(...args) {
    const fullPrompt = args.join(' ');

    const dataPairs = [];
    const dataRegex = /(?<label>[a-zA-Z0-9\\s]+?)\\s*,\\s*(?<value>[\\d.]+)/g;
    const dataString = fullPrompt.split(/with data:|data:|:/i)[1] || fullPrompt;

    let match;
    while ((match = dataRegex.exec(dataString)) !== null) {
        if(match.groups && match.groups.label && match.groups.value) {
            dataPairs.push({ label: match.groups.label.trim(), value: parseFloat(match.groups.value) });
        }
    }

    if (dataPairs.length === 0) {
        return "I couldn't find any data in your request. Please format it like '...with data: Label 1, 10; Label 2, 20'.";
    }

    const titleRegex = /(?:chart of|graph of|of|for)\\s+["']?(?<title>[\\w\\s]+?)["']?(?=\\s+with data|\\s+with|\\s*:|$)/i;
    const titleMatch = fullPrompt.match(titleRegex);
    const chartTitle = titleMatch && titleMatch.groups && titleMatch.groups.title ? titleMatch.groups.title.trim() : 'Generated Graph';

    const width = 500;
    const height = 330;
    const margin = { top: 50, right: 20, bottom: 80, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxValue = Math.max(0, ...dataPairs.map(d => d.value));
    const barPadding = 0.2;
    const barWidth = chartWidth / dataPairs.length;

    let svgContent = '';

    // Y-axis and grid lines
    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
        const tickValue = (maxValue / numTicks) * i;
        const y = margin.top + chartHeight - (tickValue / maxValue) * chartHeight;
        svgContent += \`<line x1="\${margin.left - 5}" y1="\${y}" x2="\${width - margin.right}" y2="\${y}" stroke="#44403c" stroke-dasharray="2" />\`;
        svgContent += \`<text x="\${margin.left - 10}" y="\${y + 4}" text-anchor="end" font-size="12" fill="#a8a29e">\${tickValue.toFixed(0)}</text>\`;
    }
    
    // Bars and labels
    dataPairs.forEach((d, i) => {
        const barHeight = (d.value / maxValue) * chartHeight;
        const x = margin.left + i * barWidth;
        const y = margin.top + chartHeight - barHeight;
        
        svgContent += \`<rect x="\${x + barWidth * barPadding / 2}" y="\${y}" width="\${barWidth * (1 - barPadding)}" height="\${barHeight}" fill="#f59e0b" />\`;
        
        svgContent += \`<text x="\${x + barWidth / 2}" y="\${y - 5}" text-anchor="middle" font-size="12" fill="#d6d3d1" font-weight="bold">\${d.value}</text>\`;
        
        svgContent += \`<text transform="translate(\${x + barWidth / 2}, \${height - margin.bottom + 20}) rotate(-45)" text-anchor="end" font-size="12" fill="#a8a29e">\${d.label}</text>\`;
    });

    // Axes lines
    svgContent += \`<line x1="\${margin.left}" y1="\${margin.top}" x2="\${margin.left}" y2="\${height - margin.bottom}" stroke="#a8a29e" stroke-width="2"/>\`; // Y-axis
    svgContent += \`<line x1="\${margin.left}" y1="\${height - margin.bottom}" x2="\${width - margin.right}" y2="\${height - margin.bottom}" stroke="#a8a29e" stroke-width="2"/>\`; // X-axis

    // Title
    svgContent += \`<text x="\${width / 2}" y="\${margin.top / 2}" text-anchor="middle" font-size="18" font-weight="bold" fill="#fcd34d">\${chartTitle.replace(/\\b\\w/g, l => l.toUpperCase())}</text>\`;

    const fullSvg = \`<svg width="\${width}" height="\${height}" xmlns="http://www.w3.org/2000/svg" font-family="sans-serif">\${svgContent}</svg>\`;

    this._currentResponseSVG = fullSvg;
    return "Certainly. Here is the graph generated from your data.";
}`
  },
  {
    id: 'cap_predefined_13',
    tag: 'WRITE_JS_FILE',
    description: "Writes or updates a JavaScript file by triggering a download.",
    functionBody: `function(filename, ...contentParts) {
      if (!filename) return "To use this capability, provide a filename and content. For example: [WRITE_JS_FILE 'example.js' 'console.log(\\"hello\\");']";
      const content = contentParts.join(' ');
      if (!content) return 'Error: Content is required for the file.';
      
      try {
        const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return \`The file "\${filename}" has been successfully prepared for download.\`;
      } catch (error) {
        console.error("File download error:", error);
        return \`An error occurred while trying to create "\${filename}" for download.\`;
      }
    }`
  },
  {
    id: 'cap_predefined_14',
    tag: 'WRITE_JSON_FILE',
    description: "Writes or updates a JSON file by triggering a download.",
    functionBody: `function(filename, ...contentParts) {
      if (!filename) return "To use this capability, provide a filename and content. For example: [WRITE_JSON_FILE 'data.json' '{\\"key\\": \\"value\\"}']";
      const content = contentParts.join(' ');
      if (!content) return 'Error: Content is required for the file.';
      
      try {
        const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return \`The file "\${filename}" has been successfully prepared for download.\`;
      } catch (error) {
        console.error("File download error:", error);
        return \`An error occurred while trying to create "\${filename}" for download.\`;
      }
    }`
  },
  {
    id: 'cap_predefined_15',
    tag: 'WRITE_HTML_FILE',
    description: "Writes or updates an HTML file by triggering a download.",
    functionBody: `function(filename, ...contentParts) {
      if (!filename) return "To use this capability, provide a filename and content. For example: [WRITE_HTML_FILE 'index.html' '<h1>Hello</h1>']";
      const content = contentParts.join(' ');
      if (!content) return 'Error: Content is required for the file.';
      
      try {
        const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return \`The file "\${filename}" has been successfully prepared for download.\`;
      } catch (error) {
        console.error("File download error:", error);
        return \`An error occurred while trying to create "\${filename}" for download.\`;
      }
    }`
  },
  {
    id: 'cap_predefined_16',
    tag: 'WRITE_GRAPH_FILE',
    description: "Writes or updates an SVG graph file by triggering a download.",
    functionBody: `function(filename, ...contentParts) {
      if (!filename) return "To use this capability, provide a filename and SVG content. For example: [WRITE_GRAPH_FILE 'my_chart.svg' '<svg>...</svg>']";
      const content = contentParts.join(' ');
      if (!content) return 'Error: Content is required for the file.';
      
      try {
        const blob = new Blob([content], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return \`The file "\${filename}" has been successfully prepared for download.\`;
      } catch (error) {
        console.error("File download error:", error);
        return \`An error occurred while trying to create "\${filename}" for download.\`;
      }
    }`
  },
  {
    id: 'cap_predefined_17',
    tag: 'ROLL_DICE',
    description: "Rolls a die with a specified number of sides. Usage: [ROLL_DICE 20]",
    functionBody: `function(sidesStr) {
      const sides = parseInt(sidesStr, 10) || 20;
      const roll = Math.floor(Math.random() * sides) + 1;
      let resultText = \`You rolled a \${roll} on a d\${sides}.\`;
      if (roll === 1) resultText += " (Critical Fail!)";
      if (roll === sides) resultText += " (Critical Hit!)";
      return resultText;
    }`
  }
];
