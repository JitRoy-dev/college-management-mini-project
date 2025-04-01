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

// Define event schema as it's not in formValidationSchemas.ts yet
const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().min(1, { message: "Description is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  endDate: z.coerce.date({ message: "End date is required!" }),
  location: z.string().min(1, { message: "Location is required!" }),
  type: z.enum(["HOLIDAY", "EXAM", "ACTIVITY", "MEETING", "OTHER"], 
    { message: "Event type is required!" }),
  imgUrl: z.string().optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ['endDate']
});

type EventSchema = z.infer<typeof eventSchema>;

// These would need to be implemented in lib/actions.ts
const createEvent = async (prevState: any, formData: FormData | EventSchema) => {
  return { success: false, error: "Not implemented yet" };
};

const updateEvent = async (prevState: any, formData: FormData | EventSchema) => {
  return { success: false, error: "Not implemented yet" };
};

const EventForm = ({
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
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: "Not submitted"
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction({ ...data, imgUrl: img?.secure_url });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
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
          label="Location"
          name="location"
          defaultValue={data?.location}
          register={register}
          error={errors?.location}
        />
        <InputField
          label="Start Date & Time"
          name="startDate"
          type="datetime-local"
          defaultValue={data?.startDate?.toISOString().slice(0, 16)}
          register={register}
          error={errors?.startDate}
        />
        <InputField
          label="End Date & Time"
          name="endDate"
          type="datetime-local"
          defaultValue={data?.endDate?.toISOString().slice(0, 16)}
          register={register}
          error={errors?.endDate}
        />
        <div className="flex flex-col gap-2 w-full md:w-1/3">
          <label className="text-xs text-gray-500">Event Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("type")}
            defaultValue={data?.type}
          >
            <option value="HOLIDAY">Holiday</option>
            <option value="EXAM">Exam</option>
            <option value="ACTIVITY">Activity</option>
            <option value="MEETING">Meeting</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.type?.message && (
            <p className="text-xs text-red-400">
              {errors.type.message.toString()}
            </p>
          )}
        </div>
        <div className="w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
            {...register("description")}
            defaultValue={data?.description}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
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
      <span className="text-xs text-gray-400 font-medium">
        Event Image
      </span>
      <CldUploadWidget
        uploadPreset="school"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
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
              <span>Upload an image</span>
            </div>
          );
        }}
      </CldUploadWidget>
      {img && (
        <div className="text-xs text-green-500">
          Image uploaded successfully: {img.original_filename}
        </div>
      )}
      <button className="p-4 bg-lamaBlue w-full text-white rounded-md hover:bg-blue-500">
        Submit
      </button>
    </form>
  );
};

export default EventForm; 