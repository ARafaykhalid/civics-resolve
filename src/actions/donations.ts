"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import DonationCampaign from "@/models/DonationCampaign";
import DonationTransaction from "@/models/Donation";
import { donationCampaignSchema, donationTransactionSchema } from "@/lib/validations";

/** Create donation campaign (admin only) */
export async function createDonationCampaign(data: {
  title: string; description: string; category: string;
  images: string[]; qrCodeImage: string; upiId?: string; goalAmount: number;
}) {
  try {
    const validated = donationCampaignSchema.parse(data);
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    const campaign = await DonationCampaign.create({ ...validated, createdBy: session.user.id });
    revalidatePath("/donate");
    return { success: true, data: { id: campaign._id.toString() } };
  } catch (error) {
    console.error("Create campaign error:", error);
    return { success: false, error: "Failed to create campaign" };
  }
}

/** Get all active donation campaigns */
export async function getDonationCampaigns(showAll = false) {
  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = showAll ? {} : { isActive: true };
    const campaigns = await DonationCampaign.find(query).sort({ createdAt: -1 }).lean();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, data: campaigns.map((c: any) => ({
      ...c, _id: c._id.toString(), createdBy: c.createdBy?.toString(),
      createdAt: c.createdAt?.toISOString?.() || c.createdAt,
      updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
    }))};
  } catch (error) {
    console.error("Get campaigns error:", error);
    return { success: false, error: "Failed to fetch campaigns" };
  }
}

/** Get a single campaign by ID */
export async function getDonationCampaignById(id: string) {
  try {
    await connectDB();
    const campaign = await DonationCampaign.findById(id).lean();
    if (!campaign) return { success: false, error: "Campaign not found" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = campaign as any;
    return { success: true, data: {
      ...c, _id: c._id.toString(), createdBy: c.createdBy?.toString(),
      createdAt: c.createdAt?.toISOString?.() || c.createdAt,
      updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
    }};
  } catch (error) {
    console.error("Get campaign error:", error);
    return { success: false, error: "Failed to fetch campaign" };
  }
}

/** Submit donation proof (any user) */
export async function submitDonationProof(data: {
  campaignId: string; donorName: string; donorEmail?: string;
  amount: number; transactionId: string; screenshotUrl?: string;
}) {
  try {
    const validated = donationTransactionSchema.parse(data);
    await connectDB();
    const session = await auth();

    await DonationTransaction.create({
      ...validated,
      userId: session?.user?.id || undefined,
      status: "pending",
    });

    revalidatePath(`/donate/${validated.campaignId}`);
    return { success: true, message: "Donation proof submitted. Admin will verify it." };
  } catch (error) {
    console.error("Submit donation proof error:", error);
    return { success: false, error: "Failed to submit proof" };
  }
}

/** Get transactions for a campaign (admin) */
export async function getCampaignTransactions(campaignId: string) {
  try {
    await connectDB();
    const transactions = await DonationTransaction.find({ campaignId }).sort({ createdAt: -1 }).lean();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, data: transactions.map((t: any) => ({
      ...t, _id: t._id.toString(), campaignId: t.campaignId?.toString(),
      userId: t.userId?.toString(),
      createdAt: t.createdAt?.toISOString?.() || t.createdAt,
      updatedAt: t.updatedAt?.toISOString?.() || t.updatedAt,
    }))};
  } catch (error) {
    console.error("Get transactions error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Verify/reject donation transaction (admin only) */
export async function verifyDonationTransaction(transactionId: string, action: "verified" | "rejected", adminNote?: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin") return { success: false, error: "Admin required" };

    const transaction = await DonationTransaction.findById(transactionId);
    if (!transaction) return { success: false, error: "Transaction not found" };

    transaction.status = action;
    transaction.adminNote = adminNote || "";
    await transaction.save();

    // If verified, update campaign raised amount
    if (action === "verified") {
      await DonationCampaign.findByIdAndUpdate(transaction.campaignId, {
        $inc: { raisedAmount: transaction.amount },
      });
    }

    revalidatePath("/dashboard");
    revalidatePath(`/donate/${transaction.campaignId}`);
    return { success: true, message: `Transaction ${action}` };
  } catch (error) {
    console.error("Verify transaction error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Toggle campaign active status (admin) */
export async function toggleCampaignStatus(campaignId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin") return { success: false, error: "Admin required" };

    const campaign = await DonationCampaign.findById(campaignId);
    if (!campaign) return { success: false, error: "Not found" };

    campaign.isActive = !campaign.isActive;
    await campaign.save();
    revalidatePath("/donate");
    revalidatePath("/dashboard");
    return { success: true, message: campaign.isActive ? "Activated" : "Deactivated" };
  } catch (error) {
    console.error("Toggle campaign error:", error);
    return { success: false, error: "Failed" };
  }
}
