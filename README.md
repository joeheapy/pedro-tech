Service Story Maker - AI-Powered Service Design Platform

Overview
Service Story Maker is a full-stack AI SaaS application designed for service designers, UX professionals, and product managers. It streamlines the service design process by automatically generating customer journeys, personas, pain points, and feature recommendations based on user inputs and AI analysis.

Features
Customer Journey Mapping: Create and visualize detailed customer journeys with AI assistance
Persona Generation: Develop realistic user personas based on journey context
Pain Point Analysis: Identify customer and business pain points throughout the journey
Feature Recommendations: Receive AI-powered feature suggestions to address user needs
Project Management: Create, edit, and organize multiple service design projects
User Authentication: Secure sign-up, sign-in, and profile management using Clerk
Payment Processing: Subscription management and secure payments via Stripe
Type Safety: Fully typed with TypeScript for improved maintainability
Token System: Manage AI generation usage with an intuitive token system
Technologies Used
NextJS 15 (App Router)
React
TypeScript
TailwindCSS
Shadcn UI
Clerk Authentication
Stripe Payments
Prisma ORM
PostgreSQL
OpenAI API
Installation
Clone the repository:

Navigate into the project directory:

Install dependencies:

Configure Environment Variables:
Create a .env.local file in the project root and add:

Initialize the database:

Run the Development Server:

Usage
Visit http://localhost:3000 to access the application
Sign up or sign in using Clerk authentication
Create a new project with title and description
Generate a customer journey with key steps
Create personas based on your journey
Identify customer and business pain points
Generate feature recommendations to address pain points
Access your projects anytime from the projects dashboard
Data Architecture
The application uses a PostgreSQL database with Prisma ORM. Key models include:

Profile: User profile with subscription information
Project: Container for all service design assets
JourneySteps: Customer journey mapping data
Persona: User persona definitions
CustomerPains: Pain points identified in the journey
Features: Generated feature recommendations
Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request. For major changes, please open an issue first to discuss what you would like to change.

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
License
This project is licensed under the MIT License - see the LICENSE file for details.
