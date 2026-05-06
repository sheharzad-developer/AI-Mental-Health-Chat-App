"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function bookSession(doctorId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) redirect("/");

  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!date || !time) {
    redirect(`/doctors/${doctorId}?error=Pick+a+date+and+time`);
  }

  // Combine date + time into an ISO timestamp
  const scheduledFor = new Date(`${date}T${time}:00`).toISOString();

  const { data, error } = await supabaseAdmin()
    .from("bookings")
    .insert({
      user_email: session.user.email,
      doctor_id: doctorId,
      scheduled_for: scheduledFor,
      notes: notes || null,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      `/doctors/${doctorId}?error=${encodeURIComponent(error?.message ?? "Failed to create booking.")}`
    );
  }

  const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  if (!paymentLink) {
    redirect(
      `/doctors/${doctorId}?error=Payment+link+not+configured`
    );
  }

  // client_reference_id ties the Stripe payment back to this booking row.
  // prefilled_email saves the user a step in checkout.
  const url = new URL(paymentLink);
  url.searchParams.set("client_reference_id", data.id);
  url.searchParams.set("prefilled_email", session.user.email);

  redirect(url.toString());
}
