# Phase 6.1 - Initial Demo Content Source of Truth

## 1. Purpose

This document is the human-reviewable source of truth for the initial QuizMaster demo content. Phase 6.1 completes two public quizzes before any seed code is written: **Java Core Basics** and **Spring Boot Essentials**.

Correct answers and explanations are included because this is an internal content source. A future seeder may consume this content, but the public API must not expose correct answers or explanations before a quiz attempt is submitted and the existing authorization rules permit access.

## 2. Content Rules

- Quiz titles, questions, options, and explanations use English consistently.
- Questions are single-choice and have exactly one correct answer.
- Every question has four options labeled A, B, C, and D.
- Every question has a stable key, one topic, and an `easy` or `medium` difficulty.
- Wording must be clear, beginner/intermediate friendly, and independent of exact framework versions.
- Questions must not rely on tricks, obscure edge cases, jokes, filler, or outdated behavior.
- Explanations must be one to three sentences and state why the correct answer is correct.
- Keys are stable content identifiers and should not be changed casually after seeding begins.

## 3. Category Overview

| Category | Phase 6.1 state | Intended coverage |
| --- | --- | --- |
| Java Core | Complete | Java runtime and core language fundamentals |
| Spring Boot | Complete | Common Spring Boot application concepts |
| SQL & Database | Outline only | Relational database and SQL fundamentals |
| Computer Networking | Outline only | Core networking protocols and concepts |
| Software Engineering | Outline only | Development lifecycle and engineering practices |
| English for IT | Outline only | Practical English used in software work |

## 4. Quiz Overview

| Quiz | Category | Status | Time limit | Questions | Difficulty range |
| --- | --- | --- | ---: | ---: | --- |
| Java Core Basics | Java Core | Public | 10 minutes | 8 | Easy-Medium |
| Spring Boot Essentials | Spring Boot | Public | 10 minutes | 8 | Easy-Medium |
| SQL Basics | SQL & Database | Planned | 10 minutes | 6-10 target | Easy-Medium |
| Networking Fundamentals | Computer Networking | Planned | 10 minutes | 6-10 target | Easy-Medium |
| Software Engineering Basics | Software Engineering | Planned | 10 minutes | 6-10 target | Easy-Medium |
| English for IT Basics | English for IT | Planned | 8 minutes | 6-10 target | Easy-Medium |

## 5. Full Content: Java Core Basics

**Category:** Java Core
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `java-core-001`
**Topic:** JVM/JDK/JRE
**Difficulty:** easy

**Question:** What is the main role of the JVM in a Java application?

**Options:**

- A. It edits Java source files.
- B. It executes Java bytecode on a specific platform.
- C. It stores application data in relational tables.
- D. It converts HTTP requests directly into SQL queries.

**Correct answer:** B

**Explanation:** The JVM provides the runtime environment that executes Java bytecode on a particular platform. The Java compiler, which is included in the JDK, compiles source code into bytecode.

### Question 2

**Key:** `java-core-002`
**Topic:** Primitive vs reference types
**Difficulty:** easy

**Question:** Which variable is declared with a Java primitive type?

**Options:**

- A. `String name = "QuizMaster";`
- B. `Integer score = 10;`
- C. `int questionCount = 8;`
- D. `List<String> topics = new ArrayList<>();`

**Correct answer:** C

**Explanation:** `int` is one of Java's primitive types. `String`, `Integer`, and `List` are reference types.

### Question 3

**Key:** `java-core-003`
**Topic:** Class and object
**Difficulty:** easy

**Question:** In object-oriented Java, what is an object?

**Options:**

- A. An instance created from a class.
- B. A package that contains source files.
- C. A keyword used to handle exceptions.
- D. A compiler option that creates bytecode.

**Correct answer:** A

**Explanation:** A class defines structure and behavior, while an object is a concrete instance of that class. Multiple objects can be created from the same class.

### Question 4

**Key:** `java-core-004`
**Topic:** Inheritance
**Difficulty:** easy

**Question:** Which keyword declares that one Java class inherits from another class?

**Options:**

- A. `implements`
- B. `imports`
- C. `extends`
- D. `inherits`

**Correct answer:** C

**Explanation:** A class uses `extends` to inherit accessible fields and methods from another class. `implements` is used when a class fulfills an interface contract.

### Question 5

**Key:** `java-core-005`
**Topic:** Interface
**Difficulty:** easy

**Question:** Which declaration correctly states that `EmailService` fulfills the `NotificationService` interface contract?

**Options:**

- A. `class EmailService extends NotificationService`
- B. `class EmailService implements NotificationService`
- C. `class EmailService imports NotificationService`
- D. `class EmailService inherits NotificationService`

**Correct answer:** B

**Explanation:** A Java class uses the `implements` keyword to declare that it fulfills an interface contract. `extends` is used for class inheritance or for one interface extending another interface.

### Question 6

**Key:** `java-core-006`
**Topic:** Exception handling
**Difficulty:** easy

**Question:** What is the purpose of a `catch` block in Java?

**Options:**

- A. To declare a new class.
- B. To repeat a block until no exception occurs.
- C. To handle a matching exception thrown by its associated `try` block.
- D. To prevent the compiler from creating bytecode.

**Correct answer:** C

**Explanation:** A `catch` block handles an exception type that matches an exception thrown while its associated `try` block runs. This lets the program respond to the error instead of leaving it unhandled at that point.

### Question 7

**Key:** `java-core-007`
**Topic:** Collections basics
**Difficulty:** easy

**Question:** Which Java collection interface is designed to contain no duplicate elements?

**Options:**

- A. `List`
- B. `Queue`
- C. `Set`
- D. `Deque`

**Correct answer:** C

**Explanation:** A `Set` models a collection of unique elements and does not allow duplicate elements according to its equality rules. A `List` can contain duplicates.

### Question 8

**Key:** `java-core-008`
**Topic:** String immutability
**Difficulty:** medium

**Question:** Given `String title = "Java";`, what happens when `title.concat(" Basics")` is called without assigning its result?

**Options:**

- A. `title` becomes `"Java Basics"`.
- B. `title` remains `"Java"` because `String` objects are immutable.
- C. `title` becomes `null`.
- D. The code fails to compile because `concat` cannot accept text.

**Correct answer:** B

**Explanation:** `String` objects are immutable, so `concat` returns a new `String` rather than modifying the original one. Without assigning the returned value, `title` still refers to `"Java"`.

## 6. Full Content: Spring Boot Essentials

**Category:** Spring Boot
**Status:** Public
**Time limit:** 10 minutes
**Question count:** 8

### Question 1

**Key:** `spring-boot-001`
**Topic:** `@SpringBootApplication`
**Difficulty:** easy

**Question:** What does `@SpringBootApplication` commonly provide on the main application class?

**Options:**

- A. A combination of configuration, component scanning, and auto-configuration support.
- B. Automatic creation of every database table without JPA configuration.
- C. Authentication for every endpoint without security configuration.
- D. Conversion of every class into a REST controller.

**Correct answer:** A

**Explanation:** `@SpringBootApplication` combines key annotations that enable configuration, component scanning, and Spring Boot auto-configuration. It does not automatically define application-specific persistence or security behavior.

### Question 2

**Key:** `spring-boot-002`
**Topic:** Dependency injection
**Difficulty:** easy

**Question:** Which example uses constructor injection for an `AttemptService` dependency?

**Options:**

- A. `QuizController(AttemptService attemptService) { this.attemptService = attemptService; }`
- B. `AttemptService attemptService = new AttemptService()` inside every controller method.
- C. A static global variable initialized by the controller.
- D. A database column named `attemptService`.

**Correct answer:** A

**Explanation:** Constructor injection supplies a dependency through the receiving class's constructor. This makes required dependencies explicit and allows the Spring container to provide the managed bean.

### Question 3

**Key:** `spring-boot-003`
**Topic:** Controller/Service/Repository layers
**Difficulty:** medium

**Question:** Which responsibility assignment best matches a typical layered Spring Boot application?

**Options:**

- A. Controllers handle HTTP input, services coordinate business logic, and repositories access persistent data.
- B. Repositories render web pages, controllers create database schemas, and services only hold constants.
- C. Services handle CSS, repositories validate JWT signatures, and controllers manage database files directly.
- D. Controllers perform every responsibility so services and repositories are unnecessary.

**Correct answer:** A

**Explanation:** In a typical layered design, controllers manage the HTTP boundary, services contain or coordinate business rules, and repositories provide data access. This separation keeps responsibilities clear and easier to test.

### Question 4

**Key:** `spring-boot-004`
**Topic:** REST controller
**Difficulty:** easy

**Question:** What is the usual purpose of `@RestController` in Spring MVC?

**Options:**

- A. To mark a class whose handler return values are written to the HTTP response body.
- B. To mark a class as a database entity.
- C. To schedule every method to run periodically.
- D. To encrypt all response fields automatically.

**Correct answer:** A

**Explanation:** `@RestController` marks a web controller whose handler return values are written to the response body, commonly as JSON. It combines controller semantics with response-body behavior.

### Question 5

**Key:** `spring-boot-005`
**Topic:** DTO usage
**Difficulty:** medium

**Question:** Why is a DTO often used at a REST API boundary?

**Options:**

- A. To define an explicit request or response shape without exposing the persistence entity directly.
- B. To replace the database engine.
- C. To make all fields globally writable.
- D. To disable input validation.

**Correct answer:** A

**Explanation:** A DTO defines the data accepted or returned by an API and decouples that contract from persistence entities. It can also limit exposed fields and provide a focused place for input constraints.

### Question 6

**Key:** `spring-boot-006`
**Topic:** Validation
**Difficulty:** medium

**Question:** In a configured Spring MVC application, what is the purpose of placing `@Valid` on a request DTO parameter?

**Options:**

- A. To trigger validation of the DTO against its declared validation constraints.
- B. To save the DTO to the database automatically.
- C. To convert the endpoint into an admin-only endpoint.
- D. To skip deserialization of the request body.

**Correct answer:** A

**Explanation:** `@Valid` requests validation of the bound DTO using its declared constraints, such as `@NotBlank`. The application can then reject invalid input through its configured error-handling flow.

### Question 7

**Key:** `spring-boot-007`
**Topic:** Spring Data JPA basics
**Difficulty:** easy

**Question:** What does extending `JpaRepository<Quiz, Long>` primarily provide?

**Options:**

- A. Common persistence operations for `Quiz` entities with `Long` identifiers.
- B. Automatic REST authentication for quiz endpoints.
- C. A frontend component for displaying quizzes.
- D. Automatic generation of quiz questions by AI.

**Correct answer:** A

**Explanation:** `JpaRepository` provides common repository operations such as saving, finding, and deleting entities. The generic parameters identify the entity type and its identifier type.

### Question 8

**Key:** `spring-boot-008`
**Topic:** Spring Security/JWT basics
**Difficulty:** medium

**Question:** When a client sends a JWT to access a protected endpoint, what should the backend do before treating the request as authenticated?

**Options:**

- A. Trust every token that contains an email address.
- B. Validate the token, including its signature and relevant claims such as expiration.
- C. Store the user's plaintext password inside the token.
- D. Disable authorization checks for the request.

**Correct answer:** B

**Explanation:** The backend must validate the token's integrity and relevant claims before establishing authentication for the request. A token should not be trusted merely because it has the expected text fields.

## 7. Admin Demo Quizzes

### Draft — Spring Security Practice

**Category:** Spring Boot
**Status:** Draft / Unpublished
**Purpose:** Allow an admin to demonstrate editing quiz metadata, questions, and options before publishing.
**Question count:** 3

#### Question 1

**Key:** `spring-security-draft-001`
**Topic:** Authentication vs authorization
**Difficulty:** easy

**Question:** Which statement correctly distinguishes authentication from authorization?

**Options:**

- A. Authentication verifies identity, while authorization checks permitted actions.
- B. Authentication checks permitted actions, while authorization verifies identity.
- C. Authentication encrypts the database, while authorization creates user accounts.
- D. Authentication and authorization always mean exactly the same thing.

**Correct answer:** A

**Explanation:** Authentication verifies who a user is, while authorization determines what an authenticated user is allowed to do. Applications commonly perform authentication before applying authorization rules.

#### Question 2

**Key:** `spring-security-draft-002`
**Topic:** JWT purpose in stateless APIs
**Difficulty:** easy

**Question:** What is a common purpose of a JWT in a stateless API after a user logs in?

**Options:**

- A. To store the user's plaintext password in each request.
- B. To carry signed claims that the backend can validate on later requests.
- C. To make every endpoint public automatically.
- D. To replace all database tables used by the application.

**Correct answer:** B

**Explanation:** A JWT can carry signed claims that the backend validates on later requests without relying on a server-side login session. The backend must still verify the token before trusting those claims.

#### Question 3

**Key:** `spring-security-draft-003`
**Topic:** Password hashing
**Difficulty:** easy

**Question:** Why should an application store password hashes instead of plaintext passwords?

**Options:**

- A. It avoids storing the original password and reduces exposure if credentials are leaked.
- B. It allows administrators to read every user's password more easily.
- C. It removes the need to authenticate users.
- D. It guarantees that every user chooses a unique password.

**Correct answer:** A

**Explanation:** Password hashing lets the application verify a submitted password without storing the original password. A strong adaptive password hash also reduces the impact of a credential database exposure.

### Draft — Empty Quiz For Publish Validation

**Category:** Java Core
**Status:** Draft / Unpublished
**Purpose:** Allow an admin to demonstrate that the existing publish validation blocks an empty quiz.
**Question count:** 0

This quiz intentionally has no questions or options. It must remain unpublished until valid question content is added through the normal admin workflow.

## 8. Placeholder Outlines for Remaining Quizzes

These quizzes are intentionally outlines only in Phase 6.1. Their full question sets must be reviewed in a later content phase before seeding.

### SQL Basics

- **Category:** SQL & Database
- **Planned focus:** `SELECT`, filtering, joins, grouping, primary/foreign keys, and transaction fundamentals.
- **Target:** 6-10 beginner/intermediate single-choice questions.

### Networking Fundamentals

- **Category:** Computer Networking
- **Planned focus:** Network layers, IP addressing, DNS, HTTP/HTTPS, and TCP versus UDP.
- **Target:** 6-10 beginner/intermediate single-choice questions.

### Software Engineering Basics

- **Category:** Software Engineering
- **Planned focus:** Requirements, SDLC, version control, testing levels, code review, and maintainable design.
- **Target:** 6-10 beginner/intermediate single-choice questions.

### English for IT Basics

- **Category:** English for IT
- **Planned focus:** Common technical vocabulary, issue descriptions, documentation language, and routine team communication.
- **Target:** 6-10 beginner/intermediate single-choice questions.

## 9. Review Checklist

- [x] Java Core Basics has exactly 8 questions.
- [x] Spring Boot Essentials has exactly 8 questions.
- [x] Draft — Spring Security Practice has exactly 3 questions and is unpublished.
- [x] Draft — Empty Quiz For Publish Validation has 0 questions and is unpublished.
- [x] Every question has exactly 4 options.
- [x] Every question declares exactly 1 correct answer.
- [x] Every question has a 1-3 sentence explanation.
- [x] Questions use clear wording and avoid ambiguous answers.
- [x] No question is duplicated.
- [x] No question depends on an exact Java, Spring, or Spring Boot version number.
- [x] Quiz content is consistently written in English.
- [x] No public API behavior is changed by this document.
- [x] The completed content is ready for seeder implementation review.

## 10. Notes for the Future Seeder

- Preserve each question key as a stable content identifier or lookup key.
- Preserve quiz metadata exactly unless a later content review explicitly changes it.
- Map exactly one option to the correct-answer field for every question.
- Keep option order deterministic so seeded content remains stable across runs.
- Create or update records idempotently using stable account emails, quiz identifiers, and question keys rather than database-generated IDs.
- Hash demo account passwords with the backend's configured password encoder; never persist plaintext passwords.
- Run only behind the approved demo profile or explicit seed property and never by default in test or production.
- Verify that public quiz responses omit correctness and explanations before submission. Do not change API behavior merely to fit the source document.
- Treat the four placeholder quizzes as unapproved for question seeding until their complete content passes the same checklist.
