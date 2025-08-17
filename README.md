Assignment: “Software Requirements Analysis and Design: LearnWords-English — A Full-Stack CRUD Application with DevOps Practices”


---
**Description**

LearnWords-English is an innovative language-learning platform that allows users (Thai student) to improve their English vocabulary through interactive and engaging methods. Also, it offers an accessible way to build vocabulary and confidence. 

The system incorporates flashcards, quizzes, and progress tracking to inform users to know how many quizzes which they have done. Users can test their comprehension right away, practice words in various contexts, and use spaced repetition techniques to gradually reinforce their knowledge.

In addition, this application provides scalability and flexibility for user accounts, quiz results, and flashcards. For safe and customised learning, user management and authentication are put into place. LearnWords-English ultimate objective is to give students of all skill levels an approachable and inspiring tool that will allow them to confidently assess their progress and effectively increase their vocabulary.


**Objective**

This project has been created and included user authentication using Node.js, React.js, and MongoDB, and extended it into LearnWords-English, a full-stack application that helps users build English vocabulary. It is implemented CRUD operations for flashcards and quizzes, while managing tasks in Jira with user stories and sprints, creating SysML diagrams (Requirement, BDD, Parametric) Development was tracked with GitHub, using feature branches, commits linked to Jira issues, and pull requests. For deployment, CI/CD with GitHub Actions have been set up in order to managed backend processes with PM2, and hosted the app on AWS EC2 with Nginx.

---
Main features

1.User Authentication (Signup, Login, and Logout)

2.Flashcards Management (CRUD)
- Create: Add new flashcards with word, definition, and example
- Read: Browse and search existing flashcards
- Update: Edit flashcard details
- Delete: Remove flashcards from collection

3.Quiz System (CRUD)
- Create: Generate quizzes from flashcards
- Read: Take quizzes with multiple-choice or input answers
- Update: Manage/edit quiz questions
- Delete: Remove unwanted quizzes

4.Bug Tracking and Resolution

---

**GitHub link of the starter project: **[https://github.com/Bonneynatt/LearnWords-English} 

---

Requirements – LearnWords-English

1. Real-World Application
- LearnWords-English: a full-stack web app for learning English through flashcards and quizzes, supporting full CRUD functionality.

2. Design & Project Management

- SysML diagrams: Requirements, BDD, Parametric (for quiz scoring & flashcard review).

- Managed in Jira with Epics, User Stories, Subtasks, and Sprints.

- Linked Jira issues to GitHub commits/branches.

3. Backend (Node.js + Express + MongoDB)

- REST API with CRUD for Users, Flashcards, Quizzes.

- Mongoose for schema and validation.

4. Frontend (React.js)

- User-friendly UI with Browse, Study, and Manage modes.

- Forms for adding/editing, lists/cards for displaying data.

- AuthContext + Axios for API integration.

5. Authentication & Authorization

- JWT-based login/signup.

- Only authenticated users can perform CRUD.

6. Version Control (GitHub)

- main branch for production.

- Feature branches per Jira issue.

- Commits and PRs follow Jira ticket references.

7. CI/CD & Deployment

- GitHub Actions for build & test automation.

- Backend with PM2 on AWS EC2.

- Frontend served via Nginx on AWS.

