import { sign } from "jsonwebtoken";
import { User } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";

export class AuthService {
  private prisma: PrismaService;
  private mailService: MailService;

  constructor() {
    this.prisma = new PrismaService();
    this.mailService = new MailService();
  }

  forgotPassword = async (body: Pick<User, "email">) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      throw new ApiError("Invalid email address", 400);
    }

    const payload = { id: user.id };

    const token = sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    await this.mailService.sendMail(
      body.email, // send email to
      "Reset your password", // subject
      "reset-password", // template name
      { resetLink: resetLink } // context variable
    );

    return { message: "send email success" };
  };
}
