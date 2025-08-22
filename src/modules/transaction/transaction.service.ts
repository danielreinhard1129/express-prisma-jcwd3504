import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { TransactionQueue } from "./transaction.queue";

export class TransactionService {
  private prisma: PrismaService;
  private transactionQueue: TransactionQueue;

  constructor() {
    this.prisma = new PrismaService();
    this.transactionQueue = new TransactionQueue();
  }

  createTransaction = async (
    body: { ticketId: number; qty: number },
    authUserId: number
  ) => {
    // cek ticketId ada apa tidak di database
    const ticket = await this.prisma.ticket.findFirst({
      where: { id: body.ticketId },
    });
    // kalo tidak ada throw error
    if (!ticket) {
      throw new ApiError("Invalid ticket id", 400);
    }
    // kalo ada, cek stocknya cukup atau tidak
    if (ticket.stock < body.qty) {
      throw new ApiError("Insufficient stock", 400);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // kalo stocknya cukup, decrement stock ticket tsb
      await tx.ticket.update({
        where: { id: body.ticketId },
        data: { stock: { decrement: body.qty } },
      });
      // buat data transaksi baru
      return await tx.transaction.create({
        data: {
          ticketId: body.ticketId,
          qty: body.qty,
          userId: authUserId,
          price: ticket.price,
        },
      });
    });

    // buat delay jobs 1 menit untuk mengecek status transaksi
    await this.transactionQueue.addNewTransaction(result.uuid);

    return { message: "Create transaction success" };
  };
}
