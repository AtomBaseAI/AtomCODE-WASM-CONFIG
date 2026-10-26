import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl">404</CardTitle>
          <CardDescription>Page Not Found</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Link
            href="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Back to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
