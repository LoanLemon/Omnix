function generateSchema(val: any): any {
  if (val === null) return "null";
  if (Array.isArray(val)) {
    if (val.length === 0) return [];
    return [generateSchema(val[0])];
  }
  if (typeof val === "object") {
    const schema: Record<string, any> = {};
    for (const k of Object.keys(val)) {
      // If the key is numeric index, represent it as "string" in schema as per user specification
      const isNumericKey = !isNaN(Number(k));
      const schemaKey = isNumericKey ? "string" : k;
      schema[schemaKey] = generateSchema(val[k]);
    }
    return schema;
  }
  return typeof val;
}

function processParsedJSON(original: string, parsed: any): any {
  let rowsCount = 0;
  let firstRow: any = null;
  if (Array.isArray(parsed)) {
    rowsCount = parsed.length;
    firstRow = parsed[0] || null;
  } else if (typeof parsed === "object" && parsed !== null) {
    const keys = Object.keys(parsed);
    rowsCount = keys.length;
    const firstKey = keys[0];
    if (firstKey !== undefined) {
      // In user's example, the first row appears wrapped with its index key (e.g. "0")
      firstRow = { [firstKey]: parsed[firstKey] };
    } else {
      firstRow = parsed;
    }
  }

  const schema = generateSchema(firstRow);
  return {
    original,
    parsed,
    rowsCount,
    preview: firstRow,
    schema
  };
}

export function findAndParseJSON(text: string): { original: string; parsed: any; rowsCount: number; preview: any; schema: any } | null {
  // Check for markdown codeblocks first
  const codeBlockRegex = /```json\s*([\s\S]*?)```/gi;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    const rawContent = match[1].trim();
    try {
      const parsed = JSON.parse(rawContent);
      return processParsedJSON(match[0], parsed);
    } catch (e) {
      // continue searching
    }
  }

  // Attempt to parse any substring starting with { or [ and ending with } or ]
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(candidate);
      return processParsedJSON(candidate, parsed);
    } catch (e) {}
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    const candidate = text.substring(firstBracket, lastBracket + 1);
    try {
      const parsed = JSON.parse(candidate);
      return processParsedJSON(candidate, parsed);
    } catch (e) {}
  }

  return null;
}

export function findHTML(text: string): { original: string; tagCount: number; preview: string } | null {
  // Check for html codeblock
  const codeBlockRegex = /```html\s*([\s\S]*?)```/gi;
  const match = codeBlockRegex.exec(text);
  if (match) {
    const content = match[1].trim();
    const tagMatches = content.match(/<[a-zA-Z1-6]+(?:\s+[^>]*?)?>/g) || [];
    return {
      original: match[0],
      tagCount: tagMatches.length,
      preview: content.substring(0, 500) + (content.length > 500 ? "..." : "")
    };
  }

  // Check raw html tags
  const htmlTagRegex = /<([a-zA-Z1-6]+)(?:\s+[^>]*?)?>[\s\S]*?<\/\1>/gi;
  if (htmlTagRegex.test(text)) {
    const tagMatches = text.match(/<[a-zA-Z1-6]+(?:\s+[^>]*?)?>/g) || [];
    const htmlStart = text.search(/<[a-zA-Z1-6]+/);
    const htmlEnd = text.lastIndexOf(">") + 1;
    if (htmlStart !== -1 && htmlEnd !== -1 && htmlEnd > htmlStart) {
      const original = text.substring(htmlStart, htmlEnd);
      return {
        original,
        tagCount: tagMatches.length,
        preview: original.substring(0, 500) + (original.length > 500 ? "..." : "")
      };
    }
  }

  return null;
}

export function findCodeBlock(text: string): { original: string; language: string; lineCount: number; preview: string } | null {
  const codeBlockRegex = /```(javascript|js|typescript|ts|python|py|css|sql|sh|bash)\s*([\s\S]*?)```/gi;
  const match = codeBlockRegex.exec(text);
  if (match) {
    const language = match[1];
    const content = match[2].trim();
    const lineCount = content.split("\n").length;
    return {
      original: match[0],
      language,
      lineCount,
      preview: content.substring(0, 500) + (content.length > 500 ? "..." : "")
    };
  }
  return null;
}

export function analyzeAndPreprocessPrompt(
  promptText: string,
  hasImage?: boolean
): { content: string; format: "General Text" | "JSON" | "HTML" | "Image" | "Code" } {
  if (hasImage) {
    return { content: promptText, format: "Image" };
  }

  // 1. JSON analysis
  const jsonResult = findAndParseJSON(promptText);
  if (jsonResult) {
    const previewStr = JSON.stringify(jsonResult.preview, null, 4);
    const schemaStr = JSON.stringify(jsonResult.schema, null, 4);
    
    const replacement = `
# JSON Data
The user provided data with ${jsonResult.rowsCount} rows.
The context length of this JSON dataset is ${jsonResult.original.length} characters.
The first row appears as the following:
\`\`\`json
${previewStr}
\`\`\`
This is the identified schema:
\`\`\`
${schemaStr}
\`\`\`
Reference JSON in JavaScript as: 'json_data'
`;
    // Replace JSON chunk in original prompt
    const cleanContent = promptText.replace(jsonResult.original, replacement.trim());
    return { content: cleanContent, format: "JSON" };
  }

  // 2. HTML analysis
  const htmlResult = findHTML(promptText);
  if (htmlResult) {
    const replacement = `
# HTML Data
The user provided HTML content with approximately ${htmlResult.tagCount} tags and a context length of ${htmlResult.original.length} characters.
The HTML preview:
\`\`\`html
${htmlResult.preview}
\`\`\`
Reference HTML in JavaScript as: 'html_data'
`;
    const cleanContent = promptText.replace(htmlResult.original, replacement.trim());
    return { content: cleanContent, format: "HTML" };
  }

  // 3. Code analysis
  const codeResult = findCodeBlock(promptText);
  if (codeResult) {
    const replacement = `
# ${codeResult.language.toUpperCase()} Code Data
The user provided ${codeResult.language.toUpperCase()} code of ${codeResult.lineCount} lines and a context length of ${codeResult.original.length} characters.
The code preview:
\`\`\`${codeResult.language}
${codeResult.preview}
\`\`\`
Reference Code in JavaScript as: 'code_data'
`;
    const cleanContent = promptText.replace(codeResult.original, replacement.trim());
    return { content: cleanContent, format: "Code" };
  }

  return { content: promptText, format: "General Text" };
}
