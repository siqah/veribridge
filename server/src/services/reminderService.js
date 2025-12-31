import prisma from "../db/prisma.js";
import { sendPaymentReminderEmail } from "./emailService.js";

/**
 * Schedule reminders for a new invoice
 */
export async function scheduleReminders(invoiceId, dueDate) {
  if (!dueDate) return;

  const reminderOffsets = [
    { type: "before_due", days: -3, label: "3 days before" },
    { type: "on_due", days: 0, label: "On due date" },
    { type: "overdue_7", days: 7, label: "7 days overdue" },
    { type: "overdue_14", days: 14, label: "14 days overdue" },
  ];

  try {
    for (const offset of reminderOffsets) {
      const scheduledFor = new Date(dueDate);
      scheduledFor.setDate(scheduledFor.getDate() + offset.days);

      // Only schedule future reminders
      if (scheduledFor > new Date()) {
        await prisma.paymentReminder.create({
          data: {
            invoiceId,
            reminderType: offset.type,
            daysOffset: offset.days,
            scheduledFor,
            status: "pending",
          },
        });
      }
    }

    console.log(`📅 Scheduled reminders for invoice ${invoiceId}`);
  } catch (error) {
    console.error("Error scheduling reminders:", error);
  }
}

/**
 * Cancel all pending reminders for an invoice
 */
export async function cancelReminders(invoiceId) {
  try {
    await prisma.paymentReminder.updateMany({
      where: {
        invoiceId,
        status: "pending",
      },
      data: {
        status: "cancelled",
      },
    });

    console.log(`🚫 Cancelled reminders for invoice ${invoiceId}`);
  } catch (error) {
    console.error("Error cancelling reminders:", error);
  }
}

/**
 * Process all due payment reminders (for cron job)
 */
export async function processPaymentReminders() {
  console.log("⏰ Processing payment reminders...");

  try {
    const now = new Date();

    // Find all pending reminders that are due
    const dueReminders = await prisma.paymentReminder.findMany({
      where: {
        status: "pending",
        scheduledFor: { lte: now },
      },
      include: {
        invoice: {
          include: {
            user: {
              include: { userProfile: true },
            },
          },
        },
      },
    });

    console.log(`Found ${dueReminders.length} due reminders`);

    for (const reminder of dueReminders) {
      const { invoice } = reminder;

      // Skip if invoice is already paid or cancelled
      if (invoice.status === "PAID" || invoice.status === "CANCELLED") {
        await prisma.paymentReminder.update({
          where: { id: reminder.id },
          data: { status: "cancelled" },
        });
        continue;
      }

      // Skip if no client email
      if (!invoice.clientEmail) {
        await prisma.paymentReminder.update({
          where: { id: reminder.id },
          data: {
            status: "failed",
            errorMessage: "No client email",
          },
        });
        continue;
      }

      try {
        // Get email template based on reminder type
        const emailData = getReminderEmailData(reminder, invoice);

        // Send email
        await sendPaymentReminderEmail({
          to: invoice.clientEmail,
          subject: emailData.subject,
          invoiceNumber: invoice.invoiceNumber,
          clientName: invoice.clientName,
          amount: invoice.total / 100,
          currency: invoice.currency,
          dueDate: invoice.dueDate,
          portalLink: `${
            process.env.CLIENT_URL || "http://localhost:5173"
          }/invoice/${invoice.accessToken}`,
          reminderType: reminder.reminderType,
          businessName: invoice.user.userProfile?.businessName || "VeriBridge",
        });

        // Mark as sent
        await prisma.paymentReminder.update({
          where: { id: reminder.id },
          data: {
            status: "sent",
            sentAt: new Date(),
          },
        });

        console.log(
          `✅ Sent ${reminder.reminderType} reminder for invoice ${invoice.invoiceNumber}`
        );
      } catch (error) {
        console.error(`❌ Failed to send reminder ${reminder.id}:`, error);

        await prisma.paymentReminder.update({
          where: { id: reminder.id },
          data: {
            status: "failed",
            errorMessage: error.message,
          },
        });
      }
    }

    console.log("⏰ Payment reminder processing complete");
  } catch (error) {
    console.error("Payment reminder processing error:", error);
  }
}

/**
 * Get email data based on reminder type
 */
function getReminderEmailData(reminder, invoice) {
  const invoiceNumber = invoice.invoiceNumber;
  const formattedAmount = `${invoice.currency} ${(
    invoice.total / 100
  ).toLocaleString()}`;

  switch (reminder.reminderType) {
    case "before_due":
      return {
        subject: `Payment Reminder: Invoice ${invoiceNumber} due in 3 days`,
        heading: "Payment Reminder",
        message: `This is a friendly reminder that your invoice ${invoiceNumber} for ${formattedAmount} is due in 3 days.`,
      };
    case "on_due":
      return {
        subject: `Payment Due Today: Invoice ${invoiceNumber}`,
        heading: "Payment Due Today",
        message: `Your invoice ${invoiceNumber} for ${formattedAmount} is due today. Please make your payment to avoid any late fees.`,
      };
    case "overdue_7":
      return {
        subject: `Overdue Invoice: ${invoiceNumber} - 7 days past due`,
        heading: "Invoice Overdue",
        message: `Your invoice ${invoiceNumber} for ${formattedAmount} is now 7 days overdue. Please make your payment as soon as possible.`,
      };
    case "overdue_14":
      return {
        subject: `URGENT: Invoice ${invoiceNumber} - 14 days overdue`,
        heading: "Urgent Payment Required",
        message: `Your invoice ${invoiceNumber} for ${formattedAmount} is now 14 days overdue. Immediate payment is required to avoid further action.`,
      };
    default:
      return {
        subject: `Payment Reminder: Invoice ${invoiceNumber}`,
        heading: "Payment Reminder",
        message: `This is a reminder about your invoice ${invoiceNumber} for ${formattedAmount}.`,
      };
  }
}

export default {
  scheduleReminders,
  cancelReminders,
  processPaymentReminders,
};
