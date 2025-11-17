require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const FAQ = require('../models/FAQ');

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Support Agent 1',
    email: 'agent1@example.com',
    password: 'agent123',
    role: 'agent'
  },
  {
    name: 'Support Agent 2',
    email: 'agent2@example.com',
    password: 'agent123',
    role: 'agent'
  },
  {
    name: 'John Customer',
    email: 'customer1@example.com',
    password: 'customer123',
    role: 'customer'
  },
  {
    name: 'Jane Doe',
    email: 'customer2@example.com',
    password: 'customer123',
    role: 'customer'
  }
];

// Comprehensive FAQ data for all categories
const faqs = [
  // ACCOUNT CATEGORY
  {
    category: 'account',
    question: 'How do I create a new account?',
    answer: 'To create a new account, click on the "Register" button on the login page. Fill in your name, email address, and create a secure password. Once submitted, your account will be created immediately and you can start using our support portal.',
    keywords: ['register', 'sign up', 'create account', 'new user', 'registration']
  },
  {
    category: 'account',
    question: 'How can I reset my password?',
    answer: 'If you forgot your password, click on the "Forgot Password" link on the login page. Enter your registered email address, and we will send you a password reset link. Follow the instructions in the email to create a new password.',
    keywords: ['password reset', 'forgot password', 'change password', 'reset']
  },
  {
    category: 'account',
    question: 'How do I update my profile information?',
    answer: 'To update your profile information, log in to your account and navigate to the "Profile" or "Settings" section. You can update your name, email, and other personal information there. Remember to save your changes before leaving the page.',
    keywords: ['profile', 'update profile', 'edit account', 'personal information']
  },
  {
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'To delete your account, please contact our support team directly through the chat or email support@example.com. For security reasons, account deletion requires manual verification and cannot be done automatically.',
    keywords: ['delete account', 'close account', 'remove account', 'account deletion']
  },
  {
    category: 'account',
    question: 'Can I change my email address?',
    answer: 'Yes, you can change your email address in the account settings. Go to Profile Settings, click on "Email Settings," and enter your new email address. You will need to verify the new email address before the change takes effect.',
    keywords: ['change email', 'update email', 'email address', 'modify email']
  },

  // BILLING CATEGORY
  {
    category: 'billing',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway.',
    keywords: ['payment', 'payment methods', 'credit card', 'paypal', 'billing']
  },
  {
    category: 'billing',
    question: 'How can I view my billing history?',
    answer: 'To view your billing history, log in to your account and navigate to "Billing" or "Payment History" section. You can see all past invoices, payment dates, and amounts. You can also download invoices as PDF files.',
    keywords: ['billing history', 'invoices', 'payment history', 'receipts']
  },
  {
    category: 'billing',
    question: 'How do I update my billing information?',
    answer: 'To update your billing information, go to Account Settings > Billing Information. You can update your payment method, billing address, and credit card details. Changes take effect immediately.',
    keywords: ['update billing', 'payment info', 'credit card update', 'billing address']
  },
  {
    category: 'billing',
    question: 'What is your refund policy?',
    answer: 'We offer a 30-day money-back guarantee for all new subscriptions. If you are not satisfied with our service, contact us within 30 days of your purchase for a full refund. Refunds are processed within 5-7 business days.',
    keywords: ['refund', 'money back', 'cancellation', 'refund policy']
  },
  {
    category: 'billing',
    question: 'Do you offer discounts for annual subscriptions?',
    answer: 'Yes! We offer a 20% discount when you choose annual billing instead of monthly. Annual subscriptions also include priority support and additional features. Contact our sales team for enterprise pricing.',
    keywords: ['discount', 'annual', 'subscription', 'pricing', 'yearly']
  },
  {
    category: 'billing',
    question: 'Why was my payment declined?',
    answer: 'Payments can be declined for several reasons: insufficient funds, incorrect card details, expired card, or bank security measures. Please verify your payment information and try again. If the issue persists, contact your bank or try a different payment method.',
    keywords: ['payment declined', 'payment failed', 'card declined', 'transaction failed']
  },

  // TECHNICAL CATEGORY
  {
    category: 'technical',
    question: 'Why is the chat not loading?',
    answer: 'If the chat is not loading, try these steps: 1) Refresh your browser, 2) Clear your browser cache and cookies, 3) Check your internet connection, 4) Try a different browser, 5) Disable browser extensions that might block the chat. If the issue persists, contact our technical support.',
    keywords: ['chat not loading', 'chat broken', 'cant see chat', 'loading issue']
  },
  {
    category: 'technical',
    question: 'Which browsers are supported?',
    answer: 'Our platform works best on the latest versions of Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. We recommend keeping your browser updated for the best experience and security. Internet Explorer is not supported.',
    keywords: ['browser', 'supported browsers', 'compatibility', 'chrome', 'firefox']
  },
  {
    category: 'technical',
    question: 'How do I enable notifications?',
    answer: 'To enable notifications, click on the notification icon in your browser\'s address bar when prompted, or go to your browser settings > Site Settings > Notifications and allow notifications for our website. You can also enable in-app notifications in your account settings.',
    keywords: ['notifications', 'alerts', 'enable notifications', 'push notifications']
  },
  {
    category: 'technical',
    question: 'I am experiencing slow performance. What should I do?',
    answer: 'For slow performance issues: 1) Check your internet connection speed, 2) Close unnecessary browser tabs, 3) Clear browser cache, 4) Disable heavy browser extensions, 5) Restart your browser. If you continue experiencing issues, report them to our technical support team.',
    keywords: ['slow', 'performance', 'lag', 'speed', 'loading slow']
  },
  {
    category: 'technical',
    question: 'How do I report a bug or technical issue?',
    answer: 'To report a bug, use the "Report Issue" button in the chat interface, or click on "Help" > "Report Bug" in the main menu. Provide detailed information about what happened, including screenshots if possible. Our technical team will investigate and respond within 24 hours.',
    keywords: ['bug', 'report bug', 'technical issue', 'error', 'problem']
  },
  {
    category: 'technical',
    question: 'Is my data secure?',
    answer: 'Yes, we take security very seriously. All data is encrypted in transit using TLS/SSL and at rest using AES-256 encryption. We comply with GDPR, SOC 2, and industry best practices. Your conversations and personal information are never shared with third parties without your consent.',
    keywords: ['security', 'data security', 'encryption', 'privacy', 'safe']
  },

  // PRODUCT CATEGORY
  {
    category: 'product',
    question: 'What features are included in the free plan?',
    answer: 'Our free plan includes: basic AI chat support, up to 50 messages per month, conversation history for 30 days, and email support. Upgrade to Pro for unlimited messages, priority support, advanced analytics, and custom AI training.',
    keywords: ['free plan', 'features', 'pricing', 'free tier', 'limitations']
  },
  {
    category: 'product',
    question: 'How does the AI chatbot work?',
    answer: 'Our AI chatbot uses advanced GPT-4 technology to understand and respond to your questions. It learns from our comprehensive knowledge base and previous conversations to provide accurate, helpful responses. The AI is continuously improved based on feedback and new information.',
    keywords: ['ai', 'chatbot', 'how it works', 'gpt', 'artificial intelligence']
  },
  {
    category: 'product',
    question: 'Can I customize the AI responses?',
    answer: 'Yes! You can customize your experience by adjusting the tone (formal/casual), response length (detailed/concise), and adding custom instructions in your preferences. Pro users can also create custom AI training with company-specific information.',
    keywords: ['customize', 'personalize', 'ai settings', 'preferences', 'custom']
  },
  {
    category: 'product',
    question: 'What is the difference between Pro and Enterprise plans?',
    answer: 'Pro plan includes unlimited messages, priority support, and basic analytics. Enterprise plan adds: dedicated account manager, custom AI training, SSO integration, advanced analytics, SLA guarantees, and API access. Contact sales for Enterprise pricing.',
    keywords: ['plans', 'enterprise', 'pro', 'comparison', 'upgrade']
  },
  {
    category: 'product',
    question: 'Can I integrate this with my existing tools?',
    answer: 'Yes, we offer integrations with popular tools including Slack, Microsoft Teams, Zendesk, Salesforce, and more. Pro and Enterprise plans include API access for custom integrations. Check our documentation for the full list of supported integrations.',
    keywords: ['integration', 'api', 'connect', 'tools', 'third party']
  },
  {
    category: 'product',
    question: 'How accurate are the AI responses?',
    answer: 'Our AI maintains a 92% accuracy rate based on user feedback. It excels at answering common questions using our knowledge base. For complex or unique situations, the system can escalate to human agents. We continuously improve accuracy through machine learning and user feedback.',
    keywords: ['accuracy', 'correct', 'reliable', 'ai quality', 'performance']
  },

  // GENERAL CATEGORY
  {
    category: 'general',
    question: 'How can I contact customer support?',
    answer: 'You can contact our customer support team through: 1) Live chat (available 24/7), 2) Email at support@example.com, 3) Phone at 1-800-SUPPORT (business hours), or 4) Submit a ticket through your dashboard. Average response time is under 2 hours.',
    keywords: ['contact', 'support', 'customer service', 'help', 'reach out']
  },
  {
    category: 'general',
    question: 'What are your support hours?',
    answer: 'Our AI chatbot is available 24/7 for instant assistance. Human support agents are available Monday-Friday, 9 AM to 6 PM EST. Pro and Enterprise customers have access to extended support hours and priority response times.',
    keywords: ['hours', 'availability', 'support hours', 'when', 'time']
  },
  {
    category: 'general',
    question: 'Do you offer training or tutorials?',
    answer: 'Yes! We offer: 1) Interactive video tutorials in the Help Center, 2) Comprehensive documentation and guides, 3) Weekly webinars for new users, and 4) One-on-one training sessions for Enterprise customers. All resources are free and accessible from your dashboard.',
    keywords: ['training', 'tutorial', 'learn', 'guide', 'help center']
  },
  {
    category: 'general',
    question: 'How do I provide feedback or suggestions?',
    answer: 'We love hearing from our users! Provide feedback through: 1) The feedback form in your dashboard, 2) Email us at feedback@example.com, 3) Vote on feature requests in our community forum, or 4) Participate in our monthly user survey. Your input helps shape our product!',
    keywords: ['feedback', 'suggestion', 'feature request', 'improve', 'ideas']
  },
  {
    category: 'general',
    question: 'Is there a mobile app available?',
    answer: 'Currently, our platform is fully responsive and works great on mobile browsers. We are developing dedicated iOS and Android apps, which are scheduled for release in Q2 2024. Sign up for our newsletter to be notified when they launch!',
    keywords: ['mobile app', 'ios', 'android', 'mobile', 'app']
  },
  {
    category: 'general',
    question: 'How do I upgrade or downgrade my subscription?',
    answer: 'To change your subscription, go to Account Settings > Subscription. You can upgrade anytime and changes take effect immediately. Downgrades take effect at the end of your current billing cycle. You will not lose any data when changing plans.',
    keywords: ['upgrade', 'downgrade', 'change plan', 'subscription', 'switch']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await FAQ.deleteMany({});

    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Get admin user for FAQ creation
    const adminUser = createdUsers.find(user => user.role === 'admin');

    console.log('📚 Creating FAQs...');
    const faqsWithCreator = faqs.map(faq => ({
      ...faq,
      createdBy: adminUser._id
    }));
    const createdFAQs = await FAQ.create(faqsWithCreator);
    console.log(`✅ Created ${createdFAQs.length} FAQs`);

    // Display summary
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║          Database Seeded Successfully!            ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - FAQs: ${createdFAQs.length}`);
    console.log('   - Categories: Account, Billing, Technical, Product, General\n');

    console.log('👤 Test Users:');
    console.log('   Admin:');
    console.log('     Email: admin@example.com');
    console.log('     Password: admin123\n');
    console.log('   Agent:');
    console.log('     Email: agent1@example.com');
    console.log('     Password: agent123\n');
    console.log('   Customer:');
    console.log('     Email: customer1@example.com');
    console.log('     Password: customer123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
