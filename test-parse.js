const text = `
Here is my response.

# write_file

## name
src/App.tsx

## language
typescript

## content
\`\`\`tsx
import React from 'react';
\`\`\`

# chat_user

## message
I am done.
`;

function parseMarkdownToolCalls(text) {
  const toolCalls = [];
  const toolRegex = /^#\s+([a-zA-Z_0-9]+)\s*$/gm;
  
  let match;
  let matches = [];
  while ((match = toolRegex.exec(text)) !== null) {
      matches.push({
          tool: match[1],
          index: match.index
      });
  }
  
  for (let i = 0; i < matches.length; i++) {
      const toolMatch = matches[i];
      const nextMatch = matches[i + 1];
      
      const toolContent = text.substring(toolMatch.index, nextMatch ? nextMatch.index : text.length);
      
      const parts = toolContent.split(/^##\s+/m);
      const params = {};
      
      for (let j = 1; j < parts.length; j++) {
          const part = parts[j];
          const firstNewline = part.indexOf('\n');
          if (firstNewline !== -1) {
              const paramName = part.substring(0, firstNewline).trim();
              let paramValue = part.substring(firstNewline + 1).trim();
              
              if (paramValue.startsWith('\`\`\`')) {
                  const firstLineEnd = paramValue.indexOf('\n');
                  if (firstLineEnd !== -1) {
                      const lastTickIdx = paramValue.lastIndexOf('\`\`\`');
                      if (lastTickIdx !== -1 && lastTickIdx > firstLineEnd) {
                          paramValue = paramValue.substring(firstLineEnd + 1, lastTickIdx).trim();
                      }
                  }
              }
              
              params[paramName] = paramValue;
          } else {
             const paramName = part.trim();
             params[paramName] = "";
          }
      }
      
      toolCalls.push({
          tool: toolMatch.tool,
          params: params
      });
  }
  
  return toolCalls;
}

console.log(JSON.stringify(parseMarkdownToolCalls(text), null, 2));
