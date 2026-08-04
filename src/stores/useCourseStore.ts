import { create } from "zustand";
import { Course } from "@/types/courses";

interface CourseStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),
}));
