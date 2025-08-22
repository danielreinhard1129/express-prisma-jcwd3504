import { TransactionWorker } from "../modules/transaction/transaction.worker";

export const initWorkers = () => {
  new TransactionWorker();
};
