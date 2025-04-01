"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { z } from "zod";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

// Define announcement schema as it's not in formValidationSchemas.ts yet
const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  content: z.string().min(1, { message: "Content is required!" }),
  date: z.coerce.date({ message: "Date is required!" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], 
    { message: "Priority is required!" }),
  targetAudience: z.enum(["ALL", "STUDENTS", "TEACHERS", "PARENTS", "STAFF"], 
    { message: "Target audience is required!" }),
  authorId: z.string().min(1, { message: "Author is required!" }),
});

type AnnouncementSchema = z.infer<typeof announcementSchema>;

// These would need to be implemented in lib/actions.ts
const createAnnouncement = async () => {
  return { success: false, error: "Not implemented yet" };
};

const updateAnnouncement = async () => {
  return { success: false, error: "Not implemented yet" };
};

const AnnouncementForm = ({
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
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new announcement" : "Update the announcement"}
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
          label="Date"
          name="date"
          type="date"
          defaultValue={data?.date?.toISOString().split("T")[0]}
          register={register}
          error={errors?.date}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Priority</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("priority")}
            defaultValue={data?.priority}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          {errors.priority?.message && (
            <p className="text-xs text-red-400">
              {errors.priority.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Target Audience</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("targetAudience")}
            defaultValue={data?.targetAudience}
          >
            <option value="ALL">All</option>
            <option value="STUDENTS">Students</option>
            <option value="TEACHERS">Teachers</option>
            <option value="PARENTS">Parents</option>
            <option value="STAFF">Staff</option>
          </select>
          {errors.targetAudience?.message && (
            <p className="text-xs text-red-400">
              {errors.targetAudience.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Author</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("authorId")}
            defaultValue={data?.authorId}
          >
            {teachers?.map((teacher: { id: string; name: string; surname: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            )) || <option>No teachers available</option>}
          </select>
          {errors.authorId?.message && (
            <p className="text-xs text-red-400">
              {errors.authorId.message.toString()}
            </p>
          )}
        </div>
        <div className="w-full">
          <label className="text-xs text-gray-500">Content</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[150px]"
            {...register("content")}
            defaultValue={data?.content}
          />
          {errors.content?.message && (
            <p className="text-xs text-red-400">
              {errors.content.message.toString()}
            </p>
          )}
        </div>
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
      </div>
      <button className="p-4 bg-lamaBlue w-full text-white rounded-md hover:bg-blue-500">
        Submit
      </button>
    </form>
  );
};

export default AnnouncementForm; 