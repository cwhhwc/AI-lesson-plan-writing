# Standard Workflow for Unit Test Case Generation (v2.1)

**OVERRIDING RULE: All user-facing output, especially descriptive parameters in tests (describe/it titles) and all code comments, MUST be in Chinese.**

## Step 1: Analysis & Test Design (Unchanged)
1.  **User Directive:** User specifies the target file and function name(s).
2.  **Read Source File:** Read the latest version of the target source file.
3.  **Analyze Function:** Identify Inputs, Outputs, Side Effects.
4.  **Identify Dependencies:** List all external modules/objects to be mocked.
5.  **Design Test Cases:** Create test scenarios (`it` blocks) following the Arrange-Act-Assert pattern. 
    - **Note 1 (Variable Detail):** For simple code, provide detailed AAA design. For complex code, provide a high-level list of test case titles.
6.  **Propose Plan:** Present the design to the user for confirmation.

## Step 2: Pre-computation & Setup (Optimized)
1.  **(NEW) Read setup.js:** Read the current content of `tests/setup.js` from the filesystem.
2.  **(NEW) Analyze setup.js:** Based on the fresh content, determine if new global mocks are needed for the current test and propose updates if necessary.
3.  **Check Testability:** If the code is difficult to test, report the issue to the user and ask for their opinion (e.g., suggest refactoring). Do not force a complex test.
4.  **(NEW) Determine Test File Path:** Based on the function's purpose, determine the appropriate test file. Use logical grouping to keep test files focused and not too long. Propose a new file name if a new logical group is identified (e.g., `useChat.history.test.js`).
5.  **Await Final Approval:** Wait for the user to approve the full plan before proceeding.

## Step 3: Test Code Generation (Unchanged)
1.  **Constraint:** Strictly no modification of the user's source code. All code generation must target test files only.
2.  **Locate/Create Test File:** Use the path determined in Step 2.
3.  **Write Mock Setup:** Implement `vi.mock()` for all identified dependencies.
4.  **Write `beforeEach` Hook:** If needed, set up state/mock reset for test isolation.
5.  **Implement Test Cases:** Write the `it(...)` blocks as designed.

## Step 4: Handoff (Unchanged)
1.  **Deliver Code:** Present the newly written, complete test code.
2.  **Prompt for Execution:** Instruct the user to run the tests and await their feedback.
