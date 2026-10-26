"use server";

import {
  RegisterSchema,
  StaffRegisterSchema,
  StudentRegisterSchema,
} from "@/schemas/auth-schema";
import { db } from "@/lib/db";
import * as z from "zod";
import { genSaltSync, hashSync } from "bcrypt-ts";

type Base = { name: string; email: string; password: string };

const hash = (password: string) => hashSync(password, genSaltSync(10));

/** Admin self-registration (original admin app behavior). */
export const registerAdmin = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid email/password" };
  }
  const { email, password, name } = validatedFields.data;

  const existing = await db.admin.findUnique({ where: { email } });
  if (existing) return { error: "Email already exists !" };

  await db.admin.create({
    data: { name, email, password: hash(password) },
  });

  return { success: "Registeration Completed !" };
};

/** Staff self-registration (original staff app behavior). */
export const registerStaff = async (
  values: z.infer<typeof StaffRegisterSchema>
) => {
  const validatedFields = StaffRegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid details" };
  }
  const { email, password, name, staffnumber, department, phone } =
    validatedFields.data as Base & {
      staffnumber: string;
      department: string;
      phone: string;
    };

  const existing = await db.staff.findUnique({ where: { email } });
  if (existing) return { error: "Email already exists !" };

  await db.staff.create({
    data: { name, email, staffnumber, department, phone, password: hash(password) },
  });

  return { success: "Registeration Completed !" };
};

/** Student self-registration (original student app behavior). */
export const registerStudent = async (
  values: z.infer<typeof StudentRegisterSchema>
) => {
  const validatedFields = StudentRegisterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid details" };
  }
  const { email, password, name, rollnumber, batch, department, section } =
    validatedFields.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already exists !" };

  await db.user.create({
    data: {
      name,
      email,
      department,
      rollnumber,
      batch,
      section,
      password: hash(password),
    },
  });

  return { success: "Registeration Completed !" };
};
