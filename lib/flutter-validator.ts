interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  hasMain: boolean;
  hasRunApp: boolean;
  hasImports: boolean;
  widgetCount: number;
}

export function validateFlutterCode(code: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  // Check for basic structure
  const hasMain = /void\s+main\s*\(\s*\)\s*{/.test(code);
  const hasRunApp = /runApp\s*\(/.test(code);
  const hasImports = /import\s+['"]package:flutter\/material\.dart['"];?/.test(code);
  
  // Count widgets
  const widgetMatches = code.match(/class\s+\w+\s+extends\s+(Stateless|Stateful)Widget/g);
  const widgetCount = widgetMatches ? widgetMatches.length : 0;
  
  // Basic validations
  if (!hasImports) {
    errors.push({
      message: "Missing Flutter material import",
      severity: 'error',
      suggestion: "Add: import 'package:flutter/material.dart';"
    });
  }
  
  // Check for dart:ui import if ImageFilter or BackdropFilter is used
  if ((code.includes('ImageFilter') || code.includes('BackdropFilter')) && 
      !code.includes("import 'dart:ui'")) {
    errors.push({
      message: "Missing dart:ui import for ImageFilter/BackdropFilter",
      severity: 'error',
      suggestion: "Add: import 'dart:ui';"
    });
  }
  
  // Check for dart:math import if math functions are used
  if ((code.includes('math.') || code.includes('Random')) && 
      !code.includes("import 'dart:math'")) {
    errors.push({
      message: "Missing dart:math import",
      severity: 'error',
      suggestion: "Add: import 'dart:math' as math;"
    });
  }
  
  // Check for dart:async import if async features are used
  if ((code.includes('Timer') || code.includes('StreamController')) && 
      !code.includes("import 'dart:async'")) {
    errors.push({
      message: "Missing dart:async import",
      severity: 'error',
      suggestion: "Add: import 'dart:async';"
    });
  }
  
  // Check for imports after code declarations
  const lines = code.split('\n');
  let foundDeclaration = false;
  let importAfterDeclaration = false;
  
  for (const line of lines) {
    if (line.includes('class ') || line.includes('void main') || 
        (line.includes('Widget ') && !line.includes('import'))) {
      foundDeclaration = true;
    }
    if (foundDeclaration && line.trim().startsWith('import ')) {
      importAfterDeclaration = true;
      break;
    }
  }
  
  if (importAfterDeclaration) {
    errors.push({
      message: "Import statements must appear before any declarations",
      severity: 'error',
      suggestion: "Move all import statements to the top of the file"
    });
  }
  
  if (!hasMain) {
    errors.push({
      message: "Missing main() function",
      severity: 'error',
      suggestion: "Add: void main() { runApp(MyApp()); }"
    });
  }
  
  if (!hasRunApp) {
    errors.push({
      message: "Missing runApp() call in main function",
      severity: 'error',
      suggestion: "Add runApp(MyApp()) inside main function"
    });
  }
  
  if (widgetCount === 0) {
    errors.push({
      message: "No Flutter widgets found",
      severity: 'error',
      suggestion: "Create at least one widget class extending StatelessWidget or StatefulWidget"
    });
  }
  
  // Check for common syntax errors
  const syntaxChecks = [
    {
      pattern: /;\s*;/g,
      message: "Double semicolon detected",
      severity: 'error' as const
    },
    {
      pattern: /\)\s*\)(?![,\s]*[;\)])/g,  // Improved to avoid false positives
      message: "Possible extra closing parenthesis",
      severity: 'warning' as const
    },
    {
      pattern: /\{\s*\}(?![\s,;])/g,  // Improved to avoid false positives for empty blocks
      message: "Empty code block detected",
      severity: 'warning' as const
    },
    {
      pattern: /return\s+;/g,
      message: "Empty return statement",
      severity: 'error' as const
    },
    {
      pattern: /^[a-z]\s+/gm,  // Lines starting with single lowercase letter
      message: "Syntax error: unexpected character at line start",
      severity: 'error' as const
    },
    {
      pattern: /\.decoration\?\.copyWith\([^)]*\)(?!\s*,)/g,
      message: "Missing required parameters in copyWith",
      severity: 'error' as const
    }
  ];
  
  syntaxChecks.forEach(check => {
    const matches = code.match(check.pattern);
    if (matches) {
      const lines = code.split('\n');
      matches.forEach(match => {
        const index = code.indexOf(match);
        const lineNumber = code.substring(0, index).split('\n').length;
        
        if (check.severity === 'error') {
          errors.push({
            line: lineNumber,
            message: check.message,
            severity: check.severity
          });
        } else {
          warnings.push({
            line: lineNumber,
            message: check.message,
            severity: check.severity
          });
        }
      });
    }
  });
  
  // Check bracket balance
  const openBrackets = (code.match(/\{/g) || []).length;
  const closeBrackets = (code.match(/\}/g) || []).length;
  if (openBrackets !== closeBrackets) {
    errors.push({
      message: `Unbalanced brackets: ${openBrackets} opening, ${closeBrackets} closing`,
      severity: 'error',
      suggestion: "Check that all { have matching }"
    });
  }
  
  // Check parenthesis balance
  const openParens = (code.match(/\(/g) || []).length;
  const closeParens = (code.match(/\)/g) || []).length;
  if (openParens !== closeParens) {
    errors.push({
      message: `Unbalanced parentheses: ${openParens} opening, ${closeParens} closing`,
      severity: 'error',
      suggestion: "Check that all ( have matching )"
    });
  }
  
  // Check for common Flutter mistakes
  if (code.includes('setState') && !code.includes('StatefulWidget')) {
    errors.push({
      message: "setState used but no StatefulWidget found",
      severity: 'error',
      suggestion: "Change widget to extend StatefulWidget instead of StatelessWidget"
    });
  }
  
  if (code.includes('@override') && code.includes('build(')) {
    const buildPattern = /@override\s+Widget\s+build\s*\(\s*BuildContext\s+context\s*\)/;
    if (!buildPattern.test(code)) {
      warnings.push({
        message: "build method might have incorrect signature",
        severity: 'warning',
        suggestion: "Use: @override Widget build(BuildContext context)"
      });
    }
  }
  
  // Check for trailing commas (Flutter best practice)
  const widgetCallPattern = /\)[,]?\s*\)/g;
  if (!widgetCallPattern.test(code)) {
    warnings.push({
      message: "Consider adding trailing commas for better formatting",
      severity: 'warning',
      suggestion: "Add commas after widget parameters for better code formatting"
    });
  }
  
  // Check for overflow prevention
  const hasColumn = /Column\s*\(/.test(code);
  const hasRow = /Row\s*\(/.test(code);
  const hasScrollView = /SingleChildScrollView|ListView|CustomScrollView|GridView/.test(code);
  const hasExpanded = /Expanded|Flexible/.test(code);
  
  if (hasColumn && !hasScrollView && !hasExpanded) {
    warnings.push({
      message: "Column without scroll view may cause overflow",
      severity: 'warning',
      suggestion: "Wrap with SingleChildScrollView or use Expanded for children"
    });
  }
  
  if (hasRow && !hasExpanded && !code.includes('mainAxisSize: MainAxisSize.min')) {
    warnings.push({
      message: "Row without Flexible/Expanded children may cause horizontal overflow",
      severity: 'warning',
      suggestion: "Use Flexible or Expanded for Row children or set mainAxisSize: MainAxisSize.min"
    });
  }
  
  // Check for fixed heights that might cause issues
  const fixedHeightPattern = /height:\s*\d{3,}/g; // Heights > 100
  if (fixedHeightPattern.test(code) && !hasScrollView) {
    warnings.push({
      message: "Large fixed heights detected without scroll view",
      severity: 'warning',
      suggestion: "Consider using ScrollView or responsive sizing with MediaQuery"
    });
  }
  
  // Check for NetworkImage usage (not supported in DartPad)
  if (code.includes('NetworkImage') || code.includes('Image.network')) {
    errors.push({
      message: "NetworkImage/Image.network not supported in DartPad",
      severity: 'error',
      suggestion: "Use colored Container with Icons as placeholders instead of network images"
    });
  }
  
  // Check for http/https URLs (likely trying to load external resources)
  if (code.includes('http://') || code.includes('https://')) {
    warnings.push({
      message: "External URLs detected - DartPad cannot load external resources",
      severity: 'warning',
      suggestion: "Replace with local placeholders or mock data"
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    hasMain,
    hasRunApp,
    hasImports,
    widgetCount
  };
}

export function generateFixPrompt(code: string, errors: ValidationError[]): string {
  const errorList = errors.map(e => `- ${e.message}${e.suggestion ? ` (${e.suggestion})` : ''}`).join('\n');
  
  const hasOverflowError = errors.some(e => e.message.includes('overflow')) || 
                           errors.some(e => e.message.includes('Column')) ||
                           errors.some(e => e.message.includes('Row'));
  
  const hasNetworkImageError = errors.some(e => e.message.includes('NetworkImage')) ||
                                errors.some(e => e.message.includes('network'));
  
  return `The generated Flutter code has the following errors that need to be fixed:

${errorList}

Please regenerate the code fixing these issues. Make sure the code:
1. Has proper Flutter imports (including dart:ui for blur effects, dart:math for math operations)
2. Contains a main() function with runApp()
3. Has at least one widget class
4. Has balanced brackets and parentheses
5. Follows Flutter best practices
6. IMPORTANT: If using ImageFilter or BackdropFilter, include: import 'dart:ui';
${hasOverflowError ? `
7. CRITICAL: Make the widget RESPONSIVE and prevent overflow:
   - Wrap content in SingleChildScrollView for vertical scrolling
   - Use Expanded or Flexible in Column/Row
   - Avoid fixed heights that can cause overflow
   - Use MediaQuery for responsive sizing
   - Test for different screen sizes` : ''}
${hasNetworkImageError ? `
8. DARTPAD LIMITATION: Cannot use NetworkImage or load external URLs:
   - Replace NetworkImage with colored Container placeholders
   - Use Icons or text instead of real images
   - For carousels, use different colored containers with icons
   - Example: Container(color: Colors.blue.shade100, child: Icon(Icons.image))` : ''}

Original code that needs fixing:
${code}`;
}

export function autoFixImports(code: string): string {
  let fixedCode = code;
  const imports: string[] = [];
  
  // Always need material.dart
  if (!code.includes("import 'package:flutter/material.dart';")) {
    imports.push("import 'package:flutter/material.dart';");
  }
  
  // Check for dart:ui usage
  if ((code.includes('ImageFilter') || code.includes('BackdropFilter')) && 
      !code.includes("import 'dart:ui'")) {
    imports.push("import 'dart:ui';");
  }
  
  // Check for dart:math usage
  if ((code.includes('math.') || code.includes('Random')) && 
      !code.includes("import 'dart:math'")) {
    imports.push("import 'dart:math' as math;");
  }
  
  // Check for dart:async usage
  if ((code.includes('Timer') || code.includes('StreamController')) && 
      !code.includes("import 'dart:async'")) {
    imports.push("import 'dart:async';");
  }
  
  // If we need to add imports, add them at the beginning
  if (imports.length > 0 && !code.startsWith('import')) {
    fixedCode = imports.join('\n') + '\n\n' + code;
  } else if (imports.length > 0) {
    // Find where to insert additional imports
    const firstImportIndex = code.indexOf('import');
    const beforeImports = code.substring(0, firstImportIndex);
    const afterFirstImport = code.substring(firstImportIndex);
    
    // Add missing imports after existing ones
    const existingImports = afterFirstImport.match(/import[^;]+;/g) || [];
    const lastImportEnd = firstImportIndex + existingImports.join('\n').length;
    
    fixedCode = beforeImports + 
                code.substring(firstImportIndex, lastImportEnd) + '\n' +
                imports.filter(imp => !code.includes(imp)).join('\n') + 
                code.substring(lastImportEnd);
  }
  
  return fixedCode;
}

export function extractCodeBlock(response: string): string {
  // Try to extract code from markdown code blocks
  const codeBlockMatch = response.match(/```(?:dart|flutter)?\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code block, look for import statements as start
  const importIndex = response.indexOf('import ');
  if (importIndex !== -1) {
    return response.substring(importIndex).trim();
  }
  
  return response.trim();
}