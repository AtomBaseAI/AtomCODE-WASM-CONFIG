"use client"
import { importstudents } from "@/actions/student";
import BackBtn from "@/components/backbtn";
import { Button } from "@/components/ui/button";
import { Download, Loader, UploadCloud } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentImport() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please upload a file first.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const result = await importstudents(text);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }

      setUploading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className="h-[80vh] w-full flex justify-center items-center">
      {!uploading ? (
        <div className="flex flex-col items-center border-2 border-violet-500 hover:border-violet-800 border-dashed rounded-md h-[20rem] w-[25rem]">
          <div className="flex h-1/6 justify-center items-center w-5/6">
            <div className="w-1/3 h-full flex items-center justify-start">
              <BackBtn />
            </div>
            <div className="w-2/3 h-full flex items-center justify-end">
              <a href="https://admin-demo.edtech.atomlabs.in/imports/student-sample/Student_Upload_Sample.csv" target="_blank" download="Student_Upload_Sample" className="bg-green-500 hover:bg-green-700 text-white py-2 px-2 rounded-md text-md flex flex-row">
                <Download className="mr-2"/> Download Sample
              </a>
            </div>
          </div>
          <div className="flex flex-col h-3/6 w-5/6 justify-center items-center">
            <UploadCloud className="h-12 w-12" />
            <p>
              upload <span className="text-green-500 font-bold">.csv</span> file
            </p>
          </div>
          <div className="flex flex-col h-2/6 w-5/6 justify-center items-center gap-4">
            <input type="file" accept=".csv" onChange={handleFileChange} className="w-full overflow-clip rounded-md border border-neutral-300 bg-neutral-50/50 text-sm text-neutral-600 file:mr-4 file:cursor-pointer file:border-none file:bg-neutral-50 file:px-4 file:py-2 file:font-medium file:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-75 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-300 dark:file:bg-neutral-900 dark:file:text-white dark:focus-visible:outline-white" />
            <Button onClick={handleImport} className="w-full">Upload</Button>
            {uploading && <p>Uploading...</p>}
          </div>
        </div>

      ) : (

        <div className="flex flex-col items-center border-2 border-yellow-500 hover:border-yellow-800 border-dashed rounded-md h-[20rem] w-[25rem]">
          <div className="flex flex-col h-full w-full justify-center items-center">
            <div className="flex h-5/6 flex-col justify-center items-center gap-8">

              <Loader className="h-12 w-12 animate-spin" />
              <h2> Uploading ...</h2>
            </div>
            <p className="text-yellow-500">Do not refresh the page !</p>
          </div>
        </div>
      )
      }
    </div>
  );
}
