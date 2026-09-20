// ─── Language Definitions for Code Playground ───
// Maps each supported language to its Wandbox compiler, file extension,
// icon label, default boilerplate code, and category.

export interface LanguageDefinition {
  id: string;
  name: string;
  wandboxCompiler: string;   // Wandbox API "compiler" field
  wandboxVersion: string;    // Display version
  extension: string;
  monacoId: string;          // maps to CodeMirror language extension
  category: "compiled" | "interpreted";
  iconLabel: string;
  boilerplate: string;
}

export const LANGUAGES: LanguageDefinition[] = [
  // ─── Compiled Languages ───
  {
    id: "c",
    name: "C",
    wandboxCompiler: "gcc-13.2.0-c",
    wandboxVersion: "GCC 13.2.0",
    extension: ".c",
    monacoId: "c",
    category: "compiled",
    iconLabel: "C",
    boilerplate: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  },
  {
    id: "cpp",
    name: "C++",
    wandboxCompiler: "gcc-13.2.0",
    wandboxVersion: "GCC 13.2.0",
    extension: ".cpp",
    monacoId: "cpp",
    category: "compiled",
    iconLabel: "C++",
    boilerplate: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  },
  {
    id: "java",
    name: "Java",
    wandboxCompiler: "openjdk-jdk-22+36",
    wandboxVersion: "OpenJDK 22",
    extension: ".java",
    monacoId: "java",
    category: "compiled",
    iconLabel: "Java",
    boilerplate: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  },
  {
    id: "rust",
    name: "Rust",
    wandboxCompiler: "rust-1.82.0",
    wandboxVersion: "1.82.0",
    extension: ".rs",
    monacoId: "rs",
    category: "compiled",
    iconLabel: "Rust",
    boilerplate: `fn main() {
    println!("Hello, World!");
}`,
  },
  {
    id: "go",
    name: "Go",
    wandboxCompiler: "go-1.23.2",
    wandboxVersion: "1.23.2",
    extension: ".go",
    monacoId: "go",
    category: "compiled",
    iconLabel: "Go",
    boilerplate: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}`,
  },
  {
    id: "csharp",
    name: "C#",
    wandboxCompiler: "dotnetcore-8.0.402",
    wandboxVersion: ".NET 8.0",
    extension: ".cs",
    monacoId: "cs",
    category: "compiled",
    iconLabel: "C#",
    boilerplate: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
    }
}`,
  },
  {
    id: "swift",
    name: "Swift",
    wandboxCompiler: "swift-6.0.1",
    wandboxVersion: "6.0.1",
    extension: ".swift",
    monacoId: "swift",
    category: "compiled",
    iconLabel: "Swift",
    boilerplate: `print("Hello, World!")`,
  },

  // ─── Interpreted Languages ───
  {
    id: "python",
    name: "Python",
    wandboxCompiler: "cpython-3.12.7",
    wandboxVersion: "3.12.7",
    extension: ".py",
    monacoId: "py",
    category: "interpreted",
    iconLabel: "Python",
    boilerplate: `# Python 3.12
print("Hello, World!")`,
  },
  {
    id: "javascript",
    name: "JavaScript",
    wandboxCompiler: "nodejs-20.17.0",
    wandboxVersion: "Node.js 20.17",
    extension: ".js",
    monacoId: "js",
    category: "interpreted",
    iconLabel: "JavaScript",
    boilerplate: `// Node.js 20
console.log("Hello, World!");`,
  },
  {
    id: "typescript",
    name: "TypeScript",
    wandboxCompiler: "typescript-5.6.2",
    wandboxVersion: "5.6.2",
    extension: ".ts",
    monacoId: "ts",
    category: "interpreted",
    iconLabel: "TypeScript",
    boilerplate: `// TypeScript 5.6
const greeting: string = "Hello, World!";
console.log(greeting);`,
  },
  {
    id: "ruby",
    name: "Ruby",
    wandboxCompiler: "ruby-3.3.11",
    wandboxVersion: "3.3.11",
    extension: ".rb",
    monacoId: "rb",
    category: "interpreted",
    iconLabel: "Ruby",
    boilerplate: `# Ruby 3.3
puts "Hello, World!"`,
  },
  {
    id: "php",
    name: "PHP",
    wandboxCompiler: "php-8.3.12",
    wandboxVersion: "8.3.12",
    extension: ".php",
    monacoId: "php",
    category: "interpreted",
    iconLabel: "PHP",
    boilerplate: `<?php
echo "Hello, World!\\n";
?>`,
  },
  {
    id: "perl",
    name: "Perl",
    wandboxCompiler: "perl-5.40.0",
    wandboxVersion: "5.40.0",
    extension: ".pl",
    monacoId: "pl",
    category: "interpreted",
    iconLabel: "Perl",
    boilerplate: `#!/usr/bin/perl
use strict;
use warnings;

print "Hello, World!\\n";`,
  },
  {
    id: "r",
    name: "R",
    wandboxCompiler: "r-4.4.1",
    wandboxVersion: "4.4.1",
    extension: ".r",
    monacoId: "r",
    category: "interpreted",
    iconLabel: "R",
    boilerplate: `# R 4.4
cat("Hello, World!\\n")`,
  },
  {
    id: "lua",
    name: "Lua",
    wandboxCompiler: "lua-5.4.7",
    wandboxVersion: "5.4.7",
    extension: ".lua",
    monacoId: "lua",
    category: "interpreted",
    iconLabel: "Lua",
    boilerplate: `-- Lua 5.4
print("Hello, World!")`,
  },
];

// ─── Helpers ───

export const getLanguageById = (id: string): LanguageDefinition =>
  LANGUAGES.find((l) => l.id === id) ?? LANGUAGES[0];

export const getCompiledLanguages = () =>
  LANGUAGES.filter((l) => l.category === "compiled");

export const getInterpretedLanguages = () =>
  LANGUAGES.filter((l) => l.category === "interpreted");

export const DEFAULT_LANGUAGE_ID = "python";

// Wandbox API endpoint
export const WANDBOX_API_URL = "https://wandbox.org/api/compile.json";

// Code execution result interface
export interface ExecutionResult {
  stdout: string;
  stderr: string;
  output: string;     // combined stdout + stderr
  code: number | null; // exit code
  signal: string | null;
  compile?: {
    stdout: string;
    stderr: string;
    code: number | null;
    signal: string | null;
  };
  language: string;
  version: string;
  executionTime?: number;
}
