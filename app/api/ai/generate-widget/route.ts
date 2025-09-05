import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createSupabaseServer } from '@/lib/supabase/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = {
  role: "system" as const,
  content: `You are an expert Flutter/Dart code generation assistant. Your task is to generate Flutter widgets based on user descriptions. The generated code must follow these guidelines:

1. **Dart 3.9 and Flutter 3.35 Compatibility**: Use the latest language and framework features, avoiding deprecated APIs, widgets, and methods. Follow official release notes for guidance.

2. **Clean and Efficient Code**: Generate well-structured, readable, and optimized code. Follow best practices for widget building, state management, and UI design.

3. **Self-Contained Widgets**: The generated widget must be autonomous and fully functional on its own, without depending on external code or configuration. It should be executable in DartPad.

4. **No External Dependencies**: Do not include third-party packages. Use only Flutter's standard libraries.

5. **DartPad Compatibility**: Ensure the code works in DartPad, avoiding features or configurations that are not supported there.

6. **Responsiveness**: Widgets should be responsive and adapt to different screen sizes appropriately.

7. **Clear Comments**: Include brief and clear comments explaining the purpose of major code sections or complex logic.

8. **Consistent Code Style**: Follow Dart and Flutter style conventions: proper indentation, descriptive variable and function names, logical organization.

9. **Error Handling**: Consider potential errors or edge cases, and handle them appropriately.

10. **Performance Optimization**: Apply best practices to optimize performance, avoiding unnecessary expensive operations and building UI efficiently.

IMPORTANT: You must respond with a JSON object containing exactly two fields:
- "description": A brief description of what the widget does (1-2 sentences)
- "code": The complete Flutter/Dart code that can run in DartPad

The code should always start with the necessary imports and a main() function that runs the app.

Example response format:
{
  "description": "A simple counter app with increment and decrement buttons",
  "code": "import 'package:flutter/material.dart';\\n\\nvoid main() {\\n  runApp(MyApp());\\n}\\n\\nclass MyApp extends StatelessWidget {\\n  @override\\n  Widget build(BuildContext context) {\\n    return MaterialApp(\\n      home: CounterScreen(),\\n    );\\n  }\\n}\\n\\nclass CounterScreen extends StatefulWidget {\\n  @override\\n  _CounterScreenState createState() => _CounterScreenState();\\n}\\n\\nclass _CounterScreenState extends State<CounterScreen> {\\n  int _counter = 0;\\n\\n  void _incrementCounter() {\\n    setState(() {\\n      _counter++;\\n    });\\n  }\\n\\n  void _decrementCounter() {\\n    setState(() {\\n      _counter--;\\n    });\\n  }\\n\\n  @override\\n  Widget build(BuildContext context) {\\n    return Scaffold(\\n      appBar: AppBar(\\n        title: Text('Counter App'),\\n      ),\\n      body: Center(\\n        child: Column(\\n          mainAxisAlignment: MainAxisAlignment.center,\\n          children: <Widget>[\\n            Text(\\n              'Counter Value:',\\n              style: Theme.of(context).textTheme.headlineMedium,\\n            ),\\n            Text(\\n              '$_counter',\\n              style: Theme.of(context).textTheme.headlineLarge,\\n            ),\\n            SizedBox(height: 20),\\n            Row(\\n              mainAxisAlignment: MainAxisAlignment.center,\\n              children: [\\n                ElevatedButton(\\n                  onPressed: _decrementCounter,\\n                  child: Text('Decrement'),\\n                ),\\n                SizedBox(width: 20),\\n                ElevatedButton(\\n                  onPressed: _incrementCounter,\\n                  child: Text('Increment'),\\n                ),\\n              ],\\n            ),\\n          ],\\n        ),\\n      ),\\n    );\\n  }\\n}"
}`
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createSupabaseServer();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      messages: [
        SYSTEM_PROMPT,
        {
          role: "user",
          content: `Please generate the Flutter widget code based on the following user request: ${prompt}`,
        },
      ],
      model: "moonshotai/kimi-k2-instruct-0905",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error("No response from AI");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (parseError) {
      console.error("Failed to parse AI response:", response);
      throw new Error("Invalid response format from AI");
    }

    // Validate the response has the required fields
    if (!parsedResponse.code || !parsedResponse.description) {
      throw new Error("Response missing required fields");
    }

    return NextResponse.json({
      description: parsedResponse.description,
      code: parsedResponse.code,
    });

  } catch (error) {
    console.error("Error generating widget:", error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to generate widget" },
      { status: 500 }
    );
  }
}