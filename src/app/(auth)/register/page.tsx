import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RegisterFormAdmin } from "@/components/auth/register-form-admin";
import { RegisterFormStaff } from "@/components/auth/register-form-staff";
import { RegisterFormStudent } from "@/components/auth/register-form-student";
import { CLIENT_NAME } from "@/config/branding";

export default function Register() {
  return (
    <>
      <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:px-0">
        <div className="absolute right-4 top-4 md:right-8 md:top-8">
          <ThemeToggle />
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>
              <p className="text-sm text-muted-foreground">
                Register on {CLIENT_NAME} — pick your role below
              </p>
            </div>

            <Tabs defaultValue="student">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <RegisterFormStudent />
              </TabsContent>
              <TabsContent value="staff">
                <RegisterFormStaff />
              </TabsContent>
              <TabsContent value="admin">
                <RegisterFormAdmin />
              </TabsContent>
            </Tabs>

            <p className="px-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-primary"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
