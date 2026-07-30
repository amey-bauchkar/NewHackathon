import { MockOffer } from "./types";

export const mockOffers: MockOffer[] = [
  {
    id: "scam-1",
    title: "🚨 Urgent Selection Notice",
    preview: "You're selected without interview. Pay ₹2,000...",
    tag: "scam",
    text: `Subject: Congratulations! You've Been Selected for Internship at GlobalTech Solutions

Dear Student,

We are pleased to inform you that you have been selected for a 3-month paid internship at GlobalTech Solutions Pvt. Ltd. based on your impressive college profile. No interview is required — you have been directly shortlisted!

Internship Details:
- Role: Software Development Intern
- Stipend: ₹25,000/month
- Duration: 3 Months
- Location: Work From Home

To confirm your seat, please pay a one-time refundable security deposit of ₹2,000 via the link below within 24 hours. Seats are limited and your slot will be released if payment is not received by tomorrow.

Payment Link: https://pay.globaltech-solutions.xyz/intern-fee

After payment, your offer letter and onboarding documents will be emailed within 2 hours.

Best regards,
HR Team
GlobalTech Solutions Pvt. Ltd.
hr@globaltech-solutions.xyz`,
  },
  {
    id: "scam-2",
    title: "🚨 WhatsApp Job Offer",
    preview: "Hi! We found your resume on Naukri...",
    tag: "scam",
    text: `Hi there! 👋

We found your resume on Naukri.com and are impressed with your profile. We have an exciting work-from-home data entry opportunity for you.

Company: Digital Marketing Pro
Earn: ₹15,000 - ₹45,000 per month
Work: Just 2-3 hours daily from your phone!
No experience needed!

To get started, you need to:
1. Register on our portal by paying ₹500 registration fee
2. Complete a simple training module
3. Start earning from Day 1!

This is a limited time offer. We are only selecting 50 candidates this week. Reply "YES" immediately to secure your spot.

Send payment to: UPI - digitalmarketingpro@ybl

Contact: +91 98765 43210 (WhatsApp only)
No calls please.`,
  },
  {
    id: "suspicious-1",
    title: "⚠️ Vague Startup Offer",
    preview: "Exciting opportunity at a fast-growing startup...",
    tag: "suspicious",
    text: `Subject: Internship Opportunity - Exciting Startup

Hi,

We are a fast-growing startup in the tech space and are looking for interns to join our dynamic team. We came across your profile and think you'd be a great fit.

Role: Marketing & Operations Intern
Duration: 2 months
Stipend: Performance-based (details shared after joining)
Location: Remote

We need you to start immediately. Please share your resume, college ID, and Aadhaar card copy for our records. We'll send the offer letter once we receive your documents.

The internship will be confirmed on a first-come-first-serve basis, so please respond within 48 hours.

Looking forward to hearing from you!

Thanks,
Team HR
(Company name and website not mentioned)`,
  },
  {
    id: "safe-1",
    title: "✅ Legitimate TCS Offer",
    preview: "TCS NQT — Your internship offer from Tata...",
    tag: "safe",
    text: `Subject: Internship Offer Letter — Tata Consultancy Services

Dear Candidate,

Congratulations! Based on your performance in the TCS National Qualifier Test (NQT) and subsequent interview rounds, we are pleased to offer you an internship position at Tata Consultancy Services Limited.

Internship Details:
- Role: Assistant Systems Engineer Intern
- Department: Digital Transformation
- Stipend: ₹15,000/month
- Duration: 6 months (January 2025 – June 2025)
- Location: TCS Synergy Park, Hyderabad
- Reporting Manager: Mr. Rajesh Kumar

Please note:
- No fees or deposits are required at any stage
- Your offer is contingent upon background verification
- Please accept this offer by logging into the TCS iON portal within 7 days

For queries, contact your college placement coordinator or reach us at:
Email: campus.recruitment@tcs.com
Phone: 1800-209-3111 (Toll Free)

We look forward to welcoming you to the TCS family!

Warm regards,
Priya Sharma
Head — Campus Recruitment
Tata Consultancy Services Limited
www.tcs.com`,
  },
];
