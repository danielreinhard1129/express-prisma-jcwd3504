import { sign } from "jsonwebtoken";
import { User } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { hash } from "bcrypt";

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

  resetPassword = async (body: Pick<User, "password">, authUserId: number) => {
    const user = await this.prisma.user.findFirst({
      where: { id: authUserId },
    });

    if (!user) {
      throw new ApiError("Account not found!", 400);
    }

    const hashedPassword = await hash(body.password, 10);

    await this.prisma.user.update({
      where: { id: authUserId },
      data: { password: hashedPassword },
    });

    return { message: "Reset password success" };
  };
}
