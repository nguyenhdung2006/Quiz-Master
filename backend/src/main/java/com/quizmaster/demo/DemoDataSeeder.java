package com.quizmaster.demo;

import com.quizmaster.attempt.AttemptRepository;
import com.quizmaster.attempt.AttemptService;
import com.quizmaster.attempt.StartAttemptRequest;
import com.quizmaster.attempt.StartAttemptResponse;
import com.quizmaster.attempt.SubmitAnswerRequest;
import com.quizmaster.attempt.SubmitAttemptRequest;
import com.quizmaster.category.Category;
import com.quizmaster.category.CategoryRepository;
import com.quizmaster.quiz.Option;
import com.quizmaster.quiz.OptionRepository;
import com.quizmaster.quiz.Question;
import com.quizmaster.quiz.QuestionRepository;
import com.quizmaster.quiz.Quiz;
import com.quizmaster.quiz.QuizRepository;
import com.quizmaster.user.User;
import com.quizmaster.user.UserRepository;
import com.quizmaster.user.UserRole;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed-demo", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String DEMO_PASSWORD = "password123";
    private static final String DEMO_USER_EMAIL = "demo-user@quizmaster.local";
    private static final String JAVA_CORE_QUIZ_TITLE = "Java Core Basics";
    private static final String LOCKED_QUIZ_TITLE = "Locked Demo Quiz";

    private static final List<DemoUser> USERS = List.of(
            new DemoUser("demo-admin@quizmaster.local", UserRole.ADMIN),
            new DemoUser("demo-user@quizmaster.local", UserRole.USER),
            new DemoUser("demo-empty@quizmaster.local", UserRole.USER)
    );

    private static final Map<String, String> CATEGORIES = categoryDefinitions();
    private static final List<DemoQuiz> QUIZZES = quizDefinitions();

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final AttemptRepository attemptRepository;
    private final AttemptService attemptService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        LOGGER.info("Demo data seed enabled; checking local demo data");

        seedUsers();
        Map<String, Category> categoriesBySlug = seedCategories();
        Map<String, Quiz> quizzesByTitle = seedQuizzes(categoriesBySlug);
        seedAttempts(quizzesByTitle);

        LOGGER.info("Demo data seed completed");
    }

    private void seedUsers() {
        for (DemoUser demoUser : USERS) {
            if (userRepository.findByEmail(demoUser.email()).isPresent()) {
                continue;
            }

            User user = new User();
            user.setEmail(demoUser.email());
            user.setPassword(passwordEncoder.encode(DEMO_PASSWORD));
            user.setRole(demoUser.role());
            userRepository.save(user);
            LOGGER.info("Created demo user {}", demoUser.email());
        }
    }

    private Map<String, Category> seedCategories() {
        Map<String, Category> categoriesBySlug = new LinkedHashMap<>();

        CATEGORIES.forEach((slug, name) -> {
            Category category = categoryRepository.findBySlug(slug)
                    .orElseGet(() -> createCategory(name, slug));
            categoriesBySlug.put(slug, category);
        });

        return categoriesBySlug;
    }

    private Category createCategory(String name, String slug) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        Category savedCategory = categoryRepository.save(category);
        LOGGER.info("Created demo category {}", name);
        return savedCategory;
    }

    private Map<String, Quiz> seedQuizzes(Map<String, Category> categoriesBySlug) {
        Map<String, Quiz> quizzesByTitle = new LinkedHashMap<>();

        for (DemoQuiz demoQuiz : QUIZZES) {
            Category category = categoriesBySlug.get(demoQuiz.categorySlug());
            if (category == null) {
                throw new IllegalStateException("Missing demo category: " + demoQuiz.categorySlug());
            }

            Quiz quiz = quizRepository.findByTitleAndCategoryId(demoQuiz.title(), category.getId())
                    .orElseGet(() -> {
                        validateQuiz(demoQuiz);
                        return createQuiz(demoQuiz, category);
                    });
            quizzesByTitle.put(demoQuiz.title(), quiz);
        }

        return quizzesByTitle;
    }

    private Quiz createQuiz(DemoQuiz demoQuiz, Category category) {
        Quiz quiz = new Quiz();
        quiz.setCategory(category);
        quiz.setTitle(demoQuiz.title());
        quiz.setDescription(demoQuiz.description());
        quiz.setTimeLimitMinutes(demoQuiz.timeLimitMinutes());
        quiz.setPublished(demoQuiz.published());
        Quiz savedQuiz = quizRepository.save(quiz);

        for (int questionIndex = 0; questionIndex < demoQuiz.questions().size(); questionIndex++) {
            createQuestion(savedQuiz, demoQuiz.questions().get(questionIndex), questionIndex + 1);
        }

        LOGGER.info("Created demo quiz {} with {} questions", demoQuiz.title(), demoQuiz.questions().size());
        return savedQuiz;
    }

    private void seedAttempts(Map<String, Quiz> quizzesByTitle) {
        User demoUser = userRepository.findByEmail(DEMO_USER_EMAIL)
                .orElseThrow(() -> new IllegalStateException("Missing demo user: " + DEMO_USER_EMAIL));

        seedSubmittedAttempt(demoUser, requireQuiz(quizzesByTitle, JAVA_CORE_QUIZ_TITLE), 1);
        Quiz lockedQuiz = requireQuiz(quizzesByTitle, LOCKED_QUIZ_TITLE);
        seedSubmittedAttempt(demoUser, lockedQuiz, 2);
        if (lockedQuiz.isPublished()) {
            lockedQuiz.setPublished(false);
            quizRepository.saveAndFlush(lockedQuiz);
        }
    }

    private Quiz requireQuiz(Map<String, Quiz> quizzesByTitle, String title) {
        Quiz quiz = quizzesByTitle.get(title);
        if (quiz == null) {
            throw new IllegalStateException("Missing demo quiz: " + title);
        }
        return quiz;
    }

    private void seedSubmittedAttempt(User user, Quiz quiz, int incorrectAnswerCount) {
        if (attemptRepository.existsByUserIdAndQuizIdAndSubmittedAtIsNotNull(user.getId(), quiz.getId())) {
            LOGGER.info("Submitted demo attempt already exists; skipping {}", quiz.getTitle());
            return;
        }

        boolean restoreDraftStatus = !quiz.isPublished();
        if (restoreDraftStatus) {
            quiz.setPublished(true);
            quizRepository.saveAndFlush(quiz);
        }

        try {
            StartAttemptResponse startedAttempt = attemptService.startAttempt(
                    new StartAttemptRequest(quiz.getId()),
                    user.getEmail()
            );
            SubmitAttemptRequest submission = buildSubmission(quiz, incorrectAnswerCount);
            attemptService.submitAttempt(startedAttempt.attemptId(), submission, user.getEmail());
            LOGGER.info("Created submitted demo attempt for {}", quiz.getTitle());
        } finally {
            if (restoreDraftStatus) {
                quiz.setPublished(false);
                quizRepository.saveAndFlush(quiz);
            }
        }
    }

    private SubmitAttemptRequest buildSubmission(Quiz quiz, int incorrectAnswerCount) {
        List<Question> questions = questionRepository.findByQuizIdOrderByDisplayOrderAsc(quiz.getId());
        if (incorrectAnswerCount < 0 || incorrectAnswerCount > questions.size()) {
            throw new IllegalStateException("Invalid demo incorrect-answer count for " + quiz.getTitle());
        }

        List<SubmitAnswerRequest> answers = java.util.stream.IntStream.range(0, questions.size())
                .mapToObj(index -> {
                    Question question = questions.get(index);
                    boolean chooseCorrect = index < questions.size() - incorrectAnswerCount;
                    Option selectedOption = selectOption(question, chooseCorrect);
                    return new SubmitAnswerRequest(question.getId(), selectedOption.getId());
                })
                .toList();
        return new SubmitAttemptRequest(answers);
    }

    private Option selectOption(Question question, boolean chooseCorrect) {
        return optionRepository.findByQuestionIdOrderByDisplayOrderAsc(question.getId())
                .stream()
                .filter(option -> Boolean.TRUE.equals(option.getCorrect()) == chooseCorrect)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Missing demo " + (chooseCorrect ? "correct" : "incorrect")
                                + " option for question " + question.getId()
                ));
    }

    private void createQuestion(Quiz quiz, DemoQuestion demoQuestion, int displayOrder) {
        Question question = new Question();
        question.setQuiz(quiz);
        question.setContent(demoQuestion.content());
        question.setExplanation(demoQuestion.explanation());
        question.setDisplayOrder(displayOrder);
        Question savedQuestion = questionRepository.save(question);

        List<Option> options = java.util.stream.IntStream.range(0, demoQuestion.options().size())
                .mapToObj(optionIndex -> createOption(
                        savedQuestion,
                        demoQuestion.options().get(optionIndex),
                        optionIndex,
                        demoQuestion.correctOptionIndex()
                ))
                .toList();
        optionRepository.saveAll(options);
    }

    private Option createOption(
            Question question,
            String content,
            int optionIndex,
            int correctOptionIndex
    ) {
        Option option = new Option();
        option.setQuestion(question);
        option.setContent(content);
        option.setCorrect(optionIndex == correctOptionIndex);
        option.setDisplayOrder(optionIndex + 1);
        return option;
    }

    private void validateQuiz(DemoQuiz quiz) {
        for (DemoQuestion question : quiz.questions()) {
            if (question.options().size() != 4) {
                throw new IllegalStateException("Demo question must have exactly 4 options: " + question.key());
            }
            if (question.correctOptionIndex() < 0 || question.correctOptionIndex() >= question.options().size()) {
                throw new IllegalStateException("Demo question has an invalid correct option: " + question.key());
            }
            if (question.explanation().isBlank()) {
                throw new IllegalStateException("Demo question must have an explanation: " + question.key());
            }
        }
    }

    private static Map<String, String> categoryDefinitions() {
        Map<String, String> categories = new LinkedHashMap<>();
        categories.put("java-core", "Java Core");
        categories.put("spring-boot", "Spring Boot");
        categories.put("sql-database", "SQL & Database");
        categories.put("computer-networking", "Computer Networking");
        categories.put("software-engineering", "Software Engineering");
        categories.put("english-for-it", "English for IT");
        return Map.copyOf(categories);
    }

    private static List<DemoQuiz> quizDefinitions() {
        return List.of(
                new DemoQuiz(
                        "Java Core Basics",
                        "java-core",
                        "Review essential Java runtime, type system, object-oriented, exception, collection, and String concepts.",
                        10,
                        true,
                        javaCoreQuestions()
                ),
                new DemoQuiz(
                        "Spring Boot Essentials",
                        "spring-boot",
                        "Review common Spring Boot application structure, REST, validation, persistence, and security concepts.",
                        10,
                        true,
                        springBootQuestions()
                ),
                new DemoQuiz(
                        "SQL Basics",
                        "sql-database",
                        "Review essential SQL querying, relational keys, grouping, sorting, and transaction concepts.",
                        10,
                        true,
                        sqlBasicsQuestions()
                ),
                new DemoQuiz(
                        "Networking Fundamentals",
                        "computer-networking",
                        "Review core web, addressing, transport, client-server, status code, and latency concepts.",
                        10,
                        true,
                        networkingQuestions()
                ),
                new DemoQuiz(
                        "Software Engineering Basics",
                        "software-engineering",
                        "Review requirements, development processes, modeling, testing, maintenance, and version control.",
                        10,
                        true,
                        softwareEngineeringQuestions()
                ),
                new DemoQuiz(
                        "English for IT Basics",
                        "english-for-it",
                        "Review common English terms used in software development, APIs, databases, and error messages.",
                        8,
                        true,
                        englishForItQuestions()
                ),
                new DemoQuiz(
                        "Draft — Spring Security Practice",
                        "spring-boot",
                        "Practice basic authentication, authorization, JWT, and password storage concepts before publishing.",
                        10,
                        false,
                        springSecurityPracticeQuestions()
                ),
                new DemoQuiz(
                        "Draft — Empty Quiz For Publish Validation",
                        "java-core",
                        "An empty draft for demonstrating publish validation in the admin workflow.",
                        10,
                        false,
                        List.of()
                ),
                new DemoQuiz(
                        LOCKED_QUIZ_TITLE,
                        "software-engineering",
                        "Preserve a realistic submitted-attempt history while demonstrating why structural editing is locked.",
                        8,
                        false,
                        lockedDemoQuestions()
                )
        );
    }

    private static List<DemoQuestion> javaCoreQuestions() {
        return List.of(
                question(
                        "java-core-001",
                        "What is the main role of the JVM in a Java application?",
                        1,
                        "The JVM provides the runtime environment that executes Java bytecode on a particular platform. The Java compiler, which is included in the JDK, compiles source code into bytecode.",
                        "It edits Java source files.",
                        "It executes Java bytecode on a specific platform.",
                        "It stores application data in relational tables.",
                        "It converts HTTP requests directly into SQL queries."
                ),
                question(
                        "java-core-002",
                        "Which variable is declared with a Java primitive type?",
                        2,
                        "`int` is one of Java's primitive types. `String`, `Integer`, and `List` are reference types.",
                        "String name = \"QuizMaster\";",
                        "Integer score = 10;",
                        "int questionCount = 8;",
                        "List<String> topics = new ArrayList<>();"
                ),
                question(
                        "java-core-003",
                        "In object-oriented Java, what is an object?",
                        0,
                        "A class defines structure and behavior, while an object is a concrete instance of that class. Multiple objects can be created from the same class.",
                        "An instance created from a class.",
                        "A package that contains source files.",
                        "A keyword used to handle exceptions.",
                        "A compiler option that creates bytecode."
                ),
                question(
                        "java-core-004",
                        "Which keyword declares that one Java class inherits from another class?",
                        2,
                        "A class uses `extends` to inherit accessible fields and methods from another class. `implements` is used when a class fulfills an interface contract.",
                        "implements",
                        "imports",
                        "extends",
                        "inherits"
                ),
                question(
                        "java-core-005",
                        "Which declaration correctly states that `EmailService` fulfills the `NotificationService` interface contract?",
                        1,
                        "A Java class uses the `implements` keyword to declare that it fulfills an interface contract. `extends` is used for class inheritance or for one interface extending another interface.",
                        "class EmailService extends NotificationService",
                        "class EmailService implements NotificationService",
                        "class EmailService imports NotificationService",
                        "class EmailService inherits NotificationService"
                ),
                question(
                        "java-core-006",
                        "What is the purpose of a `catch` block in Java?",
                        2,
                        "A `catch` block handles an exception type that matches an exception thrown while its associated `try` block runs. This lets the program respond to the error instead of leaving it unhandled at that point.",
                        "To declare a new class.",
                        "To repeat a block until no exception occurs.",
                        "To handle a matching exception thrown by its associated `try` block.",
                        "To prevent the compiler from creating bytecode."
                ),
                question(
                        "java-core-007",
                        "Which Java collection interface is designed to contain no duplicate elements?",
                        2,
                        "A `Set` models a collection of unique elements and does not allow duplicate elements according to its equality rules. A `List` can contain duplicates.",
                        "List",
                        "Queue",
                        "Set",
                        "Deque"
                ),
                question(
                        "java-core-008",
                        "Given `String title = \"Java\";`, what happens when `title.concat(\" Basics\")` is called without assigning its result?",
                        1,
                        "`String` objects are immutable, so `concat` returns a new `String` rather than modifying the original one. Without assigning the returned value, `title` still refers to `\"Java\"`.",
                        "title becomes \"Java Basics\".",
                        "title remains \"Java\" because String objects are immutable.",
                        "title becomes null.",
                        "The code fails to compile because concat cannot accept text."
                )
        );
    }

    private static List<DemoQuestion> springBootQuestions() {
        return List.of(
                question(
                        "spring-boot-001",
                        "What does `@SpringBootApplication` commonly provide on the main application class?",
                        0,
                        "`@SpringBootApplication` combines key annotations that enable configuration, component scanning, and Spring Boot auto-configuration. It does not automatically define application-specific persistence or security behavior.",
                        "A combination of configuration, component scanning, and auto-configuration support.",
                        "Automatic creation of every database table without JPA configuration.",
                        "Authentication for every endpoint without security configuration.",
                        "Conversion of every class into a REST controller."
                ),
                question(
                        "spring-boot-002",
                        "Which example uses constructor injection for an `AttemptService` dependency?",
                        0,
                        "Constructor injection supplies a dependency through the receiving class's constructor. This makes required dependencies explicit and allows the Spring container to provide the managed bean.",
                        "QuizController(AttemptService attemptService) { this.attemptService = attemptService; }",
                        "AttemptService attemptService = new AttemptService() inside every controller method.",
                        "A static global variable initialized by the controller.",
                        "A database column named attemptService."
                ),
                question(
                        "spring-boot-003",
                        "Which responsibility assignment best matches a typical layered Spring Boot application?",
                        0,
                        "In a typical layered design, controllers manage the HTTP boundary, services contain or coordinate business rules, and repositories provide data access. This separation keeps responsibilities clear and easier to test.",
                        "Controllers handle HTTP input, services coordinate business logic, and repositories access persistent data.",
                        "Repositories render web pages, controllers create database schemas, and services only hold constants.",
                        "Services handle CSS, repositories validate JWT signatures, and controllers manage database files directly.",
                        "Controllers perform every responsibility so services and repositories are unnecessary."
                ),
                question(
                        "spring-boot-004",
                        "What is the usual purpose of `@RestController` in Spring MVC?",
                        0,
                        "`@RestController` marks a web controller whose handler return values are written to the response body, commonly as JSON. It combines controller semantics with response-body behavior.",
                        "To mark a class whose handler return values are written to the HTTP response body.",
                        "To mark a class as a database entity.",
                        "To schedule every method to run periodically.",
                        "To encrypt all response fields automatically."
                ),
                question(
                        "spring-boot-005",
                        "Why is a DTO often used at a REST API boundary?",
                        0,
                        "A DTO defines the data accepted or returned by an API and decouples that contract from persistence entities. It can also limit exposed fields and provide a focused place for input constraints.",
                        "To define an explicit request or response shape without exposing the persistence entity directly.",
                        "To replace the database engine.",
                        "To make all fields globally writable.",
                        "To disable input validation."
                ),
                question(
                        "spring-boot-006",
                        "In a configured Spring MVC application, what is the purpose of placing `@Valid` on a request DTO parameter?",
                        0,
                        "`@Valid` requests validation of the bound DTO using its declared constraints, such as `@NotBlank`. The application can then reject invalid input through its configured error-handling flow.",
                        "To trigger validation of the DTO against its declared validation constraints.",
                        "To save the DTO to the database automatically.",
                        "To convert the endpoint into an admin-only endpoint.",
                        "To skip deserialization of the request body."
                ),
                question(
                        "spring-boot-007",
                        "What does extending `JpaRepository<Quiz, Long>` primarily provide?",
                        0,
                        "`JpaRepository` provides common repository operations such as saving, finding, and deleting entities. The generic parameters identify the entity type and its identifier type.",
                        "Common persistence operations for Quiz entities with Long identifiers.",
                        "Automatic REST authentication for quiz endpoints.",
                        "A frontend component for displaying quizzes.",
                        "Automatic generation of quiz questions by AI."
                ),
                question(
                        "spring-boot-008",
                        "When a client sends a JWT to access a protected endpoint, what should the backend do before treating the request as authenticated?",
                        1,
                        "The backend must validate the token's integrity and relevant claims before establishing authentication for the request. A token should not be trusted merely because it has the expected text fields.",
                        "Trust every token that contains an email address.",
                        "Validate the token, including its signature and relevant claims such as expiration.",
                        "Store the user's plaintext password inside the token.",
                        "Disable authorization checks for the request."
                )
        );
    }

    private static List<DemoQuestion> sqlBasicsQuestions() {
        return List.of(
                question(
                        "sql-basics-001",
                        "Which SQL statement retrieves the `name` column from every row in the `users` table?",
                        0,
                        "`SELECT name FROM users;` requests the `name` column from all rows in the `users` table. A `SELECT` statement reads data without changing those rows.",
                        "SELECT name FROM users;",
                        "UPDATE users SET name;",
                        "DELETE name FROM users;",
                        "INSERT name INTO users;"
                ),
                question(
                        "sql-basics-002",
                        "Which SQL clause filters rows according to a condition?",
                        1,
                        "The `WHERE` clause keeps only rows that satisfy its condition. For example, `WHERE active = true` filters out inactive rows.",
                        "ORDER BY",
                        "WHERE",
                        "GROUP BY",
                        "SELECT"
                ),
                question(
                        "sql-basics-003",
                        "What does an `INNER JOIN` return?",
                        2,
                        "An `INNER JOIN` returns combined rows where the join condition matches in both tables. Rows without a match are excluded from the result.",
                        "Every row from the first table, even without a match.",
                        "Every possible combination of rows from both tables.",
                        "Rows that satisfy the join condition in both tables.",
                        "Only rows that contain null values."
                ),
                question(
                        "sql-basics-004",
                        "What is the main purpose of a primary key?",
                        0,
                        "A primary key uniquely identifies each row in a table and cannot be null. This gives other tables and queries a stable way to refer to a specific row.",
                        "To uniquely identify each row in a table.",
                        "To sort every query result automatically.",
                        "To store the longest text value in a row.",
                        "To allow duplicate identifiers in a table."
                ),
                question(
                        "sql-basics-005",
                        "What does a foreign key represent in a relational database?",
                        1,
                        "A foreign key references a key in another table, creating and protecting a relationship between rows. It helps prevent references to records that do not exist.",
                        "A password used to connect to the database.",
                        "A reference from one table to a key in another table.",
                        "A temporary name for a selected column.",
                        "A rule that makes every column unique."
                ),
                question(
                        "sql-basics-006",
                        "Why is `GROUP BY` commonly used with aggregate functions such as `COUNT`?",
                        2,
                        "`GROUP BY` divides rows into groups that share selected values, allowing an aggregate to be calculated for each group. For example, it can count quizzes in each category.",
                        "To rename the result table permanently.",
                        "To remove every duplicate row from storage.",
                        "To calculate an aggregate separately for each group of rows.",
                        "To prevent the query from returning columns."
                ),
                question(
                        "sql-basics-007",
                        "What is the purpose of `ORDER BY score DESC` in a query?",
                        3,
                        "`ORDER BY` sorts the result, and `DESC` requests descending order. Higher score values therefore appear before lower score values.",
                        "To delete rows with duplicate scores.",
                        "To group rows that have the same score.",
                        "To return only rows with negative scores.",
                        "To sort rows from the highest score to the lowest score."
                ),
                question(
                        "sql-basics-008",
                        "What is the purpose of rolling back a database transaction?",
                        1,
                        "A rollback cancels the uncommitted changes made in the current transaction. It helps preserve consistency when an operation cannot complete successfully.",
                        "To make all transaction changes permanent.",
                        "To cancel uncommitted changes in the transaction.",
                        "To create a backup of the entire database.",
                        "To grant every user administrator access."
                )
        );
    }

    private static List<DemoQuestion> networkingQuestions() {
        return List.of(
                question(
                        "networking-001",
                        "What is HTTP primarily used for?",
                        0,
                        "HTTP defines how clients and servers exchange web requests and responses. It is an application-layer protocol used by browsers, APIs, and other web clients.",
                        "Exchanging web requests and responses between clients and servers.",
                        "Assigning physical addresses to network cards.",
                        "Compressing every file stored on a computer.",
                        "Replacing the operating system's file system."
                ),
                question(
                        "networking-002",
                        "What is the main role of DNS?",
                        1,
                        "DNS resolves human-readable domain names to IP addresses and other DNS records. This lets users access services by name instead of remembering numeric addresses.",
                        "To encrypt every packet sent over a network.",
                        "To translate domain names into IP addresses.",
                        "To assign application port numbers automatically.",
                        "To store web page source code."
                ),
                question(
                        "networking-003",
                        "Which statement correctly compares TCP and UDP?",
                        2,
                        "TCP provides a connection-oriented byte stream with reliable, ordered delivery. UDP sends independent datagrams without guaranteeing delivery or order.",
                        "UDP guarantees ordered delivery, while TCP does not.",
                        "TCP and UDP always provide identical delivery guarantees.",
                        "TCP provides reliable ordered delivery, while UDP does not guarantee it.",
                        "TCP can only be used inside a local network."
                ),
                question(
                        "networking-004",
                        "What is an IP address used for in an IP network?",
                        0,
                        "An IP address identifies a network interface for addressing and routing packets. Routers use destination IP addresses to move packets toward the correct network.",
                        "To identify a network interface so packets can be addressed and routed.",
                        "To name a database column.",
                        "To describe the format of an HTML document.",
                        "To hash a user's password."
                ),
                question(
                        "networking-005",
                        "What does a network port number help identify?",
                        1,
                        "A port number helps direct traffic to a particular application or service on a host. An IP address identifies the host interface, while the port distinguishes services on it.",
                        "The physical location of a computer building.",
                        "A particular application or service on a host.",
                        "The brand of the network cable.",
                        "The username of the current user."
                ),
                question(
                        "networking-006",
                        "In the client-server model, what does a client typically do?",
                        2,
                        "A client initiates a request for data or a service, and a server processes the request and returns a response. A browser requesting a web page is a common example.",
                        "It permanently replaces the server.",
                        "It assigns all IP addresses on the internet.",
                        "It sends requests to a server for data or services.",
                        "It must store every server database locally."
                ),
                question(
                        "networking-007",
                        "What does HTTP status code 404 usually indicate?",
                        3,
                        "HTTP 404 means the server did not find the requested resource. It does not by itself mean the entire server is offline.",
                        "The request succeeded and returned content.",
                        "The client must switch to a different network protocol.",
                        "The server created a new resource successfully.",
                        "The requested resource was not found."
                ),
                question(
                        "networking-008",
                        "What does network latency measure?",
                        0,
                        "Latency measures the time delay involved in sending data across a network. Higher latency generally makes interactive requests feel slower.",
                        "The delay before data reaches its destination or a response returns.",
                        "The total storage capacity of a server disk.",
                        "The number of user accounts in an application.",
                        "The maximum length of a domain name."
                )
        );
    }

    private static List<DemoQuestion> softwareEngineeringQuestions() {
        return List.of(
                question(
                        "software-engineering-001",
                        "What is a software requirement?",
                        1,
                        "A requirement describes a needed capability, behavior, quality, or constraint of a system. Clear requirements help teams agree on what the software should achieve.",
                        "A random implementation detail chosen after release.",
                        "A documented need or constraint that the system should satisfy.",
                        "A list of every variable name in the source code.",
                        "A backup copy of the production database."
                ),
                question(
                        "software-engineering-002",
                        "What does a use case primarily describe?",
                        2,
                        "A use case describes how an actor interacts with a system to achieve a goal. It focuses on observable behavior rather than internal implementation details.",
                        "The exact memory address of each object.",
                        "The color palette used by an operating system.",
                        "An interaction between an actor and the system to achieve a goal.",
                        "A list of database passwords."
                ),
                question(
                        "software-engineering-003",
                        "Which practice is commonly associated with agile development?",
                        0,
                        "Agile approaches commonly deliver work in short iterations and use feedback to adapt priorities and implementation. This supports incremental learning and delivery.",
                        "Delivering in short iterations and adapting based on feedback.",
                        "Preventing stakeholders from reviewing work until the project ends.",
                        "Avoiding all testing to increase delivery speed.",
                        "Fixing every requirement permanently before any discussion."
                ),
                question(
                        "software-engineering-004",
                        "What is the main purpose of software testing?",
                        1,
                        "Testing evaluates whether software behaves as expected and helps reveal defects. Different test levels examine behavior at different scopes.",
                        "To guarantee that software can never contain a defect.",
                        "To evaluate behavior and detect defects before they affect users.",
                        "To replace requirements and design activities completely.",
                        "To make source code unavailable to developers."
                ),
                question(
                        "software-engineering-005",
                        "How does the waterfall model traditionally organize development work?",
                        3,
                        "The waterfall model traditionally moves through defined phases in sequence, such as requirements, design, implementation, and testing. Returning to earlier phases can be more formal and costly than in iterative approaches.",
                        "As unrelated tasks with no planned order.",
                        "As continuous deployment with no requirements phase.",
                        "As daily releases driven only by production incidents.",
                        "As a sequence of distinct phases completed largely in order."
                ),
                question(
                        "software-engineering-006",
                        "What is UML commonly used for?",
                        0,
                        "UML provides standardized diagram types for visualizing and communicating aspects of a software system. Examples include class, sequence, and use case diagrams.",
                        "Modeling and communicating software structure and behavior with diagrams.",
                        "Encrypting network traffic between services.",
                        "Compiling source code into machine code.",
                        "Managing user passwords in a database."
                ),
                question(
                        "software-engineering-007",
                        "What does software maintenance include after a system is released?",
                        2,
                        "Maintenance includes correcting defects, adapting to environmental changes, and improving the system after release. It is a normal part of the software lifecycle.",
                        "Only deleting the source code after deployment.",
                        "Only writing the first project requirements.",
                        "Fixing defects, adapting the system, and making improvements.",
                        "Preventing any future change to the application."
                ),
                question(
                        "software-engineering-008",
                        "What is a key benefit of version control?",
                        1,
                        "Version control records changes over time and supports collaboration, review, and recovery of earlier versions. It provides a shared history of the codebase.",
                        "It removes the need to review any code change.",
                        "It tracks changes and helps teams collaborate on source code.",
                        "It guarantees that every committed change has no defects.",
                        "It replaces all application tests."
                )
        );
    }

    private static List<DemoQuestion> englishForItQuestions() {
        return List.of(
                question(
                        "english-it-001",
                        "In software development, what does it mean to fix a bug?",
                        0,
                        "A bug is a defect or unintended behavior in software, and to fix it means to correct that problem. The fix should normally be verified with appropriate testing.",
                        "To correct a defect in the software.",
                        "To add the same defect to more files.",
                        "To publish a database password.",
                        "To remove every feature from the application."
                ),
                question(
                        "english-it-002",
                        "What does the verb `deploy` usually mean in a software project?",
                        1,
                        "To deploy means to release or install an application version into a target environment. That environment might be used for testing, staging, or production.",
                        "To write a requirement without implementing it.",
                        "To release or install an application in a target environment.",
                        "To rename every variable in the source code.",
                        "To disconnect all users permanently."
                ),
                question(
                        "english-it-003",
                        "In database terminology, what is a query?",
                        2,
                        "A query is a request or instruction used to read or manipulate data in a database. SQL is a common language for expressing relational database queries.",
                        "A physical cable connecting two servers.",
                        "A visual icon used to start an application.",
                        "A request or instruction for working with database data.",
                        "A password that is stored without hashing."
                ),
                question(
                        "english-it-004",
                        "What does an API endpoint refer to?",
                        0,
                        "An API endpoint is a specific address and operation through which a client interacts with an API. For HTTP APIs, it is commonly described by a path and an HTTP method.",
                        "A specific API address and operation that a client can call.",
                        "The final line of every source file.",
                        "A backup battery inside a server.",
                        "A private password shared by all users."
                ),
                question(
                        "english-it-005",
                        "What does the error message `Permission denied` usually mean?",
                        1,
                        "`Permission denied` means the current user or process is not allowed to perform the requested operation. The relevant permissions or identity should be checked.",
                        "The operation completed successfully.",
                        "The current user or process lacks the required permission.",
                        "The database contains no tables.",
                        "The network connection is always too slow."
                ),
                question(
                        "english-it-006",
                        "What does it mean to refactor code?",
                        3,
                        "Refactoring improves the internal structure of code while preserving its intended external behavior. It can make code clearer, simpler, or easier to maintain.",
                        "To change every public behavior without reviewing it.",
                        "To delete all tests before editing code.",
                        "To copy a defect into another module.",
                        "To improve internal code structure without changing intended behavior."
                )
        );
    }

    private static List<DemoQuestion> springSecurityPracticeQuestions() {
        return List.of(
                question(
                        "spring-security-draft-001",
                        "Which statement correctly distinguishes authentication from authorization?",
                        0,
                        "Authentication verifies who a user is, while authorization determines what an authenticated user is allowed to do. Applications commonly perform authentication before applying authorization rules.",
                        "Authentication verifies identity, while authorization checks permitted actions.",
                        "Authentication checks permitted actions, while authorization verifies identity.",
                        "Authentication encrypts the database, while authorization creates user accounts.",
                        "Authentication and authorization always mean exactly the same thing."
                ),
                question(
                        "spring-security-draft-002",
                        "What is a common purpose of a JWT in a stateless API after a user logs in?",
                        1,
                        "A JWT can carry signed claims that the backend validates on later requests without relying on a server-side login session. The backend must still verify the token before trusting those claims.",
                        "To store the user's plaintext password in each request.",
                        "To carry signed claims that the backend can validate on later requests.",
                        "To make every endpoint public automatically.",
                        "To replace all database tables used by the application."
                ),
                question(
                        "spring-security-draft-003",
                        "Why should an application store password hashes instead of plaintext passwords?",
                        0,
                        "Password hashing lets the application verify a submitted password without storing the original password. A strong adaptive password hash also reduces the impact of a credential database exposure.",
                        "It avoids storing the original password and reduces exposure if credentials are leaked.",
                        "It allows administrators to read every user's password more easily.",
                        "It removes the need to authenticate users.",
                        "It guarantees that every user chooses a unique password."
                )
        );
    }

    private static List<DemoQuestion> lockedDemoQuestions() {
        return List.of(
                question(
                        "locked-demo-001",
                        "Why can editing an old quiz question damage historical result accuracy?",
                        0,
                        "Submitted results refer to the question and option structure used when the attempt was scored. Changing that structure can make an old score or review inconsistent with what the learner answered.",
                        "It can make stored answers and scores inconsistent with the original quiz.",
                        "It automatically improves every historical score.",
                        "It removes the need to preserve submitted answers.",
                        "It changes only the quiz title and nothing else."
                ),
                question(
                        "locked-demo-002",
                        "Why should published quiz structure remain stable after learners submit attempts?",
                        1,
                        "Stable questions and options preserve the meaning of submitted answers, scores, and reviews. Metadata may follow separate rules, but structural changes must not rewrite history.",
                        "So the quiz can expose correct answers before submission.",
                        "So submitted answers, scores, and reviews keep their original meaning.",
                        "So every learner receives the same score regardless of answers.",
                        "So authentication is no longer required."
                ),
                question(
                        "locked-demo-003",
                        "What data does an answer review need for a submitted single-choice attempt?",
                        2,
                        "A useful review connects each question to the learner's selected option, the correct option, and the explanation. This data is shown only after submission under the existing ownership rules.",
                        "Only the quiz title.",
                        "Only the learner's email address.",
                        "The selected option, correct option, and explanation for each question.",
                        "A public list of every user's attempts."
                ),
                question(
                        "locked-demo-004",
                        "Why might a quiz be unpublished while its old attempts are still preserved?",
                        3,
                        "Unpublishing prevents new public starts without erasing legitimate learner history. Existing submitted attempts can still support owned result and review flows.",
                        "To delete all historical answers silently.",
                        "To make the draft visible in the public catalog.",
                        "To allow anyone to edit another user's result.",
                        "To stop new public starts while retaining legitimate attempt history."
                )
        );
    }

    private static DemoQuestion question(
            String key,
            String content,
            int correctOptionIndex,
            String explanation,
            String... options
    ) {
        return new DemoQuestion(key, content, List.of(options), correctOptionIndex, explanation);
    }

    private record DemoUser(String email, UserRole role) {
    }

    private record DemoQuiz(
            String title,
            String categorySlug,
            String description,
            int timeLimitMinutes,
            boolean published,
            List<DemoQuestion> questions
    ) {
    }

    private record DemoQuestion(
            String key,
            String content,
            List<String> options,
            int correctOptionIndex,
            String explanation
    ) {
    }
}
