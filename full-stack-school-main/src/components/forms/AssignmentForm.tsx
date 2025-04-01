"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

// Define assignment schema as it's not in formValidationSchemas.ts yet
const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Assignment title is required!" }),
  description: z.string().optional(),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  lessonId: z.coerce.number().min(1, { message: "Lesson is required!" }),
  points: z.coerce.number().min(0, { message: "Points must be a positive number" }),
  fileUrl: z.string().optional(),
});

type AssignmentSchema = z.infer<typeof assignmentSchema>;

// These would need to be implemented in lib/actions.ts
const createAssignment = async (prevState: any, formData: FormData | AssignmentSchema) => {
  return { success: false, error: "Not implemented yet" };
};

const updateAssignment = async (prevState: any, formData: FormData | AssignmentSchema) => {
  return { success: false, error: "Not implemented yet" };
};

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  const [file, setFile] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: "Not submitted"
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction({ ...data, fileUrl: file?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons = [] } = relatedData || {};
  
  // Debug info - to be removed after fixing the issue
  console.log("relatedData:", relatedData);
  console.log("lessons:", lessons);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
        />
        <InputField
          label="Points"
          name="points"
          type="number"
          defaultValue={data?.points}
          register={register}
          error={errors?.points}
        />
        <InputField
          label="Due Date"
          name="dueDate"
          type="datetime-local"
          defaultValue={data?.dueDate?.toISOString().slice(0, 16)}
          register={register}
          error={errors?.dueDate}
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            <option value="">Select a lesson</option>
            {Array.isArray(lessons) && lessons.length > 0 ? (
              lessons.map((lesson: { id: number; title: string }) => (
                <option value={lesson.id} key={lesson.id}>
                  {lesson.title}
                </option>
              ))
            ) : (
              <option value="" disabled>No lessons available</option>
            )}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Assignment File
      </span>
      <CldUploadWidget
        uploadPreset="school"
        onSuccess={(result, { widget }) => {
          setFile(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          return (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload assignment file</span>
            </div>
          );
        }}
      </CldUploadWidget>
      {file && (
        <div className="text-xs text-green-500">
          File uploaded successfully: {file.original_filename}
        </div>
      )}
      <button className="p-4 bg-blue-600 text-white w-full rounded-md hover:bg-blue-700">
        Submit
      </button>
    </form>
  );
};

export default AssignmentForm; 