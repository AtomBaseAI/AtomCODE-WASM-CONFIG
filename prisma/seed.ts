/**
 * AtomCode unified seed — one demo dataset for all three roles.
 * Run: bun prisma/seed.ts
 */
import { PrismaClient } from "@prisma/client";
import { genSaltSync, hashSync } from "bcrypt-ts";

const db = new PrismaClient();

async function main() {
  const hash = (pw: string) => hashSync(pw, genSaltSync(10));

  const admin = await db.admin.upsert({
    where: { email: "admin@atom.com" },
    update: {},
    create: {
      name: "Atom Admin",
      email: "admin@atom.com",
      password: hash("Admin@Atom"),
    },
  });

  const staff = await db.staff.upsert({
    where: { email: "staff@atom.com" },
    update: {},
    create: {
      name: "Sam Staff",
      email: "staff@atom.com",
      department: "cse",
      staffnumber: "STF001",
      phone: "9876543210",
      password: hash("Staff@Atom"),
    },
  });

  const student = await db.user.upsert({
    where: { email: "student@atom.com" },
    update: {},
    create: {
      name: "Riya Student",
      email: "student@atom.com",
      department: "cse",
      section: "a",
      batch: "2023-2027",
      rollnumber: "21CS001",
      password: hash("User@Atom"),
    },
  });

  // --- extra sample accounts (all roles) for testing ---
  await db.admin.upsert({
    where: { email: "admin2@atom.com" },
    update: {},
    create: {
      name: "Backup Admin",
      email: "admin2@atom.com",
      password: hash("Admin@Atom"),
    },
  });

  // Staff #2 — deliberately NOT enrolled in any course (tests empty states).
  await db.staff.upsert({
    where: { email: "staff2@atom.com" },
    update: {},
    create: {
      name: "Priya Staff",
      email: "staff2@atom.com",
      department: "cse",
      staffnumber: "STF002",
      phone: "9876543211",
      password: hash("Staff@Atom"),
    },
  });

  // Student #2 — enrolled below so the leaderboard has 2+ students.
  const student2 = await db.user.upsert({
    where: { email: "student2@atom.com" },
    update: {},
    create: {
      name: "Arjun Student",
      email: "student2@atom.com",
      department: "cse",
      section: "a",
      batch: "2023-2027",
      rollnumber: "21CS002",
      password: hash("User@Atom"),
    },
  });

  // Student #3 — deliberately NOT enrolled (tests empty states).
  await db.user.upsert({
    where: { email: "student3@atom.com" },
    update: {},
    create: {
      name: "Kiran Student",
      email: "student3@atom.com",
      department: "it",
      section: "b",
      batch: "2023-2027",
      rollnumber: "21IT001",
      password: hash("User@Atom"),
    },
  });

  const now = new Date();
  const course =
    (await db.course.findFirst({ where: { title: "Full Stack Java" } })) ??
    await db.course.create({
      data: {
        title: "Full Stack Java",
        startdate: new Date(now.getTime() - 7 * 864e5),
        enddate: new Date(now.getTime() + 60 * 864e5),
        language: "java",
      },
    });

  await db.staffCourse.upsert({
    where: { id: "seed-sc-1" },
    update: {},
    create: { id: "seed-sc-1", staffId: staff.id, courseId: course.id, active: true },
  }).catch(async () => {
    await db.staffCourse.create({
      data: { staffId: staff.id, courseId: course.id, active: true },
    });
  });

  await db.userCourse.upsert({
    where: { id: "seed-uc-1" },
    update: {},
    create: {
      id: "seed-uc-1",
      userId: student.id,
      courseId: course.id,
      active: true,
      completionPercentage: 0,
    },
  }).catch(async () => {
    await db.userCourse.create({
      data: {
        userId: student.id,
        courseId: course.id,
        active: true,
        completionPercentage: 0,
      },
    });
  });

  await db.userCourse.upsert({
    where: { id: "seed-uc-2" },
    update: {},
    create: {
      id: "seed-uc-2",
      userId: student2.id,
      courseId: course.id,
      active: true,
      completionPercentage: 0,
    },
  }).catch(async () => {
    await db.userCourse.create({
      data: {
        userId: student2.id,
        courseId: course.id,
        active: true,
        completionPercentage: 0,
      },
    });
  });

  const mod1 =
    (await db.module.findFirst({ where: { title: "Java Basics", courseId: course.id } })) ??
    await db.module.create({
      data: {
        title: "Java Basics",
        courseId: course.id,
        moduledate: new Date(now.getTime() - 5 * 864e5),
        modulestatus: "active",
        language: "java",
        maxscore: 40,
        concepturl: "https://www.youtube.com/embed/eIrMbAQSU34",
      },
    });

  const mod2 =
    (await db.module.findFirst({ where: { title: "OOP in Java", courseId: course.id } })) ??
    await db.module.create({
      data: {
        title: "OOP in Java",
        courseId: course.id,
        moduledate: new Date(now.getTime() + 3 * 864e5),
        modulestatus: "active",
        language: "java",
        maxscore: 40,
        concepturl: "https://www.youtube.com/embed/6T_Hrn7hAJY",
      },
    });

  if ((await db.mCQQuestion.count({ where: { moduleId: mod1.id } })) === 0) {
    await db.mCQQuestion.createMany({
      data: [
        {
          title: "JVM stands for",
          description: "What does JVM stand for in Java?",
          topic: "Fundamentals",
          subtopic: "JVM",
          Option1: "Java Virtual Machine",
          Option2: "Java Verified Method",
          Option3: "Just Virtual Memory",
          Option4: "Java Variable Machine",
          CorrectOption: 1,
          moduleId: mod1.id,
          iscodesnippet: false,
        },
        {
          title: "Entry point of Java",
          description:
            "Which method is the entry point of every Java program?",
          topic: "Fundamentals",
          subtopic: "main",
          Option1: "start()",
          Option2: "init()",
          Option3: "main(String[] args)",
          Option4: "run()",
          CorrectOption: 3,
          moduleId: mod1.id,
          iscodesnippet: false,
        },
      ],
    });
  }

  if ((await db.codeQuestion.count({ where: { moduleId: mod1.id } })) === 0) {
    await db.codeQuestion.createMany({
      data: [
        {
          title: "Hello Atom",
          description:
            "Print `Hello, Atom!` to stdout. No trailing spaces.",
          moduleId: mod1.id,
          sampleinput1: "",
          sampleinput2: "",
          sampleoutput1: "Hello, Atom!",
          sampleoutput2: "",
          input1: "",
          input2: "",
          input3: "",
          output1: "Hello, Atom!",
          output2: "",
          output3: "",
          sourcecode:
            "public class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}",
          maxscore: 10,
          difficulty: "easy",
          lang: "java",
          topic: "Basics",
          subtopic: "IO",
          inputconstrains: "None",
          blacklist: "",
          whitelist: "",
        },
        {
          title: "Sum of Two",
          description:
            "Read two integers separated by space and print their sum.",
          moduleId: mod1.id,
          sampleinput1: "2 3",
          sampleinput2: "10 20",
          sampleoutput1: "5",
          sampleoutput2: "30",
          input1: "5 7",
          input2: "0 0",
          input3: "100 250",
          output1: "12",
          output2: "0",
          output3: "350",
          sourcecode:
            "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}",
          maxscore: 10,
          difficulty: "easy",
          lang: "java",
          topic: "Basics",
          subtopic: "Arithmetic",
          inputconstrains: "-10^9 <= a,b <= 10^9",
          blacklist: "",
          whitelist: "",
        },
      ],
    });
  }

  if ((await db.mCQQuestion.count({ where: { moduleId: mod2.id } })) === 0) {
    await db.mCQQuestion.createMany({
      data: [
        {
          title: "Keyword for inheritance",
          description: "Which keyword is used to inherit a class in Java?",
          topic: "OOP",
          subtopic: "Inheritance",
          Option1: "implements",
          Option2: "extends",
          Option3: "inherits",
          Option4: "super",
          CorrectOption: 2,
          moduleId: mod2.id,
          iscodesnippet: false,
        },
      ],
    });
  }

  const assessment =
    (await db.assessments.findFirst({ where: { title: "Unit Test 1", courseId: course.id } })) ??
    await db.assessments.create({
      data: {
        title: "Unit Test 1",
        date: new Date(now.getTime() - 1 * 864e5),
        accesskey: 123456,
        language: "java",
        courseId: course.id,
        maxtime: "01:00",
        active: true,
        maxscore: 10,
        tabswitches: 5,
      },
    });

  if ((await db.codeQuestion.count({ where: { assessmentsId: assessment.id } })) === 0) {
    await db.codeQuestion.create({
      data: {
        title: "Reverse String",
        description: "Read a line and print it reversed.",
        assessmentsId: assessment.id,
        sampleinput1: "atom",
        sampleinput2: "",
        sampleoutput1: "mota",
        sampleoutput2: "",
        input1: "code",
        input2: "java",
        input3: "abc",
        output1: "edoc",
        output2: "avaj",
        output3: "cba",
        sourcecode:
          "import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your code here\n    }\n}",
        maxscore: 10,
        difficulty: "medium",
        lang: "java",
        topic: "Strings",
        subtopic: "Reverse",
        inputconstrains: "1 <= len <= 1000",
        blacklist: "",
        whitelist: "",
      },
    });
  }

  await db.feedbacks.createMany({
    data: [
      {
        courseId: course.id,
        title: "Session 1 Feedback",
        link: "https://forms.gle/atom-feedback-1",
        date: new Date(now.getTime() - 2 * 864e5),
      },
    ],
  }).catch(() => {});

  console.log("Seed complete:");
  console.log("  admin    → admin@atom.com / Admin@Atom");
  console.log("  admin2   → admin2@atom.com / Admin@Atom");
  console.log("  staff    → staff@atom.com / Staff@Atom");
  console.log("  staff2   → staff2@atom.com / Staff@Atom");
  console.log("  student  → student@atom.com / User@Atom");
  console.log("  student2 → student2@atom.com / User@Atom");
  console.log("  student3 → student3@atom.com / User@Atom");
  console.log(`  course   → ${course.title} (${course.id})`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
