import { Queue } from "bullmq";
import { connection } from "../../config/redis";

export class TransactionQueue {
  private queue: Queue;
  constructor() {
    this.queue = new Queue("transactionQueue", { connection });
  }

  addNewTransaction = async (uuid: string) => {
    return await this.queue.add(
      "newTransaction",
      { uuid: uuid }, // payload queue
      {
        jobId: uuid,
        delay: 1 * 60 * 1000, // delay 1 menit
        attempts: 5, // retry sampai 5x
        removeOnComplete: true, // hapus data setelah berhasil
        backoff: { type: "exponential", delay: 1000 },
      }
    );
  };
}
