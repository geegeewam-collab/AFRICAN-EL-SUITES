import { Booking } from "./types";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function createBooking(bookingData: Omit<Booking, "id" | "createdAt" | "paymentStatus">) {
  try {
    const bookingsRef = collection(db, "bookings");
    const docRef = await addDoc(bookingsRef, {
      ...bookingData,
      paymentStatus: 'pending',
      createdAt: serverTimestamp(),
    });

    return { id: docRef.id, success: true };
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking record");
  }
}

export async function triggerStkPush(phone: string, amount: number, bookingId: string) {
  // This is where we integrate with Flutterwave / IntaSend / Daraja
  console.log(`Triggering STK Push for ${phone} - Amount: ${amount} - Booking: ${bookingId}`);

  // Simulate a successful API call to a payment provider
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return { success: true, transactionId: "TXN_" + Math.random().toString(36).substr(2, 9) };
}
