import { Job, Worker } from "bullmq";
import { connection } from "../../config/redis";
import { PrismaService } from "../prisma/prisma.service";
import { ApiError } from "../../utils/api-error";

export class TransactionWorker {
  private worker: Worker;
  private prisma: PrismaService;
  constructor() {
    this.prisma = new PrismaService();
    this.worker = new Worker("transactionQueue", this.handleTransaction, {
      connection,
    });
  }

  private handleTransaction = async (job: Job<{ uuid: string }>) => {
    const uuid = job.data.uuid;

    const transaction = await this.prisma.transaction.findFirst({
      where: { uuid },
    });

    if (!transaction) {
      throw new ApiError("Invalid transaction id", 400);
    }

    // kalo status transaksinya masih WAITING_FOR_PAYMENT
    if (transaction.status === "WAITING_FOR_PAYMENT") {
      // buat data transaksi tsb menjadi expired
      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { uuid },
          data: { status: "EXPIRED" },
        });

        // balikin stock yang sebelumnya di beli
        await tx.ticket.update({
          where: { id: transaction.ticketId },
          data: { stock: { increment: transaction.qty } },
        });
      });
    }
  };
}
