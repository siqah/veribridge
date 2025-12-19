// Email template for admin formation alerts
// Used in the manual concierge workflow

export function generateFormationAdminEmail(order, formData) {
  const {
    id,
    companyName,
    jurisdiction,
    companyType,
    directorName,
    directorAddress,
    paymentAmount,
  } = order;

  const {
    sicCode,
    directorDob,
    nationality,
    occupation,
    townOfBirth,
    mothersMaidenName,
    fathersFirstName,
    directorEmail,
    directorPhone,
  } = formData;

  // Map SIC code to description
  const sicDescriptions = {
    62020: "IT Consultancy",
    62012: "Business Software Development",
    74100: "Specialized Design Activities",
    47910: "Retail via Internet",
    82990: "Business Support Services",
  };

  const sicDescription = sicDescriptions[sicCode] || sicCode;

  const emailBody = `
🚨 ACTION REQUIRED: New ${jurisdiction} Formation Order #${id}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADMIN, PLEASE LOG INTO RAPID FORMATIONS AND COPY-PASTE THIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. COMPANY NAME:   ${companyName} ${companyType}

2. SIC CODE:       ${sicCode} - ${sicDescription}

3. DIRECTOR DETAILS:
   - Full Name:       ${directorName}
   - Date of Birth:   ${directorDob}
   - Nationality:     ${nationality}
   - Occupation:      ${occupation}

4. SECURITY QUESTIONS (Authentication Data):
   - Town of Birth:           ${townOfBirth}
   - Mother's Maiden Name:    ${mothersMaidenName}
   - Father's First Name:     ${fathersFirstName}

5. CONTACT INFORMATION:
   - Email:    ${directorEmail}
   - Phone:    ${directorPhone}

6. ADDRESSES:
   ✅ Service Address (PUBLIC): 
      71-75 Shelton Street, Covent Garden, London WC2H 9JQ
      (Included in Privacy Package - select from Rapid Formations list)
   
   ✅ Residential Address (PRIVATE):
      ${directorAddress}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PAYMENT STATUS: PAID (KES ${paymentAmount.toLocaleString()})

🔗 RAPID FORMATIONS DASHBOARD:
   https://www.rapidformations.co.uk/

📦 PACKAGE TO SELECT:
   "Privacy Package" - £64.99 (includes £50 govt fee + addresses)
   ❌ DECLINE all upsells (printed certs, call answering, etc)

📋 NEXT STEPS:
   1. Log into Rapid Formations account
   2. Click "Form New Company"
   3. Copy-paste the data above
   4. Select "Privacy Package" (£64.99)
   5. Complete payment using company card/Wise
   6. Wait 24-48 hours for certificate
   7. Upload PDF to VeriBridge order #${id}
   8. Customer receives automated email

💵 ECONOMICS:
   Customer paid:  KES ${paymentAmount.toLocaleString()}
   Package cost:   KES 11,050 (£64.99)
   Paystack fee:   KES 300
   ──────────────────────────
   Your profit:    KES ${(paymentAmount - 11050 - 300).toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is an automated alert from VeriBridge Formation Service.
Order created at: ${new Date().toLocaleString("en-GB", {
    timeZone: "Africa/Nairobi",
  })} EAT
  `;

  return {
    subject: `🚨 ACTION REQUIRED: New Formation Order #${id} - ${companyName}`,
    body: emailBody,
    html: `<pre style="font-family: monospace; font-size: 12px; line-height: 1.6; background: #f5f5f5; padding: 20px; border-radius: 8px;">${emailBody}</pre>`,
  };
}

// Console log version for development (no email service yet)
export function logFormationAlert(order, formData) {
  const email = generateFormationAdminEmail(order, formData);

  console.log("\n" + "=".repeat(80));
  console.log(email.subject);
  console.log("=".repeat(80));
  console.log(email.body);
  console.log("=".repeat(80) + "\n");

  return email;
}
