"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CourseModuleData {
    courseId: string;
    courseTitle: string;
    modules: {
        moduleId: string;
        moduleTitle: string;
    }[];
}

const ModuleSelector = ({ courses }: { courses: CourseModuleData[] }) => {
    const router = useRouter();
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [selectedModule, setSelectedModule] = useState<string>("");

    const handleRoute = () => {
        if (selectedCourse && selectedModule) {
            router.push(`/staff/atom/${selectedCourse}/${selectedModule}/`);
        } else {
            toast.warning("Select both Course & Module")
        }
    };

    const selectedCourseData = courses.find(
        (course) => course.courseId === selectedCourse
    );

    return (
        <Card className="w-[350px] rounded-md">
            <CardHeader>
                <CardTitle>Workspace</CardTitle>
                <CardDescription>Select Course & Module to load</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="course">Course</Label>
                        <Select onValueChange={(value) => setSelectedCourse(value)}>
                            <SelectTrigger id="course">
                                <SelectValue placeholder="Select Course" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {courses.map((course) => (
                                    <SelectItem
                                        key={course.courseId}
                                        value={course.courseId}
                                    >
                                        {course.courseTitle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="module">Module</Label>
                        <Select
                            onValueChange={(value) => setSelectedModule(value)}
                            disabled={!selectedCourse}
                        >
                            <SelectTrigger id="module">
                                <SelectValue placeholder="Select Module" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                                {selectedCourseData?.modules.map((module) => (
                                    <SelectItem
                                        key={module.moduleId}
                                        value={module.moduleId}
                                    >
                                        {module.moduleTitle}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button className="w-full" onClick={handleRoute}>
                    Load
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ModuleSelector;
